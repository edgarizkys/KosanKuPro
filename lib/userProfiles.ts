export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'superadmin' | 'employee' | 'vendor' | 'tenant';
  title: string;
  avatar: string;
  avatarBg?: string;
  branchId: string;
  branchName: string;
  roomNumber?: string;
  department?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinDate: string;
  bio?: string;
}

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'USR-OWN-01',
    name: 'Bapak Hendra Gunawan',
    email: 'owner@kosanku.pro',
    phone: '0811-9988-7766',
    role: 'owner',
    title: 'Owner Utama & Pemilik Properti',
    avatar: '👑',
    avatarBg: 'bg-amber-500',
    branchId: 'all',
    branchName: 'Konsolidasi Semua Cabang',
    department: 'Direksi Eksekutif',
    status: 'ACTIVE',
    joinDate: '01 Jan 2024',
    bio: 'Founder & Pengelola jaringan KosanKu Pro Indonesia.',
  },
  {
    id: 'USR-ADM-01',
    name: 'Pak Suryadi Wibowo',
    email: 'admin@kosanku.pro',
    phone: '0812-3456-7890',
    role: 'admin',
    title: 'Super Admin Control Center',
    avatar: '🛡️',
    avatarBg: 'bg-emerald-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    department: 'Manajemen Operasional',
    status: 'ACTIVE',
    joinDate: '15 Feb 2024',
    bio: 'Kepala administrasi, billing Midtrans, dan pengawasan sistem kos.',
  },
  {
    id: 'USR-EMP-01',
    name: 'Bambang Prasetyo',
    email: 'staf@kosanku.pro',
    phone: '0813-5544-3322',
    role: 'employee',
    title: 'Teknisi & Staf Lapangan',
    avatar: '👷',
    avatarBg: 'bg-blue-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    department: 'Teknik & Maintenance',
    status: 'ACTIVE',
    joinDate: '10 Mar 2024',
    bio: 'Penanggung jawab audit inventori fisik, keluhan AC, dan cek-in kamar.',
  },
  {
    id: 'USR-EMP-02',
    name: 'Siti Aminah',
    email: 'siti@kosanku.pro',
    phone: '0812-4433-2211',
    role: 'employee',
    title: 'Staf Operasional & Front Office',
    avatar: '👩‍💼',
    avatarBg: 'bg-purple-600',
    branchId: 'bdg',
    branchName: 'KosanKu Pro - Dago Bandung',
    department: 'Customer Service & Resepsionis',
    status: 'ACTIVE',
    joinDate: '01 Apr 2024',
    bio: 'Admin operasional harian cabang Bandung & rekapitulasi tenant.',
  },
  {
    id: 'USR-VND-01',
    name: 'Depot Suci Pratama',
    email: 'vendor@kosanku.pro',
    phone: '0812-9988-7711',
    role: 'vendor',
    title: 'Mitra Vendor Galon & Gas',
    avatar: '🏪',
    avatarBg: 'bg-teal-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    department: 'Suplai Galon 19L & Gas LPG 3kg',
    status: 'ACTIVE',
    joinDate: '20 Jan 2024',
    bio: 'Mitra resmi pengiriman air minum galon dan gas untuk penghuni kos.',
  },
  {
    id: 'USR-TNT-01',
    name: 'Budi Santoso',
    email: 'budi@kosanku.pro',
    phone: '0819-8765-4321',
    role: 'tenant',
    title: 'Penghuni Kamar Deluxe A-101',
    avatar: '👤',
    avatarBg: 'bg-indigo-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    roomNumber: 'A-101 (Deluxe Queen)',
    department: 'Software Engineer',
    status: 'ACTIVE',
    joinDate: '01 Mei 2024',
    bio: 'Penyewa aktif kamar A-101 dengan pembayaran auto-debit QRIS.',
  },
  {
    id: 'USR-OWN-02',
    name: 'Ibu Rina Wijaya',
    email: 'rina@kosanku.com',
    phone: '0811-2233-4455',
    role: 'owner',
    title: 'Co-Owner & Investor Dago (30%)',
    avatar: '👑',
    avatarBg: 'bg-pink-600',
    branchId: 'bdg',
    branchName: 'KosanKu Pro - Dago Bandung',
    department: 'Investor Pasif',
    status: 'ACTIVE',
    joinDate: '15 Feb 2024',
    bio: 'Pemegang 30% saham bagi hasil operasional cabang Dago Bandung.',
  },
];

const STORAGE_KEY = 'kosanku_user_profiles_v2';

export function getStoredUserProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USER_PROFILES));
      return INITIAL_USER_PROFILES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USER_PROFILES;
  }
}

export function saveStoredUserProfiles(profiles: UserProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save user profiles to localStorage:', e);
  }
}
