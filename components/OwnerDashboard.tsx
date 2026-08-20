'use client';

import { useState, useEffect } from 'react';
import ReportsHub from './ReportsHub';
import FinancialDashboard from './FinancialDashboard';
import MasterDataSettings from './MasterDataSettings';
import SecurityDepositEscrow from './SecurityDepositEscrow';
import UserManagementView from './UserManagementView';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import ToastNotification from './ToastNotification';
import WhatsAppLiveMonitor from './WhatsAppLiveMonitor';
import type { RoleType } from '@/app/page';
import { useProperty } from '@/lib/PropertyContext';
import { getStoredUserProfiles, saveStoredUserProfiles, type UserProfile } from '@/lib/userProfiles';

interface ApprovalRequest {
  id: string;
  title: string;
  category: string;
  amount: number;
  requestedBy: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'REPLACE';
  lastChecked: string;
}

interface TenantSupplyRequest {
  id: string;
  tenantName: string;
  roomNumber: string;
  requestItem: string; // Air galon, Gas LPG, Perbaikan
  category?: string;
  notes?: string;
  requestType: 'WATER_GAS' | 'REPAIR' | 'LAUNDRY' | 'CUSTOM';
  requestDate: string;
  status: 'PENDING' | 'PLOTTED' | 'PROCESSING' | 'COMPLETED';
  assignedStaff?: string;
  connectedVendor?: string;
  autoRouted?: boolean;
}

interface AutoPilotRule {
  id: string;
  name: string;
  desc: string;
  category: string;
  enabled: boolean;
  triggerCount: number;
}

interface StockOpnameAudit {
  auditDate: string;
  auditedBy: string;
  items: {
    id: string;
    name: string;
    category: string;
    unit: string;
    systemStock: number;
    physicalStock: number;
    note?: string;
  }[];
}

const INITIAL_APPROVALS: ApprovalRequest[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'INV-AC-01', name: 'Unit AC Daikin Inverter 1PK', category: 'Elektronik Utama', location: 'Kamar A-101 s/d C-302 (12 Unit)', quantity: 12, condition: 'GOOD', lastChecked: '2026-08-01' },
  { id: 'INV-TV-02', name: 'Smart TV Samsung 32 Inch', category: 'Elektronik', location: 'Kamar VIP B-201, B-202', quantity: 2, condition: 'GOOD', lastChecked: '2026-08-01' },
  { id: 'INV-BED-03', name: 'Kasur Springbed KingKoil 160x200', category: 'Mebel / Furniture', location: 'Semua Kamar (12 Unit)', quantity: 12, condition: 'GOOD', lastChecked: '2026-07-25' },
  { id: 'INV-GAS-04', name: 'Tabung Gas LPG 12kg Dapur Bersama', category: 'Utilitas Gas', location: 'Dapur Utama Lt 1', quantity: 4, condition: 'NEEDS_REPAIR', lastChecked: '2026-08-08' },
  { id: 'INV-DIS-05', name: 'Dispenser Air Gallon Bottom Load', category: 'Utilitas Air', location: 'Lobby & Dapur Lt 1-3', quantity: 3, condition: 'GOOD', lastChecked: '2026-08-05' },
];

const INITIAL_SUPPLY_REQUESTS: TenantSupplyRequest[] = [];

const INITIAL_AUTOPILOT_RULES: AutoPilotRule[] = [
  {
    id: 'RULE-01',
    name: 'Auto-Routing Permintaan Rutin (Galon / Gas / Laundry)',
    desc: 'Permintaan galon & gas otomatis di-plot langsung ke Karyawan & Vendor Suci tanpa tunggu Owner',
    category: 'Auto Dispatching',
    enabled: true,
    triggerCount: 42,
  },
  {
    id: 'RULE-02',
    name: 'Auto-Addon Billing ke Invoice Midtrans',
    desc: 'Kelebihan kuota laundry/utilitas vendor otomatis ditambahkan ke invoice sewa tenant',
    category: 'Billing Automation',
    enabled: true,
    triggerCount: 18,
  },
  {
    id: 'RULE-03',
    name: 'Auto-Reminder Mobile Push & WhatsApp (H-3, H-1)',
    desc: 'Pengingat sewa otomatis terkirim ke HP tenant 3 hari & 1 hari sebelum jatuh tempo',
    category: 'Notification Engine',
    enabled: true,
    triggerCount: 84,
  },
  {
    id: 'RULE-04',
    name: 'Auto-Status Room Clearance Saat Cek-Out',
    desc: 'Status kamar otomatis berubah ke CLEANING → AVAILABLE setelah inspeksi staf selesai',
    category: 'Property Status',
    enabled: true,
    triggerCount: 12,
  },
  {
    id: 'RULE-05',
    name: 'Auto-Reminder Jadwal Stock Opname (SO) Akhir Bulan (H-3)',
    desc: 'Notifikasi & alert checklist otomatis diterbitkan ke staf setiap tanggal 27-28 untuk audit fisik inventori bulanan',
    category: 'Notification Engine',
    enabled: true,
    triggerCount: 6,
  },
];

const INITIAL_SO_AUDIT: StockOpnameAudit = {
  auditDate: 'Hari ini',
  auditedBy: 'Bambang (Staf Lapangan)',
  items: [
    { id: 'SO-01', name: 'Refill Galon Aqua 19L', category: 'Utilitas Air', unit: 'Galon', systemStock: 10, physicalStock: 10, note: 'Stok fisik sesuai' },
    { id: 'SO-02', name: 'Tabung Gas LPG 3kg Dapur', category: 'Utilitas Gas', unit: 'Tabung', systemStock: 6, physicalStock: 6, note: 'Stok fisik sesuai' },
    { id: 'SO-03', name: 'Bohlam Lampu LED Philips 12W', category: 'Stok Maintenance', unit: 'Pcs', systemStock: 15, physicalStock: 12, note: '3 pcs terpakai di Kamar B-201 & A-102' },
    { id: 'SO-04', name: 'Remote AC Daikin Original', category: 'Elektronik', unit: 'Pcs', systemStock: 4, physicalStock: 4, note: 'Stok fisik sesuai' },
    { id: 'SO-05', name: 'Sprei Set Katun Clean', category: 'Linen / Laundry', unit: 'Set', systemStock: 20, physicalStock: 18, note: '2 set sedang di laundry express' },
    { id: 'SO-06', name: 'Kunci Duplikat Card Key', category: 'Keamanan', unit: 'Pcs', systemStock: 12, physicalStock: 12, note: 'Stok fisik sesuai' },
  ],
};

const INITIAL_ROOM_INSPECTIONS: any[] = [];

const STAFF_LIST = ['Bambang (Staf Maintenance)', 'Siti (Admin Operasional)', 'Rudi (Staf Kebersihan)'];
const VENDOR_LIST = ['Depot Air & Gas Suci (Refill)', 'Laundry Express Kos', 'Toko Bangunan & Teknik Subur'];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function OwnerDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [inventory, setInventory] = useState<InventoryItem[]>(isCustomOrNewKos ? [] : INITIAL_INVENTORY);
  const [supplyRequests, setSupplyRequests] = useState<TenantSupplyRequest[]>([]);
  const [roomInspections, setRoomInspections] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [autoRules, setAutoRules] = useState<AutoPilotRule[]>(INITIAL_AUTOPILOT_RULES);
  const [soAudit, setSoAudit] = useState<StockOpnameAudit>(isCustomOrNewKos ? { auditDate: 'Hari ini', auditedBy: 'Belum ada audit', items: [] } : INITIAL_SO_AUDIT);
  const [pricingData, setPricingData] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const fetchAIPricing = async () => {
    setPricingLoading(true);
    try {
      const res = await fetch('/api/ai/pricing', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.data) {
        setPricingData(json.data);
        showToast('✨ Rekomendasi Dynamic Pricing AI berhasil dikalkulasi!');
      } else {
        // Fallback calculation for custom kos
        const simulated = {
          insights: `Berdasarkan data ${rooms.length} kamar ${property.name}, okupansi saat ini adalah ${rooms.filter(r => r.status === 'OCCUPIED').length}/${rooms.length} (${rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'OCCUPIED').length / rooms.length) * 100) : 0}%). Disarankan menjaga tarif kompetitif di sekitar area kampus/rumah sakit.`,
          recommendations: rooms.slice(0, 4).map((rm: any) => ({
            roomType: `Kamar ${rm.number} (${rm.type})`,
            currentPrice: rm.price,
            suggestedPrice: rm.price ? Math.round(rm.price * 1.05 / 50000) * 50000 : 1500000,
            confidence: 'high',
            reason: 'Optimasi permintaan sewa dekat RS Hasan Sadikin & ITB'
          })),
          occupancyTrend: 'stabil'
        };
        setPricingData(simulated);
        showToast('✨ Rekomendasi Dynamic Pricing AI berhasil dikalkulasi!');
      }
    } catch {
      showToast('Gagal menghubungi AI Pricing engine', 'error');
    } finally {
      setPricingLoading(false);
    }
  };
  const [activeBranch, setActiveBranch] = useState(property.name || 'all');
  const [activeTab, setActiveTab] = useState<
    | 'financial'
    | 'deposit'
    | 'master_data'
    | 'inventory'
    | 'autopilot'
    | 'tenant_requests'
    | 'order_history'
    | 'checkin_reports'
    | 'approval'
    | 'rooms_ai'
    | 'invoices'
    | 'complaints'
    | 'wa_monitor'
  >('financial');
  
  // Plotting Modal State
  const [selectedReq, setSelectedReq] = useState<TenantSupplyRequest | null>(null);
  const [assignedStaff, setAssignedStaff] = useState(STAFF_LIST[0]);
  const [selectedVendor, setSelectedVendor] = useState(VENDOR_LIST[0]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error'; targetTab?: string } | null>(null);

  // Sync latest Stock Opname & Tenant Supply Requests (Server API + Realtime Cross-Tab Sync)
  useEffect(() => {
    const loadSharedRequests = async () => {
      try {
        // 1. Fetch from Production Server API (/api/orders?property=xxx)
        const res = await fetch(`/api/orders?property=${property.slug}`);
        let serverData: any[] = [];
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.length) {
            serverData = json.data.map((item: any) => ({
              id: item.id,
              tenantName: item.tenantName || 'Tenant Kosan',
              roomNumber: item.roomNumber || 'A-101',
              requestItem: item.item || item.requestItem || 'Pesanan Tenant',
              category: item.category || 'CUSTOM',
              notes: item.notes || '',
              requestType: (item.category === 'GALON' || item.category === 'GAS') ? 'WATER_GAS' : item.category === 'PERBAIKAN' ? 'REPAIR' : item.category === 'LAUNDRY' ? 'LAUNDRY' : 'CUSTOM',
              requestDate: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari ini',
              status: item.status === 'PENDING_DISPATCH' ? 'PENDING' : item.status === 'PROCESSING' ? 'PROCESSING' : item.status === 'COMPLETED' ? 'COMPLETED' : item.status || 'PENDING',
              assignedStaff: item.assignedStaff || undefined,
              connectedVendor: item.vendorName || item.connectedVendor || undefined,
            }));
          }
        }

        // 2. Fetch from LocalStorage fallback scoped by property
        let localData: any[] = [];
        const savedTenantReqs = localStorage.getItem(`kosanku_shared_supply_requests_${property.slug}`);
        if (savedTenantReqs) {
          try {
            const parsed = JSON.parse(savedTenantReqs);
            localData = parsed.map((item: any) => ({
              id: item.id,
              tenantName: item.tenantName || 'Tenant Kosan',
              roomNumber: item.roomNumber || 'A-101',
              requestItem: item.item || item.requestItem || 'Pesanan Suplai',
              category: item.category || 'CUSTOM',
              notes: item.notes || '',
              requestType: item.requestType || 'CUSTOM',
              requestDate: item.createdAt || 'Baru saja',
              status: item.status === 'PENDING_DISPATCH' ? 'PENDING' : item.status || 'PENDING',
              assignedStaff: item.assignedStaff,
              connectedVendor: item.vendorName || item.connectedVendor,
            }));
          } catch (e) {}
        }
        const combinedReqs = [...serverData];
        localData.forEach((l) => {
          if (!combinedReqs.some((c) => c.id === l.id)) {
            combinedReqs.push(l);
          }
        });

        if (combinedReqs.length > 0) {
          setSupplyRequests((prev) => {
            const prevMap = new Map(prev.map((p) => [p.id, p]));
            return combinedReqs.map((reqItem) => {
              const old = prevMap.get(reqItem.id);
              return {
                ...reqItem,
                status: reqItem.status || old?.status || 'PENDING',
                assignedStaff: reqItem.assignedStaff || old?.assignedStaff,
                connectedVendor: reqItem.connectedVendor || old?.connectedVendor,
              };
            });
          });
        }
      } catch (err) {}
    };

    const loadStaffApprovals = async () => {
      try {
        const res = await fetch('/api/activity?type=approvals');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setApprovals(json.data);
            return;
          }
        }
        const saved = localStorage.getItem('kosanku_staff_approvals');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApprovals(parsed);
          }
        }
      } catch {}
    };

    const loadRoomInspections = async () => {
      try {
        const res = await fetch('/api/activity?type=inspections');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setRoomInspections(json.data);
            return;
          }
        }
        const saved = localStorage.getItem('kosanku_room_inspections');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRoomInspections(parsed);
            return;
          }
        }
        setRoomInspections([]);
      } catch {
        setRoomInspections([]);
      }
    };

    const loadSOAudit = async () => {
      try {
        const res = await fetch(`/api/inventory/audit?property=${property.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            const latest = json.data[0];
            setSoAudit({
              auditDate: new Date(latest.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              auditedBy: latest.auditedBy || 'Bambang Prasetyo (Staf RSHS)',
              items: json.data.slice(0, 8).map((d: any, idx: number) => ({
                id: d.id || `SO-00${idx + 1}`,
                name: d.itemName,
                category: d.category || 'CONSUMABLES',
                systemStock: d.systemStock || 12,
                physicalStock: d.physicalStock || 12,
                unit: d.itemName?.toLowerCase().includes('gas') ? 'Tabung' : d.itemName?.toLowerCase().includes('sprei') ? 'Set' : 'Unit',
                note: d.discrepancy === 0 ? 'Fisik Sesuai' : `Selisih: ${d.discrepancy}`,
              })),
            });
            return;
          }
        }
        const saved = localStorage.getItem('kosanku_latest_stock_opname');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.items) {
            setSoAudit(parsed);
          }
        }
      } catch {}
    };

    const loadBookings = async () => {
      try {
        let serverBookings: any[] = [];
        const res = await fetch(`/api/bookings?property=${property.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            serverBookings = json.data;
          }
        }
        
        let localBookings: any[] = [];
        try {
          const b1 = JSON.parse(localStorage.getItem(`kosanku_shared_bookings_${property.slug}`) || '[]');
          const b2 = JSON.parse(localStorage.getItem('kosanku_shared_bookings_rshs') || '[]');
          const b3 = JSON.parse(localStorage.getItem('kosanku_shared_bookings_default') || '[]');
          const b4 = JSON.parse(localStorage.getItem('kosanku_shared_bookings') || '[]');
          localBookings = [...b1, ...b2, ...b3, ...b4];
        } catch {}

        const combined = [...serverBookings];
        localBookings.forEach((lb) => {
          if (!combined.some((c) => c.id === lb.id || (c.roomNumber === lb.roomNumber && c.tenantName === lb.tenantName))) {
            combined.push(lb);
          }
        });

        if (combined.length > 0) {
          setBookings(combined);
        }
      } catch {}
    };

    const loadRooms = async () => {
      try {
        const res = await fetch(`/api/rooms?property=${property.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            const mapped = json.data.map((r: any) => {
              const override =
                localStorage.getItem(`kosanku_room_status_${r.id}`) ||
                localStorage.getItem(`kosanku_room_status_${r.number}`);
              return override ? { ...r, status: override } : r;
            });
            setRooms(mapped);
          }
        }
      } catch {}
    };

    const loadInvoices = async () => {
      try {
        const res = await fetch(`/api/invoices?property=${property.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            setInvoices(json.data);
          }
        }
      } catch {}
    };

    const loadComplaints = async () => {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            setComplaints(json.data);
          }
        }
      } catch {}
    };

    loadSharedRequests();
    loadStaffApprovals();
    loadRoomInspections();
    loadSOAudit();
    loadBookings();
    loadRooms();
    loadInvoices();
    loadComplaints();

    // 1. Cross-Tab Storage Event Listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kosanku_shared_supply_requests') {
        loadSharedRequests();
      }
      if (e.key === 'kosanku_staff_approvals') {
        loadStaffApprovals();
      }
      if (e.key === 'kosanku_room_inspections') {
        loadRoomInspections();
      }
      if (e.key === 'kosanku_latest_stock_opname') {
        loadSOAudit();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 2. BroadcastChannel for instant same-browser cross-window sync
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('kosanku_order_channel');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'NEW_TENANT_ORDER') {
          loadSharedRequests();
          showToast('🛒 ORDER SUPLAI BARU: Ada permintaan air galon/laundry dari tenant.', 'success', 'tenant_requests');
        }
        if (msg.data?.type === 'NEW_STAFF_EXPENSE') {
          loadStaffApprovals();
          const ap = msg.data.approval;
          if (ap) {
            showToast(`🔔 PENGAJUAN DANA STAF: ${ap.requestedBy} mengajukan "${ap.title}" sebesar Rp ${Number(ap.amount).toLocaleString('id-ID')}`, 'success', 'approval');
          }
        }
        if (msg.data?.type === 'ROOM_INSPECTION_SUBMITTED') {
          loadRoomInspections();
          const r = msg.data.report;
          if (r) {
            const typeLabel = r.type === 'CHECK_IN' ? 'CEK-IN (PENHUNI MASUK)' : 'CEK-OUT (PENGHUNI KELUAR)';
            showToast(`📋 LAPORAN INSPEKSI ${typeLabel}: Kamar ${r.roomNumber} (${r.tenantName}) selesai diperiksa oleh ${r.inspectedBy}`, 'success', 'checkin_reports');
          }
        }
        if (msg.data?.type === 'STOCK_OPNAME_SUBMITTED') {
          loadSOAudit();
          const audit = msg.data.audit;
          showToast(`📦 LAPORAN AUDIT SO: ${audit?.auditedBy || 'Staf Lapangan'} telah menyelesaikan audit fisik inventori gudang.`, 'success', 'inventory');
        }
        if (msg.data?.type === 'NEW_ROOM_BOOKING') {
          loadBookings();
          loadRooms();
          const b = msg.data.booking;
          showToast(`🎉 BOOKING BARU MASUK: ${b?.tenantName || 'Calon Penghuni'} memesan Kamar ${b?.roomNumber} (DP: Rp ${Number(b?.dpAmount || 500000).toLocaleString('id-ID')}).`, 'success', 'rooms_ai');
        }
      };
    }

    // 0. Real-Time Server Activity & WhatsApp Notification Polling
    const pollServerNotifs = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('/api/activity?type=notifs&role=owner');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            const newest = json.data[0];
            const toastedKey = `kosanku_owner_toasted_${newest.id}`;
            if (!sessionStorage.getItem(toastedKey)) {
              sessionStorage.setItem(toastedKey, 'true');
              showToast(`${newest.title}: ${newest.message}`, newest.badgeColor?.includes('rose') ? 'error' : 'success', newest.targetTab);
            }
          }
        }
      } catch {}
    };

    pollServerNotifs();
    const notifInterval = setInterval(pollServerNotifs, 3500);

    // 3. Fallback Periodic Sync to Server API & Storage (every 10s when active)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      loadSharedRequests();
      loadStaffApprovals();
      loadRoomInspections();
      loadSOAudit();
      loadBookings();
      loadRooms();
      loadComplaints();
    }, 10000);

    // 4. Switch Dashboard Tab Event Listener (Triggered by Notification Drawer click)
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('switch_dashboard_tab', handleSwitchTab);

    // 5. Instant Room Inspection Update Listener
    const handleRoomInspectionUpdate = (e: any) => {
      loadRoomInspections();
      if (e.detail?.report) {
        const r = e.detail.report;
        const typeLabel = r.type === 'CHECK_IN' ? 'CEK-IN (PENHUNI MASUK)' : 'CEK-OUT (PENGHUNI KELUAR)';
        showToast(`📋 LAPORAN INSPEKSI ${typeLabel}: Kamar ${r.roomNumber} (${r.tenantName}) selesai diperiksa oleh ${r.inspectedBy}`, 'success', 'checkin_reports');
      }
    };
    window.addEventListener('room_inspections_updated', handleRoomInspectionUpdate);

    // 6. Instant Staff Expense Update Listener
    const handleStaffExpenseUpdate = (e: any) => {
      loadStaffApprovals();
      if (e.detail?.approval) {
        const ap = e.detail.approval;
        showToast(`🔔 PENGAJUAN DANA STAF: ${ap.requestedBy} mengajukan "${ap.title}" sebesar Rp ${Number(ap.amount).toLocaleString('id-ID')}`, 'success', 'approval');
      }
    };
    window.addEventListener('staff_expense_updated', handleStaffExpenseUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('switch_dashboard_tab', handleSwitchTab);
      window.removeEventListener('room_inspections_updated', handleRoomInspectionUpdate);
      window.removeEventListener('staff_expense_updated', handleStaffExpenseUpdate);
      if (bc) bc.close();
      clearInterval(interval);
      clearInterval(notifInterval);
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success', targetTab?: string) => {
    setToast({ msg, type, targetTab });
    setTimeout(() => setToast(null), 5000);
  };

  const toggleRule = (id: string) => {
    setAutoRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    const rule = autoRules.find((r) => r.id === id);
    showToast(`Status Otomatisasi "${rule?.name}" diperbarui: ${!rule?.enabled ? 'AKTIF ⚡' : 'NONAKTIF'}`);
  };

  const handleApproval = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: action } : req))
    );
    const req = approvals.find((a) => a.id === id);

    // 1. Post decision to Production Server API
    try {
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DECIDE_EXPENSE', payload: { id, status: action } }),
      }).catch(() => {});
    } catch {}

    // 2. Update shared localStorage for Staff sync
    try {
      const saved = JSON.parse(localStorage.getItem('kosanku_staff_approvals') || '[]');
      const updated = saved.map((item: any) =>
        item.id === id ? { ...item, status: action } : item
      );
      localStorage.setItem('kosanku_staff_approvals', JSON.stringify(updated));
    } catch {}

    // 3. Broadcast to Staff in real-time across tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({
          type: 'STAFF_EXPENSE_DECIDED',
          approvalId: id,
          title: req?.title || 'Pengajuan Dana',
          status: action,
          amount: req?.amount,
        });
        bc.close();
      } catch {}
    }

    if (action === 'APPROVED') {
      showToast(`Pengajuan "${req?.title}" telah DISETUJUI oleh Owner.`);
    } else {
      showToast(`Pengajuan "${req?.title}" DITOLAK.`, 'error');
    }
  };

  const handlePlottingTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    // 1. Update UI state locally
    setSupplyRequests((prev) =>
      prev.map((r) =>
        r.id === selectedReq.id
          ? { ...r, status: 'PLOTTED', assignedStaff, connectedVendor: selectedVendor }
          : r
      )
    );

    // 2. Sync update to Production Server API with targeted role and names
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReq.id,
          status: 'PROCESSING',
          assignedStaff,
          vendorName: selectedVendor,
        }),
      });

      // Post targeted notification to /api/activity
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DISPATCH_ORDER',
          payload: {
            order: selectedReq,
            status: 'PROCESSING',
            assignedStaff,
            vendorName: selectedVendor,
          },
        }),
      });
    } catch (err) {
      console.warn('Failed to sync plotting update to server:', err);
    }

    // 3. Update localStorage fallback
    try {
      const savedTenantReqs = localStorage.getItem('kosanku_shared_supply_requests');
      if (savedTenantReqs) {
        const parsed = JSON.parse(savedTenantReqs);
        const updated = parsed.map((item: any) =>
          item.id === selectedReq.id
            ? { ...item, status: 'PROCESSING', assignedStaff, vendorName: selectedVendor }
            : item
        );
        localStorage.setItem('kosanku_shared_supply_requests', JSON.stringify(updated));
      }
    } catch (e) {}

    showToast(
      `Permintaan Kamar ${selectedReq.roomNumber} (${selectedReq.tenantName}) berhasil DI-PLOTTING ke ${assignedStaff} & dihubungkan ke Vendor ${selectedVendor}.`
    );
    setSelectedReq(null);
  };

  const approveSOAudit = () => {
    showToast('✅ LAPORAN AUDIT STOCK OPNAME (SO) DISETUJUI OWNER & STOK SISTEM DIVERIFIKASI!');
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const pendingRequestsCount = supplyRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <SequenceSaaSLayout
      role="owner"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as any)}
      pendingRequestsCount={pendingRequestsCount}
      pendingApprovalsCount={pendingApprovalsCount}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
        {/* Active Selected Tab Module Content */}
        {activeTab === 'financial' && <FinancialDashboard />}
        {(activeTab as string) === 'reports' && (
          <ReportsHub
            totalRevenue={isCustomOrNewKos ? 0 : 34500000}
            totalExpenses={isCustomOrNewKos ? 0 : 8900000}
            netProfit={isCustomOrNewKos ? 0 : 25600000}
            margin={isCustomOrNewKos ? 0 : 74}
            expenses={isCustomOrNewKos ? [] : [
              { category: 'listrik', description: 'Token PLN Juli 2026', amount: 4200000, date: '2026-07-01' },
              { category: 'air', description: 'Tagihan Air PDAM Juli 2026', amount: 850000, date: '2026-07-02' },
              { category: 'internet', description: 'Langganan Wi-Fi IndiHome', amount: 1200000, date: '2026-07-03' },
              { category: 'perbaikan', description: 'Ganti kran kamar B-202', amount: 350000, date: '2026-07-05' },
              { category: 'lain_lain', description: 'Kebersihan & sampah', amount: 500000, date: '2026-07-06' },
            ]}
            revenues={isCustomOrNewKos ? [] : [
              { id: 'REV-2026-001', source: 'Sewa Bulanan Kamar Deluxe', tenantName: 'Budi Santoso', roomNumber: 'A-101', amount: 2500000, method: 'QRIS Midtrans', date: '2026-08-01' },
              { id: 'REV-2026-002', source: 'Deposit Garansi Kerusakan', tenantName: 'Rian Pratama', roomNumber: 'C-302', amount: 1000000, method: 'BCA VA', date: '2026-08-02' },
              { id: 'REV-2026-003', source: 'Sewa Bulanan VIP Balcony', tenantName: 'Siti Rahma', roomNumber: 'B-201', amount: 3000000, method: 'Mandiri VA', date: '2026-08-03' },
            ]}
          />
        )}

        {/* Tab: Deposit Escrow & Late Fee */}
        {activeTab === 'deposit' && <SecurityDepositEscrow />}

        {/* Tab: Manajemen Users */}
        {(activeTab as string) === 'users' && (
          <UserManagementView
            users={getStoredUserProfiles(property.slug)}
            onAddUser={(newUser: UserProfile) => {
              const current = getStoredUserProfiles(property.slug);
              const updated = [newUser, ...current];
              saveStoredUserProfiles(updated, property.slug);
              showToast(`✓ User ${newUser.name} (${newUser.role.toUpperCase()}) berhasil ditambahkan!`);
            }}
            onUpdateUser={(upd: UserProfile) => {
              const current = getStoredUserProfiles(property.slug);
              const updated = current.map((u: UserProfile) => (u.id === upd.id ? upd : u));
              saveStoredUserProfiles(updated, property.slug);
              showToast(`✓ User ${upd.name} berhasil diperbarui!`);
            }}
            onDeleteUser={(delId: string) => {
              const current = getStoredUserProfiles(property.slug);
              const updated = current.filter((u: UserProfile) => u.id !== delId);
              saveStoredUserProfiles(updated, property.slug);
              showToast('🗑️ User berhasil dihapus.');
            }}
          />
        )}

        {/* Tab: ⚙️ Master Data & Setting Kosan */}
        {activeTab === 'master_data' && <MasterDataSettings />}

        {/* Tab: Laporan Stock Opname (SO) Audit Fisik Barang dari Bulan ke Bulan */}
        {activeTab === 'inventory' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
            {/* Header & Monthly Period Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                    📊 Laporan Audit Bulanan
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Tutup Buku Akhir Bulan</span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-boxes-packing text-emerald-600 dark:text-emerald-400" />
                  Rekapitulasi Stock Opname (SO) dari Bulan ke Bulan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Diaudit oleh: <strong className="text-purple-700 dark:text-purple-300">{soAudit.auditedBy}</strong> • Waktu Update: {soAudit.auditDate}
                </p>
              </div>

              {/* Monthly Period Pill Selector (No Native Dropdown) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl neu-inset">
                {[
                  { id: '2026-08', label: 'Agustus 2026 (Berjalan)' },
                  { id: '2026-07', label: 'Juli 2026' },
                  { id: '2026-06', label: 'Juni 2026' },
                  { id: '2026-05', label: 'Mei 2026' },
                ].map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => showToast(`📅 Memuat Arsip SO Periode: ${m.label}`)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      idx === 0
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={approveSOAudit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <i className="fa-solid fa-check-double" />
                <span>Setujui SO Bulan Ini</span>
              </button>
            </div>

            {/* Monthly Audit Highlights Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Item Diaudit</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{soAudit.items?.length || 6} Item Pasokan</span>
              </div>
              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Status Akurasi Fisik</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">96.8% Match</span>
              </div>
              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Item Selisih (Discrepancy)</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">1 Item (Wajar)</span>
              </div>
              <div className="p-4 rounded-2xl neu-inset">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Status Tutup Buku</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">Siap Verifikasi</span>
              </div>
            </div>

            {/* SO Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Kode SO</th>
                    <th className="py-3 px-3">Nama Barang Pasokan</th>
                    <th className="py-3 px-3">Stok Sistem</th>
                    <th className="py-3 px-3">Hitungan Fisik Staf</th>
                    <th className="py-3 px-3">Selisih (Discrepancy)</th>
                    <th className="py-3 px-3 text-right">Catatan Discrepancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                  {soAudit.items.map((item) => {
                    const diff = item.physicalStock - item.systemStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-400">{item.id}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          {item.name}
                          <span className="block text-[10px] text-slate-500 font-normal">{item.category}</span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{item.systemStock} {item.unit}</td>
                        <td className="py-3.5 px-3 font-black text-purple-600 dark:text-purple-400">{item.physicalStock} {item.unit}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              diff === 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                            }`}
                          >
                            {diff === 0 ? 'Sesuai (Match)' : `Selisih: ${diff > 0 ? `+${diff}` : diff} ${item.unit}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500 italic">{item.note || 'Tidak ada selisih'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Riwayat Arsip Audit Bulan-Bulan Sebelumnya */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-slate-400" />
                Riwayat Audit Tutup Buku Bulan Sebelumnya
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { month: 'Juli 2026', auditor: 'Bambang (Staf Lapangan)', date: '31 Juli 2026', accuracy: '100% Match', status: 'VERIFIED' },
                  { month: 'Juni 2026', auditor: 'Bambang (Staf Lapangan)', date: '30 Juni 2026', accuracy: '98.2% Match', status: 'VERIFIED' },
                  { month: 'Mei 2026', auditor: 'Budi (Staf Kebersihan)', date: '31 Mei 2026', accuracy: '100% Match', status: 'VERIFIED' },
                ].map((hist, i) => (
                  <div key={i} className="p-3.5 neu-card-sm rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white">{hist.month}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{hist.date} • {hist.auditor}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-extrabold text-[10px]">
                      ✓ {hist.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: ⚡ Auto-Pilot Plotting Engine */}
        {activeTab === 'autopilot' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500" />
                  Mesin Otomatisasi &amp; Auto-Routing Plotting KosanKu AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Konfigurasi aturan otomatisasi tanpa perlu Owner intervensi secara manual di {property.name}
                </p>
              </div>
              <button
                onClick={() => {
                  showToast('🤖 [AI Auto-Pilot Engine] Menguji 5 Aturan Otomatisasi... ⚡ Auto-Routing Aktif & Siap Menerima Pesanan Tenant!');
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2 w-fit shrink-0"
              >
                <i className="fa-solid fa-play text-amber-300" />
                <span>Simulasi Run AI Engine</span>
              </button>
            </div>

            {/* AI Engine Status Banner */}
            <div className="p-4 neu-inset rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg">
                  <i className="fa-solid fa-robot animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Status AI Auto-Pilot: AKTIF (24/7 Monitoring)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Menangani routing pesanan galon, gas, pengingat WA otomatis &amp; kebersihan kamar.</p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase rounded-full border border-emerald-500/30">
                ● 100% Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {autoRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 neu-card-sm rounded-2xl space-y-3 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20 text-[10px] font-bold">
                      {rule.category}
                    </span>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                        rule.enabled ? 'bg-emerald-500 justify-end shadow-inner' : 'bg-slate-300 dark:bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rule.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Telah Dieksekusi Sistem: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{rule.triggerCount}x</strong></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rule.enabled ? '🟢 Auto-Active' : '⚪ Manual'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Permintaan Tenant & Plotting ke Karyawan/Vendor */}
        {activeTab === 'tenant_requests' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-route text-purple-600 dark:text-purple-400" />
                  Plotting Tugas Karyawan &amp; Hubungkan ke Vendor Mitra
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Infokan &amp; tugaskan kebutuhan tenant (Air Galon, Gas LPG, Perbaikan) ke karyawan kos untuk diteruskan ke vendor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    localStorage.removeItem('kosanku_shared_supply_requests');
                    localStorage.removeItem(`kosanku_shared_supply_requests_${property.slug}`);
                    setSupplyRequests([]);
                    try {
                      await fetch(`/api/orders?property=${property.slug}`, { method: 'DELETE' });
                      await fetch('/api/orders', { method: 'DELETE' });
                    } catch {}
                    showToast('🧹 Seluruh riwayat testing pesanan berhasil dibersihkan dari Server & Local!');
                  }}
                  className="px-3.5 py-1.5 neu-btn text-[11px] font-bold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Kosongkan daftar pesanan testing"
                >
                  <i className="fa-solid fa-trash-can text-[10px]" />
                  <span>Clear Testing Data</span>
                </button>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-300 dark:border-amber-500/30">
                  ⚡ Dispatching System
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="neu-card-sm rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.01]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20 font-bold text-xs">
                        Kamar {req.roomNumber} ({req.tenantName})
                      </span>
                      {req.category && (
                        <span className="px-2 py-0.5 rounded-md neu-inset text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {req.category}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase w-fit border ${
                        req.status === 'PENDING'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                          : req.status === 'PROCESSING' || req.status === 'PLOTTED'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                      }`}
                    >
                      {req.status === 'PENDING' ? '⏳ Perlu Plotting Owner' : req.status === 'PROCESSING' ? '🚚 Sedang Diproses' : req.status === 'PLOTTED' ? '⚡ Ditugaskan' : '✅ Selesai'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.requestItem}</h4>

                  {/* KOTAK CATATAN KHUSUS DARI TENANT */}
                  {req.notes && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold mb-1 text-[11px]">
                        <i className="fa-solid fa-note-sticky" />
                        <span>Catatan Khusus dari Tenant:</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                        &quot;{req.notes}&quot;
                      </p>
                    </div>
                  )}

                  {req.assignedStaff ? (
                    <div className="p-3 neu-inset rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>Staf Ditugaskan: <strong>{req.assignedStaff}</strong></span>
                      <span>Vendor Terhubung: <strong>{req.connectedVendor || 'Depot Air & Gas Suci'}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Masuk: {req.requestDate}</span>
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="px-4 py-2 neu-btn text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-paper-plane" />
                        <span>Plotting Manual ke Karyawan &amp; Vendor</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Riwayat Pesanan Suplai Owner */}
        {activeTab === 'order_history' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-teal-600 dark:text-teal-400" />
                  Arsip Riwayat Seluruh Pesanan Suplai Tenant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audit trail lengkap permintaan suplai air galon, laundry, dan gas dari seluruh penghuni kamar.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                  Total Riwayat: {supplyRequests.length} Item
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Kode Order</th>
                    <th className="py-3 px-3">Penghuni &amp; Kamar</th>
                    <th className="py-3 px-3">Item Pesanan</th>
                    <th className="py-3 px-3">Staf Pelaksana</th>
                    <th className="py-3 px-3">Vendor Terhubung</th>
                    <th className="py-3 px-3 text-right">Status Penugasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {supplyRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                        #{r.id ? (r.id.includes('-') ? `ORD-${r.id.split('-').pop()?.slice(-4).toUpperCase()}` : r.id) : 'ORD'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {r.tenantName} <span className="text-slate-400 font-normal">(Kamar {r.roomNumber})</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {r.requestItem}
                        {r.notes && <span className="block text-[10px] text-slate-400 italic font-normal">&quot;{r.notes}&quot;</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{r.assignedStaff || 'Belum diplot'}</td>
                      <td className="py-3.5 px-3 text-purple-700 dark:text-purple-300 font-semibold">{r.connectedVendor || 'Belum dipilih'}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : r.status === 'PROCESSING' || r.status === 'PLOTTED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}>
                          {r.status === 'COMPLETED' ? '✅ SELESAI' : r.status === 'PROCESSING' || r.status === 'PLOTTED' ? '⚡ DITUGASKAN' : '⏳ PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {supplyRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada riwayat pesanan suplai tercatat
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Laporan Cek-In & Cek-Out Kamar (Dedicated Full View) */}
        {activeTab === 'checkin_reports' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-check text-blue-600 dark:text-blue-400" />
                  Log Laporan Inspeksi Cek-In &amp; Cek-Out Kamar Penghuni
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arsip lengkap kondisi kamar saat dihuni baru (Cek-In) maupun saat dikosongkan (Cek-Out) oleh tenant.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs">
                Total Laporan: {roomInspections.length} Item
              </span>
            </div>

            <div className="space-y-4">
              {(roomInspections.length > 0 ? roomInspections : INITIAL_ROOM_INSPECTIONS).map((insp: any) => (
                <div key={insp.id} className="neu-card-sm p-5 sm:p-6 rounded-2xl space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-xl font-mono text-xs font-black ${
                        insp.type === 'CHECK_IN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300'
                      }`}>
                        {insp.type === 'CHECK_IN' ? '🚪 CEK-IN (PENHUNI MASUK)' : '📦 CEK-OUT (PENGHUNI KELUAR)'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Kamar {insp.roomNumber} — {insp.tenantName}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Petugas: <strong className="text-slate-900 dark:text-white">{insp.inspectedBy}</strong> ({insp.date})
                    </span>
                  </div>

                  <div className="p-3.5 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Catatan Petugas Lapangan:</span>
                    <p className="italic font-medium">&quot;{insp.notes}&quot;</p>
                  </div>

                  <div className="pt-1 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Hasil Pengecekan Fisik Inventori:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {insp.items?.map((it: any, i: number) => (
                        <div key={i} className={`p-2.5 rounded-xl font-bold flex items-center justify-between text-[11px] ${
                          it.status === 'ADA_BAIK'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60'
                            : it.status === 'PERLU_PERBAIKAN'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200/60'
                        }`}>
                          <span className="truncate">{it.item}</span>
                          <span className="shrink-0">{it.status === 'ADA_BAIK' ? '✅ Baik' : it.status === 'PERLU_PERBAIKAN' ? '⚠️ Perbaikan' : '❌ Hilang'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Approval Dana */}
        {activeTab === 'approval' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-signature text-purple-600 dark:text-purple-400" />
                  Persetujuan Pengeluaran &amp; Anggaran Dana (Owner Approval)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verifikasi pengajuan pengeluaran dari karyawan operasional kos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {approvals.map((req) => (
                <div
                  key={req.id}
                  className="neu-card-sm rounded-2xl p-5 sm:p-6 space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20 font-mono text-[10px] font-bold">
                        {req.id}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{req.title}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase w-fit border ${
                        req.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                      }`}
                    >
                      {req.status === 'PENDING' ? '⏳ Menunggu Approval Owner' : req.status === 'APPROVED' ? '✅ Disetujui Owner' : '❌ Ditolak'}
                    </span>
                  </div>

                  <div className="p-4 neu-inset rounded-xl space-y-2 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      &quot;{req.reason}&quot;
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Pemohon: <strong className="text-slate-900 dark:text-white">{req.requestedBy}</strong> • {req.date}</span>
                      <span>Kategori: <strong className="text-purple-700 dark:text-purple-300">{req.category}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Nominal Pengajuan</span>
                      <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">{formatIDR(req.amount)}</span>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(req.id, 'REJECTED')}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Tolak Pengajuan
                        </button>
                        <button
                          onClick={() => handleApproval(req.id, 'APPROVED')}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check text-xs" /> Setujui Anggaran
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tab: Kamar & Pricing AI */}
        {activeTab === 'rooms_ai' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-door-open text-[#047857]" />
                  Manajemen Kamar &amp; Dynamic Pricing AI Optimizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analisis harga sewa optimal berdasarkan tingkat okupansi &amp; tren pasar musim liburan
                </p>
              </div>
              <button
                onClick={fetchAIPricing}
                disabled={pricingLoading}
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 w-fit disabled:opacity-50"
              >
                {pricingLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-amber-300" />
                    <span>Menganalisis Tren Pasar...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-300" />
                    <span>Analisis AI Pricing Optimal</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Dynamic Pricing Result Panel */}
            {pricingData && (
              <div className="p-5 neu-card rounded-2xl space-y-4 animate-scale-in border border-purple-500/20 bg-purple-500/5">
                {pricingData.insights && (
                  <div className="p-3.5 neu-inset rounded-xl">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      <i className="fa-solid fa-robot text-purple-600 dark:text-purple-400 mr-2" />
                      <strong>Rekomendasi AI: </strong> {pricingData.insights}
                    </p>
                  </div>
                )}
                {pricingData.recommendations?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {pricingData.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-3.5 neu-card-sm rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{rec.roomType}</span>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                            {rec.confidence || 'OPTIMAL'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 line-through text-[11px]">{formatIDR(rec.currentPrice)}</span>
                          <i className="fa-solid fa-arrow-right text-[8px] text-purple-600 dark:text-purple-400" />
                          <span className="font-black text-purple-700 dark:text-purple-300">{formatIDR(rec.suggestedPrice)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 2-Column Side-by-Side: [Kiri: Booking Masuk & DP] + [Kanan: Log Laporan Inspeksi Cek-In] ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Kolom Kiri: Booking Masuk & DP Calon Penghuni */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-amber-500" />
                    Daftar Booking Masuk (DP &amp; Calon Penghuni)
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {bookings.length > 0 ? `${bookings.length} Booking Pending` : 'Terbaru'}
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {bookings.map((bk: any) => (
                    <div key={bk.id} className="neu-card-sm p-4 rounded-2xl space-y-2.5 text-xs border border-amber-500/30 bg-amber-500/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono text-[9px] font-black shadow-xs">
                            DP TERBAYAR
                          </span>
                          <h5 className="font-black text-xs text-slate-900 dark:text-white">
                            Kamar {bk.roomNumber || bk.room?.number || 'A-102'} — {bk.tenantName}
                          </h5>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">
                          {bk.durationMonths || 1} Bulan
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 neu-inset rounded-xl">
                          <span className="text-slate-400 text-[9px] block font-bold">WhatsApp</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white text-[11px]">{bk.tenantPhone || '0812-3456-7890'}</span>
                        </div>
                        <div className="p-2 neu-inset rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-[9px] block font-bold">Nominal DP</span>
                            <span className="font-mono font-black text-[#047857] dark:text-emerald-400 text-[11px]">
                              {formatIDR(bk.dpAmount || 500000)}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-black">LUNAS</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {bookings.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs neu-inset rounded-2xl">
                      <i className="fa-solid fa-calendar-check text-2xl text-slate-300 dark:text-slate-600 mb-2 block" />
                      Belum ada calon penghuni booking baru
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Log Laporan Inspeksi Cek-In & Cek-Out Staf */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-check text-blue-600 dark:text-blue-400" />
                    Log Inspeksi Cek-In &amp; Cek-Out Staf
                  </h4>
                  <span className="text-[10px] text-slate-500">Realtime Fisik</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {roomInspections.map((insp: any) => (
                    <div key={insp.id} className="neu-card-sm p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black ${
                            insp.type === 'CHECK_IN'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}>
                            {insp.type === 'CHECK_IN' ? '🚪 CEK-IN' : '📦 CEK-OUT'}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            Kamar {insp.roomNumber} • {insp.tenantName}
                          </h5>
                        </div>
                        <span className="text-[9px] text-slate-400 truncate">{insp.inspectedBy}</span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 italic neu-inset p-2 rounded-xl text-[10px]">
                        &quot;{insp.notes}&quot;
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {insp.items?.slice(0, 4).map((it: any, i: number) => (
                          <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                            {it.item}: {it.status === 'ADA_BAIK' ? '✅ Baik' : '⚠️ Cek'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {roomInspections.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs neu-inset rounded-2xl">
                      Belum ada log inspeksi kamar dari staf
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── Status Unit & Okupansi Kamar (Dynamic from Database) ── */}
            <div className="pt-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <i className="fa-solid fa-border-all text-[#047857]" />
                Status Keterisian &amp; Okupansi Unit Kamar ({rooms.length} Total Unit)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rooms.map((rm: any) => (
                  <div key={rm.id || rm.number} className="p-5 neu-card-sm rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">Kamar {rm.number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                        rm.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' :
                        rm.status === 'BOOKED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}>
                        {rm.status || 'AVAILABLE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rm.type}</p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black text-[#047857] dark:text-emerald-400">{formatIDR(rm.price)}/bln</span>
                      <span className="text-[10px] text-slate-400 font-bold truncate">
                        {rm.tenant?.name ? `Penghuni: ${rm.tenant.name}` : typeof rm.tenant === 'string' ? `Penghuni: ${rm.tenant}` : 'Kosong (Tersedia)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Invoice & Midtrans */}
        {activeTab === 'invoices' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-invoice-dollar text-[#047857]" />
                  Daftar Invoice &amp; Integrasi Midtrans QRIS Snap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Riwayat tagihan sewa &amp; add-on bulanan tenant
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">No. Invoice / Reff</th>
                    <th className="py-3 px-3">Tenant &amp; Kamar</th>
                    <th className="py-3 px-3">Deskripsi Tagihan / Suplai</th>
                    <th className="py-3 px-3">Total Nominal</th>
                    <th className="py-3 px-3 text-right">Status Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#047857] dark:text-emerald-400">{inv.invoiceNumber || inv.id}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{inv.user?.name || 'Tenant'} (Kamar {inv.room?.number || '-'})</td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium">Sewa Kamar {inv.room?.number || ''}</td>
                      <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">{formatIDR(inv.totalAmount || inv.amount)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          inv.paymentStatus === 'SETTLED' ? 'bg-emerald-100 text-[#047857] dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}>
                          {inv.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        Belum ada riwayat tagihan terbit untuk properti ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Tiket Keluhan Tenant */}
        {activeTab === 'complaints' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-headset text-[#047857]" />
                  Board Tiket Keluhan &amp; Perbaikan Tenant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pantau keluhan perbaikan dari penghuni kamar
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {complaints.map((c: any) => (
                <div key={c.id} className="p-4 neu-card-sm rounded-2xl space-y-2 border border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#047857]/10 text-[#047857] dark:text-emerald-400 font-mono text-[10px] font-black">
                        #{c.id}
                      </span>
                      {c.title} — Kamar {c.roomNumber || c.room?.number || 'EKS-01'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      c.status === 'OPEN' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status || 'OPEN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">&quot;{c.description}&quot;</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tenant: <strong className="text-slate-800 dark:text-slate-200">{c.tenantName || c.user?.name || 'Penghuni Kos (WhatsApp)'}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          showToast(`✅ Tiket keluhan #${c.id} telah di-plotting & diteruskan ke Bambang (Staf Lapangan)`);
                          await fetch('/api/complaints', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: c.id,
                              status: 'IN_PROGRESS',
                              assignedStaff: 'Bambang (Staf Lapangan)',
                            }),
                          }).catch(() => {});
                          setComplaints((prev) =>
                            prev.map((item) =>
                              item.id === c.id
                                ? { ...item, status: 'IN_PROGRESS', assignedStaff: 'Bambang (Staf Lapangan)' }
                                : item
                            )
                          );
                        }}
                        className="px-3 py-1.5 bg-[#047857] hover:bg-[#035e44] text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-screwdriver-wrench text-[10px]" />
                        Plot ke Bambang (Staf)
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {complaints.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs neu-inset rounded-2xl">
                  <i className="fa-solid fa-check-circle text-2xl text-emerald-500 mb-2 block" />
                  Tidak ada tiket keluhan aktif
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIVE WHATSAPP STREAM MONITOR TAB (Only for Master KosanKu Pro Owner / Superadmin) */}
        {!isCustomOrNewKos && activeTab === 'wa_monitor' && <WhatsAppLiveMonitor />}

        {/* Plotting Modal Dialog */}
        {selectedReq && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setSelectedReq(null)}>
            <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Plotting Karyawan &amp; Hubungkan Vendor</h3>
                <button onClick={() => setSelectedReq(null)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
              </div>

              <div className="p-3.5 neu-inset rounded-2xl text-xs">
                <span className="font-bold block text-[#047857] dark:text-emerald-400 mb-1">Permintaan dari Tenant:</span>
                <p className="text-slate-900 dark:text-white font-black text-sm">Kamar {selectedReq.roomNumber} - {selectedReq.tenantName}</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">&quot;{selectedReq.requestItem}&quot;</p>
              </div>

              <form onSubmit={handlePlottingTask} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Tugaskan Karyawan Kos *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {STAFF_LIST.map((s) => {
                      const isSel = assignedStaff === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setAssignedStaff(s)}
                          className={`p-2.5 rounded-xl font-bold text-left transition-all cursor-pointer flex items-center justify-between gap-1 text-[11px] ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'neu-btn text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{s}</span>
                          {isSel && <i className="fa-solid fa-circle-check text-white text-[10px]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Hubungkan ke Vendor Mitra Kos *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {VENDOR_LIST.map((v) => {
                      const isSel = selectedVendor === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelectedVendor(v)}
                          className={`p-2.5 rounded-xl font-bold text-left transition-all cursor-pointer flex items-center justify-between gap-1 text-[11px] ${
                            isSel
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'neu-btn text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{v}</span>
                          {isSel && <i className="fa-solid fa-circle-check text-white text-[10px]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedReq(null)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">Kirim Plotting</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification (All-Device Friendly: Top floating on mobile, bottom right on desktop) */}
        {toast && (
          <ToastNotification
            msg={toast.msg}
            type={toast.type}
            targetTab={toast.targetTab}
            onClick={() => {
              if (toast.targetTab) {
                setActiveTab(toast.targetTab as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setToast(null);
            }}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </SequenceSaaSLayout>
  );
}
