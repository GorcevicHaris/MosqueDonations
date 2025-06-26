import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDonations } from '@/contexts/DonationContext';
import { Colors } from '../../constants/Colors';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const {
    fridayDonations,
    getDonationsByPurpose,
    summary,
    getTotalDonationsCount,
  } = useDonations();

  // Ukupni iznos donacija
  const totalDonations = summary.friday + summary.fitr + summary.zakat;

  // Ukupan broj donacija (friday + fitr + zakat)
  const totalCount = getTotalDonationsCount();

  // Prosečna donacija ukupno
  const averageDonation = totalCount > 0 ? totalDonations / totalCount : 0;

  // Broj petkovnih donacija
  const fridayCount = fridayDonations.length;

  // Broj fitr i zakat donacija uzimamo iz summary count polja jer nemamo nizove
  const fitrCount = summary.countFitr;
  const zakatCount = summary.countZakat;

  // Prosečne vrednosti po tipu
  const averageFriday = fridayCount > 0 ? summary.friday / fridayCount : 0;
  const averageFitr = fitrCount > 0 ? summary.fitr / fitrCount : 0;
  const averageZakat = zakatCount > 0 ? summary.zakat / zakatCount : 0;

  // Za analitiku svih donacija koristi samo fridayDonations jer ostalih nema
  const allDonations = fridayDonations;

  // Mesečni pregled
  const monthlyData = allDonations.reduce((acc, donation) => {
    const month = new Date(donation.donation_date).toLocaleDateString('bs-BA', {
      month: 'long',
      year: 'numeric',
    });
    acc[month] = (acc[month] || 0) + donation.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Nedavna aktivnost (sortirano po datumu)
  const recentActivity = allDonations
    .slice()
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())
    .slice(0, 5);

  function formatPrice(value: number | string): string {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '0';
    return new Intl.NumberFormat('bs-BA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  }

  const donationsByPurpose = getDonationsByPurpose();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <BarChart3 color={Colors.white} size={32} />
          <Text style={styles.headerTitle}>Analitika donacija</Text>
          <Text style={styles.headerSubtitle}>Pregled statistika i trendova</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Ukupno i brojevi donacija */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp color={Colors.success} size={24} />
            <Text style={styles.statValue}>{formatPrice(totalDonations)} Din</Text>
            <Text style={styles.statLabel}>Ukupno donacija</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar color={Colors.primary} size={24} />
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Ukupan broj donacija</Text>
          </View>

          <View style={styles.statCard}>
            <Target color={Colors.accent} size={24} />
            <Text style={styles.statValue}>{formatPrice(averageDonation)} Din</Text>
            <Text style={styles.statLabel}>Prosečna donacija</Text>
          </View>
        </View>

        {/* Broj i prosečna vrednost po tipu donacije */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Petkovnih donacija</Text>
            <Text style={styles.statValue}>{fridayCount}</Text>
            <Text style={styles.statLabel}>Prosečno: {formatPrice(averageFriday)} Din</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fitr donacija</Text>
            <Text style={styles.statValue}>{fitrCount}</Text>
            <Text style={styles.statLabel}>Prosečno: {formatPrice(averageFitr)} Din</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Zakat donacija</Text>
            <Text style={styles.statValue}>{zakatCount}</Text>
            <Text style={styles.statLabel}>Prosečno: {formatPrice(averageZakat)} Din</Text>
          </View>
        </View>

        {/* Donacije po nameni */}
        {Object.keys(donationsByPurpose).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donacije po nameni</Text>
            <View style={styles.purposeChart}>
              {Object.entries(donationsByPurpose)
                .sort(([, a], [, b]) => b - a)
                .map(([purpose, amount]) => {
                  const percentage = totalDonations > 0 ? (amount / totalDonations) * 100 : 0;
                  return (
                    <View key={purpose} style={styles.purposeItem}>
                      <View style={styles.purposeInfo}>
                        <Text style={styles.purposeName}>{purpose}</Text>
                        <Text style={styles.purposeAmount}>{formatPrice(amount)} Din</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                      </View>
                      <Text style={styles.purposePercentage}>{percentage.toFixed(1)}%</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* Mesečni pregled */}
        {Object.keys(monthlyData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mesečni pregled</Text>
            <View style={styles.monthlyChart}>
              {Object.entries(monthlyData).map(([month, amount]) => (
                <View key={month} style={styles.monthlyItem}>
                  <Text style={styles.monthName}>{month}</Text>
                  <Text style={styles.monthAmount}>{formatPrice(amount)} Din</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nedavna aktivnost */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nedavna aktivnost</Text>
            <View style={styles.activityList}>
              {recentActivity.map((donation) => (
                <View key={donation.id} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityAmount}>{formatPrice(donation.amount)} Din</Text>
                    <Text style={styles.activityPurpose}>{donation.purposeName}</Text>
                  </View>
                  <Text style={styles.activityDate}>
                    {new Date(donation.donation_date).toLocaleDateString('bs-BA')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <View style={styles.emptyState}>
            <BarChart3 color={Colors.textLight} size={64} />
            <Text style={styles.emptyStateTitle}>Nema podataka za analizu</Text>
            <Text style={styles.emptyStateText}>
              Dodajte prve donacije da biste videli detaljnu analitiku
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Styles ostaju isti kao što si dao


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
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 16,
  },
  purposeChart: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purposeItem: {
    marginBottom: 20,
  },
  purposeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purposeName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  purposeAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  purposePercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  monthlyChart: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  monthAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  activityList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityInfo: {
    flex: 1,
  },
  activityAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },
  activityPurpose: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textLight,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});