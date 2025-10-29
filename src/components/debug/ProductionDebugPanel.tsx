import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DebugLog {
  timestamp: string;
  message: string;
  data: string | null;
  url: string;
  level?: 'info' | 'warn' | 'error';
}

export const ProductionDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const [authLogs, setAuthLogs] = useState<DebugLog[]>([]);
  const [dashboardLogs, setDashboardLogs] = useState<DebugLog[]>([]);
  const [apiLogs, setApiLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const authLogsData = sessionStorage.getItem('auth_debug');
        const dashboardLogsData = sessionStorage.getItem('dashboard_debug');
        const apiLogsData = sessionStorage.getItem('api_debug');
        
        if (authLogsData) {
          setAuthLogs(JSON.parse(authLogsData));
        }
        
        if (dashboardLogsData) {
          setDashboardLogs(JSON.parse(dashboardLogsData));
        }
        
        if (apiLogsData) {
          setApiLogs(JSON.parse(apiLogsData));
        }
      } catch (error) {
        console.error('Erro ao carregar logs de debug:', error);
      }
    };

    loadLogs();
    
    // Atualizar logs a cada 5 segundos
    const interval = setInterval(loadLogs, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const clearAllLogs = () => {
    sessionStorage.removeItem('auth_debug');
    sessionStorage.removeItem('dashboard_debug');
    sessionStorage.removeItem('api_debug');
    setAuthLogs([]);
    setDashboardLogs([]);
    setApiLogs([]);
    alert('Todos os logs foram limpos');
  };

  const exportLogs = () => {
    const allLogs = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: window.location.href,
      user: user ? { email: user.email, role: user.role } : null,
      localStorage: {
        token: localStorage.getItem('token') ? 'presente' : 'ausente',
        userEmail: localStorage.getItem('userEmail'),
        userRole: localStorage.getItem('userRole')
      },
      authLogs,
      dashboardLogs,
      apiLogs
    };

    const dataStr = JSON.stringify(allLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* Botão flutuante para abrir o painel */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* Painel de debug */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Debug Panel - Produção</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Informações do sistema */}
              <div className="mb-6 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Ambiente:</strong> {process.env.NODE_ENV}
                  </div>
                  <div>
                    <strong>URL:</strong> {window.location.href}
                  </div>
                  <div>
                    <strong>Usuário:</strong> {user ? `${user.email} (${user.role})` : 'Não autenticado'}
                  </div>
                  <div>
                    <strong>Token:</strong> {localStorage.getItem('token') ? 'Presente' : 'Ausente'}
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="mb-6 flex gap-2">
                <button
                  onClick={clearAllLogs}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  Limpar Logs
                </button>
                <button
                  onClick={exportLogs}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Exportar Logs
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Recarregar Página
                </button>
              </div>

              {/* Logs de autenticação */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Logs de Autenticação ({authLogs.length})</h3>
                <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                  {authLogs.length === 0 ? (
                    <p className="text-gray-500">Nenhum log de autenticação</p>
                  ) : (
                    authLogs.slice(-10).map((log, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded text-xs">
                        <div className="font-mono text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="font-semibold">{log.message}</div>
                        {log.data && (
                          <pre className="mt-1 text-gray-700 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.data), null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Logs do dashboard */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Logs do Dashboard ({dashboardLogs.length})</h3>
                <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                  {dashboardLogs.length === 0 ? (
                    <p className="text-gray-500">Nenhum log do dashboard</p>
                  ) : (
                    dashboardLogs.slice(-10).map((log, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded text-xs">
                        <div className="font-mono text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="font-semibold">{log.message}</div>
                        {log.data && (
                          <pre className="mt-1 text-gray-700 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.data), null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Logs de API */}
              <div>
                <h3 className="font-bold mb-2">Logs de API ({apiLogs.length})</h3>
                <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                  {apiLogs.length === 0 ? (
                    <p className="text-gray-500">Nenhum log de API</p>
                  ) : (
                    apiLogs.slice(-10).map((log, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded text-xs">
                        <div className="font-mono text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className={`font-semibold ${
                          log.level === 'error' ? 'text-red-600' : 
                          log.level === 'warn' ? 'text-yellow-600' : 
                          'text-blue-600'
                        }`}>
                          {log.message}
                        </div>
                        {log.data && (
                          <pre className="mt-1 text-gray-700 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.data), null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};