import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/tenant/HomeScreen';
import { PropertyCatalogScreen } from '../screens/tenant/PropertyCatalogScreen';
import { TicketScreen } from '../screens/tenant/TicketScreen';
import { AiConciergeScreen } from '../screens/tenant/AiConciergeScreen';
import { PropertyDetailScreen } from '../screens/tenant/PropertyDetailScreen';
import { PaymentScreen } from '../screens/tenant/PaymentScreen';
import { LandlordDashboardScreen } from '../screens/landlord/LandlordDashboardScreen';
import { LandlordRoomsScreen } from '../screens/landlord/LandlordRoomsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tenant Tab Navigation
function TenantTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={PropertyCatalogScreen}
        options={{
          tabBarLabel: 'Katalog Kos',
        }}
      />
      <Tab.Screen
        name="AiConcierge"
        component={AiConciergeScreen}
        options={{
          tabBarLabel: 'AI Concierge',
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketScreen}
        options={{
          tabBarLabel: 'Laporan',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding && !user) {
    return <OnboardingScreen onFinishOnboarding={() => setShowOnboarding(false)} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === 'LANDLORD' ? (
        <>
          <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} />
          <Stack.Screen name="LandlordRooms" component={LandlordRoomsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="TenantMain" component={TenantTabs} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

