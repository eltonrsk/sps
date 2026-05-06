import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, ScanLine, History } from 'lucide-react';

type TodayStats = {
  totalPickups: number;
  recentPickups: Array<{
    id: string;
    student_name: string;
    parent_name: string;
    pickup_time: string;
  }>;
};

export default function SecurityDashboard() {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  const [stats] = useState<TodayStats>({
    totalPickups: 45,
    recentPickups: [
      { id: '1', student_name: 'John Doe', parent_name: 'Jane Doe', pickup_time: '2:30 PM' },
      { id: '2', student_name: 'Alice Smith', parent_name: 'Bob Smith', pickup_time: '2:15 PM' },
      { id: '3', student_name: 'Charlie Brown', parent_name: 'Lucy Brown', pickup_time: '2:00 PM' },
    ]
  });

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
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Security Dashboard</span>
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
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('scanner')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'scanner'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4" />
                  QR Scanner
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
                  Today's Pickups
                </div>
              </button>
            </nav>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Statistics</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPickups} Pickups</p>
              </div>
              <Shield className="w-16 h-16 text-blue-100" />
            </div>
          </div>
        </div>

        {activeTab === 'scanner' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Scanner</h2>
              <p className="text-gray-600">QR scanning functionality would be implemented here.</p>
            </div>

            {stats.recentPickups.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Pickups</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {stats.recentPickups.map((pickup) => (
                      <div key={pickup.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{pickup.student_name}</div>
                            <div className="text-sm text-gray-600">Picked by: {pickup.parent_name}</div>
                          </div>
                          <div className="text-sm text-gray-500">{pickup.pickup_time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup History</h2>
            <p className="text-gray-600">Pickup history functionality would be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
}