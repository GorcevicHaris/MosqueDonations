import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useDonations } from '@/contexts/DonationContext';
import { Colors } from '../../constants/Colors';
import { Calendar, Target, Check } from 'lucide-react-native';

interface User {
  id: number;
  mosqueId: number;
}

export default function AddDonationScreen() {
  const { user } = useAuth();
  const { purposes, addFridayDonation ,addFitrDonation, addZakatDonation} = useDonations();
  const [amount, setAmount] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [donationDate, setDonationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
const [fitrAmount, setFitrAmount] = useState<string>('');
const [fitrYear, setFitrYear] = useState<string>(new Date().getFullYear().toString());
const [loadingFitr, setLoadingFitr] = useState(false);
const [zakatAmount, setZakatAmount] = useState<string>('');
const [zakatYear, setZakatYear] = useState<string>(new Date().getFullYear().toString());
const [loadingZakat, setLoadingZakat] = useState(false);

const handleZakatSubmit = async () => {
  const amountNumber = parseFloat(zakatAmount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    Alert.alert('Greška', 'Molimo unesite validan iznos za zakat donaciju');
    return;
  }
  setLoadingZakat(true);
  try {
    if (!user) {
      Alert.alert('Greška', 'Korisnik nije prijavljen');
      return;
    }
    await addZakatDonation({
      mosque_id: Number(user.mosqueId),
      user_id: Number(user.id),
      amount: amountNumber,
      year: parseInt(zakatYear),
    });
    Alert.alert('Uspešno', 'Zakat donacija je uspešno dodata');
    setZakatAmount('');
  } catch (error) {
    console.error('Greška prilikom dodavanja zakat donacije:', error);
    Alert.alert('Greška', 'Došlo je do greške prilikom dodavanja zakat donacije');
  } finally {
    setLoadingZakat(false);
  }
};
const handleFitrSubmit = async () => {
  const amountNumber = parseFloat(fitrAmount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    Alert.alert('Greška', 'Molimo unesite validan iznos za fitr donaciju');
    return;
  }
  setLoadingFitr(true);
  try {
    if (!user) {
      Alert.alert('Greška', 'Korisnik nije prijavljen');
      return;
    }
    await addFitrDonation({
      mosque_id: Number(user.mosqueId),
      user_id: Number(user.id),
      amount: amountNumber,
      year: parseInt(fitrYear),
    });
    Alert.alert('Uspešno', 'Fitr donacija je uspešno dodata');
    setFitrAmount('');
  } catch (error) {
    console.error('Greška prilikom dodavanja fitr donacije:', error);
    Alert.alert('Greška', 'Došlo je do greške prilikom dodavanja fitr donacije');
  } finally {
    setLoadingFitr(false);
  }
};

  const handleSubmit = async () => {
    if (!amount || !selectedPurpose) {
      Alert.alert('Greška', 'Molimo unesite iznos i odaberite namenu donacije');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Greška', 'Molimo unesite valjan iznos');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        Alert.alert('Greška', 'Korisnik nije prijavljen');
        return;
      }

      const selectedPurposeObj = purposes.find((p) => p.id === selectedPurpose);
      if (!selectedPurposeObj) {
        Alert.alert('Greška', 'Odabrana namena nije validna');
        return;
      }

      await addFridayDonation({
        mosque_id: Number(user.mosqueId),
        user_id: Number(user.id),
        amount: amountNumber,
        purpose_id: parseInt(selectedPurpose),
        purposeName: selectedPurposeObj.name,
        donation_date: donationDate,
      });

      Alert.alert('Uspešno', 'Donacija je uspešno dodana', [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
            setSelectedPurpose('');
            setDonationDate(new Date().toISOString().split('T')[0]);
          },
        },
      ]);
    } catch (error) {
      console.error('Add donation error:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom dodavanja donacije');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  console.log('Purposes in AddDonationScreen:', purposes); // Provera u konzoli

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nova donacija</Text>
          <Text style={styles.headerSubtitle}>Dodajte novu petkovnu donaciju</Text>
        </View>
      </LinearGradient>
<ScrollView style={styles.content}>
  <View style={styles.donationCard}>
    <Text style={styles.sectionTitle}>Donacija za petak</Text>
    <View style={styles.inputSection}>
      <Text style={styles.label}>Iznos sadake</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={Colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Text style={styles.currency}>dinara</Text>
      </View>
    </View>

    <View style={styles.inputSection}>
      <Text style={styles.label}>Datum donacije</Text>
      <View style={styles.inputContainer}>
        <Calendar color={Colors.textSecondary} size={20} />
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textSecondary}
          value={donationDate}
          onChangeText={setDonationDate}
        />
      </View>
    </View>

    <View style={styles.inputSection}>
      <Text style={styles.label}>Namena donacije</Text>
      <View style={styles.purposeContainer}>
        {purposes.length === 0 ? (
          <Text style={styles.purposeText}>Učitavanje namena...</Text>
        ) : (
          purposes.map((purpose) => (
            <TouchableOpacity
              key={purpose.id}
              style={[
                styles.purposeButton,
                selectedPurpose === purpose.id && styles.purposeButtonSelected,
              ]}
              onPress={() => setSelectedPurpose(purpose.id)}
            >
              <View style={styles.purposeContent}>
                <Target
                  color={selectedPurpose === purpose.id ? Colors.white : Colors.primary}
                  size={16}
                />
                <Text
                  style={[
                    styles.purposeText,
                    selectedPurpose === purpose.id && styles.purposeTextSelected,
                  ]}
                >
                  {purpose.name}
                </Text>
              </View>
              {selectedPurpose === purpose.id && <Check color={Colors.white} size={20} />}
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>

    <TouchableOpacity
      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      disabled={loading}
    >
      <Text style={styles.submitButtonText}>
        {loading ? 'Dodavanje...' : 'Dodaj donaciju za petak'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Zakat donacija */}
  <View style={styles.donationCard}>
    <Text style={styles.sectionTitle}>Zakat donacija</Text>

    <View style={styles.inputSection}>
      <Text style={styles.label}>Iznos</Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="decimal-pad"
        placeholderTextColor={"black"}
        value={zakatAmount}
        onChangeText={setZakatAmount}
      />
      </View>
    </View>

    <View style={styles.inputSection}>
      <Text style={styles.label}>Godina</Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="2025"
        keyboardType="number-pad"
        value={zakatYear}
        onChangeText={setZakatYear}
      />
      </View>
    </View>

    <TouchableOpacity
      style={[styles.submitButton, loadingZakat && styles.submitButtonDisabled]}
      onPress={handleZakatSubmit}
      disabled={loadingZakat}
    >
      <Text style={styles.submitButtonText}>
        {loadingZakat ? 'Dodavanje...' : 'Dodaj Zakat donaciju'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Fitr donacija */}
  <View style={styles.donationCard}>
    <Text style={styles.sectionTitle}>Fitr donacija</Text>

    <View style={styles.inputSection}>
      <Text  style={styles.label}>Iznos</Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={"black"}
        keyboardType="decimal-pad"
        value={fitrAmount}
        onChangeText={setFitrAmount}
      />
      </View>
    </View>

    <View style={styles.inputSection}>
      <Text style={styles.label}>Godina</Text>
      <View style={styles.inputContainer}>

      <TextInput
        style={styles.input}
        placeholder="2025"
        keyboardType="number-pad"
        value={fitrYear}
        onChangeText={setFitrYear}
      />
      </View>
    </View>

    <TouchableOpacity
      style={[styles.submitButton, loadingFitr && styles.submitButtonDisabled]}
      onPress={handleFitrSubmit}
      disabled={loadingFitr}
    >
      <Text style={styles.submitButtonText}>
        {loadingFitr ? 'Dodavanje...' : 'Dodaj Fitr donaciju'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Ostale informacije */}
  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>Napomena</Text>
    <Text style={styles.infoText}>
      Petkovne donacije (sedžada) se upisuju svake nedelje nakon džuma namaza. 
      Molimo vas da redovno upisujete donacije kako biste imali tačnu evidenciju.
    </Text>
  </View>
</ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica Neue',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.white,
    opacity: 0.9,
  },
  content: { flex: 1, padding: 20 },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputSection: { marginBottom: 24 },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    paddingVertical: 16,
    paddingLeft: 8,
  },
  currency: {
    fontSize: 16,
    fontFamily: 'Helvetica Neue',
    color: Colors.textSecondary,
  },
  purposeContainer: { gap: 12 },
  purposeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  purposeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  purposeContent: { flexDirection: 'row', alignItems: 'center' },
  purposeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
    marginLeft: 12,
  },
  purposeTextSelected: { color: Colors.white },
  submitButton: {
    backgroundColor: Colors.primary, // Popravljeno sa 'Colors.primary'
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  donationCard: {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: 20,
  marginBottom: 24,
  shadowColor: Colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
},
sectionTitle: {
  fontSize: 20,
  fontFamily: 'Inter-SemiBold',
  color: Colors.text,
  marginBottom: 16,
},

});