'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PropertyConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  whatsapp: string;
  mapsUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  accentColor: string;
  totalRooms: number;
  featuredRooms: {
    number: string;
    type: string;
    price: number;
    size: string;
    imageUrl: string;
    facilities: string[];
  }[];
}

export const PROPERTIES_REGISTRY: Record<string, PropertyConfig> = {
  'default': {
    id: 'prop-001',
    slug: 'default',
    name: 'KosanKu Pro Residence',
    tagline: 'Luxury Living Management & Smart Co-Living',
    address: 'Jl. Merdeka No. 123, Kel. Sukajadi',
    city: 'Bandung',
    whatsapp: '081234567890',
    mapsUrl: 'https://maps.google.com/?q=-6.917464,107.619123',
    heroHeadline: 'Sewa Kos Modern',
    heroSubheadline: 'Siap Huni.',
    accentColor: '#047857',
    totalRooms: 12,
    featuredRooms: [
      { number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000, size: '4 x 5 m (20 m²)', imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', facilities: ['AC Inverter', 'Smart TV', 'KM Dalam', 'WiFi 100Mbps'] },
      { number: 'B-201', type: 'VIP Balcony Resort', price: 2000000, size: '5 x 6 m (30 m²)', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', facilities: ['AC Inverter', 'Smart TV', 'Balkon Pribadi', 'KM Dalam'] },
      { number: 'C-302', type: 'Standard Cosy Single', price: 1200000, size: '3.5 x 4 m (14 m²)', imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80', facilities: ['AC', 'WiFi', 'KM Dalam', 'Springbed'] },
    ],
  },
  'rshs': {
    id: 'prop-rshs',
    slug: 'rshs',
    name: 'Juragan Kost RSHS',
    tagline: 'Kosan Eksklusif dan Nyaman di Depan RS Hasan Sadikin Bandung',
    address: 'Jl. Pasir Kaliki GG h tabri No.76/65, Sukabungah, Kec. Sukajadi, Kota Bandung, Jawa Barat 40162',
    city: 'Bandung',
    whatsapp: '+62 812-2379-8307',
    mapsUrl: 'https://maps.google.com/?q=-6.897368,107.598642',
    heroHeadline: 'Juragan Kost RSHS',
    heroSubheadline: 'Depan RS Hasan Sadikin.',
    accentColor: '#0284c7', // Medical Azure Blue
    totalRooms: 48,
    featuredRooms: [
      {
        number: 'EKS-01',
        type: 'Eksekutif',
        price: 1500000,
        size: '4 x 4.5 m (18 m²)',
        imageUrl: '/images/rshs/Eksekutif/1.png',
        facilities: ['Kasur Comfort', 'Lemari & Meja Kursi', 'Kipas Angin', 'Kamar Mandi Dalam', 'Free Laundry 5kg/bln', 'Mini Gym & CCTV', 'Dapur & Kulkas Bersama', 'Pembersihan Kamar 2x/bln'],
      },
      {
        number: 'NYM-01',
        type: 'Nyaman',
        price: 1000000,
        size: '3.5 x 4 m (14 m²)',
        imageUrl: '/images/rshs/Nyaman/1.png',
        facilities: ['Kipas Angin', 'Laundy Room', 'Free Laundry 5kg/bln', 'Parkir Motor', 'Dapur Bersama', 'CCTV 24 Jam'],
      },
      {
        number: 'NYM-02',
        type: 'Nyaman 2',
        price: 1400000,
        size: '4 x 4 m (16 m²)',
        imageUrl: '/images/rshs/Nyaman%202/1.png',
        facilities: ['Kasur & Lemari', 'Kamar Mandi Dalam', 'Closet Duduk & Shower', 'Free Laundry 5kg', 'WiFi & CCTV', 'Dapur & Kulkas', 'Pembersihan Kamar 2x/bln'],
      },
      {
        number: 'NYM-03',
        type: 'Nyaman 3',
        price: 1300000,
        size: '3.5 x 4 m (14 m²)',
        imageUrl: '/images/rshs/Nyaman%203/1.png',
        facilities: ['Kasur & Meja', 'Kamar Mandi Dalam', 'Closet Duduk', 'Water Heater', 'Token Listrik Awal', 'Air PDAM', 'Free Laundry 5kg'],
      },
      {
        number: 'NYM-04',
        type: 'Nyaman 4',
        price: 1400000,
        size: '4 x 4.5 m (18 m²)',
        imageUrl: '/images/rshs/Nyaman%204/1.png',
        facilities: ['Kamar Mandi Dalam', 'Free Laundry 5kg', 'Ruang Terbuka Bersama', 'Dapur Bersama', 'WiFi & CCTV', 'Free Trial Oxy Gym', 'Parkir Motor'],
      },
      {
        number: 'PV-01',
        type: 'Paviliun Eksekutif',
        price: 2800000,
        size: '6 x 7 m (42 m²)',
        imageUrl: '/images/rshs/Paviliun%20Eksekutif/1.png',
        facilities: ['Ruang Tamu & Kamar Tidur', 'Kamar Mandi Dalam', 'Dapur Privat', 'Free Laundry 10kg', 'WiFi Kencang', 'Parkir Motor', 'CCTV 24 Jam'],
      },
      {
        number: 'PV-02',
        type: 'Paviliun Tipe B',
        price: 2600000,
        size: '5.5 x 6.5 m (36 m²)',
        imageUrl: '/images/rshs/Paviliun%20Tipe%20B/1.jpg',
        facilities: ['1 Kasur 160x200 + 2 Kasur Single', 'Kompor Gas & Dapur', 'Lemari Baju Besar', 'Kamar Mandi Dalam', 'Free Laundry 10kg', 'Listrik & WiFi'],
      },
      {
        number: 'SN-01',
        type: 'Super Nyaman',
        price: 1700000,
        size: '4.5 x 5 m (22 m²)',
        imageUrl: '/images/rshs/Super%20Nyaman/1.png',
        facilities: ['Kasur Comfort Luas', 'Kamar Mandi Dalam', 'Water Heater', 'WiFi Kencang', 'Free Laundry 5kg', 'Dapur Bersama', 'Parkir Motor'],
      },
    ],
  },
};

interface PropertyContextType {
  property: PropertyConfig;
  setPropertySlug: (slug: string) => void;
  availableProperties: PropertyConfig[];
}

const PropertyContext = createContext<PropertyContextType>({
  property: PROPERTIES_REGISTRY['default'],
  setPropertySlug: () => {},
  availableProperties: Object.values(PROPERTIES_REGISTRY),
});

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
      const urlSlugParam = searchParams.get('property') || searchParams.get('kosan');

      // 1. Explicit Query Param (?kosan=rshs or ?kosan=default)
      if (urlSlugParam) {
        const slug = urlSlugParam.toLowerCase();
        if (PROPERTIES_REGISTRY[slug]) {
          setActiveSlug(slug);
          localStorage.setItem('kosanku_active_property_slug', slug);
          return;
        }
      }

      // 2. Subdomain check (e.g. rshs.kosankupro.cloud)
      if (hostname.includes('rshs.') || hostname.startsWith('rshs.')) {
        setActiveSlug('rshs');
        return;
      }

      // 3. Root URL access without query param -> Default KosanKu Pro Landing Page
      setActiveSlug('default');
      localStorage.setItem('kosanku_active_property_slug', 'default');
    }
  }, []);

  const handleSetPropertySlug = (slug: string) => {
    if (PROPERTIES_REGISTRY[slug]) {
      setActiveSlug(slug);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kosanku_active_property_slug', slug);
      }
    }
  };

  const currentProperty = PROPERTIES_REGISTRY[activeSlug] || PROPERTIES_REGISTRY['default'];

  return (
    <PropertyContext.Provider
      value={{
        property: currentProperty,
        setPropertySlug: handleSetPropertySlug,
        availableProperties: Object.values(PROPERTIES_REGISTRY),
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  return useContext(PropertyContext);
}
