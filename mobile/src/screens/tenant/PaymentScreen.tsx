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

interface Invoice {
  id: string;
  month: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentMethod?: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-08',
    month: 'Agustus 2026',
    amount: 2500000,
    dueDate: '28 Agust 2026',
    status: 'PENDING',
  },
  {
    id: 'INV-2026-07',
    month: 'Juli 2026',
    amount: 2500000,
    dueDate: '28 Juli 2026',
    status: 'PAID',
    paymentMethod: 'Midtrans QRIS',
  },
  {
    id: 'INV-2026-06',
    month: 'Juni 2026',
    amount: 2500000,
    dueDate: '28 Juni 2026',
    status: 'PAID',
    paymentMethod: 'Transfer BCA',
  },
];

export const PaymentScreen = ({ navigation }: any) => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA'>('QRIS');

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInv(inv);
    setShowPayModal(true);
  };

  const handleSimulatePayment = () => {
    if (!selectedInv) return;

    setInvoices((prev) =>
      prev.map((item) =>
        item.id === selectedInv.id
          ? { ...item, status: 'PAID', paymentMethod: payMethod }
          : item
      )
    );

    setShowPayModal(false);
    Alert.alert(
      '✅ Pembayaran Berhasil!',
      `Pembayaran tagihan ${selectedInv.month} sebesar Rp ${selectedInv.amount.toLocaleString(
        'id-ID'
      )} via ${payMethod} berhasil diverifikasi secara otomatis! Bukti bayar telah dikirimkan ke WhatsApp Anda.`,
      [{ text: 'Mantap' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tagihan & Pembayaran</Text>
          <Text style={styles.headerSub}>Kelola invoice sewa kosan & riwayat transaksi</Text>
        </View>

        {/* Active Unpaid Card Banner */}
        {invoices.some((i) => i.status === 'PENDING') && (
          <View style={styles.activeBanner}>
            <View style={styles.activeBannerHeader}>
              <Text style={styles.activeBannerTitle}>Tagihan Bulan Ini (Agustus 2026)</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Belum Bayar</Text>
              </View>
            </View>

            <Text style={styles.activeAmount}>Rp 2.500.000</Text>
            <Text style={styles.activeDueDate}>📅 Jatuh Tempo: 28 Agustus 2026</Text>

            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() =>
                handleOpenPay(invoices.find((i) => i.status === 'PENDING')!)
              }
            >
              <Text style={styles.payNowBtnText}>Bayar via Midtrans / QRIS 💳</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Invoice List */}
        <Text style={styles.sectionTitle}>Riwayat Invoice</Text>
        {invoices.map((inv) => (
          <View key={inv.id} style={styles.invCard}>
            <View style={styles.invHeader}>
              <View>
                <Text style={styles.invId}>{inv.id}</Text>
                <Text style={styles.invMonth}>{inv.month}</Text>
              </View>

              <View
                style={[
                  styles.statusChip,
                  inv.status === 'PAID' ? styles.chipPaid : styles.chipPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    inv.status === 'PAID' ? styles.textPaid : styles.textPending,
                  ]}
                >
                  {inv.status === 'PAID' ? 'LUNAS' : 'PENDING'}
                </Text>
              </View>
            </View>

            <View style={styles.invFooter}>
              <View>
                <Text style={styles.invPriceLabel}>Total Tagihan</Text>
                <Text style={styles.invPriceVal}>
                  Rp {inv.amount.toLocaleString('id-ID')}
                </Text>
              </View>

              {inv.status === 'PENDING' ? (
                <TouchableOpacity
                  style={styles.invPayBtn}
                  onPress={() => handleOpenPay(inv)}
                >
                  <Text style={styles.invPayBtnText}>Bayar</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.invPaidInfo}>
                  <Text style={styles.invPaidMethod}>✓ {inv.paymentMethod}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Payment Gateway Modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pembayaran Midtrans Gateway</Text>
            <Text style={styles.modalSub}>
              Invoice: {selectedInv?.id} • {selectedInv?.month}
            </Text>

            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmountLabel}>Total Harus Dibayar</Text>
              <Text style={styles.modalAmountVal}>
                Rp {selectedInv?.amount.toLocaleString('id-ID')}
              </Text>
            </View>

            <Text style={styles.methodTitle}>Pilih Metode Pembayaran:</Text>
            {(['QRIS', 'BCA_VA', 'MANDIRI_VA'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodRow,
                  payMethod === method && styles.methodRowSelected,
                ]}
                onPress={() => setPayMethod(method)}
              >
                <Text
                  style={[
                    styles.methodText,
                    payMethod === method && styles.methodTextSelected,
                  ]}
                >
                  {method === 'QRIS'
                    ? '📲 Instant QRIS (GoPay/OVO/ShopeePay/BCA)'
                    : method === 'BCA_VA'
                    ? '🏦 BCA Virtual Account'
                    : '🏦 Mandiri Virtual Account'}
                </Text>
                {payMethod === method && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSimulatePayment}
              >
                <Text style={styles.confirmBtnText}>Simulasi Bayar Instant</Text>
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
  },
  header: {
    marginBottom: SPACING.lg,
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
  activeBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: SPACING.lg,
  },
  activeBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBannerTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeAmount: {
    color: COLORS.accent,
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  activeDueDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.md,
  },
  payNowBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  payNowBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  invCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  invId: {
    color: COLORS.textSubtle,
    fontSize: 11,
  },
  invMonth: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chipPaid: {
    backgroundColor: COLORS.successBg,
  },
  chipPending: {
    backgroundColor: COLORS.warningBg,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textPaid: {
    color: COLORS.success,
  },
  textPending: {
    color: COLORS.warning,
  },
  invFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  invPriceLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  invPriceVal: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  invPayBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  invPayBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  invPaidInfo: {
    alignItems: 'flex-end',
  },
  invPaidMethod: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  modalSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.md,
  },
  modalAmountBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalAmountLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  modalAmountVal: {
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  methodTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodRowSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.primary,
  },
  methodText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  methodTextSelected: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  checkIcon: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  modalActionRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
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
