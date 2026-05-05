<?php

namespace App\Http\Controllers\Api;

use App\Models\QrCode;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QrCodeController
{
    public function index(Request $request)
    {
        $query = QrCode::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter expired/valid codes
        if ($request->has('expired')) {
            if ($request->boolean('expired')) {
                $query->expired();
            } else {
                $query->notExpired();
            }
        }

        $qrCodes = $query->with('user', 'student')
                        ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $qrCodes
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'nullable|exists:students,id',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Generate unique code
        $code = QrCode::generateCode();

        $qrCode = QrCode::create([
            'user_id' => $request->user()->id,
            'student_id' => $request->student_id,
            'code' => $code,
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'QR Code generated successfully',
            'data' => $qrCode
        ], 201);
    }

    public function show($id)
    {
        $qrCode = QrCode::with('user', 'student', 'pickups')
                        ->find($id);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $qrCode
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $qrCode = QrCode::find($id);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'nullable|exists:students,id',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $qrCode->update($request->only('student_id', 'expires_at', 'is_active'));

        return response()->json([
            'success' => true,
            'message' => 'QR Code updated successfully',
            'data' => $qrCode
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $qrCode = QrCode::find($id);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        $qrCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'QR Code deleted successfully'
        ], 200);
    }

    public function generateBulk(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'count' => 'required|integer|min:1|max:100',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $codes = [];
        for ($i = 0; $i < $request->count; $i++) {
            $code = QrCode::create([
                'user_id' => $request->user()->id,
                'code' => QrCode::generateCode(),
                'expires_at' => $request->expires_at,
                'is_active' => true,
            ]);
            $codes[] = $code;
        }

        return response()->json([
            'success' => true,
            'message' => 'QR Codes generated successfully',
            'data' => [
                'count' => count($codes),
                'codes' => $codes
            ]
        ], 201);
    }

    public function deactivate(Request $request, $id)
    {
        $qrCode = QrCode::find($id);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        $qrCode->deactivate();

        return response()->json([
            'success' => true,
            'message' => 'QR Code deactivated',
            'data' => $qrCode
        ], 200);
    }

    public function activate(Request $request, $id)
    {
        $qrCode = QrCode::find($id);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        $qrCode->activate();

        return response()->json([
            'success' => true,
            'message' => 'QR Code activated',
            'data' => $qrCode
        ], 200);
    }

    public function getByCode(Request $request, $code)
    {
        $qrCode = QrCode::where('code', $code)
                        ->with('user', 'student')
                        ->first();

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code not found'
            ], 404);
        }

        if (!$qrCode->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code is invalid or expired'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $qrCode
        ], 200);
    }
}
