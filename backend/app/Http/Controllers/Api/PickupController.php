<?php

namespace App\Http\Controllers\Api;

use App\Models\Pickup;
use App\Models\Student;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PickupController
{
    public function index(Request $request)
    {
        $query = Pickup::query();

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('pickup_time', [
                $request->start_date,
                $request->end_date
            ]);
        } elseif ($request->has('date')) {
            $query->whereDate('pickup_time', $request->date);
        } elseif ($request->boolean('today', false)) {
            $query->today();
        } elseif ($request->boolean('this_week', false)) {
            $query->thisWeek();
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by picker
        if ($request->has('picked_by_user_id')) {
            $query->where('picked_by_user_id', $request->picked_by_user_id);
        }

        $pickups = $query->with('student', 'pickedByUser', 'verifiedByUser', 'qrCode')
                        ->orderBy('pickup_time', 'desc')
                        ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $pickups
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'picked_by_user_id' => 'required|exists:user_profiles,id',
            'verified_by_user_id' => 'required|exists:user_profiles,id',
            'qr_code_id' => 'nullable|exists:qr_codes,id',
            'pickup_time' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $pickup = Pickup::create([
            'student_id' => $request->student_id,
            'picked_by_user_id' => $request->picked_by_user_id,
            'verified_by_user_id' => $request->verified_by_user_id,
            'qr_code_id' => $request->qr_code_id,
            'pickup_time' => $request->pickup_time ?? now(),
            'notes' => $request->notes,
        ]);

        // Mark QR code as used
        if ($request->qr_code_id) {
            $qrCode = $pickup->qrCode;
            if ($qrCode) {
                $qrCode->markAsUsed();
            }
        }

        // Send notification to guardians
        $student = Student::find($request->student_id);
        Notification::createPickupNotification(
            $student->id,
            "{$student->full_name} has been picked up at " . $pickup->pickup_time->format('h:i A')
        );

        return response()->json([
            'success' => true,
            'message' => 'Pickup recorded successfully',
            'data' => $pickup->load('student', 'pickedByUser', 'verifiedByUser')
        ], 201);
    }

    public function show($id)
    {
        $pickup = Pickup::with('student', 'pickedByUser', 'verifiedByUser', 'qrCode')
                        ->find($id);

        if (!$pickup) {
            return response()->json([
                'success' => false,
                'message' => 'Pickup not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pickup
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $pickup = Pickup::find($id);

        if (!$pickup) {
            return response()->json([
                'success' => false,
                'message' => 'Pickup not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'picked_by_user_id' => 'exists:user_profiles,id',
            'verified_by_user_id' => 'exists:user_profiles,id',
            'pickup_time' => 'date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $pickup->update($request->only('picked_by_user_id', 'verified_by_user_id', 'pickup_time', 'notes'));

        return response()->json([
            'success' => true,
            'message' => 'Pickup updated successfully',
            'data' => $pickup
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'security') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $pickup = Pickup::find($id);

        if (!$pickup) {
            return response()->json([
                'success' => false,
                'message' => 'Pickup not found'
            ], 404);
        }

        $pickup->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pickup deleted successfully'
        ], 200);
    }

    public function getStats(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth();
        $endDate = $request->end_date ?? now()->endOfMonth();

        $stats = Pickup::getPickupStats($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    public function getTodayStats(Request $request)
    {
        $pickups = Pickup::today()->count();
        $unique_students = Pickup::today()->distinct('student_id')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_pickups' => $pickups,
                'unique_students' => $unique_students,
            ]
        ], 200);
    }

    public function quickPickup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Find QR code
        $qrCode = \App\Models\QrCode::where('code', $request->qr_code)->first();

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR Code'
            ], 404);
        }

        if (!$qrCode->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code is invalid or expired'
            ], 400);
        }

        // Create pickup
        $pickup = Pickup::create([
            'student_id' => $qrCode->student_id,
            'picked_by_user_id' => $request->user()->id,
            'verified_by_user_id' => $request->user()->id,
            'qr_code_id' => $qrCode->id,
            'pickup_time' => now(),
        ]);

        $qrCode->markAsUsed();

        // Send notification
        $student = Student::find($qrCode->student_id);
        Notification::createPickupNotification(
            $student->id,
            "{$student->full_name} has been picked up"
        );

        return response()->json([
            'success' => true,
            'message' => 'Pickup recorded successfully',
            'data' => $pickup->load('student')
        ], 201);
    }
}
