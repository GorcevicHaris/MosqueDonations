import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDonations } from '@/contexts/DonationContext';
import { Colors } from '../../constants/Colors';
import { BarChart3, TrendingUp, Calendar, Target, PieChart, Activity } from 'lucide-react-native';

// Chart.js imports for React Native
import {
  LineChart,
  BarChart,
  PieChart as RNPieChart,
  ContributionGraph,
  ProgressChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Using the actual donation type from your context instead of custom interface

interface MonthlyData {
  [key: string]: number;
}

interface PurposeData {
  [key: string]: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface PieChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function AnalyticsScreen() {
  const {
    fridayDonations,
    getDonationsByPurpose,
    summary,
    getTotalDonationsCount,
  } = useDonations();
  // Basic calculations
  const totalDonations: number =
    (Number(summary.friday) || 0) +
    (Number(summary.fitr) || 0) +
    (Number(summary.zakat) || 0);
  
  const totalCount: number = getTotalDonationsCount();
  const averageDonation: number = totalCount > 0 ? totalDonations / totalCount : 0;
  
  const fridayCount: number = summary.countFriday || 0;
  const fitrCount: number = summary.countFitr || 0;
  const zakatCount: number = summary.countZakat || 0;

  const averageFriday: number = fridayCount > 0 ? summary.friday / fridayCount : 0;
  const averageFitr: number = fitrCount > 0 ? summary.fitr / fitrCount : 0;
  const averageZakat: number = zakatCount > 0 ? summary.zakat / zakatCount : 0;

  const allDonations = fridayDonations;

  // Advanced analytics calculations
  const analyticsData = useMemo(() => {
    // Monthly trend data
    const monthlyData: MonthlyData = allDonations.reduce((acc, donation) => {
      const month = new Date(donation.donation_date).toLocaleDateString('bs-BA', {
        month: 'short',
        year: '2-digit',
      });
      acc[month] = (acc[month] || 0) + donation.amount;
      return acc;
    }, {} as MonthlyData);

    // Weekly trend data
    const weeklyData: MonthlyData = allDonations.reduce((acc, donation) => {
      const date = new Date(donation.donation_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toLocaleDateString('bs-BA', { month: 'short', day: 'numeric' });
      acc[weekKey] = (acc[weekKey] || 0) + donation.amount;
      return acc;
    }, {} as MonthlyData);

    // Donation type distribution - fix NaN values
    const typeDistribution = [
      { 
        name: 'Petkovno', 
        amount: Number(summary.friday) || 0, 
        color: '#4F46E5', 
        legendFontColor: Colors.text, 
        legendFontSize: 12 
      },
      { 
        name: 'Fitr', 
        amount: Number(summary.fitr) || 0, 
        color: '#10B981', 
        legendFontColor: Colors.text, 
        legendFontSize: 12 
      },
      { 
        name: 'Zakat', 
        amount: Number(summary.zakat) || 0, 
        color: '#F59E0B', 
        legendFontColor: Colors.text, 
        legendFontSize: 12 
      },
    ].filter(item => item.amount > 0 && !isNaN(item.amount));

    // Growth rate calculation (month over month)
    const monthlyEntries = Object.entries(monthlyData).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    const growthRate = monthlyEntries.length >= 2 
      ? ((monthlyEntries[monthlyEntries.length - 1][1] - monthlyEntries[monthlyEntries.length - 2][1]) / monthlyEntries[monthlyEntries.length - 2][1]) * 100
      : 0;

    // Consistency score (how regular are donations)
    const daysBetweenDonations = allDonations
      .sort((a, b) => new Date(a.donation_date).getTime() - new Date(b.donation_date).getTime())
      .reduce((acc, donation, index, arr) => {
        if (index === 0) return acc;
        const prevDate = new Date(arr[index - 1].donation_date);
        const currDate = new Date(donation.donation_date);
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        acc.push(daysDiff);
        return acc;
      }, [] as number[]);

    const avgDaysBetween = daysBetweenDonations.length > 0 
      ? daysBetweenDonations.reduce((sum, days) => sum + days, 0) / daysBetweenDonations.length 
      : 0;

    const consistencyScore = avgDaysBetween > 0 ? Math.max(0, 100 - (avgDaysBetween - 7) * 2) : 100;

    return {
      monthlyData,
      weeklyData,
      typeDistribution,
      growthRate,
      consistencyScore,
      avgDaysBetween,
    };
  }, [allDonations, summary]);

  // Chart configurations
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e0e7ff',
      strokeWidth: 1,
    },
  };

  // Prepare chart data
  const monthlyChartData: ChartData = {
    labels: Object.keys(analyticsData.monthlyData).slice(-6), // Last 6 months
    datasets: [{
      data: Object.values(analyticsData.monthlyData).slice(-6),
      color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const weeklyChartData: ChartData = {
    labels: Object.keys(analyticsData.weeklyData).slice(-8), // Last 8 weeks
    datasets: [{
      data: Object.values(analyticsData.weeklyData).slice(-8),
    }],
  };

  const progressData = {
    labels: ['Konzistentnost', 'Rast', 'Aktivnost'],
    data: [
      analyticsData.consistencyScore / 100,
      Math.min(1, Math.max(0, (analyticsData.growthRate + 50) / 100)),
      Math.min(1, totalCount / 50), // Normalize based on 50 donations as "full activity"
    ],
  };

  function formatPrice(value: number | string): string {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '0';
    return new Intl.NumberFormat('bs-BA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  }

  const donationsByPurpose: PurposeData = getDonationsByPurpose();

  // Recent activity
  const recentActivity = allDonations
    .slice()
    .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <BarChart3 color={Colors.white} size={32} />
          <Text style={styles.headerTitle}>Napredna analitika</Text>
          <Text style={styles.headerSubtitle}>Detaljni uvid u donacije i trendove</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Key Performance Indicators */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp color={Colors.success} size={24} />
            <Text style={styles.statValue}>{formatPrice(totalDonations)} Din</Text>
            <Text style={styles.statLabel}>Ukupno donacija</Text>
            <Text style={[styles.statSubLabel, { color: analyticsData.growthRate >= 0 ? Colors.success : Colors.error }]}>
              {analyticsData.growthRate >= 0 ? '+' : ''}{analyticsData.growthRate.toFixed(1)}% mesečno
            </Text>
          </View>

          <View style={styles.statCard}>
            <Calendar color={Colors.primary} size={24} />
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Broj donacija</Text>
            <Text style={styles.statSubLabel}>
              ~{analyticsData.avgDaysBetween.toFixed(0)} dana između
            </Text>
          </View>

          <View style={styles.statCard}>
            <Target color={Colors.accent} size={24} />
            <Text style={styles.statValue}>{formatPrice(averageDonation)} Din</Text>
            <Text style={styles.statLabel}>Prosečna donacija</Text>
            <Text style={styles.statSubLabel}>
              {analyticsData.consistencyScore.toFixed(0)}% konzistentnost
            </Text>
          </View>
        </View>

        {/* Performance Overview */}
        {totalCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Activity color={Colors.primary} size={20} /> Pregled performansi
            </Text>
            <View style={styles.chartContainer}>
              <ProgressChart
                data={progressData}
                width={screenWidth - 80}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1, index = 0) => {
                    const colors = ['#10B981', '#F59E0B', '#EF4444'];
                    return colors[index] || `rgba(79, 70, 229, ${opacity})`;
                  },
                }}
                hideLegend={false}
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Monthly Trend */}
        {Object.keys(analyticsData.monthlyData).length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <TrendingUp color={Colors.primary} size={20} /> Mesečni trend
            </Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={monthlyChartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                formatYLabel={(value: string) => `${Math.round(Number(value) / 1000)}k`}
              />
            </View>
          </View>
        )}

        {/* Weekly Activity */}
        {Object.keys(analyticsData.weeklyData).length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Calendar color={Colors.primary} size={20} /> Nedeljni pregled
            </Text>
          </View>
        )}

        {/* Donation Type Distribution */}
        {analyticsData.typeDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <PieChart color={Colors.primary} size={20} /> Distribucija po tipu
            </Text>
            <View style={styles.chartContainer}>
              <RNPieChart
                data={analyticsData.typeDistribution}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 50]}
                style={styles.chart}
              />
              {/* Debug info - remove this after testing */}
              <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0' }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Debug: Friday: {Number(summary.friday) || 0}, Fitr: {Number(summary.fitr) || 0}, Zakat: {Number(summary.zakat) || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Total items: {analyticsData.typeDistribution.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* If no data, show message */}
        {analyticsData.typeDistribution.length === 0 && totalCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <PieChart color={Colors.primary} size={20} /> Distribucija po tipu
            </Text>
            <View style={styles.chartContainer}>
              <Text style={styles.emptyStateText}>
                Nema validnih podataka za prikaz distribucije. Proverite da li su donacije pravilno evidentirane.
              </Text>
            </View>
          </View>
        )}

        {/* Detailed Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Petkovnih donacija</Text>
            <Text style={styles.statValue}>{fridayCount}</Text>
            <Text style={styles.statSubLabel}>Prosečno: {formatPrice(averageFriday)} Din</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fitr donacija</Text>
            <Text style={styles.statValue}>{fitrCount}</Text>
            <Text style={styles.statSubLabel}>Prosečno: {formatPrice(averageFitr)} Din</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Zakat donacija</Text>
            <Text style={styles.statValue}>{zakatCount}</Text>
            <Text style={styles.statSubLabel}>Prosečno: {formatPrice(averageZakat)} Din</Text>
          </View>
        </View>

        {/* Donations by Purpose */}
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

        {/* Recent Activity */}
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

        {/* Empty State */}
        {totalCount === 0 && (
          <View style={styles.emptyState}>
            <BarChart3 color={Colors.textLight} size={64} />
            <Text style={styles.emptyStateTitle}>Nema podataka za analizu</Text>
            <Text style={styles.emptyStateText}>
              Dodajte prve donacije da biste videli detaljnu analitiku i grafikone
            </Text>
          </View>
        )}
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
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.textLight,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
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
  chart: {
    marginVertical: 8,
    borderRadius: 12,
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