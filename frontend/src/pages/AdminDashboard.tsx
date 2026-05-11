import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import UserManagement from "../components/UserManagement";
import StudentManagement from "../components/StudentManagement";
import QRScanner from "../components/QRScanner";

import { studentService } from "../services/studentService";
import { userService } from "../services/userService";
import { pickupService, Pickup } from "../services/pickupService";
import { qrCodeService, QRCode } from "../services/qrCodeService";
import { notificationService, Notification } from "../services/notificationService";
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
  ChevronRight,
  Trash2,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";

type DashboardStats = {
  totalStudents: number;
  pickedToday: number;
  notPickedToday: number;
  totalUsers: number;
};

const navItems = [
  { id: "overview", label: "Dashboard", icon: GraduationCap },
  { id: "users", label: "Users", icon: UserPlus },
  { id: "students", label: "Students", icon: Plus },
  { id: "qrcodes", label: "QR Codes", icon: QrCode },
  { id: "scanner", label: "Scanner", icon: MapPin },
  { id: "history", label: "History", icon: ClipboardList },
  { id: "notifications", label: "Alerts", icon: Bell },
] as const;

type TabId = (typeof navItems)[number]["id"];

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const loadAdminData = async () => {
    try {
      const [students, users, todayPickups, recentPickupData, qrData] =
        await Promise.all([
          studentService.getAllStudents(),
          userService.getAllUsers(),
          pickupService.getTodayPickups(),
          pickupService.getRecentPickups(10),
          qrCodeService.getAllQRCodes(true),
        ]);

      const uniqueStudentPickups = new Set(
        todayPickups.map((pickup) => pickup.student_id)
      ).size;

      setStats({
        totalStudents: students.length,
        pickedToday: uniqueStudentPickups,
        notPickedToday: Math.max(
          students.length - uniqueStudentPickups,
          0
        ),
        totalUsers: users.length,
      });

      setRecentPickups(recentPickupData);
      setQrCodes(qrData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const [notificationData, unreadData] = await Promise.all([
        notificationService.getAllNotifications({ limit: 100 }),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationData);
      setUnreadCount(unreadData.unread_count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const unreadData = await notificationService.getUnreadCount();
      const newUnreadCount = unreadData.unread_count;
      
      // Only update if count changed
      if (newUnreadCount !== unreadCount) {
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      loadNotifications();
    }
  }, [activeTab]);

  // Set up polling for real-time notifications
  useEffect(() => {
    // Initial load
    checkForNewNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(checkForNewNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'pickup':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const statCards = [
    {
      title: "Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Picked Today",
      value: stats.pickedToday,
      icon: CheckCircle,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: stats.notPickedToday,
      icon: XCircle,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
      bg: "bg-slate-100",
      color: "text-slate-600",
    },
  ];

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
                Student Pickup System
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
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
                    {/* Show notification badge for Alerts item */}
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
                Manage students safely and smoothly.
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
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {statCards.map((card, index) => {
                      const Icon = card.icon;

                      return (
                        <motion.div
                          key={index}
                          whileHover={{ y: -4 }}
                          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                {card.title}
                              </p>
                              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                {loadingData ? "..." : card.value}
                              </h2>
                            </div>

                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}
                            >
                              <Icon
                                className={`w-7 h-7 ${card.color}`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Quick Access
                      </h2>

                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveTab("students")}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              Student Management
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => setActiveTab("users")}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              User Management
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Recent Pickups
                      </h2>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll">
                        {recentPickups.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No recent pickups.
                          </p>
                        ) : (
                          recentPickups.map((pickup) => (
                            <div
                              key={pickup.id}
                              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {pickup.student_name}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    pickup.pickup_time
                                  ).toLocaleString()}
                                </p>
                              </div>

                              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                Verified
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && <UserManagement />}
              {activeTab === "students" && <StudentManagement />}

              {activeTab === "scanner" && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <QRScanner
                    securityUserId={profile?.id || ""}
                    onPickupComplete={loadAdminData}
                  />
                </div>
              )}

              {activeTab === "qrcodes" && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-5">
                    QR Codes
                  </h2>

                  <div className="space-y-3">
                    {qrCodes.slice(0, 10).map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {code.student_name || "Student"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {code.code}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            code.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {code.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-5">
                    Pickup History
                  </h2>

                  <div className="space-y-3">
                    {recentPickups.map((pickup) => (
                      <div
                        key={pickup.id}
                        className="p-4 rounded-2xl bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {pickup.student_name}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              Picked by {pickup.picked_by_name}
                            </p>
                          </div>

                          <span className="text-xs text-gray-400">
                            {new Date(
                              pickup.pickup_time
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Notifications
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Mark All Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Bell className="w-14 h-14 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          No Notifications
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          You're all caught up! No new notifications.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const colorClass = getNotificationColor(notification.type);
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl border transition-all ${
                              !notification.is_read 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold text-gray-900 ${
                                      !notification.is_read ? 'font-bold' : ''
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.is_read && (
                                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>
                                      {notification.user_name || 'System'}
                                    </span>
                                    <span>
                                      {new Date(notification.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                                    title="Mark as read"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                                  title="Delete notification"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}