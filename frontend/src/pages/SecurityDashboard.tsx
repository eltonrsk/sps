import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, ScanLine, History, ChevronRight, CheckCircle, Clock, Users } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { pickupService, Pickup } from '../services/pickupService';

type TodayStats = {
  totalPickups: number;
  recentPickups: Pickup[];
  pendingPickups: number;
  averageTime: number;
};

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: Shield },
  { id: 'scanner', label: 'QR Scanner', icon: ScanLine },
  { id: 'history', label: 'Pickup History', icon: History },
] as const;

type TabId = (typeof navItems)[number]['id'];

export default function SecurityDashboard() {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<TodayStats>({
    totalPickups: 0,
    recentPickups: [],
    pendingPickups: 0,
    averageTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [todayPickups, recentPickupData] = await Promise.all([
        pickupService.getTodayPickups(),
        pickupService.getRecentPickups(10)
      ]);

      // Calculate average pickup time (mock calculation)
      const averageTime = todayPickups.length > 0 
        ? todayPickups.reduce((acc) => acc + 5, 0) / todayPickups.length 
        : 0;

      setStats({
        totalPickups: todayPickups.length,
        recentPickups: recentPickupData,
        pendingPickups: Math.max(0, 50 - todayPickups.length), // Mock pending count
        averageTime: Math.round(averageTime)
      });
    } catch (error) {
      console.error('Error loading security data:', error);
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

  const statCards = [
    {
      title: 'Today\'s Pickups',
      value: stats.totalPickups,
      icon: CheckCircle,
      bg: 'bg-emerald-100',
      color: 'text-emerald-600',
    },
    {
      title: 'Pending',
      value: stats.pendingPickups,
      icon: Clock,
      bg: 'bg-orange-100',
      color: 'text-orange-600',
    },
    {
      title: 'Avg. Time',
      value: `${stats.averageTime}m`,
      icon: Shield,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      title: 'Security Staff',
      value: '8',
      icon: Users,
      bg: 'bg-slate-100',
      color: 'text-slate-600',
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
              <Shield className="w-6 h-6 text-white" />
            </div>

            <div className="ml-3">
              <h1 className="font-bold text-gray-900 text-lg">SPS</h1>
              <p className="text-xs text-gray-500">
                Security Portal
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
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>

                  {active && (
                    <ChevronRight className="w-4 h-4 opacity-80" />
                  )}
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
                Monitor and verify student pickups securely.
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
              {activeTab === 'overview' && (
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
                                {loading ? "..." : card.value}
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

                  {/* Quick Actions & Recent Activity */}
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
                          onClick={() => setActiveTab('scanner')}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <ScanLine className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              QR Scanner
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => setActiveTab('history')}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              Pickup History
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Recent Pickups
                      </h2>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll">
                        {stats.recentPickups.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No recent pickups.
                          </p>
                        ) : (
                          stats.recentPickups.slice(0, 5).map((pickup) => (
                            <div
                              key={pickup.id}
                              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {pickup.student_name || 'Student'}
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
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'scanner' && (
                <div className="space-y-6">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                  >
                    <QRScanner securityUserId={profile?.id || ''} onPickupComplete={loadSecurityData} />
                  </motion.div>

                  {stats.recentPickups.length > 0 && (
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Pickups</h2>
                      <div className="space-y-3">
                        {stats.recentPickups.map((pickup) => (
                          <div key={pickup.id} className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {pickup.student_name || 'Unknown Student'} ({pickup.grade || '-'})
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Picked by: {pickup.picked_by_name || 'Unknown'} • Verified by: {pickup.verified_by_name || 'Unknown'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(pickup.pickup_time).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-5">
                    Pickup History
                  </h2>

                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : stats.recentPickups.length === 0 ? (
                      <div className="text-center py-12">
                        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium mb-2">No pickup history</p>
                        <p className="text-gray-500">Your pickup records will appear here once you start using the QR code system.</p>
                      </div>
                    ) : (
                      stats.recentPickups.map((pickup) => (
                        <div
                          key={pickup.id}
                          className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {pickup.student_name || 'Student'} ({pickup.grade || '-'})
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Picked by {pickup.picked_by_name || 'N/A'} • Verified by {pickup.verified_by_name || 'N/A'}
                              </p>
                            </div>

                            <span className="text-xs text-gray-400">
                              {new Date(
                                pickup.pickup_time
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}