// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext';
import { useDonations } from '@/contexts/DonationContext';
import { Colors } from '../../constants/Colors';
import { Building, Calendar, Plus, Trash2 } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const { fetchDonations, fridayDonations, deleteDonation, getDonationsByPurpose ,fetchSummary,summary} = useDonations();
   if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  const [showAll, setShowAll] = React.useState(false);
  const sortedDonations = [...fridayDonations].sort((a, b) => {
  return new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime();
});

const donationsToShow = showAll
  ? [...fridayDonations].reverse()
  : [...fridayDonations].reverse().slice(0, 3);

  function formatPrice(value: number | string): string {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number)) return '0';
  return new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    } else if (user) {
      fetchDonations(Number(user.id));
    }
  }, [loading, user?.id]);


  useEffect(() => {
  if (user) {
    fetchDonations(Number(user.id));
    fetchSummary(Number(user.id)); 
  }
}, [user]);
  const donationsByPurpose = getDonationsByPurpose();
  const currentMonth = new Date().toLocaleDateString('bs-BA', { month: 'long', year: 'numeric' });
  const recentDonations = [...fridayDonations].sort((a, b) => {
  return new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime();
});

// console.log(recentDonations,"recentDonations")
  const handleDeleteDonation = (donationId: number) => {
    Alert.alert(
      'Obriši donaciju',
      'Da li ste sigurni da želite obrisati ovu donaciju?',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDonation(donationId);
              Alert.alert('Uspešno', 'Donacija je obrisana.');
            } catch (error) {
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja donacije.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>السلام عليكم</Text>
          <Text style={styles.userName}>{user.fullName}{" "}{user.id}</Text>
          <View style={styles.mosqueInfo}>
            <Building color={Colors.white} size={16} />
            <Text style={styles.mosqueName}>{user.mosqueName}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={[styles.dinarSign, { color: Colors.primary }]}>Din</Text>
            </View>
           <Text style={styles.statValue}>{formatPrice(summary.friday)} Din</Text>
            <Text style={styles.statLabel}>Ukupno donacija</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar color={Colors.secondary} size={24} />
            </View>
            <Text style={styles.statValue}>{fridayDonations.length}</Text>
            <Text style={styles.statLabel}>Petkovnih donacija</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Donacije za {currentMonth}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/add-donation')}
            >
              <Plus color={Colors.white} size={18} />
            </TouchableOpacity>
          </View>
<View style={styles.statsContainer}>
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>Fitr</Text>
<Text style={styles.statValue}>{formatPrice(summary.fitr)} Din</Text>  </View>
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>Zekat</Text>
<Text style={styles.statValue}>{formatPrice(summary.zakat)} Din</Text>  </View>
</View>
{donationsToShow.length > 0 ? (
  <>
    <View style={styles.donationsList}>
      {donationsToShow.map((donation) => (
        <View key={donation.id} style={styles.donationItem}>
          <View style={styles.donationInfo}>
            <Text style={styles.donationAmount}>{formatPrice(donation.amount)} Din</Text>
            <Text style={styles.donationPurpose}>{donation.purposeName}</Text>
          </View>
          <View style={styles.donationActions}>
            <Text style={styles.donationDate}>
              {new Date(donation.donation_date).toLocaleDateString('bs-BA')}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteDonation(donation.id)}
              style={styles.deleteButton}
            >
              <Trash2 color={Colors.warning} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>

    {sortedDonations.length > 3 && (
      <TouchableOpacity
        onPress={() => setShowAll(!showAll)}
        style={styles.showMoreButton}
      >
        <Text style={styles.showMoreText}>
          {showAll ? 'Prikaži manje' : `Prikaži sve (${sortedDonations.length})`}
        </Text>
      </TouchableOpacity>
    )}
  </>
) : (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>Nema dodanih donacija</Text>
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={() => router.push('/(tabs)/add-donation')}
    >
      <Plus color={Colors.white} size={20} />
      <Text style={styles.primaryButtonText}>Dodaj prvu donaciju</Text>
    </TouchableOpacity>
  </View>
)}

        </View>

        {Object.keys(donationsByPurpose).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donacije po nameni</Text>
            <View style={styles.purposesList}>
              {Object.entries(donationsByPurpose).map(([purpose, amount]) => (
                <View key={purpose} style={styles.purposeItem}>
                  <Text style={styles.purposeName}>{purpose}</Text>
                  <Text style={styles.purposeAmount}>{formatPrice(amount)} Din</Text>
                </View>
              ))}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Amiri-Regular',
    color: Colors.white,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
    marginBottom: 8,
  },
  mosqueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mosqueName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.white,
    marginLeft: 6,
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
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
    fontSize: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationsList: {
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
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  donationInfo: {
    flex: 1,
  },
  donationAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },
  donationPurpose: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  donationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textLight,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 12,
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
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  purposesList: {
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
  purposeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  purposeName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  purposeAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  dinarSign: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  showMoreButton: {
  marginTop: 12,
  alignSelf: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  backgroundColor: Colors.primary,
},
showMoreText: {
  color: Colors.white,
  fontFamily: 'Inter-SemiBold',
  fontSize: 14,
},

});
//problem je sto dodaje samo za petak