
import { WorkingSheetConfig } from '../utils/workingSheetConfig';

export interface WorkingItem {
  id: string;
  date?: string;
  name?: string;
  description?: string;
  code?: string;
  
  // Financial
  amount?: number;
  amountIn?: number;
  amountOut?: number;
  balance?: number;
  paymentMethod?: string;
  company?: string;
  
  // Inventory
  variety?: string;
  weight?: number;
  pieces?: number;
  shape?: string;
  color?: string;
  cost?: number;
  cutPolishWeight?: number;
  status?: string;
  
  // Capital Source (for capital tracking header)
  isSource?: boolean;
}

export const getWorkingSheetData = async (config: WorkingSheetConfig): Promise<{ items: WorkingItem[], sources?: WorkingItem[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const items: WorkingItem[] = [];
  const sources: WorkingItem[] = [];

  // 1. Capital Tracking (Sheet19 AllExpenses)
  if (config.sheetType === 'capital_tracking') {
    // Capital Sources
    sources.push(
      { id: 'src-1', name: 'Rimsan haj', amount: 8000000, description: 'Initial Capital', isSource: true },
      { id: 'src-2', name: 'Ziyam', amount: 10000000, description: 'Additional Capital', isSource: true },
      { id: 'src-3', name: 'VG NDB payment', amount: 838500, description: 'Bank Transfer', isSource: true }
    );

    // Transactions
    let balance = 18838500;
    for (let i = 0; i < 15; i++) {
      const isOut = Math.random() > 0.3;
      const amount = Math.floor(Math.random() * 500000) + 10000;
      balance = isOut ? balance - amount : balance + amount;
      
      items.push({
        id: `trx-${i}`,
        date: new Date(Date.now() - (15-i)*86400000).toISOString().split('T')[0],
        name: ['Office', 'Zahran', 'Broker', 'Gem License'][Math.floor(Math.random()*4)],
        description: isOut ? 'Expense' : 'Income',
        amount: isOut ? -amount : amount,
        balance: balance,
        paymentMethod: Math.random() > 0.5 ? 'Cash' : 'Bank Transfer'
      });
    }
    return { items: items.reverse(), sources };
  }

  // 2. Statement (Sheet23 AllExpenses)
  if (config.sheetType === 'statement') {
    let balance = 0;
    
    // Initial In
    balance += 22908900;
    items.push({
        id: 'stmt-0',
        date: '2024-06-25',
        company: 'VG',
        name: 'Rimsan',
        description: 'Spinel balance',
        amountIn: 8000000,
        amountOut: 0,
        balance: 8000000
    });
    
    // Generate random IN/OUT
    for (let i = 1; i < 20; i++) {
        const isOut = Math.random() > 0.2;
        const amt = Math.floor(Math.random() * 1000000) + 50000;
        
        if (isOut) balance -= amt;
        else balance += amt;
        
        items.push({
            id: `stmt-${i}`,
            date: new Date(2024, 5, 25 + i).toISOString().split('T')[0],
            company: Math.random() > 0.8 ? 'VG' : '-',
            name: ['Afraz', 'Class', 'Office', 'Zah card', 'Ziyam'][Math.floor(Math.random() * 5)],
            description: Math.random() > 0.7 ? 'Payment' : '-',
            amountIn: !isOut ? amt : 0,
            amountOut: isOut ? amt : 0,
            balance: balance
        });
    }
    return { items: items.reverse() }; // Newest first
  }

  // 3. Inventory Backup (Copy of Mahenge)
  if (config.sheetType === 'inventory_backup') {
    for (let i = 1; i <= 99; i++) {
        items.push({
            id: `inv-${i}`,
            code: `00${i}*${Math.floor(Math.random()*9)}`,
            cost: Math.random() > 0.7 ? Math.floor(Math.random() * 1000000) + 100000 : undefined,
            weight: Number((Math.random() * 5 + 1).toFixed(2)),
            pieces: 1,
            cutPolishWeight: Number((Math.random() * 4 + 0.5).toFixed(2)),
            status: Math.random() > 0.4 ? 'C' : 'R', // Cut or Rough
            variety: Math.random() > 0.6 ? 'M.Purple' : 'M.Spinel',
            color: ['Red', 'Purple', 'Pink', 'Lavender'][Math.floor(Math.random()*4)],
            shape: Math.random() > 0.8 ? 'Cushion' : '-'
        });
    }
    return { items };
  }

  // 4. Export List (Sheet10)
  if (config.sheetType === 'export_list') {
    for (let i = 1; i <= 71; i++) {
        items.push({
            id: `exp-${i}`,
            date: '2024-11-20',
            code: `VG-EXP-${100+i}`,
            variety: 'Mahenge Spinel',
            weight: Number((Math.random() * 2 + 0.5).toFixed(2)),
            pieces: 1,
            shape: ['Oval', 'Round', 'Cushion'][Math.floor(Math.random()*3)],
            amount: Math.floor(Math.random() * 500) + 100 // Selling Price
        });
    }
    return { items };
  }

  // 5. Transaction Log (Sheet21)
  if (config.sheetType === 'transaction_log') {
    for (let i = 0; i < 25; i++) {
        items.push({
            id: `log-${i}`,
            date: new Date(Date.now() - i*86400000).toISOString().split('T')[0],
            name: 'Transaction',
            description: `Log entry ${i+1}`,
            amount: Math.floor(Math.random() * 100000)
        });
    }
    return { items };
  }

  return { items: [] };
};
