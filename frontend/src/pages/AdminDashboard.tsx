import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/UserManagement';
import StudentManagement from '../components/StudentManagement';
import QRScanner from '../components/QRScanner';
import { studentService } from '../services/studentService';
import { userService } from '../services/userService';
import { pickupService, Pickup } from '../services/pickupService';
import { qrCodeService, QRCode } from '../services/qrCodeService';
import { notificationService, Notification } from '../services/notificationService';
import {
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  LogOut,
  UserPlus,
  Plus,
  QrCode,
  MapPin,
  ClipboardList,
  Bell,
} from 'lucide-react';

type DashboardStats = {
  totalStudents: number;
  pickedToday: number;
  notPickedToday: number;
  totalUsers: number;
};

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: GraduationCap },
  { id: 'users', label: 'User Management', icon: UserPlus },
  { id: 'students', label: 'Students', icon: Plus },
  { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
  { id: 'scanner', label: 'Pickup Scanner', icon: MapPin },
  { id: 'history', label: 'Pickup History', icon: ClipboardList },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type TabId = (typeof navItems)[number]['id'];

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pickedToday: 0,
    notPickedToday: 0,
    totalUsers: 0,
  });
  const [recentPickups, setRecentPickups] = useState<Pickup[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const loadAdminData = async () => {
    setDashboardError('');
    try {
      const [students, users, todayPickups, recentPickupData, qrData, notificationData] = await Promise.all([
        studentService.getAllStudents(),
        userService.getAllUsers(),
        pickupService.getTodayPickups(),
        pickupService.getRecentPickups(30),
        qrCodeService.getAllQRCodes(true),
        notificationService.getAllNotifications({ limit: 50 })
      ]);

      const uniqueStudentPickups = new Set(todayPickups.map((pickup) => pickup.student_id)).size;
      const notPicked = Math.max(students.length - uniqueStudentPickups, 0);

      setStats({
        totalStudents: students.length,
        pickedToday: uniqueStudentPickups,
        notPickedToday: notPicked,
        totalUsers: users.length
      });

      setRecentPickups(recentPickupData);
      setQrCodes(qrData);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      setDashboardError(error instanceof Error ? error.message : 'Failed to load admin dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{profile?.full_name}</span>
                <span className="text-gray-500 ml-2">({profile?.role})</span>
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

          <div className="border-t border-gray-200 mt-2">
            <nav className="flex flex-wrap gap-2 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{dashboardError}</div>
        )}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pickedToday}</div>
                <div className="text-sm text-gray-600">Picked Up Today</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.notPickedToday}</div>
                <div className="text-sm text-gray-600">Not Picked Up</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Manage Users</div>
                    <div className="text-sm text-gray-600">Add or edit system users</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Manage Students</div>
                    <div className="text-sm text-gray-600">Add or edit student records</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'qrcodes' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Codes</h2>
            {loadingData ? (
              <p className="text-gray-600">Loading QR codes...</p>
            ) : qrCodes.length === 0 ? (
              <p className="text-gray-600">No QR codes available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {qrCodes.slice(0, 20).map((code) => (
                      <tr key={code.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{code.code}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{code.user_name || code.user_id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{code.student_name || '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${code.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {code.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'scanner' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <QRScanner securityUserId={profile?.id || ''} onPickupComplete={loadAdminData} />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup History</h2>
            {loadingData ? (
              <p className="text-gray-600">Loading pickup history...</p>
            ) : recentPickups.length === 0 ? (
              <p className="text-gray-600">No pickup records yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPickups.map((pickup) => (
                  <div key={pickup.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">{pickup.student_name || 'Student'} ({pickup.grade || '-'})</div>
                    <div className="text-sm text-gray-600">
                      Picked by {pickup.picked_by_name || 'N/A'} • Verified by {pickup.verified_by_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(pickup.pickup_time).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            {loadingData ? (
              <p className="text-gray-600">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-600">No notifications available.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 25).map((notification) => (
                  <div key={notification.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{notification.title}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${notification.is_read ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
