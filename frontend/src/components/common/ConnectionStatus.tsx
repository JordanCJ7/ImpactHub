// Connection Status Component
import React from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useHealthCheck } from '../../hooks/useHealthCheck';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, loading, error } = useHealthCheck();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Backend offline</span>
        {error && (
          <span className="text-xs opacity-75" title={error}>
            ({error.slice(0, 20)}...)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-green-500 ${className}`}>
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm">Connected</span>
    </div>
  );
};
