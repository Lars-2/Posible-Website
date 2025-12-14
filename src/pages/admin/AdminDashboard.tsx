import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Loader,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    schedules: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load users and schedules in parallel
      const [usersResponse, schedulesResponse] = await Promise.all([
        adminApi.getUsers().catch(() => ({ success: false, users: [] })),
        adminApi.getSchedules().catch(() => ({ success: false, schedules: [] })),
      ]);

      setStats({
        users: usersResponse.success ? usersResponse.users.length : 0,
        schedules: schedulesResponse.success ? schedulesResponse.schedules.length : 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    // {
    //   title: 'Start Chatting',
    //   description: 'Ask questions about your business data',
    //   icon: MessageSquare,
    //   color: 'bg-blue-500',
    //   link: '/admin/chat',
    // },
    {
      title: 'Manage Users',
      description: 'Add or remove account users',
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/users',
    },
    {
      title: 'Schedule Reports',
      description: 'Automate your business insights',
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/admin/schedules',
    },
    {
      title: 'POS Integrations',
      description: 'Connect your Point of Sale systems',
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '/admin/integrations',
    },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Schedules',
      value: stats.schedules,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Chief Intelligence Officer</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={stat.color} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="flex items-center text-primary-600 text-sm font-medium">
                      <span>Get started</span>
                      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* About Posible */}
          <div className="bg-white rounded-lg shadow-md p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <TrendingUp size={24} className="mr-2" />
                  <h2 className="text-2xl font-bold">Your Chief Intelligence Officer</h2>
                </div>
                <p className="text-primary-100 mb-4 max-w-2xl">
                  Posible integrates with your business platforms to analyze operations, synthesize insights, 
                  and provide data-driven recommendations across financials, inventory, marketing, staffing, 
                  and customer engagement.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>24/7 business intelligence and insights</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Natural language queries for data analysis</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Automated scheduled reports via SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

