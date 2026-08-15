import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Clean in-memory persistent store on Node.js runtime
let globalStaffApprovals: any[] = [];
let globalRoomInspections: any[] = [];
let globalOrderNotifs: any[] = [];

// GET /api/activity — Fetch live synced activity across all roles (Staff, Owner, Tenant, Vendor)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'approvals') {
    return NextResponse.json({ data: globalStaffApprovals });
  }

  if (type === 'inspections') {
    return NextResponse.json({ data: globalRoomInspections });
  }

  if (type === 'notifs') {
    const role = searchParams.get('role') || 'owner';
    const roleNotifs = globalOrderNotifs.filter((n) => !n.targetRole || n.targetRole.includes(role));
    return NextResponse.json({ data: roleNotifs });
  }

  return NextResponse.json({
    approvals: globalStaffApprovals,
    inspections: globalRoomInspections,
    notifs: globalOrderNotifs,
  });
}

// POST /api/activity — Push new staff expense, room inspection, or cross-role actions directly to server API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, payload } = body;

    if (actionType === 'STAFF_EXPENSE') {
      const newApproval = {
        id: payload.id || `APP-${Math.floor(1000 + Math.random() * 9000)}`,
        title: payload.title || 'Pengajuan Dana Operasional',
        category: payload.category || 'OPERATIONAL',
        amount: Number(payload.amount) || 0,
        requestedBy: payload.requestedBy || 'Bambang Prasetyo (Staf Lapangan)',
        requestDate: 'Baru saja',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        reason: payload.reason || '',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      globalStaffApprovals = [newApproval, ...globalStaffApprovals.filter((a) => a.id !== newApproval.id)];

      // Push in-app notification for Owner & Admin
      globalOrderNotifs.unshift({
        id: `notif_exp_${newApproval.id}`,
        title: '✍️ Pengajuan Dana Baru dari Staf',
        message: `${newApproval.requestedBy}: "${newApproval.title}" sebesar Rp ${Number(newApproval.amount).toLocaleString('id-ID')}`,
        createdAt: new Date().toISOString(),
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'approval',
        badgeColor: 'bg-amber-100 text-amber-800',
      });

      return NextResponse.json({ success: true, data: newApproval });
    }

    if (actionType === 'ROOM_INSPECTION') {
      const newInsp = {
        id: payload.id || `INSP-${Date.now().toString().slice(-4)}`,
        roomNumber: payload.roomNumber || 'A-101',
        tenantName: payload.tenantName || 'Penghuni Kosan',
        type: payload.type || 'CHECK_IN',
        inspectedBy: payload.inspectedBy || 'Bambang Prasetyo (Staf Lapangan)',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: payload.items || [],
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
      };

      globalRoomInspections = [newInsp, ...globalRoomInspections.filter((r) => r.id !== newInsp.id)];

      // Push in-app notification for Owner & Admin
      globalOrderNotifs.unshift({
        id: `notif_insp_${newInsp.id}`,
        title: newInsp.type === 'CHECK_IN' ? '🚪 Laporan Cek-In Kamar Masuk' : '📦 Laporan Cek-Out Kamar Masuk',
        message: `Kamar ${newInsp.roomNumber} (${newInsp.tenantName}) selesai diperiksa oleh ${newInsp.inspectedBy}.`,
        createdAt: new Date().toISOString(),
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'checkin_reports',
        badgeColor: newInsp.type === 'CHECK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      });

      return NextResponse.json({ success: true, data: newInsp });
    }

    if (actionType === 'DECIDE_EXPENSE') {
      const { id, status } = payload;
      globalStaffApprovals = globalStaffApprovals.map((a) => (a.id === id ? { ...a, status } : a));
      const targetApproval = globalStaffApprovals.find((a) => a.id === id);

      // Notify employee
      globalOrderNotifs.unshift({
        id: `notif_exp_dec_${id}`,
        title: status === 'APPROVED' ? '🎉 Pengajuan Dana Disetujui Owner' : '❌ Pengajuan Dana Ditolak',
        message: `Pengajuan "${targetApproval?.title || 'Dana'}" (Rp ${Number(targetApproval?.amount || 0).toLocaleString('id-ID')}) telah ${status === 'APPROVED' ? 'DISETUJUI Owner. Dana siap dicairkan!' : 'DITOLAK.'}`,
        createdAt: new Date().toISOString(),
        targetRole: ['employee'],
        targetTab: 'expense_history',
        badgeColor: status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      });

      return NextResponse.json({ success: true, data: targetApproval });
    }

    if (actionType === 'NEW_BOOKING') {
      const booking = payload;
      globalOrderNotifs.unshift({
        id: `notif_book_${Date.now()}`,
        title: '🎉 BOOKING BARU MASUK!',
        message: `${booking.tenantName} telah memesan Kamar ${booking.roomNumber} (DP: Rp ${Number(booking.dpAmount || 500000).toLocaleString('id-ID')}).`,
        createdAt: new Date().toISOString(),
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'rooms_ai',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      });

      return NextResponse.json({ success: true, data: booking });
    }

    if (actionType === 'STOCK_OPNAME') {
      const audit = payload;
      globalOrderNotifs.unshift({
        id: `notif_so_${Date.now()}`,
        title: '📦 Laporan Audit Stock Opname (SO) Baru',
        message: `${audit.auditedBy || 'Staf Lapangan'} telah menyelesaikan audit fisik ${audit.items?.length || 0} item inventori gudang.`,
        createdAt: new Date().toISOString(),
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'inventory',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      });

      return NextResponse.json({ success: true, data: audit });
    }

    if (actionType === 'DISPATCH_ORDER' || actionType === 'UPDATE_ORDER') {
      const { order, status, assignedStaff, vendorName } = payload;
      
      if (status === 'NEW') {
        globalOrderNotifs.unshift({
          id: `notif_order_new_${Date.now()}`,
          title: `🛒 Order Suplai Baru: ${order?.item || 'Item'}`,
          message: `${order?.tenantName || 'Tenant'} (Kamar ${order?.roomNumber || 'A-101'}) memesan ${order?.item || 'Suplai'}.`,
          createdAt: new Date().toISOString(),
          targetRole: ['owner', 'admin', 'vendor'],
          targetTab: 'tenant_requests',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        });
      } else if (status === 'PROCESSING' || status === 'PLOTTED') {
        globalOrderNotifs.unshift({
          id: `notif_order_${Date.now()}`,
          title: '🚚 Pesanan Anda Sedang Diproses',
          message: `Pesanan ${order?.item || 'Suplai'} (Kamar ${order?.roomNumber}) ditugaskan ke ${assignedStaff || 'Kurir'} & Vendor ${vendorName || 'Mitra'}.`,
          createdAt: new Date().toISOString(),
          targetRole: ['tenant'],
          targetTab: 'tenant_requests',
          badgeColor: 'bg-blue-100 text-blue-800',
        });
      } else if (status === 'DELIVERED') {
        globalOrderNotifs.unshift({
          id: `notif_order_del_${Date.now()}`,
          title: '📦 Pesanan Telah Tiba di Kamar!',
          message: `Pesanan ${order?.item || 'Suplai'} sudah diantar. Silakan konfirmasi terima di dashboard.`,
          createdAt: new Date().toISOString(),
          targetRole: ['tenant', 'owner'],
          targetTab: 'tenant_requests',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown actionType' }, { status: 400 });
  } catch (error) {
    console.error('[POST /api/activity error]', error);
    return NextResponse.json({ error: 'Failed to process activity' }, { status: 500 });
  }
}
