import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Download } from 'lucide-react';

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
  userRole
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
      let query = supabase
        .from('pickups')
        .select(`
          id,
          pickup_time,
          notes,
          students(first_name, last_name, grade),
          picked_by_user_id
        `)
        .order('pickup_time', { ascending: false });

      const dateCondition = getDateCondition();
      if (dateCondition) {
        query = query.gte('pickup_time', dateCondition);
      }

      if (userRole === 'parent') {
        const { data: guardianData } = await supabase
          .from('guardians')
          .select('student_id')
          .eq('user_id', userId);

        const studentIds = guardianData?.map(g => g.student_id) || [];
        query = query.in('student_id', studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const parentIds = [...new Set(data?.map(p => p.picked_by_user_id) || [])];
      const { data: parents } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', parentIds);

      const parentMap = new Map(parents?.map(p => [p.id, p.full_name]) || []);

      const pickupRecords = data?.map(p => ({
        id: p.id,
        pickup_time: p.pickup_time,
        student_name: `${(p.students as { first_name: string; last_name: string }).first_name} ${(p.students as { first_name: string; last_name: string }).last_name}`,
        parent_name: parentMap.get(p.picked_by_user_id) || 'Unknown',
        grade: (p.students as { grade: string }).grade,
        notes: p.notes,
      })) || [];

      setPickups(pickupRecords);
    } catch (error) {
      console.error('Error loading pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateCondition = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
      }
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        weekAgo.setHours(0, 0, 0, 0);
        return weekAgo.toISOString();
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        monthAgo.setHours(0, 0, 0, 0);
        return monthAgo.toISOString();
      }
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
        pickup.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPickups(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Student', 'Grade', 'Picked By', 'Notes'];
    const rows = filteredPickups.map(p => {
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
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pickup-history-${Date.now()}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pickup History</h2>
          <p className="text-gray-600 text-sm mt-1">View and export pickup records</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredPickups.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by student or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {filteredPickups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pickup records found.</p>
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
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Picked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPickups.map((pickup) => {
                  const date = new Date(pickup.pickup_time);
                  return (
                    <tr key={pickup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date.toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{date.toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pickup.student_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pickup.grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pickup.parent_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{pickup.notes || '-'}</div>
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
  );
}
