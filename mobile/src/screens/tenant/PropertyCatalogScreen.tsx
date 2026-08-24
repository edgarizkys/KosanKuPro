import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { Property } from '../../types';

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'KosanKu Residence Menteng',
    address: 'Jl. Menteng Raya No. 42',
    city: 'Jakarta Pusat',
    description: 'Kosan eksklusif AC, WiFi 100Mbps, Kamar Mandi Dalam & Sekuriti 24 Jam.',
    totalUnits: 20,
    availableUnits: 3,
    minPrice: 2500000,
    maxPrice: 3500000,
    facilities: ['AC', 'WiFi', 'K.Mandi Dalam', 'Kasur Springbed', 'Water Heater'],
    rating: 4.9,
  },
  {
    id: 'prop-2',
    name: 'KosanKu Executive Tebet',
    address: 'Jl. Tebet Barat Dalam No. 15',
    city: 'Jakarta Selatan',
    description: 'Hunian nyaman dekat stasiun Tebet, cocok untuk pekerja & mahasiswa.',
    totalUnits: 15,
    availableUnits: 5,
    minPrice: 1800000,
    maxPrice: 2400000,
    facilities: ['AC', 'WiFi', 'Parkir Mobil', 'Dapur Bersama'],
    rating: 4.7,
  },
  {
    id: 'prop-3',
    name: 'KosanKu Premiere Gading',
    address: 'Jl. Boulevard Raya Blok A4',
    city: 'Jakarta Utara',
    description: 'Kosan modern dengan akses kartu biometrik & dekat mall.',
    totalUnits: 30,
    availableUnits: 1,
    minPrice: 3000000,
    maxPrice: 4200000,
    facilities: ['AC', 'WiFi', 'Gym Access', 'Smart Lock', 'Laundry'],
    rating: 5.0,
  },
];

export const PropertyCatalogScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');

  const filteredProperties = MOCK_PROPERTIES.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Katalog Kosan</Text>
        <Text style={styles.subtitle}>Temukan kamar impian Anda dengan fasilitas lengkap</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari lokasi atau nama kosan..."
          placeholderTextColor={COLORS.textSubtle}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Image Placeholder */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageBadge}>⭐ {item.rating}</Text>
              <Text style={styles.unitBadge}>Sisa {item.availableUnits} Kamar</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.propertyName}>{item.name}</Text>
              <Text style={styles.location}>📍 {item.address}, {item.city}</Text>

              {/* Facility Chips */}
              <View style={styles.facilityContainer}>
                {item.facilities.slice(0, 3).map((f, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.pricePeriod}>Sewa mulai dari</Text>
                  <Text style={styles.price}>
                    Rp {item.minPrice.toLocaleString('id-ID')}
                    <Text style={styles.priceSub}> /bln</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => navigation.navigate('PropertyDetail', { property: item })}
                >
                  <Text style={styles.detailBtnText}>Lihat Kamar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  imageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  unitBadge: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  cardBody: {
    padding: SPACING.md,
  },
  propertyName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  location: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  facilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pricePeriod: {
    color: COLORS.textSubtle,
    fontSize: FONTS.sizes.xs,
  },
  price: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  priceSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'normal',
  },
  detailBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
});
