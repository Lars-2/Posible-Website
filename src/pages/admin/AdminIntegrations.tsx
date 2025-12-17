import { useState, useEffect } from 'react';
import { 
  Plug, 
  CheckCircle, 
  XCircle, 
  Loader, 
  ExternalLink,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useDbName } from '../../hooks/useDbName';

interface Integration {
  provider: string;
  name: string;
  description: string;
  connected: boolean;
  connected_at?: string;
  merchant_id?: string;
}

const AdminIntegrations = () => {
  const dbName = useDbName();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showToastModal, setShowToastModal] = useState(false);
  const [toastApiKey, setToastApiKey] = useState('');
  const [toastRestaurantGuid, setToastRestaurantGuid] = useState('');
  const [isSavingToast, setIsSavingToast] = useState(false);

  useEffect(() => {
    if (dbName) {
      loadIntegrations();
    }
  }, [dbName]);

  const loadIntegrations = async () => {
    if (!dbName) {
      setError('Database name not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await adminApi.getIntegrations(dbName);
      
      if (response.success) {
        setIntegrations(response.integrations);
      } else {
        setError(response.error || 'Failed to load integrations');
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
      setError('Failed to load integrations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    // Special handling for Toast (API key instead of OAuth)
    if (provider === 'toast') {
      setShowToastModal(true);
      return;
    }

    if (!dbName) {
      setError('Database name not available');
      return;
    }

    try {
      setConnecting(provider);
      setError('');
      
      const response = await adminApi.connectIntegration(provider, dbName);
      
      if (response.success && response.auth_url) {
        // Open OAuth flow in new window
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const authWindow = window.open(
          response.auth_url,
          'oauth_window',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Poll for window closure
        const pollTimer = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(pollTimer);
            setConnecting(null);
            // Reload integrations after OAuth completes
            setTimeout(() => loadIntegrations(), 1000);
          }
        }, 500);
      } else {
        throw new Error(response.error || 'Failed to initiate connection');
      }
    } catch (err: any) {
      console.error('Failed to connect integration:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect. Please try again.');
      setConnecting(null);
    }
  };

  const handleSaveToastApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toastApiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!dbName) {
      setError('Database name not available');
      return;
    }

    try {
      setIsSavingToast(true);
      setError('');
      
      const response = await adminApi.saveToastApiKey(toastApiKey, toastRestaurantGuid || null, dbName);
      
      if (response.success) {
        setShowToastModal(false);
        setToastApiKey('');
        setToastRestaurantGuid('');
        loadIntegrations();
      } else {
        setError(response.error || 'Failed to save Toast API key');
      }
    } catch (err: any) {
      console.error('Failed to save Toast API key:', err);
      setError(err.response?.data?.error || 'Failed to save API key. Please try again.');
    } finally {
      setIsSavingToast(false);
    }
  };

  const handleDisconnect = async (provider: string, providerName: string) => {
    if (!window.confirm(`Are you sure you want to disconnect ${providerName}?`)) {
      return;
    }

    if (!dbName) {
      setError('Database name not available');
      return;
    }

    try {
      setError('');
      const response = await adminApi.disconnectIntegration(provider, dbName);
      
      if (response.success) {
        loadIntegrations();
      } else {
        setError(response.error || 'Failed to disconnect');
      }
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      setError('Failed to disconnect. Please try again.');
    }
  };

  const getProviderIcon = (provider: string) => {
    // Return appropriate icon or logo for each provider
    const icons: Record<string, string> = {
      square: '⬛',
      clover: '🍀',
      toast: '🍞',
    };
    return icons[provider] || '🔌';
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      square: 'from-blue-500 to-blue-600',
      clover: 'from-green-500 to-green-600',
      toast: 'from-gray-500 to-gray-600',
    };
    return colors[provider] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect your Point of Sale systems</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <>
          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div 
                key={integration.provider} 
                className="bg-white rounded-lg shadow-md p-0 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Provider Header */}
                <div className={`bg-gradient-to-r ${getProviderColor(integration.provider)} text-white p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">
                        {getProviderIcon(integration.provider)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{integration.name}</h3>
                        <p className="text-white text-opacity-90 text-sm">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Connection Status */}
                  <div className="mb-4">
                    {integration.connected ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="font-medium">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <XCircle size={20} />
                        <span className="font-medium">Not Connected</span>
                      </div>
                    )}
                    
                    {integration.connected && integration.connected_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        Since {formatDate(integration.connected_at)}
                      </p>
                    )}
                    
                    {integration.connected && integration.merchant_id && (
                      <p className="text-sm text-gray-600 mt-1">
                        Merchant ID: {integration.merchant_id}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {integration.connected ? (
                      <button
                        onClick={() => handleDisconnect(integration.provider, integration.name)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Trash2 size={16} />
                        <span>Disconnect</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.provider)}
                        disabled={connecting === integration.provider}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {connecting === integration.provider ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Toast Info */}
                  {integration.provider === 'toast' && !integration.connected && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      <strong>Note:</strong> Toast uses API key authentication
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Connect Your POS?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">📊</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Data</h3>
                  <p className="text-gray-700 text-sm">
                    Access live sales, inventory, and customer data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">🤖</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                  <p className="text-gray-700 text-sm">
                    Get intelligent recommendations based on your data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">📱</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SMS Reports</h3>
                  <p className="text-gray-700 text-sm">
                    Receive automated business intelligence via text
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">🔒</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                  <p className="text-gray-700 text-sm">
                    OAuth2 authentication keeps your data safe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast API Key Modal */}
      {showToastModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-3">🍞</div>
              <h2 className="text-2xl font-bold text-gray-900">Connect Toast POS</h2>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Enter your Toast API credentials to connect your restaurant POS system.
            </p>

            <form onSubmit={handleSaveToastApiKey}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={toastApiKey}
                    onChange={(e) => setToastApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter your Toast API key"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in your Toast Developer Portal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant GUID <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={toastRestaurantGuid}
                    onChange={(e) => setToastRestaurantGuid(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="e.g., 12a34b56-78cd-90ef-gh12-ijk345lmn678"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your unique restaurant identifier
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowToastModal(false);
                    setToastApiKey('');
                    setToastRestaurantGuid('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingToast}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isSavingToast || !toastApiKey.trim()}
                >
                  {isSavingToast ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Connect Toast</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Need help?</strong> Contact Toast support to obtain your API credentials at{' '}
                <a 
                  href="https://pos.toasttab.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  pos.toasttab.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIntegrations;

