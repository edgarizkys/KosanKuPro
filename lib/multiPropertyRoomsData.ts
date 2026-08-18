import { RSHS_ROOMS_DATA } from './rshsRoomsData';

export interface MultiPropertyRoomItem {
  id: string;
  number: string;
  type: string;
  propertySlug: string;
  propertyName: string;
  propertyCity: string;
  propertyAddress: string;
  price: number; // Monthly price
  dailyPrice?: number; // Daily rental price
  allowDailyBooking?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'BOOKED' | 'MAINTENANCE';
  floor: number;
  size?: string;
  bedType?: string;
  electricity?: string;
  view?: string;
  capacity?: string;
  videoUrl?: string;
  imageUrl?: string | null;
  gallery?: string[];
  facilities?: string[];
  categorizedFacilities?: {
    kamar: string[];
    kamarMandi: string[];
    smart: string[];
    bersama: string[];
  };
}

// Convert RSHS rooms into MultiProperty format
const rshsEnrichedRooms: MultiPropertyRoomItem[] = RSHS_ROOMS_DATA.map((r, idx) => ({
  ...r,
  propertySlug: 'rshs',
  propertyName: 'Juragan Kost RSHS',
  propertyCity: 'Bandung',
  propertyAddress: 'Jl. Pasir Kaliki GG h tabri No.76/65, Sukajadi (Depan RSHS)',
  dailyPrice: r.price >= 2000000 ? 250000 : r.price >= 1500000 ? 175000 : 125000,
  allowDailyBooking: true,
  isFeatured: idx < 2, // Top 2 rooms are featured
  rating: 4.9,
  reviewCount: 42 + idx * 8,
  status: (r.status as any) || 'AVAILABLE',
}));

// Additional Properties for Multi-Owner Ecosystem
const dagoHeritageRooms: MultiPropertyRoomItem[] = [
  {
    id: 'dago-deluxe-loft',
    number: 'DGO-101',
    type: 'Deluxe Mezzanine Loft',
    propertySlug: 'dago-heritage',
    propertyName: 'KosanKu Dago Heritage Co-Living',
    propertyCity: 'Bandung',
    propertyAddress: 'Jl. Ir. H. Juanda No. 88, Dago Atas (Dekat ITB & UNPAD)',
    price: 2750000,
    dailyPrice: 285000,
    allowDailyBooking: true,
    isFeatured: true,
    rating: 4.96,
    reviewCount: 88,
    status: 'AVAILABLE',
    floor: 1,
    size: '5 x 5 m (25 m² Mezzanine)',
    bedType: 'King Bed (180x200) + Work Desk',
    electricity: 'Token Mandiri 2200W',
    view: 'Balkon Private Dago Pines View',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-apartment-living-room-42861-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['AC Inverter 1PK', 'Smart TV 43" 4K', 'KM Dalam Water Heater', 'Free Laundry 10kg/bln', 'Smart Lock PIN', 'High-Speed WiFi 100Mbps', 'Co-Working Space & Cafe'],
    categorizedFacilities: {
      kamar: ['Kasur King Size Luxury', 'AC Inverter Daikin', 'Smart TV 43" Netflix Ready', 'Meja Kerja Ergonomis', 'Lemari Wardrobe 3 Pintu'],
      kamarMandi: ['Kamar Mandi Dalam Marmer', 'Water Heater Ariston', 'Rain Shower', 'Kloset Duduk Toto Eco'],
      smart: ['Smart Door Lock (PIN & RFID)', 'Dedicated WiFi 100Mbps', 'Smart Lighting Controller'],
      bersama: ['Co-Working Space Rooftop', 'Dapur Modern Kitchen Set', 'Mesin Kopi Espresso', 'Parkir Mobil & Motor Aman'],
    },
  },
  {
    id: 'dago-studio-garden',
    number: 'DGO-202',
    type: 'Executive Studio Garden',
    propertySlug: 'dago-heritage',
    propertyName: 'KosanKu Dago Heritage Co-Living',
    propertyCity: 'Bandung',
    propertyAddress: 'Jl. Ir. H. Juanda No. 88, Dago Atas (Dekat ITB & UNPAD)',
    price: 2200000,
    dailyPrice: 220000,
    allowDailyBooking: true,
    isFeatured: false,
    rating: 4.88,
    reviewCount: 54,
    status: 'AVAILABLE',
    floor: 2,
    size: '4 x 5 m (20 m²)',
    bedType: 'Queen Bed (160x200)',
    electricity: 'Token Mandiri 1300W',
    view: 'Inner Garden Courtyard',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-hotel-room-with-a-king-bed-42862-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['AC Inverter', 'Smart TV 32"', 'KM Dalam', 'Water Heater', 'Smart Lock', 'Free Laundry 5kg'],
    categorizedFacilities: {
      kamar: ['Kasur Queen Comfort', 'AC Inverter', 'Smart TV 32"', 'Lemari & Meja'],
      kamarMandi: ['KM Dalam Pribadi', 'Water Heater Air Hangat', 'Shower'],
      smart: ['Smart Lock Access', 'WiFi 50Mbps'],
      bersama: ['Dapur Bersama', 'Rooftop Lounge', 'Parkir Motor'],
    },
  },
];

const bsdForestaRooms: MultiPropertyRoomItem[] = [
  {
    id: 'bsd-urban-smart',
    number: 'BSD-301',
    type: 'Urban Smart Suite 1BR',
    propertySlug: 'bsd-foresta',
    propertyName: 'KosanKu BSD Foresta Smart Suites',
    propertyCity: 'Tangerang Selatan',
    propertyAddress: 'Foresta Business District Blok B No. 12, BSD City (Dekat Prasetiya Mulya & ICE BSD)',
    price: 3400000,
    dailyPrice: 320000,
    allowDailyBooking: true,
    isFeatured: true,
    rating: 4.98,
    reviewCount: 112,
    status: 'AVAILABLE',
    floor: 3,
    size: '6 x 5 m (30 m²)',
    bedType: 'King Size Premium Bed',
    electricity: 'Token Mandiri 2200W',
    view: 'BSD City Skyline View',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-apartment-living-room-42861-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['Smart Digital Lock IoT', 'AC 1.5 PK Inverter', 'Smart TV 50" 4K', 'Kitchenette Pribadi', 'Water Heater', 'Kolam Renang & Gym', 'Free Laundry 15kg/bln'],
    categorizedFacilities: {
      kamar: ['King Bed Ergonomic', 'AC Inverter', 'Smart TV 50"', 'Kitchenette + Microwave', 'Kulkas 2 Pintu'],
      kamarMandi: ['Bathtub & Rain Shower', 'Water Heater', 'Kloset Toto Smart Washer'],
      smart: ['IoT Smart Home Voice Control', 'Smart Lock TTLock', 'Dedicated Fiber 150Mbps'],
      bersama: ['Akses Kolam Renang Resort', 'Fitness Center / Gym', 'Lobby Resepsionis 24 Jam', 'Parkir Mobil Basement'],
    },
  },
  {
    id: 'bsd-compact-single',
    number: 'BSD-105',
    type: 'Smart Compact Single',
    propertySlug: 'bsd-foresta',
    propertyName: 'KosanKu BSD Foresta Smart Suites',
    propertyCity: 'Tangerang Selatan',
    propertyAddress: 'Foresta Business District Blok B No. 12, BSD City (Dekat Prasetiya Mulya & ICE BSD)',
    price: 2400000,
    dailyPrice: 240000,
    allowDailyBooking: true,
    isFeatured: false,
    rating: 4.85,
    reviewCount: 46,
    status: 'AVAILABLE',
    floor: 1,
    size: '4 x 4 m (16 m²)',
    bedType: 'Single Bed Comfort 120x200',
    electricity: 'Token Mandiri 1300W',
    view: 'Garden Walk View',
    capacity: '1 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-hotel-room-with-a-king-bed-42862-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['AC Inverter', 'Smart TV 32"', 'KM Dalam', 'Water Heater', 'Smart Lock', 'Free Laundry 5kg'],
    categorizedFacilities: {
      kamar: ['Single Bed Comfort', 'AC Inverter', 'Smart TV', 'Meja Belajar'],
      kamarMandi: ['KM Dalam', 'Shower Water Heater', 'Kloset Duduk'],
      smart: ['Smart Lock', 'WiFi 100Mbps'],
      bersama: ['Gym', 'Dapur Bersama', 'Parkir Motor'],
    },
  },
];

const dipatiukurRooms: MultiPropertyRoomItem[] = [
  {
    id: 'du-cosy-student',
    number: 'DU-201',
    type: 'Cosy Study Single',
    propertySlug: 'dipatiukur-student',
    propertyName: 'KosanKu Dipatiukur Student Living',
    propertyCity: 'Bandung',
    propertyAddress: 'Jl. Dipatiukur No. 45, Lebakgede (Depan Kampus UNPAD Dipatiukur)',
    price: 1650000,
    dailyPrice: 160000,
    allowDailyBooking: true,
    isFeatured: false,
    rating: 4.82,
    reviewCount: 65,
    status: 'AVAILABLE',
    floor: 2,
    size: '3.5 x 4 m (14 m²)',
    bedType: 'Single Bed 120x200',
    electricity: 'Listrik & Air Termasuk',
    view: 'Area Kampus Dipatiukur',
    capacity: '1 Orang',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['AC', 'WiFi Kencang 100Mbps', 'KM Dalam', 'Water Heater', 'Free Laundry 5kg', 'Dapur Bersama + Kulkas', 'CCTV 24 Jam'],
    categorizedFacilities: {
      kamar: ['Kasur Single Comfort', 'AC Dingin', 'Lemari Baju', 'Meja & Rak Buku Luas'],
      kamarMandi: ['KM Dalam Pribadi', 'Water Heater Air Hangat', 'Shower'],
      smart: ['WiFi 100Mbps Khusus Mahasiswa', 'CCTV 24 Jam'],
      bersama: ['Dapur Bersama + Alat Masak', 'Dispenser Air Minum Gratis', 'Laundry Room', 'Parkir Motor Luas'],
    },
  },
];

export const ALL_MULTI_PROPERTY_ROOMS: MultiPropertyRoomItem[] = [
  ...rshsEnrichedRooms,
  ...dagoHeritageRooms,
  ...bsdForestaRooms,
  ...dipatiukurRooms,
];

export const PROPERTIES_METADATA = [
  { slug: 'all', name: 'Semua Properti', city: 'Semua Kota', count: ALL_MULTI_PROPERTY_ROOMS.length },
  { slug: 'rshs', name: 'Juragan Kost RSHS', city: 'Bandung (Sukajadi)', count: rshsEnrichedRooms.length },
  { slug: 'dago-heritage', name: 'KosanKu Dago Heritage Co-Living', city: 'Bandung (Dago)', count: dagoHeritageRooms.length },
  { slug: 'bsd-foresta', name: 'KosanKu BSD Foresta Smart Suites', city: 'Tangerang Selatan (BSD City)', count: bsdForestaRooms.length },
  { slug: 'dipatiukur-student', name: 'KosanKu Dipatiukur Student Living', city: 'Bandung (Dipatiukur)', count: dipatiukurRooms.length },
];
