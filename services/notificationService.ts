import { APP_MODULES } from '../constants';
import { getExportedStones } from './dataService';
import { ExtendedSpinelStone } from '../types';

export interface Notification {
  id: string;
  type: 'overdue' | 'due_today' | 'upcoming' | 'high_outstanding';
  title: string; // Customer/Name
  amount: number;
  currency: string;
  dueDate?: string;
  sourceModule: string;
  sourceTab: string;
  description?: string;
  link: string; // Navigation link
}

interface PaymentItem {
  id: string;
  date: string;
  code: string;
  customerName: string;
  description: string;
  invoiceAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currency: string;
  dueDate?: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  convertedAmount?: number;
  [key: string]: any;
}

// Helper to get module name
const getModuleName = (moduleId: string): string => {
  const module = APP_MODULES.find(m => m.id === moduleId);
  return module?.name || moduleId;
};

// Helper to convert amount to LKR
const convertToLKR = (amount: number, currency: string, convertedAmount?: number, exchangeRate?: number): number => {
  if (currency === 'LKR') return amount;
  if (convertedAmount !== undefined && convertedAmount !== null) return convertedAmount;
  if (exchangeRate && exchangeRate > 0) return amount * exchangeRate;
  return amount;
};

// Helper to format date for comparison
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === '-' || dateString === '') return '';
  return dateString;
};

// Helper to check if date is today
const isToday = (dateString: string): boolean => {
  if (!dateString || dateString === '-' || dateString === '') return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

// Helper to check if date is in next 7 days
const isUpcoming = (dateString: string): boolean => {
  if (!dateString || dateString === '-' || dateString === '') return false;
  const today = new Date();
  const dueDate = new Date(dateString);
  const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff > 0 && daysDiff <= 7;
};

// Helper to check if date is overdue
const isOverdue = (dateString: string): boolean => {
  if (!dateString || dateString === '-' || dateString === '') return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

export const getNotifications = (): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date().toISOString().split('T')[0];
  const HIGH_OUTSTANDING_THRESHOLD = 100000; // 100,000 LKR

  // 1. Scan Payment Ledger items across all modules
  APP_MODULES.forEach(module => {
    module.tabs.forEach(tabId => {
      // Skip dashboard tabs
      if (tabId.toLowerCase().includes('dashboard')) return;

      const paymentKeys = [
        `unified_payment_ledger_${module.id}_${tabId}`,
        `payment_ledger_${module.id}_${tabId}`,
        `payment_${module.id}_${tabId}`
      ];

      for (const key of paymentKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const items: PaymentItem[] = JSON.parse(data);
            
            items.forEach(item => {
              const outstanding = item.outstandingAmount || 0;
              if (outstanding <= 0) return; // Skip if no outstanding amount

              const lkrAmount = convertToLKR(outstanding, item.currency, item.convertedAmount, item.exchangeRate);
              const dueDate = formatDate(item.dueDate || '');

              // Determine notification type
              let type: Notification['type'] | null = null;
              
              if (dueDate) {
                if (isOverdue(dueDate)) {
                  type = 'overdue';
                } else if (isToday(dueDate)) {
                  type = 'due_today';
                } else if (isUpcoming(dueDate)) {
                  type = 'upcoming';
                }
              }

              // High outstanding (if no due date or not in other categories)
              if (!type && lkrAmount >= HIGH_OUTSTANDING_THRESHOLD && 
                  (item.status === 'Pending' || item.status === 'Partial')) {
                type = 'high_outstanding';
              }

              if (type) {
                notifications.push({
                  id: `payment-${item.id}`,
                  type,
                  title: item.customerName || 'Unknown Customer',
                  amount: lkrAmount,
                  currency: 'LKR',
                  dueDate: dueDate || undefined,
                  sourceModule: module.id,
                  sourceTab: tabId,
                  description: item.description || item.code,
                  link: `#/module/${module.id}/${tabId}`
                });
              }
            });
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error(`Failed to parse ${key}:`, e);
          }
        }
      }
    });
  });

  // 2. Scan Stone Sales with payment due dates
  const allStones = getExportedStones();
  
  allStones.forEach(stone => {
    // Only include stones with payment due dates and not fully paid
    if (!stone.paymentDueDate || stone.paymentDueDate === '-' || stone.paymentDueDate === '') return;
    if (stone.salesPaymentStatus === 'Paid') return;

    const outstanding = (stone.finalPrice || 0) - (stone.transactionAmount || 0);
    if (outstanding <= 0) return;

    const dueDate = formatDate(stone.paymentDueDate);
    if (!dueDate) return;

    // Determine notification type
    let type: Notification['type'] | null = null;
    
    if (isOverdue(dueDate)) {
      type = 'overdue';
    } else if (isToday(dueDate)) {
      type = 'due_today';
    } else if (isUpcoming(dueDate)) {
      type = 'upcoming';
    }

    if (type) {
      // Determine source module and tab from stone
      let sourceModule = 'vision-gems';
      let sourceTab = stone.originalCategory || stone.location || 'Spinel';

      // Try to match to actual module/tab
      APP_MODULES.forEach(mod => {
        if (mod.type === 'inventory' || mod.id === 'vision-gems' || mod.id === 'spinel-gallery') {
          const matchingTab = mod.tabs.find(tab => {
            const tabLower = tab.toLowerCase();
            const stoneLocation = (stone.location || '').toLowerCase();
            const stoneCategory = (stone.originalCategory || '').toLowerCase();
            return stoneLocation.includes(tabLower) || 
                   stoneCategory.includes(tabLower) ||
                   tabLower.includes(stoneLocation) ||
                   tabLower.includes(stoneCategory);
          });
          if (matchingTab) {
            sourceModule = mod.id;
            sourceTab = matchingTab;
          }
        }
      });

      notifications.push({
        id: `stone-${stone.id}`,
        type,
        title: stone.buyer || stone.outstandingName || 'Unknown Buyer',
        amount: outstanding,
        currency: 'LKR',
        dueDate,
        sourceModule,
        sourceTab,
        description: `Stone: ${stone.codeNo} (${stone.variety || 'Stone'})`,
        link: `#/module/${sourceModule}/${sourceTab}`
      });
    }
  });

  // Sort notifications: overdue first, then due today, then upcoming, then high outstanding
  const priorityOrder = { overdue: 0, due_today: 1, upcoming: 2, high_outstanding: 3 };
  notifications.sort((a, b) => {
    const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Within same priority, sort by due date (earliest first) or amount (highest first for high_outstanding)
    if (a.type === 'high_outstanding') {
      return b.amount - a.amount;
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return 0;
  });

  return notifications;
};

// Get notification count for badge
export const getNotificationCount = (): number => {
  return getNotifications().length;
};

// Get notifications grouped by type
export const getNotificationsByType = (): {
  overdue: Notification[];
  due_today: Notification[];
  upcoming: Notification[];
  high_outstanding: Notification[];
} => {
  const all = getNotifications();
  return {
    overdue: all.filter(n => n.type === 'overdue'),
    due_today: all.filter(n => n.type === 'due_today'),
    upcoming: all.filter(n => n.type === 'upcoming'),
    high_outstanding: all.filter(n => n.type === 'high_outstanding')
  };
};






