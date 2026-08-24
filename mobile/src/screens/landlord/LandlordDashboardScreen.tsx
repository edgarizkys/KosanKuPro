import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const LandlordDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.roleTitle}>PORTAL PENGELOLA (OWNER)</Text>
            <Text style={styles.userName}>{user?.name || 'Bapak Owner'}</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Summary Card */}
        <View style={styles.financeCard}>
          <Text style={styles.financeLabel}>Total Pendapatan (Bulan Ini)</Text>
          <Text style={styles.financeValue}>Rp 42.500.000</Text>

          <View style={styles.financeRow}>
            <View style={styles.financeCol}>
              <Text style={styles.subLabel}>Diterima</Text>
              <Text style={styles.subValueOk}>Rp 35.000.000</Text>
            </View>
            <View style={styles.financeCol}>
              <Text style={styles.subLabel}>Tunggakan</Text>
              <Text style={styles.subValueWarn}>Rp 7.500.000</Text>
            </View>
          </View>
        </View>

        {/* Occupancy Stats */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LandlordRooms')}
          activeOpacity={0.8}
        >
          <Text style={styles.sectionTitle}>Ringkasan Unit Kosan ›</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>65</Text>
              <Text style={styles.statLabel}>Total Unit</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.accent }]}>58</Text>
              <Text style={styles.statLabel}>Terisi (89%)</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>7</Text>
              <Text style={styles.statLabel}>Kosong</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Landlord Actions */}
        <Text style={styles.sectionTitle}>Aksi Pengelolaan</Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('LandlordRooms')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
            <Text style={styles.actionIconText}>🏢</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Kelola Unit & Status Kamar</Text>
            <Text style={styles.actionSub}>Atur ketersediaan & ubah status kamar</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: '#6366F1' }]}>
            <Text style={styles.actionIconText}>📊</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Laporan Kas & Laba Rugi</Text>
            <Text style={styles.actionSub}>Unduh neraca persediaan & rekap pembayaran</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('LandlordRooms')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.actionIconText}>🔑</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Kelola Penyewa & Check-In</Text>
            <Text style={styles.actionSub}>Verifikasi KTP & buat kontrak sewa baru</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  roleTitle: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  financeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  financeLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  financeValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  financeRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  financeCol: {
    flex: 1,
  },
  subLabel: {
    color: COLORS.textSubtle,
    fontSize: 11,
  },
  subValueOk: {
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  subValueWarn: {
    color: COLORS.warning,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
  },
  actionSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    color: COLORS.textSubtle,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
