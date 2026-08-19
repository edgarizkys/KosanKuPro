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
    let cloudLogs: any[] = [];
    if (process.env.NODE_ENV !== 'production') {
      try {
        const cloudRes = await fetch('https://kosankupro.cloud/api/activity?type=wa_live_stream', {
          signal: AbortSignal.timeout(1200),
        });
        if (cloudRes.ok) {
          const cloudJson = await cloudRes.json();
          if (cloudJson?.data && Array.isArray(cloudJson.data)) {
            cloudLogs = cloudJson.data;
          }
        }
      } catch {}
    }

    // Merge cloud logs and local logs without duplicate IDs
    const mergedMap = new Map<string, any>();
    waLiveStreamLogs.forEach((l) => mergedMap.set(l.id || l.timestamp + l.inboundText, l));
    cloudLogs.forEach((l) => mergedMap.set(l.id || l.timestamp + l.inboundText, l));
    const allLogs = Array.from(mergedMap.values());

    return NextResponse.json({
      data: allLogs,
      count: allLogs.length,
      latestTimestamp: allLogs[0]?.timestamp || null,
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
        title: '⚠️ Keluhan Baru dari Penghuni',
        message: `${complaint.tenantName || 'Penghuni'} (Kamar ${complaint.roomNumber || 'A-101'}): "${complaint.title || complaint.description}"`,
        targetRole: ['owner', 'admin', 'employee'],
        targetTab: 'complaints',
        badgeColor: 'bg-rose-100 text-rose-800',
      });

      return NextResponse.json({ success: true });
    }

    // 4. Room Inspection Report
    if (actionType === 'ROOM_INSPECTION') {
      const report = payload;
      const existing = propertyInspectionsMap.get(propertySlug) || [];
      propertyInspectionsMap.set(propertySlug, [report, ...existing.filter((r: any) => r.id !== report.id)]);

      pushActivityNotification(propertySlug, {
        id: `notif_insp_${report.id || Date.now()}`,
        title: `📋 Laporan ${report.type === 'CHECK_IN' ? 'Cek-In' : 'Cek-Out'} Baru`,
        message: `Kamar ${report.roomNumber} (${report.tenantName}) selesai diinspeksi oleh ${report.inspectedBy}.`,
        targetRole: ['owner', 'admin', 'superadmin'],
        targetTab: 'checkin_reports',
        badgeColor: 'bg-blue-100 text-blue-800',
      });

      return NextResponse.json({ success: true, data: report });
    }

    return NextResponse.json({ error: 'Unknown actionType' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process activity event' }, { status: 500 });
  }
}
