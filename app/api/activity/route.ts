import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Clean in-memory persistent store on Node.js runtime scoped per property
const propertyApprovalsMap = new Map<string, any[]>();
const propertyInspectionsMap = new Map<string, any[]>();
const propertyNotifsMap = new Map<string, any[]>();

// GET /api/activity — Fetch live synced activity across all roles (Staff, Owner, Tenant, Vendor)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const propertySlug = searchParams.get('property') || 'default';

  const approvals = propertyApprovalsMap.get(propertySlug) || [];
  const inspections = propertyInspectionsMap.get(propertySlug) || [];
  const notifs = propertyNotifsMap.get(propertySlug) || [];

  if (type === 'approvals') {
    return NextResponse.json({ data: approvals });
  }

  if (type === 'inspections') {
    return NextResponse.json({ data: inspections });
  }

  if (type === 'notifs') {
    const role = searchParams.get('role') || 'owner';
    const roleNotifs = notifs.filter((n) => !n.targetRole || n.targetRole.includes(role));
    return NextResponse.json({ data: roleNotifs });
  }

  return NextResponse.json({
    approvals,
    inspections,
    notifs,
  });
}

// POST /api/activity — Push new staff expense, room inspection, or cross-role actions directly to server API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, payload, property: propertySlug = 'default' } = body;

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

      // Push in-app notification for Owner & Admin
      const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
      propertyNotifsMap.set(propertySlug, [
        {
          id: `notif_exp_${newApproval.id}`,
          title: '✍️ Pengajuan Dana Baru dari Staf',
          message: `${newApproval.requestedBy}: "${newApproval.title}" sebesar Rp ${Number(newApproval.amount).toLocaleString('id-ID')}`,
          createdAt: new Date().toISOString(),
          targetRole: ['owner', 'admin', 'superadmin'],
          targetTab: 'approval',
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        ...existingNotifs,
      ]);

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

      const existingInsps = propertyInspectionsMap.get(propertySlug) || [];
      propertyInspectionsMap.set(propertySlug, [newInsp, ...existingInsps.filter((r: any) => r.id !== newInsp.id)]);

      // Push in-app notification for Owner & Admin
      const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
      propertyNotifsMap.set(propertySlug, [
        {
          id: `notif_insp_${newInsp.id}`,
          title: newInsp.type === 'CHECK_IN' ? '🚪 Laporan Cek-In Kamar Masuk' : '📦 Laporan Cek-Out Kamar Masuk',
          message: `Kamar ${newInsp.roomNumber} (${newInsp.tenantName}) selesai diperiksa oleh ${newInsp.inspectedBy}.`,
          createdAt: new Date().toISOString(),
          targetRole: ['owner', 'admin', 'superadmin'],
          targetTab: 'checkin_reports',
          badgeColor: newInsp.type === 'CHECK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
        },
        ...existingNotifs,
      ]);

      return NextResponse.json({ success: true, data: newInsp });
    }

    if (actionType === 'DECIDE_EXPENSE') {
      const { id, status } = payload;
      const existingApps = propertyApprovalsMap.get(propertySlug) || [];
      const updatedApps = existingApps.map((a: any) => (a.id === id ? { ...a, status } : a));
      propertyApprovalsMap.set(propertySlug, updatedApps);
      const targetApproval = updatedApps.find((a: any) => a.id === id);

      // Notify employee
      const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
      propertyNotifsMap.set(propertySlug, [
        {
          id: `notif_exp_dec_${id}`,
          title: status === 'APPROVED' ? '🎉 Pengajuan Dana Disetujui Owner' : '❌ Pengajuan Dana Ditolak',
          message: `Pengajuan "${targetApproval?.title || 'Dana'}" (Rp ${Number(targetApproval?.amount || 0).toLocaleString('id-ID')}) telah ${status === 'APPROVED' ? 'DISETUJUI Owner. Dana siap dicairkan!' : 'DITOLAK.'}`,
          createdAt: new Date().toISOString(),
          targetRole: ['employee'],
          targetTab: 'expense_history',
          badgeColor: status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
        },
        ...existingNotifs,
      ]);

      return NextResponse.json({ success: true, data: targetApproval });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process activity' }, { status: 500 });
  }
}
