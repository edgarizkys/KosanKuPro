// Clean in-memory persistent stores on Node.js runtime scoped per property
export const propertyApprovalsMap = new Map<string, any[]>();
export const propertyInspectionsMap = new Map<string, any[]>();
export const propertyNotifsMap = new Map<string, any[]>();
export const waLiveStreamLogs: any[] = [];

// Helper to push a notification safely
export function pushActivityNotification(
  propertySlug: string = 'default',
  notif: {
    id?: string;
    title: string;
    message: string;
    targetRole?: string[];
    targetTab?: string;
    badgeColor?: string;
    metadata?: any;
  }
) {
  const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
  const fullNotif = {
    ...notif,
    createdAt: new Date().toISOString(),
    id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  propertyNotifsMap.set(propertySlug, [fullNotif, ...existingNotifs.filter((n) => n.id !== fullNotif.id)].slice(0, 50));
  return fullNotif;
}

// Helper to push WhatsApp live stream event
export function pushWaLiveLog(log: {
  phone: string;
  senderName: string;
  detectedRole: string;
  inboundText: string;
  replyText: string;
  actionTaken?: string;
  property?: string;
}) {
  const entry = {
    id: `walog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toISOString(),
    ...log,
  };
  waLiveStreamLogs.unshift(entry);
  if (waLiveStreamLogs.length > 80) waLiveStreamLogs.pop();
  return entry;
}
