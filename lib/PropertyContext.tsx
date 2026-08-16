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
    name: 'KosanKu Premium RSHS Bandung',
    tagline: 'Hunian Eksklusif Dokter, Koas & Mahasiswa Kedokteran Unpad / RSHS',
    address: 'Jl. Pasteur No. 38 (3 Menit Jalan Kaki ke Gate 2 RS Hasan Sadikin)',
    city: 'Bandung',
    whatsapp: '081122334455',
    mapsUrl: 'https://maps.google.com/?q=-6.897368,107.598642',
    heroHeadline: 'Kosan RSHS Pasteur',
    heroSubheadline: 'Spesial Dokter & Koas.',
    accentColor: '#0284c7', // Medical Azure Blue
    totalRooms: 16,
    featuredRooms: [
      { number: 'MED-101', type: 'Deluxe Doctor Suite', price: 2200000, size: '4 x 5 m (20 m²)', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', facilities: ['AC Daikin 1PK', 'Meja Belajar Ergonomis', 'KM Dalam Water Heater', 'Akses 24 Jam Smart Key'] },
      { number: 'MED-201', type: 'VIP Koas Balcony', price: 2500000, size: '5 x 5 m (25 m²)', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', facilities: ['AC Inverter', 'Smart TV 43"', 'Balkon Private', 'Kulkas Mini & KM Dalam'] },
      { number: 'MED-301', type: 'Standard Medico Room', price: 1800000, size: '3.5 x 4.5 m (16 m²)', imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', facilities: ['AC Inverter', 'WiFi Dedicated 100Mbps', 'Kasur KingKoil', 'Lemari 2 Pintu'] },
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

      // 3. If accessed on root default URL without ?kosan= parameter, use default demo
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
