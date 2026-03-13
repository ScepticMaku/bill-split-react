import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function UpgradeScreen() {
  const router = useRouter();

  const features = [
    { id: 1, title: 'No limits', desc: 'Create as many groups and bills as you need.', icon: 'infinite' },

  ];

  const handleUpgrade = () => {
    // Integrate your payment gateway (Stripe/RevenueCat) here
    alert("Proceeding to payment...");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </Pressable>
          <View style={styles.premiumBadgeHeader}>
            <Ionicons name="sparkles" size={14} color="#FFB800" />
            <ThemedText style={styles.premiumBadgeText}>PREMIUM</ThemedText>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroTitle}>Unlock Everything</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Join thousands of users who split smarter with Splitter Pro.
          </ThemedText>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((item) => (
            <View key={item.id} style={styles.featureRow}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={22} color="tomato" />
              </View>
              <View style={styles.featureText}>
                <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.featureDesc}>{item.desc}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
            <ThemedText style={styles.pricingLabel}>ANNUAL PLAN</ThemedText>
            <View style={styles.priceRow}>
                <ThemedText style={styles.currency}>₱</ThemedText>
                <ThemedText style={styles.price}>1500</ThemedText>
                <ThemedText style={styles.period}>/year</ThemedText>
            </View>
            <ThemedText style={styles.savingsText}>Save 40% compared to monthly</ThemedText>
            
            <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
                <ThemedText style={styles.upgradeButtonText}>Upgrade Now</ThemedText>
            </Pressable>
            <ThemedText style={styles.secureText}>
                <Ionicons name="lock-closed" size={10} /> Secure payment via Stripe
            </ThemedText>
        </View>

        <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.maybeLater}>Maybe later</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  premiumBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEBB2',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB800',
    marginLeft: 4,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF5F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  featureDesc: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  pricingLabel: {
    color: 'tomato',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
  },
  period: {
    color: '#8E8E93',
    fontSize: 18,
    marginLeft: 4,
  },
  savingsText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: 'tomato',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secureText: {
    color: '#8E8E93',
    fontSize: 11,
  },
  maybeLater: {
    marginTop: 24,
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 15,
  }
});