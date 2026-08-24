import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { MaintenanceTicket } from '../../types';

const MOCK_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tck-01',
    unitNumber: 'Kamar #B04',
    title: 'Kran Air Kamar Mandi Bocor',
    description: 'Kran air terus menetes deras sejak kemarin sore.',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '19 Agust 2026',
  },
  {
    id: 'tck-02',
    unitNumber: 'Kamar #B04',
    title: 'AC Kurang Dingin',
    description: 'Perlu servis/cuci AC rutin bulanan.',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '10 Agust 2026',
  },
];

export const TicketScreen = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MOCK_TICKETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTicket = () => {
    if (!title) return;
    const newTicket: MaintenanceTicket = {
      id: 'tck-' + Date.now(),
      unitNumber: 'Kamar #B04',
      title,
      description,
      category: 'OTHER',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: 'Hari ini',
    };
    setTickets([newTicket, ...tickets]);
    setTitle('');
    setDescription('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Laporan Kerusakan</Text>
          <Text style={styles.subtitle}>Ajukan perbaikan kamar & fasilitas ke pengelola</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Buat Laporan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.unitText}>{item.unitNumber}</Text>
              <View
                style={[
                  styles.badge,
                  item.status === 'RESOLVED'
                    ? styles.badgeResolved
                    : item.status === 'IN_PROGRESS'
                    ? styles.badgeProgress
                    : styles.badgeOpen,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === 'RESOLVED'
                      ? styles.badgeTextResolved
                      : item.status === 'IN_PROGRESS'
                      ? styles.badgeTextProgress
                      : styles.badgeTextOpen,
                  ]}
                >
                  {item.status === 'RESOLVED'
                    ? 'Selesai'
                    : item.status === 'IN_PROGRESS'
                    ? 'Diproses'
                    : 'Menunggu'}
                </Text>
              </View>
            </View>

            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketDesc}>{item.description}</Text>

            <View style={styles.ticketFooter}>
              <Text style={styles.dateText}>📅 {item.createdAt}</Text>
              <Text style={styles.categoryText}>Kategori: {item.category}</Text>
            </View>
          </View>
        )}
      />

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buat Laporan Kerusakan</Text>

            <Text style={styles.label}>Judul Kerusakan</Text>
            <TextInput
              style={styles.input}
              placeholder="Misal: Lampu Utama Mati / Saklar Rusak"
              placeholderTextColor={COLORS.textSubtle}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Deskripsi Detail</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Jelaskan kendala secara rinci..."
              placeholderTextColor={COLORS.textSubtle}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTicket}>
                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  unitText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeOpen: {
    backgroundColor: COLORS.warningBg,
  },
  badgeProgress: {
    backgroundColor: COLORS.infoBg,
  },
  badgeResolved: {
    backgroundColor: COLORS.successBg,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextOpen: {
    color: COLORS.warning,
  },
  badgeTextProgress: {
    color: COLORS.info,
  },
  badgeTextResolved: {
    color: COLORS.success,
  },
  ticketTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    marginTop: 4,
  },
  ticketDesc: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateText: {
    color: COLORS.textSubtle,
    fontSize: 11,
  },
  categoryText: {
    color: COLORS.textSubtle,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginBottom: 4,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.primary,
    color: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
