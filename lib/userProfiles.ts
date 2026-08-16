export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'superadmin' | 'employee' | 'vendor' | 'tenant';
  title: string;
  avatar: string;
  avatarUrl?: string;
  avatarBg?: string;
  branchId: string;
  branchName: string;
  roomNumber?: string;
  department?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'REJECTED';
  joinDate: string;
  bio?: string;
  verificationSource?: 'INVITE_LINK' | 'MANUAL_ADMIN' | 'GOOGLE_SSO_DIRECT' | 'SELF_REGISTRATION';
  invitedRoomNumber?: string;
  registeredAt?: string;
}

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'USR-OWN-01',
    name: 'Ibu Dewi Tri Oktariani',
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
    verificationSource: 'MANUAL_ADMIN',
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
    verificationSource: 'MANUAL_ADMIN',
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
    verificationSource: 'MANUAL_ADMIN',
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
    verificationSource: 'MANUAL_ADMIN',
  },
  {
    id: 'USR-VND-01',
    name: 'Depot Air & Gas Suci',
    email: 'vendor.galon@kosanku.pro',
    phone: '0812-9988-7711',
    role: 'vendor',
    title: 'Mitra Depot Galon & Gas LPG',
    avatar: '💧',
    avatarBg: 'bg-teal-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    department: 'Suplai Galon Aqua 19L & Gas LPG 3kg/5.5kg',
    status: 'ACTIVE',
    joinDate: '20 Jan 2024',
    bio: 'Mitra resmi pengiriman air minum galon Aqua dan gas Bright untuk penghuni kos.',
    verificationSource: 'MANUAL_ADMIN',
  },
  {
    id: 'USR-VND-02',
    name: 'Laundry Express Clean',
    email: 'vendor.laundry@kosanku.pro',
    phone: '0813-8877-6655',
    role: 'vendor',
    title: 'Mitra Laundry Kiloan & Express',
    avatar: '🧺',
    avatarBg: 'bg-blue-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    department: 'Layanan Cuci Lipat, Cuci Setrika & Dry Clean',
    status: 'ACTIVE',
    joinDate: '15 Feb 2024',
    bio: 'Mitra resmi antar-jemput laundry pakaian kiloan dan bed cover penghuni kos.',
    verificationSource: 'MANUAL_ADMIN',
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
    verificationSource: 'INVITE_LINK',
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
    verificationSource: 'MANUAL_ADMIN',
  },
  {
    id: 'USR-PND-01',
    name: 'Rahmat Hidayat (Google SSO)',
    email: 'rahmat.hidayat99@gmail.com',
    phone: '0857-1122-3344',
    role: 'tenant',
    title: 'Mendaftar via Google SSO Mandiri',
    avatar: '🔍',
    avatarBg: 'bg-amber-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    roomNumber: 'Menunggu Alokasi Kamar',
    department: 'Calon Penghuni Kos',
    status: 'PENDING_APPROVAL',
    joinDate: 'Hari Ini (Baru)',
    bio: 'Login Google SSO tanpa Link Undangan — Menunggu Verifikasi Admin Kos.',
    verificationSource: 'GOOGLE_SSO_DIRECT',
    registeredAt: 'Baru saja (10 menit lalu)',
  },
  {
    id: 'USR-PND-02',
    name: 'Dimas Prasetya (Pendaftar Bebas)',
    email: 'dimas_p@yahoo.com',
    phone: '0812-9988-1122',
    role: 'tenant',
    title: 'Mendaftar dari Form Landing Page',
    avatar: '❓',
    avatarBg: 'bg-orange-600',
    branchId: 'jkt',
    branchName: 'KosanKu Pro - Jakarta Selatan (Utama)',
    roomNumber: 'Kamar B-202 (Mencari Sewa)',
    department: 'Mahasiswa / Pekerja',
    status: 'PENDING_APPROVAL',
    joinDate: 'Hari Ini (Baru)',
    bio: 'Mendaftar mandiri dari formulir web — Membutuhkan konfirmasi Owner.',
    verificationSource: 'SELF_REGISTRATION',
    registeredAt: 'Baru saja (25 menit lalu)',
  },
];

const STORAGE_KEY = 'kosanku_user_profiles_v3';

export function getStoredUserProfiles(propertySlug?: string): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILES;
  try {
    const slug = propertySlug || localStorage.getItem('kosanku_active_property_slug') || 'default';
    const scopedKey = `${STORAGE_KEY}_${slug}`;

    const raw = localStorage.getItem(scopedKey);
    if (raw) {
      const parsed: UserProfile[] = JSON.parse(raw);
      if (slug !== 'default') {
        // Strict guard: remove demo users that might have been merged in earlier sessions
        const cleaned = parsed.filter(
          (u) =>
            !u.email.endsWith('@kosanku.pro') &&
            !u.email.includes('example.com') &&
            (u.branchId === slug || u.email === 'rshs@kosankupro.cloud' || !u.email.includes('kosanku.pro'))
        );
        if (cleaned.length === 0 && slug === 'rshs') {
          const rshsOwner: UserProfile[] = [
            {
              id: 'usr_owner_rshs',
              name: 'Owner Juragan Kost RSHS',
              email: 'rshs@kosankupro.cloud',
              phone: '+62 812-2379-8307',
              role: 'owner',
              title: 'Pemilik Juragan Kost RSHS',
              avatar: '👑',
              avatarBg: 'bg-emerald-600',
              branchId: 'rshs',
              branchName: 'Juragan Kost RSHS',
              department: 'Owner & Direksi',
              status: 'ACTIVE',
              joinDate: 'Hari Ini',
              bio: 'Owner resmi Juragan Kost RSHS Bandung.',
              verificationSource: 'MANUAL_ADMIN',
            },
          ];
          localStorage.setItem(scopedKey, JSON.stringify(rshsOwner));
          return rshsOwner;
        }
        return cleaned;
      }
      return parsed;
    }

    // If default demo property, return initial demo seed
    if (slug === 'default') {
      localStorage.setItem(scopedKey, JSON.stringify(INITIAL_USER_PROFILES));
      return INITIAL_USER_PROFILES;
    }

    // For newly plotted kosan (like rshs), start with its specific registered owner or empty clean slate
    const customKosInitialUsers: UserProfile[] = slug === 'rshs' ? [
      {
        id: 'usr_owner_rshs',
        name: 'Owner Juragan Kost RSHS',
        email: 'rshs@kosankupro.cloud',
        phone: '+62 812-2379-8307',
        role: 'owner',
        title: 'Pemilik Juragan Kost RSHS',
        avatar: '👑',
        avatarBg: 'bg-emerald-600',
        branchId: 'rshs',
        branchName: 'Juragan Kost RSHS',
        department: 'Owner & Direksi',
        status: 'ACTIVE',
        joinDate: 'Hari Ini',
        bio: 'Owner resmi Juragan Kost RSHS Bandung.',
        verificationSource: 'MANUAL_ADMIN',
      },
    ] : [];

    localStorage.setItem(scopedKey, JSON.stringify(customKosInitialUsers));
    return customKosInitialUsers;
  } catch (e) {
    return [];
  }
}

export function saveStoredUserProfiles(profiles: UserProfile[], propertySlug?: string) {
  if (typeof window === 'undefined') return;
  try {
    const slug = propertySlug || localStorage.getItem('kosanku_active_property_slug') || 'default';
    const scopedKey = `${STORAGE_KEY}_${slug}`;
    localStorage.setItem(scopedKey, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save user profiles to localStorage:', e);
  }
}
