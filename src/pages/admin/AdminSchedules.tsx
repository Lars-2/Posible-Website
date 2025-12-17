import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { adminApi, DEFAULT_PHONE_NUMBER } from '../../services/adminApi';
import { useDbName } from '../../hooks/useDbName';

const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

interface Schedule {
  id: number;
  query: string;
  to_number: string;
  day: string;
  hour: number;
}

const AdminSchedules = () => {
  const dbName = useDbName();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    request: '',
    to_number: DEFAULT_PHONE_NUMBER,
    days: [] as string[],
    hour: 9,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (dbName) {
      loadSchedules();
    }
  }, [dbName]);

  const loadSchedules = async () => {
    if (!dbName) {
      setError('Database name not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await adminApi.getSchedules(DEFAULT_PHONE_NUMBER, dbName);
      
      if (response.success) {
        setSchedules(response.schedules);
      } else {
        setError(response.error || 'Failed to load schedules');
      }
    } catch (err) {
      console.error('Failed to load schedules:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (schedule: Schedule | null = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        request: schedule.query,
        to_number: schedule.to_number,
        days: schedule.day.split(','),
        hour: schedule.hour,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        request: '',
        to_number: DEFAULT_PHONE_NUMBER,
        days: [],
        hour: 9,
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setFormData({
      request: '',
      to_number: DEFAULT_PHONE_NUMBER,
      days: [],
      hour: 9,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request.trim() || formData.days.length === 0) {
      setError('Request and at least one day are required');
      return;
    }

    if (!dbName) {
      setError('Database name not available');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      let response;
      if (editingSchedule) {
        response = await adminApi.editSchedule(editingSchedule.id, formData, dbName);
      } else {
        response = await adminApi.createSchedule(formData, dbName);
      }
      
      if (response.success) {
        handleCloseModal();
        loadSchedules();
      } else {
        setError(response.error || 'Failed to save schedule');
      }
    } catch (err) {
      console.error('Failed to save schedule:', err);
      setError('Failed to save schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    if (!dbName) {
      setError('Database name not available');
      return;
    }

    try {
      setError('');
      const response = await adminApi.deleteSchedule(scheduleId, DEFAULT_PHONE_NUMBER, dbName);
      
      if (response.success) {
        loadSchedules();
      } else {
        setError(response.error || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      setError('Failed to delete schedule. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const formatDays = (dayString: string) => {
    const days = dayString.split(',');
    return days.map(day => {
      const dayObj = DAYS_OF_WEEK.find(d => d.value === day);
      return dayObj ? dayObj.label.substring(0, 3) : day;
    }).join(', ');
  };

  const formatHour = (hour: number) => {
    const h = parseInt(hour.toString());
    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';
    return `${h - 12}:00 PM`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Reports</h1>
          <p className="text-gray-600 mt-2">Automate your business intelligence reports</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Schedule</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-64 text-gray-400">
          <CalendarIcon size={64} className="mb-4" />
          <p className="text-lg">No scheduled reports yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {schedule.query.substring(0, 50)}{schedule.query.length > 50 ? '...' : ''}
                  </h3>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => handleOpenModal(schedule)}
                    className="text-primary-600 hover:text-primary-700"
                    title="Edit schedule"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete schedule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon size={16} className="mr-2 text-gray-400" />
                  <span>{formatDays(schedule.day)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{formatHour(schedule.hour)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Query
                  </label>
                  <textarea
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="e.g., What were our total sales yesterday?"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This query will be sent to Posible at the scheduled time
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of Week
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${formData.days.includes(day.value)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (Hour)
                  </label>
                  <select
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {formatHour(i)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.to_number}
                    onChange={(e) => setFormData({ ...formData, to_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="+18014005585"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;

