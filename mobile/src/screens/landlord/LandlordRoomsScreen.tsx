import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { RoomUnit } from '../../types';

const MOCK_ROOMS: RoomUnit[] = [
  {
    id: 'room-1',
    propertyId: 'prop-1',
    unitNumber: 'A101',
    roomNumber: 'A101',
    roomType: 'STANDARD',
    type: 'STANDARD',
    floor: 1,
    pricePerMonth: 2500000,
    price: 2500000,
    isAvailable: false,
    status: 'OCCUPIED',
    tenantName: 'Budi Santoso',
  },
  {
    id: 'room-2',
    propertyId: 'prop-1',
    unitNumber: 'A102',
    roomNumber: 'A102',
    roomType: 'DELUXE',
    type: 'DELUXE',
    floor: 1,
    pricePerMonth: 3000000,
    price: 3000000,
    isAvailable: true,
    status: 'AVAILABLE',
  },
  {
    id: 'room-3',
    propertyId: 'prop-1',
    unitNumber: 'A103',
    roomNumber: 'A103',
    roomType: 'DELUXE',
    type: 'DELUXE',
    floor: 1,
    pricePerMonth: 3000000,
    price: 3000000,
    isAvailable: false,
    status: 'OCCUPIED',
    tenantName: 'Siti Rahma',
  },
  {
    id: 'room-4',
    propertyId: 'prop-1',
    unitNumber: 'B201',
    roomNumber: 'B201',
    roomType: 'VIP',
    type: 'VIP',
    floor: 2,
    pricePerMonth: 3500000,
    price: 3500000,
    isAvailable: false,
    status: 'MAINTENANCE',
  },
  {
    id: 'room-5',
    propertyId: 'prop-1',
    unitNumber: 'B202',
    roomNumber: 'B202',
    roomType: 'VIP',
    type: 'VIP',
    floor: 2,
    pricePerMonth: 3500000,
    price: 3500000,
    isAvailable: true,
    status: 'AVAILABLE',
  },
];

export const LandlordRoomsScreen = ({ navigation }: any) => {
  const [rooms, setRooms] = useState<RoomUnit[]>(MOCK_ROOMS);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('ALL');

  const filteredRooms = rooms.filter(
    (r) => filter === 'ALL' || r.status === filter
  );

  const handleToggleStatus = (roomId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, RoomUnit['status']> = {
      AVAILABLE: 'OCCUPIED',
      OCCUPIED: 'MAINTENANCE',
      MAINTENANCE: 'AVAILABLE',
    };

    const nextStatus = nextStatusMap[currentStatus] || 'AVAILABLE';

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: nextStatus } : r))
    );

    Alert.alert('Status Diperbarui', `Status unit telah diubah menjadi ${nextStatus}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Unit Kosan</Text>
        <Text style={styles.headerSub}>Pantau hunian & atur ketersediaan kamar</Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {(['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f === 'ALL'
                ? 'Semua'
                : f === 'AVAILABLE'
                ? 'Kosong'
                : f === 'OCCUPIED'
                ? 'Terisi'
                : 'Perbaikan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.roomCard}>
            <View style={styles.roomCardHeader}>
              <View>
                <Text style={styles.roomNumber}>Kamar #{item.roomNumber}</Text>
                <Text style={styles.roomMeta}>
                  Lantai {item.floor} • Tipe {item.type}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  item.status === 'AVAILABLE'
                    ? styles.bgAvailable
                    : item.status === 'OCCUPIED'
                    ? styles.bgOccupied
                    : styles.bgMaintenance,
                ]}
                onPress={() => handleToggleStatus(item.id, item.status)}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'AVAILABLE'
                      ? styles.textAvailable
                      : item.status === 'OCCUPIED'
                      ? styles.textOccupied
                      : styles.textMaintenance,
                  ]}
                >
                  {item.status === 'AVAILABLE'
                    ? 'Kosong'
                    : item.status === 'OCCUPIED'
                    ? 'Terisi'
                    : 'Perbaikan'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.roomCardFooter}>
              <View>
                <Text style={styles.priceLabel}>Sewa / Bulan</Text>
                <Text style={styles.priceVal}>
                  Rp {(item.price || item.pricePerMonth || 0).toLocaleString('id-ID')}
                </Text>
              </View>

              {item.tenantName ? (
                <Text style={styles.tenantInfo}>👤 {item.tenantName}</Text>
              ) : (
                <Text style={styles.vacantInfo}>Siap Disewakan</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
  },
  backBtn: {
    marginBottom: SPACING.xs,
  },
  backBtnText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  filterChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  roomCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  roomNumber: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  roomMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bgAvailable: {
    backgroundColor: COLORS.successBg,
  },
  bgOccupied: {
    backgroundColor: COLORS.primary,
  },
  bgMaintenance: {
    backgroundColor: COLORS.warningBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textAvailable: {
    color: COLORS.success,
  },
  textOccupied: {
    color: COLORS.accent,
  },
  textMaintenance: {
    color: COLORS.warning,
  },
  roomCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  priceVal: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  tenantInfo: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  vacantInfo: {
    color: COLORS.textSubtle,
    fontSize: FONTS.sizes.xs,
    fontStyle: 'italic',
  },
});
