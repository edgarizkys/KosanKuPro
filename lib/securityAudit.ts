export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userName: string;
  email: string;
  method: 'GOOGLE_SSO' | 'PASSWORD_LOGIN' | 'INVITE_LINK_REGISTRATION' | 'DIRECT_REGISTRATION';
  role: string;
  ipAddress: string;
  device: string;
  status: 'SUCCESS' | 'PENDING_APPROVAL' | 'REJECTED' | 'BLOCKED';
}

export interface RoomInviteToken {
  id: string;
  roomNumber: string;
  roomType: string;
  token: string;
  inviteUrl: string;
  expiresAt: string;
  isUsed: boolean;
  createdBy: string;
  createdAt: string;
}

export const INITIAL_SECURITY_LOGS: SecurityAuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '10 menit lalu',
    userName: 'Rahmat Hidayat',
    email: 'rahmat.hidayat99@gmail.com',
    method: 'GOOGLE_SSO',
    role: 'TENANT',
    ipAddress: '182.253.11.45 (Jakarta)',
    device: 'Android Phone • Chrome 122',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'LOG-002',
    timestamp: '25 menit lalu',
    userName: 'Dimas Prasetya',
    email: 'dimas_p@yahoo.com',
    method: 'DIRECT_REGISTRATION',
    role: 'TENANT',
    ipAddress: '114.124.201.88 (Bandung)',
    device: 'Windows 11 • Edge',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'LOG-003',
    timestamp: '1 jam lalu',
    userName: 'Budi Santoso',
    email: 'budi@kosanku.pro',
    method: 'INVITE_LINK_REGISTRATION',
    role: 'TENANT',
    ipAddress: '180.252.99.12 (Jakarta)',
    device: 'iPhone 15 • Safari',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-004',
    timestamp: '2 jam lalu',
    userName: 'Pak Suryadi Wibowo',
    email: 'admin@kosanku.pro',
    method: 'PASSWORD_LOGIN',
    role: 'ADMIN',
    ipAddress: '36.85.12.90 (Jakarta Pusat)',
    device: 'MacBook Air • Chrome',
    status: 'SUCCESS',
  },
];

export const INITIAL_INVITE_TOKENS: RoomInviteToken[] = [
  {
    id: 'INV-101',
    roomNumber: 'A-101',
    roomType: 'Deluxe Queen',
    token: 'ksk_inv_a101_8823',
    inviteUrl: 'https://kosanku.pro/join?room=A-101&token=ksk_inv_a101_8823',
    expiresAt: '24 Jam lagi',
    isUsed: true,
    createdBy: 'Pak Suryadi (Admin)',
    createdAt: 'Kemarin',
  },
  {
    id: 'INV-102',
    roomNumber: 'A-102',
    roomType: 'Standard Single',
    token: 'ksk_inv_a102_9912',
    inviteUrl: 'https://kosanku.pro/join?room=A-102&token=ksk_inv_a102_9912',
    expiresAt: '48 Jam lagi',
    isUsed: false,
    createdBy: 'Bapak Hendra (Owner)',
    createdAt: 'Hari ini',
  },
];
