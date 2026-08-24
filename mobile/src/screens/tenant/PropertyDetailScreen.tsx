import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { Property } from '../../types';

export const PropertyDetailScreen = ({ route, navigation }: any) => {
  const property: Property = route.params?.property || {
    id: 'prop-1',
    name: 'KosanKu Residence Menteng',
    address: 'Jl. Menteng Raya No. 42',
    city: 'Jakarta Pusat',
    description:
      'Kosan eksklusif modern kelas atas di jantung Jakarta Pusat. Dilengkapi dengan fasilitas smart lock biometrik, WiFi fiber optik 100Mbps, AC Inverter hemat energi, kamar mandi dalam dengan water heater, dan keamanan CCTV 24 jam.',
    totalUnits: 20,
    availableUnits: 3,
    minPrice: 2500000,
    maxPrice: 3500000,
    facilities: [
      'AC Inverter',
      'WiFi 100Mbps',
      'K.Mandi Dalam',
      'Water Heater',
      'Kasur Springbed 160x200',
      'Meja Kerja & Lemari',
      'Smart Lock Biometrik',
      'Security 24/7 & CCTV',
    ],
    rating: 4.9,
  };

  const [selectedType, setSelectedType] = useState<'Standard' | 'Deluxe' | 'VIP'>('Deluxe');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const roomRates = {
    Standard: 2500000,
    Deluxe: 3000000,
    VIP: 3500000,
  };

  const handleConfirmBooking = () => {
    setShowBookingModal(false);
    Alert.alert(
      '🎉 Permohonan Booking Terkirim!',
      `Permohonan sewa tipe ${selectedType} (Rp ${roomRates[selectedType].toLocaleString('id-ID')}/bln) telah dikirim ke Owner. Tim kami akan menghubungi Anda via WhatsApp!`,
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header Navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>

        {/* Hero Image Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.ratingBadge}>⭐ {property.rating}</Text>
            <Text style={styles.availableBadge}>Tersedia {property.availableUnits} Kamar</Text>
          </View>
        </View>

        {/* Title & Info */}
        <Text style={styles.propertyName}>{property.name}</Text>
        <Text style={styles.location}>📍 {property.address}, {property.city}</Text>

        <Text style={styles.sectionTitle}>Deskripsi</Text>
        <Text style={styles.description}>{property.description}</Text>

        {/* Select Room Type */}
        <Text style={styles.sectionTitle}>Pilih Tipe Kamar</Text>
        <View style={styles.typeSelectorRow}>
          {(['Standard', 'Deluxe', 'VIP'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeCard,
                selectedType === type && styles.typeCardSelected,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.typeName,
                  selectedType === type && styles.typeNameSelected,
                ]}
              >
                {type}
              </Text>
              <Text
                style={[
                  styles.typePrice,
                  selectedType === type && styles.typePriceSelected,
                ]}
              >
                Rp {(roomRates[type] / 1000).toFixed(0)}rb
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Facilities List */}
        <Text style={styles.sectionTitle}>Fasilitas Kamar & Gedung</Text>
        <View style={styles.facilityGrid}>
          {property.facilities.map((fac, idx) => (
            <View key={idx} style={styles.facilityChip}>
              <Text style={styles.facilityCheck}>✓</Text>
              <Text style={styles.facilityText}>{fac}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Harga Tipe {selectedType}</Text>
          <Text style={styles.priceValue}>
            Rp {roomRates[selectedType].toLocaleString('id-ID')}
            <Text style={styles.pricePeriod}> /bln</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setShowBookingModal(true)}
        >
          <Text style={styles.bookButtonText}>Pesan Sekarang</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Booking Confirmation */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi Booking</Text>
            <Text style={styles.modalSubtitle}>KosanKu Residence Menteng</Text>

            <View style={styles.modalSummaryBox}>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Tipe Kamar</Text>
                <Text style={styles.modalSummaryVal}>{selectedType}</Text>
              </View>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Sewa Per Bulan</Text>
                <Text style={styles.modalSummaryVal}>
                  Rp {roomRates[selectedType].toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Deposit Jaminan (1x)</Text>
                <Text style={styles.modalSummaryVal}>Rp 500.000</Text>
              </View>
              <View style={[styles.modalSummaryRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 }]}>
                <Text style={[styles.modalSummaryLabel, { fontWeight: 'bold' }]}>Total Awal</Text>
                <Text style={[styles.modalSummaryVal, { color: COLORS.accent, fontWeight: 'bold' }]}>
                  Rp {(roomRates[selectedType] + 500000).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmBooking}
              >
                <Text style={styles.confirmBtnText}>Kirim Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  backBtn: {
    marginBottom: SPACING.md,
  },
  backBtnText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  heroCard: {
    height: 180,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    padding: SPACING.md,
    justifyContent: 'flex-start',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  availableBadge: {
    backgroundColor: COLORS.accent,
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  propertyName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  location: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.primary,
  },
  typeName: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: FONTS.sizes.xs,
  },
  typeNameSelected: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  typePrice: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
  },
  typePriceSelected: {
    color: '#FFF',
  },
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityCheck: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginRight: 6,
  },
  facilityText: {
    color: COLORS.text,
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  priceValue: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  pricePeriod: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'normal',
  },
  bookButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.md,
  },
  modalSummaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalSummaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  modalSummaryVal: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
