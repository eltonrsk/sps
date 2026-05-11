import { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  Search,
  Filter,
  Clock3,
  User,
  GraduationCap,
  FileText,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { patterns, animations, getStatusColor } from '../styles/designSystem';

type PickupRecord = {
  id: string;
  pickup_time: string;
  student_name: string;
  parent_name: string;
  grade: string;
  notes: string | null;
};


export default function PickupHistoryView({
  userId,
  userRole,
}: {
  userId: string;
  userRole: 'parent' | 'security' | 'admin';
}) {
  const [pickups, setPickups] = useState<PickupRecord[]>([]);
  const [filteredPickups, setFilteredPickups] = useState<PickupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPickups();
  }, [userId, userRole, dateFilter]);

  useEffect(() => {
    filterPickups();
  }, [pickups, searchTerm]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with your data fetching logic
      // Use getDateCondition() to filter data by date range
      const dateCondition = getDateCondition();
      const mockData: PickupRecord[] = [];
      
      // Apply date filtering if a date condition is set
      const filteredData = dateCondition 
        ? mockData.filter(pickup => new Date(pickup.pickup_time) >= new Date(dateCondition))
        : mockData;
      
      setPickups(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDateCondition = () => {
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();

      case 'week':
        return new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();

      case 'month':
        return new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();

      default:
        return null;
    }
  };

  const filterPickups = () => {
    if (!searchTerm) {
      setFilteredPickups(pickups);
      return;
    }

    const filtered = pickups.filter(
      (pickup) =>
        pickup.student_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        pickup.parent_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    setFilteredPickups(filtered);
  };

  const getPickupStatus = (pickupTime: string) => {
    const now = new Date();
    const pickupDate = new Date(pickupTime);
    const hoursDiff = (now.getTime() - pickupDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return {
        status: 'Recent',
        color: getStatusColor('success'),
        icon: CheckCircle
      };
    } else if (hoursDiff < 24) {
      return {
        status: 'Today',
        color: getStatusColor('info'),
        icon: Clock3
      };
    } else {
      return {
        status: 'Older',
        color: getStatusColor('neutral'),
        icon: Calendar
      };
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Student', 'Grade', 'Picked By', 'Notes'];

    const rows = filteredPickups.map((p) => {
      const date = new Date(p.pickup_time);

      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        p.student_name,
        p.grade,
        p.parent_name,
        p.notes || '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv',
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `pickup-history-${Date.now()}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Pickup History
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitor all pickup activities in real-time
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={filteredPickups.length === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${patterns.button.primary} disabled:opacity-50`}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className={`${patterns.card.base} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pickups</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {filteredPickups.length}
              </h3>
            </div>

            <div className={`${patterns.iconContainer.xl} ${patterns.iconBackground.blue} flex items-center justify-center`}>
              <Activity className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className={`${patterns.card.base} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Records</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {
                  pickups.filter((p) => {
                    const today = new Date().toDateString();
                    return new Date(p.pickup_time).toDateString() === today;
                  }).length
                }
              </h3>
            </div>

            <div className={`${patterns.iconContainer.xl} ${patterns.iconBackground.green} flex items-center justify-center`}>
              <Calendar className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className={`${patterns.card.base} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Filter</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1 capitalize">
                {dateFilter}
              </h3>
            </div>

            <div className={`${patterns.iconContainer.xl} ${patterns.iconBackground.yellow} flex items-center justify-center`}>
              <Filter className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <motion.div
        {...animations.fadeIn}
        className={`${patterns.card.base} p-5`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search student or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={patterns.input.base}
            />
          </div>

          {/* FILTER */}
          <div className="relative">
            <Filter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`appearance-none ${patterns.input.base}`}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* EMPTY STATE */}
      {filteredPickups.length === 0 ? (
        <div className={`${patterns.card.base} p-16 text-center`}>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className={`w-10 h-10 ${patterns.iconBackground.blue.replace('bg-', 'text-').replace('text-blue-100', 'text-blue-600')}`} />
          </div>

          <h3 className="text-2xl font-bold text-gray-800">
            No pickup records found
          </h3>

          <p className="text-gray-500 mt-3">
            Pickup activities will appear here once students are picked up.
          </p>
        </div>
      ) : (
        <motion.div
          {...animations.fadeIn}
          className={`${patterns.card.base} p-6`}
        >
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredPickups.map((pickup, index) => {
              const date = new Date(pickup.pickup_time);
              const status = getPickupStatus(pickup.pickup_time);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={pickup.id}
                  {...animations.stagger(index * 0.03)}
                  className={`p-4 rounded-2xl border border-gray-100 ${patterns.card.interactive}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${patterns.iconContainer.md} flex items-center justify-center flex-shrink-0 ${patterns.iconBackground.blue}`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {pickup.student_name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}>
                            {status.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{pickup.parent_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor('info')}`}>
                              {pickup.grade}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock3 className="w-3 h-3" />
                          <span>{date.toLocaleString()}</span>
                        </div>
                        {pickup.notes && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                            <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{pickup.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`${patterns.iconContainer.sm} flex items-center justify-center border ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}