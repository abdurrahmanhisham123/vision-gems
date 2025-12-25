
import { SpecializedRecordConfig } from '../utils/specializedRecordConfig';

export interface SpecializedItem {
  id: string;
  date?: string;
  code?: string;
  name?: string; // Payer, Supplier, Stone Name
  description?: string; // Car model, Variety, Service Desc
  
  // Quantities
  amount?: number; // Cost/Price
  weight?: number;
  pieces?: number;
  
  // Status/Payment
  paymentMethod?: string;
  paymentStatus?: 'Paid' | 'Not Paid';
  status?: 'Sold' | 'Available';
  
  // Additional
  slCost?: number; // Calculated or manual LKR
  shape?: string;
  color?: string;
  certificate?: string;
  roughWeight?: number;
}

export const getSpecializedData = async (config: SpecializedRecordConfig): Promise<SpecializedItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const items: SpecializedItem[] = [];

  // 1. Car Expenses (Zcar) - AllExpenses.xlsx
  if (config.recordType === 'car_expenses') {
    const rawData = [
      { date: '20/10/2023', amount: 108453 },
      { date: '12/02/2023', amount: 494721 },
      { date: '31/12/2023', amount: 475044 },
      { date: '02/05/2024', amount: 490000 },
      { date: '03/09/2024', amount: 500000 },
      { date: '02/05/2024', amount: 500000 },
      { date: '02/06/2024', amount: 500000 },
      { date: '11/06/2024', amount: 2768 },
      { date: '01/07/2024', amount: 500000 },
      { date: '03/08/2024', amount: 841000 },
      { date: '05/08/2024', amount: 10785 },
      { date: '05/09/2024', amount: 38322 },
      { date: 'Error', amount: 50000 }, // Representing error row
      { date: '27/12/2024', amount: 500000 },
      { date: '25/03/2025', amount: 540300 }
    ];

    rawData.forEach((d, i) => {
      items.push({
        id: `car-${i}`,
        date: d.date,
        name: config.primaryEntity || 'Ziyam', // Ziyam
        description: 'A3',
        amount: d.amount,
        paymentMethod: d.amount > 0 && i > 3 ? 'Zah Bank' : '-' // Approximate based on prompt
      });
    });
    return items.reverse(); // Newest top
  }

  // 2. Purchasing Record (202412) - Copy_of_Dad.xlsx
  if (config.recordType === 'purchasing_record') {
    const rawData = [
      { date: '12/09/2024', code: 'D-SP01', variety: 'Spinel', supplier: 'Musanji mattumbo', weight: 3.0, pcs: 1, cost: 100000, sl: 13239 },
      { date: '16/12/2024', code: 'D-G01', variety: 'Garnet', supplier: 'Mush', weight: 3.15, pcs: 1, cost: 100000, sl: 13239 },
      { date: '16/12/2024', code: 'D-G02', variety: 'Garnet', supplier: 'Moris', weight: 6.9, pcs: 1, cost: 150000, sl: 19858 },
      { date: '17/12/2024', code: 'D-G03', variety: 'Garnet', supplier: 'Addy', weight: 28, pcs: 9, cost: 1000000, sl: 132389 },
      { date: '18/12/2024', code: 'D-G04', variety: 'Garnet', supplier: '-', weight: 5.0, pcs: 1, cost: 150000, sl: 19858 },
      { date: '19/12/2024', code: 'D-G05', variety: 'Garnet', supplier: 'Ahamed', weight: 17.15, pcs: 3, cost: 1000000, sl: 132389 },
      { date: '20/12/2024', code: 'D-G06', variety: 'Garnet', supplier: '-', weight: 5.0, pcs: 1, cost: 100000, sl: 13239 },
      { date: '18/12/2024', code: 'D-MG01', variety: 'Mandarin', supplier: 'Hataras', weight: 135, pcs: 1, cost: 2300000, sl: 304496 },
      { date: '17/12/2024', code: 'Moon 1', variety: 'Moonstone', supplier: '-', weight: 12840, pcs: 1, cost: 3500000, sl: 463363 },
      { date: '23/12/2024', code: 'Moon 2', variety: 'Moonstone', supplier: 'hosiyana', weight: 1485, pcs: 1, cost: 5200000, sl: 688425 },
      { date: '29/12/2024', code: 'Moon 3', variety: 'Moonstone', supplier: 'hamisi', weight: 2400, pcs: 1, cost: 1000000, sl: 132389 },
      { date: '02/08/2025', code: 'DAD', variety: 'moonstone', supplier: 'steaha', weight: 7830, pcs: 1, cost: 3950000, sl: 0 }
    ];

    rawData.forEach((d, i) => {
      items.push({
        id: `pur-${i}`,
        date: d.date,
        code: d.code,
        description: d.variety,
        name: d.supplier,
        weight: d.weight,
        pieces: d.pcs,
        amount: d.cost,
        slCost: d.sl || undefined,
        paymentStatus: i === rawData.length - 1 ? undefined : 'Paid' // Last one has no status in example
      });
    });
    return items;
  }

  // 3. Cut & Polish (CutPolish) - Copy_of_Kenya.xlsx
  if (config.recordType === 'cut_polish' && !config.isTemplate) {
    items.push({
      id: 'cp-1',
      date: '2024-11-20', // Approx date based on context or leave blank if unknown
      name: 'Azeem',
      description: 'TSV Cutting',
      weight: 191,
      amount: 95525,
      paymentMethod: 'Cash'
    });
    return items;
  }

  // 4. Bangkok Export (Spinel bkk) - VG_Exporting_.xlsx
  if (config.recordType === 'bangkok_export') {
    // First 20 Real items
    const realStones = [
        { n:1, v:'M.purple Spinel', w:2.10, c:'002*1', s:'Available'},
        { n:2, v:'M.purple Spinel', w:2.05, c:'002*2', s:'Available'},
        { n:3, v:'M.Spinel', w:3.22, c:'003*2', s:'Sold'},
        { n:4, v:'M.Spinel', w:1.71, c:'003*3', s:'Available'},
        { n:5, v:'M.Spinel', w:1.12, c:'003*4', s:'Sold'},
        { n:6, v:'M.Spinel', w:1.18, c:'003*5', s:'Available'},
        { n:7, v:'M.Spinel', w:1.00, c:'003*6', s:'Sold'},
        { n:8, v:'M.Spinel', w:1.02, c:'003*8', s:'Sold'},
        { n:9, v:'M.Spinel', w:1.50, c:'003*30', s:'Available'},
        { n:10, v:'M.Spinel', w:1.04, c:'003*31', s:'Available'},
        { n:11, v:'M.purple Spinel', w:2.05, c:'007', s:'Available'},
        { n:12, v:'M.Spinel', w:2.10, c:'008*1', s:'Available'},
        { n:13, v:'M.Spinel', w:1.10, c:'009', s:'Available'},
        { n:14, v:'M.Spinel', w:1.45, c:'010*1', s:'Available'},
        { n:15, v:'M.Spinel', w:1.05, c:'011*1', s:'Available'},
        { n:16, v:'M.Spinel', w:1.12, c:'011*2', s:'Available'},
        { n:17, v:'M.Spinel', w:1.47, c:'012*1', s:'Available'},
        { n:18, v:'M.Spinel', w:1.03, c:'012*2', s:'Available'},
        { n:19, v:'M.Spinel', w:1.15, c:'012*3', s:'Available'},
        { n:20, v:'M.Spinel', w:1.09, c:'013', s:'Available'},
    ];

    realStones.forEach(s => {
        items.push({
            id: `bkk-${s.n}`,
            name: s.c,
            code: s.c,
            description: s.v,
            weight: s.w,
            pieces: 1,
            status: s.s as 'Sold' | 'Available'
        });
    });

    // Generate remaining 54 stones to reach 74 total, 129.95 weight total
    const currentWeight = realStones.reduce((a,b) => a + b.w, 0);
    const targetWeight = 129.95;
    const remainingWeight = targetWeight - currentWeight;
    const remainingCount = 74 - 20;
    
    for (let i = 0; i < remainingCount; i++) {
        const num = 21 + i;
        // Distribute remaining weight roughly evenly
        const w = Number((remainingWeight / remainingCount + (Math.random() * 0.4 - 0.2)).toFixed(2));
        items.push({
            id: `bkk-${num}`,
            name: `003*${32+i}`,
            code: `003*${32+i}`,
            description: 'M.Spinel',
            weight: w,
            pieces: 1,
            status: 'Available'
        });
    }

    return items;
  }

  // 5. & 6. Templates (Cut.and.polish, Z)
  if (config.isTemplate) {
    return []; // Return empty array to trigger empty state in UI
  }

  return [];
};
