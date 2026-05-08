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
} from 'lucide-react';
import { motion } from 'framer-motion';

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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-5 py-3 rounded-2xl text-white shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pickups</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {filteredPickups.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Activity className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
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

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Filter</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1 capitalize">
                {dateFilter}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Filter className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm"
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
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FILTER */}
          <div className="relative">
            <Filter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full appearance-none pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0"
        >

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-auto max-h-[600px]">

            <table className="min-w-full">

              <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pickup Time
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Picked By
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredPickups.map((pickup, index) => {
                  const date = new Date(pickup.pickup_time);

                  return (
                    <motion.tr
                      key={pickup.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-blue-50/40 transition-colors"
                    >

                      {/* STUDENT */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {pickup.student_name}
                            </p>

                            <p className="text-sm text-gray-500">
                              Student Record
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock3 className="w-4 h-4 text-gray-400" />

                          <div>
                            <p className="font-medium">
                              {date.toLocaleDateString()}
                            </p>

                            <p className="text-sm text-gray-500">
                              {date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* GRADE */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {pickup.grade}
                        </span>
                      </td>

                      {/* PARENT */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">

                          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                          </div>

                          <span className="font-medium text-gray-700">
                            {pickup.parent_name}
                          </span>
                        </div>
                      </td>

                      {/* NOTES */}
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-2 max-w-xs">

                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {pickup.notes || 'No notes available'}
                          </p>
                        </div>
                      </td>

                    </motion.tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}