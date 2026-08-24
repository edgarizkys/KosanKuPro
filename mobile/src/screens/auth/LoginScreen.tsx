import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('tenant@kosankupro.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('TENANT');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await login(email, role === 'ADMIN' ? 'LANDLORD' : role);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>KP</Text>
          </View>
          <Text style={styles.title}>KosanKu<Text style={styles.highlight}>Pro</Text></Text>
          <Text style={styles.subtitle}>Sistem Manajemen Kos & Hunian Modern</Text>
        </View>

        {/* Role Switcher */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'TENANT' && styles.roleTabActive]}
            onPress={() => {
              setRole('TENANT');
              setEmail('penyewa@kosankupro.com');
            }}
          >
            <Text style={[styles.roleText, role === 'TENANT' && styles.roleTextActive]}>
              Penyewa (Tenant)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'LANDLORD' && styles.roleTabActive]}
            onPress={() => {
              setRole('LANDLORD');
              setEmail('owner@kosankupro.com');
            }}
          >
            <Text style={[styles.roleText, role === 'LANDLORD' && styles.roleTextActive]}>
              Pengelola (Owner)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Email / Nomor HP</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Masukkan email..."
            placeholderTextColor={COLORS.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Kata Sandi</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textSubtle}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                Masuk sebagai {role === 'TENANT' ? 'Penyewa' : 'Pengelola'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          v1.0.0 Native • Secured by Encrypted Storage
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  highlight: {
    color: COLORS.accent,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: COLORS.accent,
  },
  roleText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
  },
  roleTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.primary,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  footerNote: {
    textAlign: 'center',
    color: COLORS.textSubtle,
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xl,
  },
});
