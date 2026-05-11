import { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { userService } from '../services/userService';
import {
  GraduationCap,
  Search,
  Plus,
  X,
  UserPlus,
  Users,
  BookOpen,
} from 'lucide-react';

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  class_name?: string;
  photo_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
};

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number?: string;
  is_active: boolean;
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    className: '',
  });

  const [newGuardian, setNewGuardian] = useState({
    userId: '',
    relationship: '',
  });

  useEffect(() => {
    loadStudents();
    loadParents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParents = async () => {
    try {
      const data = await userService.getAllUsers('parent');
      setParents(data);
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStudents(filtered);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await studentService.createStudent({
        first_name: newStudent.firstName,
        last_name: newStudent.lastName,
        grade: newStudent.grade,
        class_name: newStudent.className || undefined,
      });

      setShowAddModal(false);

      setNewStudent({
        firstName: '',
        lastName: '',
        grade: '',
        className: '',
      });

      await loadStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      alert(
        'Error adding student: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    setLoading(true);

    try {
      await studentService.addGuardian(selectedStudent.id, {
        user_id: newGuardian.userId,
        relationship: newGuardian.relationship,
        is_authorized: true,
      });

      setShowGuardianModal(false);

      setNewGuardian({
        userId: '',
        relationship: '',
      });

      setSelectedStudent(null);

      alert('Guardian added successfully!');
    } catch (error) {
      console.error('Error adding guardian:', error);

      alert(
        'Error adding guardian: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const openGuardianModal = (student: Student) => {
    setSelectedStudent(student);
    setShowGuardianModal(true);
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Student Management
          </h2>

          <p className="text-gray-500 mt-1">
            Manage student records and guardians
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search student by name or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />

            <h3 className="text-xl font-semibold text-gray-800">
              No Students Found
            </h3>

            <p className="text-gray-500 mt-2">
              Try changing your search keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* TOP */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <GraduationCap className="w-8 h-8" />
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-2xl font-bold">
                      {student.first_name} {student.last_name}
                    </h3>

                    <p className="text-blue-100 mt-1">
                      Student Profile
                    </p>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        Grade
                      </div>

                      <span className="font-semibold text-gray-900">
                        {student.grade}
                      </span>
                    </div>

                    {student.class_name && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          Class
                        </div>

                        <span className="font-semibold text-gray-900">
                          {student.class_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={() => openGuardianModal(student)}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Guardian
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                Add Student
              </h3>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleAddStudent}
              className="p-6 space-y-5"
            >
              <input
                type="text"
                placeholder="First Name"
                value={newStudent.firstName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <input
                type="text"
                placeholder="Last Name"
                value={newStudent.lastName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    lastName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <input
                type="text"
                placeholder="Grade"
                value={newStudent.grade}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    grade: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <input
                type="text"
                placeholder="Class Name"
                value={newStudent.className}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    className: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GUARDIAN MODAL */}
      {showGuardianModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Add Guardian
              </h3>

              <button
                onClick={() => {
                  setShowGuardianModal(false);
                  setSelectedStudent(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleAddGuardian}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Parent
                </label>

                <select
                  value={newGuardian.userId}
                  onChange={(e) =>
                    setNewGuardian({
                      ...newGuardian,
                      userId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Choose Parent</option>

                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name} ({parent.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Relationship
                </label>

                <select
                  value={newGuardian.relationship}
                  onChange={(e) =>
                    setNewGuardian({
                      ...newGuardian,
                      relationship: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuardianModal(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  {loading ? 'Adding...' : 'Add Guardian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}