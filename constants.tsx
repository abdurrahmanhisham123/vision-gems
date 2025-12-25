import React from 'react';
import { ModuleConfig } from './types';
import { 
  Diamond, 
  Package, 
  GalleryVerticalEnd, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Plane, 
  MapPin, 
  ShoppingBag,
  Moon,
  Layers
} from 'lucide-react';

export const APP_MODULES: ModuleConfig[] = [
  // 1. VG Exporting
  {
    id: 'vg-exporting',
    name: 'VG Exporting',
    type: 'export',
    description: 'Export management & invoices',
    icon: 'Package',
    tabs: [
      'Export', 'Export -invoice', 'Spinel bkk', 'Tsv bkk', 'Tsv sold', 'Mix semi bkk', 
      'Sapphire bkk', 'Ru- bkk 1', 'Ru-bkk2', 'Ru-bkk-16042025', 'China'
    ]
  },
  // 2. Vision Gems (Main)
  {
    id: 'vision-gems',
    name: 'Vision Gems SL',
    type: 'inventory',
    description: 'Main company inventory',
    icon: 'Diamond',
    tabs: [
      'DashboardGems', 'Spinel', 'TSV', 'Mandarin.Garnet', 'Garnet', 'Ruby', 
      'Blue.Sapphire', 'Green.Sapphire', 'Chrysoberyl', 'Zircon', 'Tourmaline', 
      'Aquamarine', 'Padparadscha', 'Pink.Sapphire', 'Violet.Sapphire', 
      'Approval', 'Z', 'V G Old stock', 'Cut.polish', 'Stone Shape'
    ]
  },
  // 3. In Stocks (New)
  {
    id: 'in-stocks',
    name: 'In Stocks',
    type: 'inventory',
    description: 'Global inventory availability',
    icon: 'Layers',
    tabs: [
      'Dashboard', 'All Stones'
    ]
  },
  // 4. SpinelGallery (Read Only)
  {
    id: 'spinel-gallery',
    name: 'SpinelGallery💎',
    type: 'readonly',
    description: 'Secondary company (Read Only)',
    icon: 'GalleryVerticalEnd',
    tabs: [
      'DashboardGEMS', 'Dash', 'Mahenge', 'Spinel', 'Blue.Sapphire', 'Cut.polish', 
      'SL.Expenses', 'BKkticket', 'BKKExport', 'BKKExpenses', 'BKKHotel', 
      'Purchasing', 'Capital', 'Stone Shapes', 'TExpenses', 'Important', 'Copy of Mahenge'
    ]
  },
  // 5. AllExpenses
  {
    id: 'all-expenses',
    name: 'AllExpenses',
    type: 'financial',
    description: 'Comprehensive expense tracking',
    icon: 'Wallet',
    tabs: [
      'ExDashboard', 'VGExpenses', 'Cut.polish', 'Ziyam', 'Zcar', 'Zahran', 'DAD', 
      'Ramzanhaji.Shares', 'Azeem.Shares', 'Others.Shares', 'Classictravel', 
      'Online.Ticket', 'Personal Ticket Visa', 'Office', 'Gem.license', 
      'Audit.Accounts', 'Fawazwife.Shares', 'Sheet19', 'Sheet21', 'Sheet23'
    ]
  },
  // 6. Outstanding
  {
    id: 'outstanding',
    name: 'Outstanding',
    type: 'receivable',
    description: 'Accounts receivable',
    icon: 'TrendingUp',
    tabs: [
      'Dashboard', 'Payment Due Date', 'SG.Payment.Received', 'Madagascar.Payment.Received', 
      'K.Payment.Received', 'VG.R.payment.received', 'VG.Payment.Received', 
      'VG.T.Payment.Received', 'Zahran', 'RusseqSales', 'Ruzaik Sales', 'BeruwalaSales', 
      'SajithOnline', 'Ziyam', 'InfazHaji', 'NusrathAli', 'Binara', 'MikdarHaji', 
      'RameesNana', 'Shimar', 'Ruqshan', 'FaizeenHaj', 'SharikHaj', 'Fazeel', 
      'AzeemColo', 'Kadarhaj.colo', 'AlthafHaj', 'BangkokSales', 'Sadam bkk', 
      'ChinaSales', 'Eleven', 'AndyBuyer', 'FlightBuyer', 'Name', 'Name1', 
      'Bangkok', 'Payment.received'
    ]
  },
  // 7. Payable
  {
    id: 'payable',
    name: 'Payable',
    type: 'payable',
    description: 'Accounts payable',
    icon: 'TrendingDown',
    tabs: [
      'Dashboard', 'Buying.Payments.Paid', 'Tanzania.Capital', 'BKK.Capital', 
      'Beruwala', 'Colombo', 'Galle', 'Kisu', 'Bangkok', 'Bayer ruler'
    ]
  },
  // 8. BKK - Freshly Added Navigation Menu
  {
    id: 'bkk',
    name: 'BKK Operations',
    type: 'financial',
    description: 'Bangkok operations & finance',
    icon: 'Building2',
    tabs: [
      'Dashboard', 
      'BKK',
      'BKKTickets', 
      'BkkExpenses', 
      'Export.Charge', 
      'Apartment', 
      'Bkkcapital', 
      'BKK.Payment', 
      'BKK.statement'
    ]
  },
  // 9. Kenya
  {
    id: 'kenya',
    name: 'Kenya',
    type: 'mixed',
    description: 'Kenya Operations',
    icon: 'MapPin',
    tabs: [
      'KDashboard', 'Instock', 'CutPolish', 'Export', 'Traveling.EX', 'BkkExpenses', 
      'BkkHotel', 'KPurchasing', 'KExpenses', 'Capital', 'Sheet19'
    ]
  },
  // 10. Mahenge
  {
    id: 'vgtz',
    name: 'Mahenge (VGTZ)',
    type: 'mixed',
    description: 'Tanzania Operations',
    icon: 'MapPin',
    tabs: [
      'VG.T Dashboard', 'VG.T.Instock', 'Purchase', 'TZ.Expenses', 'T.Capital', 
      'Azeem', 'T.export', 'Cut.and.polish', 'Tickets.visa', 'SLExpenses'
    ]
  },
  // 11. Madagascar
  {
    id: 'madagascar',
    name: 'Madagascar',
    type: 'mixed',
    description: 'Madagascar Operations',
    icon: 'MapPin',
    tabs: [
      'MDashboard', 'Instock', 'MPurchasing', 'MExpenses', 'MCapital', 'MExport', 
      'Cut.polish', 'Tickets.visa', 'SLExpenses', 'Invoice', 'Invoice bkk'
    ]
  },
  // 12. Dada
  {
    id: 'dada',
    name: 'Dada',
    type: 'mixed',
    description: 'Dada Brand',
    icon: 'ShoppingBag',
    tabs: [
      'Dashboard', 'Instock', 'Purchase', 'T.Expense', 'Capital', 'T.export', 
      'Tickets.visa', '202412Capital', '202412TExpense', '202412', '202412 (2)'
    ]
  },
  // 13. VG Ramazan
  {
    id: 'vg-ramazan',
    name: 'VG Ramazan',
    type: 'mixed',
    description: 'VG Ramazan Brand',
    icon: 'Moon',
    tabs: [
      'VGRZ.Dashboard', 'Instock', 'VGR.purchase', 'Cut.polish', 'T.Expenses', 
      'T.export', 'T.Capital'
    ]
  }
];

export const getIcon = (name: string) => {
  const icons: any = {
    Diamond: <Diamond size={24} />,
    Package: <Package size={24} />,
    GalleryVerticalEnd: <GalleryVerticalEnd size={24} />,
    Wallet: <Wallet size={24} />,
    TrendingUp: <TrendingUp size={24} />,
    TrendingDown: <TrendingDown size={24} />,
    Building2: <Building2 size={24} />,
    Plane: <Plane size={24} />,
    MapPin: <MapPin size={24} />,
    ShoppingBag: <ShoppingBag size={24} />,
    Moon: <Moon size={24} />,
    Layers: <Layers size={24} />
  };
  return icons[name] || <Diamond size={24} />;
};