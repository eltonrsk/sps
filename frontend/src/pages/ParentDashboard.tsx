import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Users, LogOut, QrCode, History, UserPlus, ShieldAlert, Trash2, Bell } from 'lucide-react';
import { studentService, Guardian } from '../services/studentService';
import { notificationService, Notification } from '../services/notificationService';

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  class_name?: string;
  photo_url?: string;
  is_active: boolean;
  created_by: string;
  created_by_name?: string;
  created_at: string;
};

type Pickup = {
  id: string;
  student_id: string;
  pickup_time: string;
  picked_by_name?: string;
  verified_by_name?: string;
  verified_by_role?: string;
  notes?: string;
};

export default function ParentDashboard() {
  const { signOut, profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [guardiansByStudent, setGuardiansByStudent] = useState<Record<string, Guardian[]>>({});
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianError, setGuardianError] = useState('');
  const [guardianSuccess, setGuardianSuccess] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'qr' | 'guardians' | 'history' | 'notifications'>('students');

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      const studentData = await studentService.getStudentsByGuardian(profile?.id || '');
      setStudents(studentData);
      if (studentData.length > 0) {
        setSelectedStudentId(studentData[0].id);
      }

      const pickupHistoryByStudent = await Promise.all(
        studentData.map((student) => studentService.getStudentPickupHistory(student.id, 100))
      );
      const pickupData = pickupHistoryByStudent
        .flat()
        .sort((a, b) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime());
      setPickups(pickupData);

      const guardianEntries = await Promise.all(
        studentData.map(async (student) => {
          const guardians = await studentService.getStudentGuardians(student.id);
          return [student.id, guardians] as const;
        })
      );
      setGuardiansByStudent(Object.fromEntries(guardianEntries));

      const [notificationData, unreadData] = await Promise.all([
        notificationService.getUserNotifications(false, 20),
        notificationService.getUnreadCount()
      ]);
      // Deduplicate notifications by ID
      const uniqueNotifications = notificationData.filter((notification, index, self) =>
        index === self.findIndex((n) => n.id === notification.id)
      );
      setNotifications(uniqueNotifications);
      setUnreadCount(unreadData.unread_count);
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const selectedStudentGuardians = selectedStudentId ? guardiansByStudent[selectedStudentId] || [] : [];
  const backupGuardiansCount = selectedStudentGuardians.filter((guardian) => guardian.id !== profile?.id).length;

  const refreshStudentGuardians = async (studentId: string) => {
    const guardians = await studentService.getStudentGuardians(studentId);
    setGuardiansByStudent((prev) => ({ ...prev, [studentId]: guardians }));
  };

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardianError('');
    setGuardianSuccess('');

    if (!selectedStudentId) {
      setGuardianError('Please select a student.');
      return;
    }

    try {
      const response = await studentService.addGuardian(selectedStudentId, {
        full_name: guardianName,
        email: guardianEmail,
        phone_number: guardianPhone || undefined,
        relationship: guardianRelationship
      });

      await refreshStudentGuardians(selectedStudentId);
      setGuardianName('');
      setGuardianEmail('');
      setGuardianPhone('');
      setGuardianRelationship('');

      if (response.createdNewUser && response.temporaryPassword) {
        setGuardianSuccess(`Guardian added. Temporary password: ${response.temporaryPassword}`);
      } else {
        setGuardianSuccess('Guardian linked successfully.');
      }
    } catch (error) {
      setGuardianError(error instanceof Error ? error.message : 'Failed to add guardian');
    }
  };

  const handleRemoveGuardian = async (studentId: string, userId: string) => {
    setGuardianError('');
    setGuardianSuccess('');
    try {
      await studentService.removeGuardian(studentId, userId);
      await refreshStudentGuardians(studentId);
      setGuardianSuccess('Guardian removed successfully.');
    } catch (error) {
      setGuardianError(error instanceof Error ? error.message : 'Failed to remove guardian');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const [notificationData, unreadData] = await Promise.all([
        notificationService.getUserNotifications(false, 20),
        notificationService.getUnreadCount()
      ]);
      // Deduplicate notifications by ID
      const uniqueNotifications = notificationData.filter((notification, index, self) =>
        index === self.findIndex((n) => n.id === notification.id)
      );
      setNotifications(uniqueNotifications);
      setUnreadCount(unreadData.unread_count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Parent Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{profile?.full_name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'students'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      My Children
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'qr'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      My QR Codes
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'history'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Pickup History
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('guardians')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'guardians'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Guardians
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'notifications'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'students' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Children</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <div key={student.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={`${student.first_name} ${student.last_name}`}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Grade:</span>
                          <span className="font-medium text-gray-900">{student.grade}</span>
                        </div>
                        {student.class_name && (
                          <div className="flex justify-between">
                            <span>Class:</span>
                            <span className="font-medium text-gray-900">{student.class_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <QRCodeDisplay userId={profile?.id || ''} students={students} />
            )}

            {activeTab === 'guardians' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Guardian Management</h2>
                  <p className="text-sm text-gray-600">Add backup guardians for student pickup authorization.</p>
                </div>

                {guardianError && (
                  <div className="p-3 rounded-lg border bg-red-50 text-red-800 border-red-200 text-sm">{guardianError}</div>
                )}
                {guardianSuccess && (
                  <div className="p-3 rounded-lg border bg-green-50 text-green-800 border-green-200 text-sm">{guardianSuccess}</div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.grade})
                      </option>
                    ))}
                  </select>

                  {selectedStudentId && backupGuardiansCount < 2 && (
                    <div className="mt-4 p-3 rounded-lg border bg-amber-50 text-amber-800 border-amber-200 text-sm flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 mt-0.5" />
                      <span>
                        Add at least 2 backup guardians for this student. Current backup guardians: {backupGuardiansCount}.
                      </span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddGuardian} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Guardian</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Guardian full name"
                      required
                    />
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Guardian email"
                      required
                    />
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Guardian phone (optional)"
                    />
                    <input
                      type="text"
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Relationship (e.g. Uncle)"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!selectedStudentId}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Guardian
                  </button>
                </form>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Authorized Guardians</h3>
                  </div>
                  {selectedStudentGuardians.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600">No guardians linked to this student yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {selectedStudentGuardians.map((guardian) => (
                        <div key={guardian.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{guardian.full_name}</p>
                            <p className="text-sm text-gray-600">{guardian.email}{guardian.phone_number ? ` • ${guardian.phone_number}` : ''}</p>
                            <p className="text-xs text-gray-500 mt-1">{guardian.relationship}</p>
                          </div>
                          {guardian.id !== profile?.id && (
                            <button
                              onClick={() => handleRemoveGuardian(selectedStudentId, guardian.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pickup History</h2>
                {pickups.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No pickup history</p>
                    <p className="text-gray-500">Your pickup records will appear here once you start using the QR code system.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Verified By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pickups.map((pickup) => {
                            const student = students.find(s => s.id === pickup.student_id);
                            return (
                              <tr key={pickup.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(pickup.pickup_time).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div>
                                    <div className="text-gray-500 text-xs">Picked by: {pickup.picked_by_name || 'N/A'}</div>
                                    <div className="font-medium">{pickup.verified_by_name || 'N/A'}</div>
                                    <div className="text-gray-500">{pickup.verified_by_role || 'N/A'}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Completed
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshNotifications}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Refresh
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No notifications</p>
                    <p className="text-gray-500">Your notifications will appear here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => {
                        const studentNames = students.map(s => `${s.first_name} ${s.last_name}`).join('|');
                        const isRelatedToStudent = students.length === 0 || 
                          studentNames.split('|').some(name => 
                            notification.message.includes(name) || notification.title.includes(name)
                          ) || notification.user_id === profile?.id;
                        
                        if (!isRelatedToStudent) return null;
                        
                        return (
                          <div
                            key={notification.id}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{notification.user_name || 'System'}</span>
                                  <span>•</span>
                                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
