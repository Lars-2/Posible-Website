import { useState, useEffect } from 'react';
import { Loader, Calendar as CalendarIcon, Clock, Phone } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
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
      const response = await adminApi.getSchedules(dbName);
      
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Scheduled Reports</h1>
        <p className="text-gray-600 mt-2">View configured automated business intelligence reports</p>
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
          <p className="text-lg">No scheduled reports configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {schedule.query.substring(0, 50)}{schedule.query.length > 50 ? '...' : ''}
                </h3>
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
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  <span>{schedule.to_number}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;

