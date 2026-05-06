import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const [stats] = useState<DashboardStats>({
    totalStudents: 150,
    pickedToday: 120,
    notPickedToday: 30,
    totalUsers: 25,
  });
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">User management functionality would be implemented here.</p>
          </div>
        )}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Management</h2>
            <p className="text-gray-600">Student management functionality would be implemented here.</p>
          </div>
        )}
        {activeTab === 'qrcodes' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Codes</h2>
            <p className="text-gray-600">Generate and manage QR codes here.</p>
          </div>
        )}
        {activeTab === 'scanner' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Scanner</h2>
            <p className="text-gray-600">Scan student QR codes for pickup check-in.</p>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup History</h2>
            <p className="text-gray-600">View pickup logs and reports.</p>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <p className="text-gray-600">Manage app notifications and alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
