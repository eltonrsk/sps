import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Users, LogOut, QrCode, History, UserPlus, ShieldAlert, Trash2, Bell, ChevronRight, GraduationCap, Eye, Check, AlertCircle } from 'lucide-react';
import { studentService, Guardian } from '../services/studentService';
import { notificationService, Notification } from '../services/notificationService';
import { patterns, getStatusColor } from '../styles/designSystem';

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

const navItems = [
  { id: 'students', label: 'My Children', icon: Users },
  { id: 'qr', label: 'QR Access', icon: QrCode },
  { id: 'guardians', label: 'Guardians', icon: UserPlus },
  { id: 'history', label: 'Pickup History', icon: History },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type TabId = (typeof navItems)[number]['id'];

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
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('students');

  useEffect(() => {
    loadParentData();
  }, []);

  // Set up polling for real-time notifications
  useEffect(() => {
    checkForNewNotifications();
    const interval = setInterval(checkForNewNotifications, 30000);
    return () => clearInterval(interval);
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotificationDropdown) {
        const target = event.target as Element;
        if (!target.closest('.notification-dropdown')) {
          setShowNotificationDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationDropdown]);

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
      
      // Load recent notifications for dropdown
      const recentData = await notificationService.getUserNotifications(false, 5);
      setRecentNotifications(recentData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const unreadData = await notificationService.getUnreadCount();
      const newUnreadCount = unreadData.unread_count;
      
      if (newUnreadCount !== unreadCount) {
        setUnreadCount(newUnreadCount);
        
        if (newUnreadCount > unreadCount) {
          const recentData = await notificationService.getUserNotifications(false, 5);
          setRecentNotifications(recentData);
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return Check;
      case 'warning':
        return AlertCircle;
      case 'info':
      default:
        return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[250px] bg-white border-r border-gray-100 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>

            <div className="ml-3">
              <h1 className="font-bold text-gray-900 text-lg">SPS</h1>
              <p className="text-xs text-gray-500">
                Parent Portal
              </p>
            </div>
          </div>

          {/* User */}
          <div className="px-5 py-5">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize mt-1">
                {profile?.role}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <div key={item.id} className="relative notification-dropdown">
                  <button
                    onClick={() => {
                      if (item.id === "notifications" && unreadCount > 0) {
                        setShowNotificationDropdown(!showNotificationDropdown);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {/* Status indicator for notifications */}
                        {item.id === "notifications" && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                            unreadCount > 0 
                              ? "bg-red-500 border-red-500 animate-pulse" 
                              : "bg-emerald-500 border-emerald-500"
                          }`} />
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Show notification badge for Notifications item */}
                      {item.id === "notifications" && unreadCount > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          active 
                            ? "bg-white text-blue-600" 
                            : "bg-red-500 text-white animate-pulse"
                        }`}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                      
                      {active && (
                        <ChevronRight className="w-4 h-4 opacity-80" />
                      )}
                    </div>
                  </button>

                  {/* Notification Dropdown */}
                  {item.id === "notifications" && showNotificationDropdown && (
                    <div className="absolute left-full ml-2 top-0 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <button
                            onClick={() => setActiveTab("notifications")}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View All
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {recentNotifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No new notifications</p>
                          </div>
                        ) : (
                          recentNotifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type);
                            const colorClass = getStatusColor(notification.type);
                            return (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  setShowNotificationDropdown(false);
                                }}
                                className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`text-sm font-medium text-gray-900 truncate ${
                                        !notification.is_read ? 'font-bold' : ''
                                      }`}>
                                        {notification.title}
                                      </h4>
                                      {!notification.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
          <div className="px-8 h-20 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your children's pickup safely.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-700 font-medium">
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'students' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          My Children
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          View your children information
        </p>
      </div>

      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
        <Users className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          {students.length} Students
        </span>
      </div>
    </div>

    {students.length === 0 ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          No students found
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Students linked to your account will appear here.
        </p>
      </motion.div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
          >
            {/* TOP */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-500 relative">
              <div className="absolute -bottom-10 left-6">
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
                    <Users className="w-9 h-9 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="pt-14 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {student.first_name} {student.last_name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Student Information
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* INFO */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Grade
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {student.grade}
                  </span>
                </div>

                {student.class_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Class
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {student.class_name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Added
                  </span>

                  <span className="text-sm font-medium text-gray-700">
                    {new Date(student.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
)}
  
 {activeTab === 'qr' && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <QRCodeDisplay userId={profile?.id || ''} students={students} />
                    </div>
                  )}

                  {activeTab === 'guardians' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Guardian Management</h2>
                        <p className="text-sm text-gray-600">Add backup guardians for student pickup authorization.</p>
                      </div>

                      {guardianError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl border bg-red-50 text-red-800 border-red-200 text-sm"
                        >
                          {guardianError}
                        </motion.div>
                      )}
                      {guardianSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl border bg-green-50 text-green-800 border-green-200 text-sm"
                        >
                          {guardianSuccess}
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-2xl"
                        >
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.first_name} {student.last_name} ({student.grade})
                            </option>
                          ))}
                        </select>

                        {selectedStudentId && backupGuardiansCount < 2 && (
                          <div className="mt-4 p-3 rounded-2xl border bg-amber-50 text-amber-800 border-amber-200 text-sm flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5" />
                            <span>
                              Add at least 2 backup guardians for this student. Current backup guardians: {backupGuardiansCount}.
                            </span>
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">Add New Guardian</h3>
                        <form onSubmit={handleAddGuardian}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={guardianName}
                              onChange={(e) => setGuardianName(e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-2xl"
                              placeholder="Guardian full name"
                              required
                            />
                            <input
                              type="email"
                              value={guardianEmail}
                              onChange={(e) => setGuardianEmail(e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-2xl"
                              placeholder="Guardian email"
                              required
                            />
                            <input
                              type="tel"
                              value={guardianPhone}
                              onChange={(e) => setGuardianPhone(e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-2xl"
                              placeholder="Guardian phone (optional)"
                            />
                            <input
                              type="text"
                              value={guardianRelationship}
                              onChange={(e) => setGuardianRelationship(e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-2xl"
                              placeholder="Relationship (e.g. Uncle)"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
                            disabled={!selectedStudentId}
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Guardian
                          </button>
                        </form>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                      >
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-gray-900">Authorized Guardians</h3>
                        </div>
                        {selectedStudentGuardians.length === 0 ? (
                          <div className="p-6 text-sm text-gray-600">No guardians linked to this student yet.</div>
                        ) : (
                          <div className="divide-y divide-gray-100">
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
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-200 text-red-700 rounded-2xl hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Pickup History</h2>
                      {pickups.length === 0 ? (
                        <motion.div
                          whileHover={{ y: -3 }}
                          className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm"
                        >
                          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-medium mb-2">No pickup history</p>
                          <p className="text-gray-500">Your pickup records will appear here once you start using the QR code system.</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ y: -3 }}
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
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
                              <tbody className="bg-white divide-y divide-gray-100">
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
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                          Completed
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={refreshNotifications}
                            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-colors ${patterns.button.secondary}`}
                          >
                            Refresh
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className={`px-4 py-2 text-sm font-medium rounded-2xl transition-colors ${patterns.button.primary}`}
                            >
                              Mark All as Read
                            </button>
                          )}
                        </div>
                      </div>
                      {notifications.length === 0 ? (
                        <motion.div
                          whileHover={{ y: -3 }}
                          className={`${patterns.card.base} p-12 text-center`}
                        >
                          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-medium mb-2">No notifications</p>
                          <p className="text-gray-500">Your notifications will appear here.</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ y: -3 }}
                          className={`${patterns.card.base} overflow-hidden`}
                        >
                          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {notifications.map((notification) => {
                              const studentNames = students.map(s => `${s.first_name} ${s.last_name}`).join('|');
                              const isRelatedToStudent = students.length === 0 || 
                                studentNames.split('|').some(name => 
                                  notification.message.includes(name) || notification.title.includes(name)
                                ) || notification.user_id === profile?.id;
                              
                              if (!isRelatedToStudent) return null;
                              
                              const Icon = getNotificationIcon(notification.type);
                              const colorClass = getStatusColor(notification.type);
                              
                              return (
                                <motion.div
                                  key={notification.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                    !notification.is_read 
                                      ? 'bg-blue-50 border-blue-200' 
                                      : 'bg-gray-50 border-gray-100'
                                  } hover:border-blue-200`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className={`font-semibold text-gray-900 truncate ${
                                            !notification.is_read ? 'font-bold' : ''
                                          }`}>
                                            {notification.title}
                                          </h3>
                                          {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                        <p className="text-xs text-gray-400">
                                          {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    {!notification.is_read && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notification.id);
                                        }}
                                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
