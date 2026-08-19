import { NextRequest, NextResponse } from 'next/server';
import {
  propertyApprovalsMap,
  propertyInspectionsMap,
  propertyNotifsMap,
  waLiveStreamLogs,
  pushActivityNotification,
  pushWaLiveLog,
} from '@/lib/activityEvents';

export const dynamic = 'force-dynamic';

// GET /api/activity — Fetch live synced activity across all roles (Staff, Owner, Tenant, Vendor)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const propertySlug = searchParams.get('property') || 'default';

  const approvals = propertyApprovalsMap.get(propertySlug) || [];
  const inspections = propertyInspectionsMap.get(propertySlug) || [];
  const notifs = propertyNotifsMap.get(propertySlug) || [];

  if (type === 'wa_live_stream') {
    return NextResponse.json({
      data: waLiveStreamLogs,
      count: waLiveStreamLogs.length,
      latestTimestamp: waLiveStreamLogs[0]?.timestamp || null,
    });
  }

  if (type === 'approvals') {
    return NextResponse.json({ data: approvals });
  }

  if (type === 'inspections') {
    return NextResponse.json({ data: inspections });
  }

  if (type === 'notifs') {
    const role = (searchParams.get('role') || 'owner').toLowerCase();
    const roleNotifs = notifs.filter((n) => !n.targetRole || n.targetRole.map((r: string) => r.toLowerCase()).includes(role));
    return NextResponse.json({ data: roleNotifs });
  }

  return NextResponse.json({
    approvals,
    inspections,
    notifs,
    waLiveStream: waLiveStreamLogs.slice(0, 15),
  });
}

// POST /api/activity — Push new staff expense, room inspection, or cross-role actions directly to server API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, payload, property: propertySlug = 'default' } = body;

    // 1. WhatsApp Live Log Stream
    if (actionType === 'WA_LOG' || actionType === 'WA_EVENT') {
      const entry = pushWaLiveLog(payload);
      return NextResponse.json({ success: true, data: entry });
    }

    // 2. Staff Expense Request
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

      const existingApps = propertyApprovalsMap.get(propertySlug) || [];
      propertyApprovalsMap.set(propertySlug, [newApproval, ...existingApps.filter((a: any) => a.id !== newApproval.id)]);

      // Push notification for Owner & Admin
      pushActivityNotification(propertySlug, {
        id: `notif_exp_${newApproval.id}`,
        title: '✍️ Pengajuan Dana Baru dari Staf',
        message: `${newApproval.requestedBy}: "${newApproval.title}" sebesar Rp ${Number(newApproval.amount).toLocaleString('id-ID')}`,
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'approval',
        badgeColor: 'bg-amber-100 text-amber-800',
      });

      return NextResponse.json({ success: true, data: newApproval });
    }

    // 3. Tenant Complaint
    if (actionType === 'TENANT_COMPLAINT') {
      const complaint = payload;
      pushActivityNotification(propertySlug, {
        id: `notif_cmp_${complaint.id || Date.now()}`,
        title: '🛠️ Keluhan Kerusakan Baru dari Tenant',
        message: `${complaint.tenantName || 'Penghuni'} (Kamar ${complaint.roomNumber || 'A-101'}): "${complaint.title || complaint.description}"`,
        targetRole: ['owner', 'admin', 'superadmin', 'employee'],
        targetTab: 'complaints',
        badgeColor: 'bg-rose-100 text-rose-800',
      });
      return NextResponse.json({ success: true });
    }

    // 4. Room Inspection Report (Cek-In / Cek-Out)
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

      const existingInsps = propertyInspectionsMap.get(propertySlug) || [];
      propertyInspectionsMap.set(propertySlug, [newInsp, ...existingInsps.filter((r: any) => r.id !== newInsp.id)]);

      // Push notification for Owner & Admin
      pushActivityNotification(propertySlug, {
        id: `notif_insp_${newInsp.id}`,
        title: newInsp.type === 'CHECK_IN' ? '🚪 Laporan Cek-In Kamar Masuk' : '📦 Laporan Cek-Out Kamar Masuk',
        message: `Kamar ${newInsp.roomNumber} (${newInsp.tenantName}) selesai diperiksa oleh ${newInsp.inspectedBy}.`,
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'checkin_reports',
        badgeColor: newInsp.type === 'CHECK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      });

      return NextResponse.json({ success: true, data: newInsp });
    }

    // 5. Stock Opname Audit Submitted
    if (actionType === 'STOCK_OPNAME') {
      const audit = payload;
      pushActivityNotification(propertySlug, {
        id: `notif_so_${audit.id || Date.now()}`,
        title: '📦 Laporan Stock Opname (SO) Staf',
        message: `${audit.auditedBy || 'Staf'}: Audit stok fisik selesai (${audit.itemName || 'Galon & Gas'}).`,
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'inventory',
        badgeColor: 'bg-indigo-100 text-indigo-800',
      });
      return NextResponse.json({ success: true });
    }

    // 6. Tenant Supply Order Dispatched
    if (actionType === 'DISPATCH_ORDER' || actionType === 'NEW_TENANT_ORDER') {
      const order = payload.order || payload;
      pushActivityNotification(propertySlug, {
        id: `notif_ord_${order.id || Date.now()}`,
        title: '🛒 Pesanan Suplai Baru Masuk',
        message: `${order.tenantName || 'Tenant'} (Kamar ${order.roomNumber || 'A-101'}) memesan ${order.item || 'Suplai'}.`,
        targetRole: ['owner', 'admin', 'vendor'],
        targetTab: 'tenant_requests',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      });
      return NextResponse.json({ success: true });
    }

    // 7. Decide Expense (Owner Approval)
    if (actionType === 'DECIDE_EXPENSE') {
      const { id, status } = payload;
      const existingApps = propertyApprovalsMap.get(propertySlug) || [];
      const updatedApps = existingApps.map((a: any) => (a.id === id ? { ...a, status } : a));
      propertyApprovalsMap.set(propertySlug, updatedApps);
      const targetApproval = updatedApps.find((a: any) => a.id === id);

      // Notify employee
      pushActivityNotification(propertySlug, {
        id: `notif_exp_dec_${id}`,
        title: status === 'APPROVED' ? '🎉 Pengajuan Dana Disetujui Owner' : '❌ Pengajuan Dana Ditolak',
        message: `Pengajuan "${targetApproval?.title || 'Dana'}" (Rp ${Number(targetApproval?.amount || 0).toLocaleString('id-ID')}) telah ${status === 'APPROVED' ? 'DISETUJUI Owner. Dana siap dicairkan!' : 'DITOLAK.'}`,
        targetRole: ['employee'],
        targetTab: 'expense_history',
        badgeColor: status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      });

      return NextResponse.json({ success: true, data: targetApproval });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process activity' }, { status: 500 });
  }
}
