import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);

  // Animation Refs (Matching Pepsi Sample 2 Video Motion)
  const ringScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  // Text "KosanKuPro" Animation
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textLetterSpacing = useRef(new Animated.Value(0)).current;
  const subTextOpacity = useRef(new Animated.Value(0)).current;

  // Screen Exit Morphing Slide
  const screenSlideX = useRef(new Animated.Value(0)).current;

  // Background Ring Pulse (Before User Clicks)
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.25,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Triggered when User Clicks Screen (Like Reference Video Sample 2)
  const handleUserClickScreen = () => {
    if (hasStartedAnimation) return;
    setHasStartedAnimation(true);

    // 1. Zoom in & Rotate 3D Brand Logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Animate Text "KosanKuPro" Slide Up & Typography Expansion
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textLetterSpacing, {
          toValue: 2,
          duration: 700,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Subtitle Fade
        Animated.timing(subTextOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          // 3. Morphing Exit Transition to Main Screen
          setTimeout(() => {
            Animated.timing(screenSlideX, {
              toValue: -width,
              duration: 700,
              useNativeDriver: true,
            }).start(() => {
              onFinish();
            });
          }, 1000);
        });
      });
    });
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handleUserClickScreen}
      style={{ flex: 1, backgroundColor: '#07090E' }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#07090E" />

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: screenSlideX }],
          },
        ]}
      >
        {/* Glowing Halo Rings */}
        <Animated.View
          style={[
            styles.glowHalo,
            {
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Center 3D Brand Logo & Text */}
        <View style={styles.centerContent}>
          {!hasStartedAnimation ? (
            /* BEFORE TAP INSTRUCTION */
            <View style={styles.tapPromptBox}>
              <View style={styles.tapIconCircle}>
                <Text style={{ fontSize: 32 }}>👆</Text>
              </View>
              <Text style={styles.tapPromptText}>Ketuk Layar untuk Membuka</Text>
              <Text style={styles.tapPromptSub}>KOSANKU PRO 3D EDITION</Text>
            </View>
          ) : (
            /* ANIMATING 3D BRAND LOGO & TYPOGRAPHY */
            <>
              {/* 3D Glassmorphism Logo Mark */}
              <Animated.View
                style={[
                  styles.logoWrapper,
                  {
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }, { rotate: spin }],
                  },
                ]}
              >
                <View style={styles.logoGlassContainer}>
                  <Image
                    source={require('../../../assets/kosanku_3d_brand_logo.jpg')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              {/* Animated Text "KosanKuPro" */}
              <Animated.View
                style={{
                  alignItems: 'center',
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }],
                }}
              >
                <Text style={styles.appName}>
                  KosanKu<Text style={styles.appNameHighlight}>Pro</Text>
                </Text>

                <Animated.Text
                  style={[
                    styles.tagline,
                    {
                      opacity: subTextOpacity,
                    },
                  ]}
                >
                  DIGITAL HOUSING SOLUTIONS
                </Animated.Text>
              </Animated.View>
            </>
          )}
        </View>

        {/* Footer Badge */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>POWERED BY KOSANKU PRO ENGINE 3D</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tapPromptBox: {
    alignItems: 'center',
  },
  tapIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: SPACING.md,
  },
  tapPromptText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  tapPromptSub: {
    color: COLORS.accent,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoWrapper: {
    marginBottom: SPACING.xl,
  },
  logoGlassContainer: {
    width: 200,
    height: 200,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 24,
    backgroundColor: COLORS.card,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  appNameHighlight: {
    color: COLORS.accent,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    letterSpacing: 3,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textSubtle,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
