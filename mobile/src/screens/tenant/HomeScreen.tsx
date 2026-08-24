import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONTS, NEUMORPHISM_SHADOW } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: '⚡' },
  { id: 'deluxe', label: 'Deluxe Suite', icon: '🏢' },
  { id: 'studio', label: 'Studio Room', icon: '🛏️' },
  { id: 'vip', label: 'VIP Executive', icon: '👑' },
];

export const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.royalBlueHeader} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Royal Blue Header with Wave Curve */}
        <View style={styles.royalHeader}>
          {/* Header Top Bar */}
          <View style={styles.topHeaderBar}>
            <View style={styles.userProfileRow}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Selamat Datang 👋</Text>
                <Text style={styles.userName}>{user?.name || 'Penyewa Kosan'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutPill} onPress={logout}>
              <Text style={styles.logoutPillText}>Keluar</Text>
            </TouchableOpacity>
          </View>

          {/* Big Header Title */}
          <Text style={styles.headerHeroTitle}>
            Nikmati Kosan Impian{'\n'}
            <Text style={styles.headerHeroTitleSub}>Kenyamanan Nyata 3D</Text>
          </Text>

          {/* Interactive 3D Room Showcase Card with Hotspots (Matching Reference Screenshot) */}
          <View style={styles.hero3DCard}>
            <Image
              source={require('../../../assets/kosanku_3d_room_hero.jpg')}
              style={styles.hero3DImage}
              resizeMode="cover"
            />

            {/* Feature Hotspots Overlay (Matching Reference Image) */}
            <View style={[styles.hotspotChip, { top: 24, left: 16 }]}>
              <Text style={styles.hotspotDot}>●</Text>
              <Text style={styles.hotspotText}>Kamar Mandi Dalam</Text>
            </View>

            <View style={[styles.hotspotChip, { top: 70, right: 16 }]}>
              <Text style={styles.hotspotDot}>●</Text>
              <Text style={styles.hotspotText}>Smart Lock Biometrik</Text>
            </View>

            <View style={[styles.hotspotChip, { bottom: 65, left: 24 }]}>
              <Text style={styles.hotspotDot}>●</Text>
              <Text style={styles.hotspotText}>AC Inverter & Desk</Text>
            </View>

            {/* Floating Action Pill Button */}
            <View style={styles.heroActionOverlay}>
              <TouchableOpacity
                style={styles.heroActionPill}
                onPress={() => navigation.navigate('Catalog')}
              >
                <View style={styles.playIconCircle}>
                  <Text style={styles.playIconText}>▶</Text>
                </View>
                <Text style={styles.heroActionText}>Lihat Spesifikasi Unit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Neumorphic Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBarContainer, NEUMORPHISM_SHADOW]}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari lokasi, kamar, atau fasilitas..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={{ fontSize: 16 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Neumorphic Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  NEUMORPHISM_SHADOW,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isActive && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header: Popular Kosan Units */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Unit Kosan Populer</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
            <Text style={styles.viewMoreText}>Lihat Semua ›</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Neumorphism Product Cards Grid */}
        <View style={styles.productGrid}>
          {/* Card 1 — Amber Suite */}
          <View style={[styles.productCard, NEUMORPHISM_SHADOW]}>
            <View style={styles.productBadgeContainer}>
              <Text style={styles.ratingBadge}>⭐ 4.9</Text>
            </View>
            <Image
              source={require('../../../assets/kosanku_3d_room_amber.jpg')}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productBody}>
              <Text style={styles.productName}>Executive Amber Suite</Text>
              <Text style={styles.productSub}>Jl. Menteng Raya No. 42 • Jakarta Pusat</Text>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.pricePeriod}>Sewa Per Bulan</Text>
                  <Text style={styles.priceVal}>Rp 2.500.000</Text>
                </View>

                <TouchableOpacity
                  style={styles.buyNowBtn}
                  onPress={() => navigation.navigate('Payment')}
                >
                  <Text style={styles.buyNowBtnText}>Sewa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card 2 — Royal Studio */}
          <View style={[styles.productCard, NEUMORPHISM_SHADOW]}>
            <View style={styles.productBadgeContainer}>
              <Text style={styles.ratingBadge}>⭐ 5.0</Text>
            </View>
            <Image
              source={require('../../../assets/kosanku_3d_room_hero.jpg')}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productBody}>
              <Text style={styles.productName}>Royal Studio Menteng</Text>
              <Text style={styles.productSub}>Akses Smart Lock & WiFi 100Mbps</Text>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.pricePeriod}>Sewa Per Bulan</Text>
                  <Text style={styles.priceVal}>Rp 3.000.000</Text>
                </View>

                <TouchableOpacity
                  style={styles.buyNowBtn}
                  onPress={() => navigation.navigate('Payment')}
                >
                  <Text style={styles.buyNowBtnText}>Sewa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

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
    paddingBottom: 40,
  },
  royalHeader: {
    backgroundColor: COLORS.royalBlueHeader,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  greetingText: {
    color: '#93C5FD',
    fontSize: FONTS.sizes.xs,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  logoutPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  headerHeroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: SPACING.md,
  },
  headerHeroTitleSub: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  hero3DCard: {
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hero3DImage: {
    width: '100%',
    height: '100%',
  },
  hotspotChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hotspotDot: {
    color: '#38BDF8',
    fontSize: 10,
    marginRight: 4,
  },
  hotspotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroActionOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heroActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  playIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroActionText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginTop: -20,
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
  },
  filterBtn: {
    backgroundColor: COLORS.royalBlue,
    padding: 8,
    borderRadius: 16,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.royalBlue,
    borderColor: COLORS.royalBlue,
  },
  categoryIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  categoryLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewMoreText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.royalBlue,
    fontWeight: 'bold',
  },
  productGrid: {
    paddingHorizontal: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 5,
  },
  ratingBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: 11,
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  productBody: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pricePeriod: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  priceVal: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.royalBlue,
  },
  buyNowBtn: {
    backgroundColor: COLORS.royalBlue,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  buyNowBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
});
