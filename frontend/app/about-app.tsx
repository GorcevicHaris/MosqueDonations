import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import {
  ArrowLeft,
  Info,
  Heart,
  Shield,
  Smartphone,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react-native';

export default function AboutAppScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Info color={Colors.white} size={40} />
          <Text style={styles.headerTitle}>O aplikaciji</Text>
          <Text style={styles.headerSubtitle}>
            Sistem za džamijske donacije
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.versionCard}>
          <Text style={styles.versionLabel}>Verzija</Text>
          <Text style={styles.versionNumber}>1.0.0</Text>
          <Text style={styles.versionDate}>Oktobar 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O aplikaciji</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              Aplikacija za džamijske donacije je moderna, digitalna platforma
              dizajnirana da olakša upravljanje i praćenje donacija u
              džamijama. Kroz intuitivan interfejs, omogućava korisnicima da
              brzo i jednostavno evidentiraju svoje priloge i prate učešće u
              zajednici.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ključne funkcije</Text>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Smartphone color={Colors.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                Jednostavno evidentiranje
              </Text>
              <Text style={styles.featureDescription}>
                Brzo dodavanje donacija za petak, fitr i zakat sa samo par
                dodirom ekrana.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <TrendingUp color={Colors.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Detaljna analitika</Text>
              <Text style={styles.featureDescription}>
                Pregledajte statistiku donacija, uporedite iznose i pratite svoj
                doprinos kroz vreme.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Users color={Colors.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Upravljanje džamijom</Text>
              <Text style={styles.featureDescription}>
                Svaka džamija ima svoj prostor sa mogućnošću prilagođavanja
                namena donacija.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Shield color={Colors.primary} size={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Sigurnost podataka</Text>
              <Text style={styles.featureDescription}>
                Vaši podaci su zaštićeni modernim sigurnosnim protokolima i
                enkripcijom.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prednosti korišćenja</Text>

          <View style={styles.benefitCard}>
            <CheckCircle color={Colors.accent} size={20} />
            <Text style={styles.benefitText}>
              Transparentno praćenje svih donacija
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <CheckCircle color={Colors.accent} size={20} />
            <Text style={styles.benefitText}>
              Smanjenje administrativnog posla za džamiju
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <CheckCircle color={Colors.accent} size={20} />
            <Text style={styles.benefitText}>
              Bolje planiranje budžeta džamije
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <CheckCircle color={Colors.accent} size={20} />
            <Text style={styles.benefitText}>
              Motivacija za redovno učešće
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <CheckCircle color={Colors.accent} size={20} />
            <Text style={styles.benefitText}>
              Pristup istoriji svih vaših priloga
            </Text>
          </View>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Heart color={Colors.error} size={28} />
            <Text style={styles.missionTitle}>Naša misija</Text>
          </View>
          <Text style={styles.missionText}>
            Olakšati džamijama i njihovim članovima upravljanje donacijama,
            omogućiti transparentnost i pružiti digitalno rešenje koje
            podržava tradicionalne vrednosti islamske zajednice. Verujemo da
            tehnologija može biti most između tradicije i modernosti.
          </Text>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>
            Sistem za džamijske donacije
          </Text>
          <Text style={styles.footerText}>
            Razvijeno sa ljubavlju za našu zajednicu
          </Text>
          <View style={styles.footerDivider} />
          <Text style={styles.copyrightText}>
            © 2025 Džamijske donacije. Sva prava zadržana.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  versionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  versionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  versionDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  benefitCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  missionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginLeft: 12,
  },
  missionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  footerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textLight,
  },
});