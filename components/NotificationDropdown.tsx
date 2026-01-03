import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, Clock, Calendar, TrendingUp, 
  X, ChevronRight, DollarSign, User, FileText
} from 'lucide-react';
import { getNotificationsByType, Notification } from '../services/notificationService';
import { APP_MODULES } from '../constants';

const getModuleName = (moduleId: string): string => {
  const module = APP_MODULES.find(m => m.id === moduleId);
  return module?.name || moduleId;
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = React.useState<{
    overdue: Notification[];
    due_today: Notification[];
    upcoming: Notification[];
    high_outstanding: Notification[];
  }>({
    overdue: [],
    due_today: [],
    upcoming: [],
    high_outstanding: []
  });

  useEffect(() => {
    if (isOpen) {
      const data = getNotificationsByType();
      setNotifications(data);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    // Remove # from hash-based link for HashRouter
    const path = notification.link.replace('#', '');
    navigate(path);
    onClose();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'due_today':
        return <Clock size={16} className="text-amber-500" />;
      case 'upcoming':
        return <Calendar size={16} className="text-blue-500" />;
      case 'high_outstanding':
        return <TrendingUp size={16} className="text-purple-500" />;
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return 'Overdue';
      case 'due_today':
        return 'Due Today';
      case 'upcoming':
        return 'Upcoming (7 days)';
      case 'high_outstanding':
        return 'High Outstanding';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-100 text-red-700';
      case 'due_today':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'upcoming':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'high_outstanding':
        return 'bg-purple-50 border-purple-100 text-purple-700';
    }
  };

  const totalCount = notifications.overdue.length + 
                     notifications.due_today.length + 
                     notifications.upcoming.length + 
                     notifications.high_outstanding.length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 max-h-[600px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-stone-900">Notifications</h3>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {totalCount === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <FileText size={24} className="text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium">No notifications</p>
            <p className="text-stone-400 text-sm mt-1">All payments are up to date</p>
          </div>
        ) : (
          <div className="p-2">
            {/* Overdue Section */}
            {notifications.overdue.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Overdue ({notifications.overdue.length})
                  </h4>
                </div>
                {notifications.overdue.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}

            {/* Due Today Section */}
            {notifications.due_today.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Due Today ({notifications.due_today.length})
                  </h4>
                </div>
                {notifications.due_today.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}

            {/* Upcoming Section */}
            {notifications.upcoming.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Upcoming ({notifications.upcoming.length})
                  </h4>
                </div>
                {notifications.upcoming.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}

            {/* High Outstanding Section */}
            {notifications.high_outstanding.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 mb-2 flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-500" />
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    High Outstanding ({notifications.high_outstanding.length})
                  </h4>
                </div>
                {notifications.high_outstanding.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatDate: (dateString: string) => string;
  getTypeIcon: (type: Notification['type']) => React.ReactNode;
  getTypeColor: (type: Notification['type']) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  formatCurrency,
  formatDate,
  getTypeIcon,
  getTypeColor
}) => {
  return (
    <button
      onClick={() => onClick(notification)}
      className="w-full p-3 mb-2 rounded-xl border hover:shadow-md transition-all text-left group bg-white hover:bg-stone-50"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg border shrink-0 ${getTypeColor(notification.type)}`}>
          {getTypeIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-900 truncate flex items-center gap-1.5">
                <User size={14} className="text-stone-400 shrink-0" />
                {notification.title}
              </div>
              {notification.description && (
                <div className="text-xs text-stone-500 mt-0.5 truncate">
                  {notification.description}
                </div>
              )}
            </div>
            <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-600 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-stone-400" />
              <span className="text-sm font-bold text-stone-900">
                {formatCurrency(notification.amount, notification.currency)}
              </span>
            </div>
            {notification.dueDate && (
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <Calendar size={12} />
                {formatDate(notification.dueDate)}
              </div>
            )}
            <div className="text-xs text-stone-400">
              {getModuleName(notification.sourceModule)} / {notification.sourceTab}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

