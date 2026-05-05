<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentController
{
    public function index(Request $request)
    {
        $query = Student::query();

        // Filter by grade
        if ($request->has('grade')) {
            $query->where('grade', $request->grade);
        }

        // Filter by class
        if ($request->has('class_name')) {
            $query->where('class_name', $request->class_name);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%");
            });
        }

        // Include pickup stats
        if ($request->boolean('include_stats', false)) {
            $query->withCount('pickups')
                  ->withCount('guardians');
        }

        $students = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'grade' => 'required|string',
            'class_name' => 'nullable|string',
            'photo_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $student = Student::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'grade' => $request->grade,
            'class_name' => $request->class_name,
            'photo_url' => $request->photo_url,
            'created_by' => $request->user()->id,
            'is_active' => $request->get('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully',
            'data' => $student
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with('guardians.user', 'pickups', 'qrCodes')->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'string',
            'last_name' => 'string',
            'grade' => 'string',
            'class_name' => 'nullable|string',
            'photo_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $student->update($request->only('first_name', 'last_name', 'grade', 'class_name', 'photo_url', 'is_active'));

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student
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

        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ], 200);
    }

    public function getByGuardian(Request $request)
    {
        $students = Student::whereHas('guardians', function ($query) {
            $query->where('user_id', auth()->id())
                  ->where('is_authorized', true);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function getTodayStatus(Request $request)
    {
        $students = Student::where('is_active', true)
            ->withCount(['pickups' => function ($query) {
                $query->whereDate('pickup_time', today());
            }])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'grade' => $student->grade,
                    'class_name' => $student->class_name,
                    'picked_up' => $student->pickups_count > 0,
                    'pickup_count' => $student->pickups_count,
                ];
            });

        $picked_up = $students->where('picked_up', true)->count();
        $not_picked_up = $students->where('picked_up', false)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $students->count(),
                'picked_up' => $picked_up,
                'not_picked_up' => $not_picked_up,
                'students' => $students
            ]
        ], 200);
    }
}
