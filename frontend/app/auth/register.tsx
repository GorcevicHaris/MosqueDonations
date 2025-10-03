import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react-native';
import axios from 'axios';
import Modal from 'react-native-modal';
import { API_URL } from '@/constants/Api';

type Mosque = {
  id: number;
  name: string;
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [selectedMosqueId, setSelectedMosqueId] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const { register } = useAuth();

  useEffect(() => {
    axios.get(`${API_URL}/mosques`)
      .then(response => setMosques(response.data))
      .catch(error => console.error('Greška pri učitavanju džamija:', error));
  }, []);

  const handleRegister = async () => {
    if (!selectedMosqueId || !fullName || !email || !password || !confirmPassword) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    setLoading(true);
    try {
      // Get the selected mosque name
      const selectedMosque = mosques.find(m => m.id === selectedMosqueId);
      
      if (!selectedMosque) {
        Alert.alert('Greška', 'Molimo izaberite džamiju');
        return;
      }

      // Use the register function from AuthContext with mosqueId
      const success = await register({
        mosqueId: selectedMosqueId,
        fullName,
        email,
        password,
        role: 'imam',
      });

      if (success) {
        // User is now authenticated, navigate to tabs
        router.replace('/(tabs)');
      } else {
        Alert.alert('Greška', 'Registracija nije uspela. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom registracije');
    } finally {
      setLoading(false);
    }
  };

  const selectedMosqueName = mosques.find(m => m.id === selectedMosqueId)?.name || 'Izaberite džamiju...';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight, Colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={Colors.white} size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Registracija</Text>
            <Text style={styles.description}>Kreirajte nalog za vašu džamiju</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Džamija</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: selectedMosqueId ? Colors.text : Colors.textSecondary }}>
                {selectedMosqueName}
              </Text>
            </TouchableOpacity>

            <Modal
              isVisible={isModalVisible}
              onBackdropPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContent}>
                {mosques.map((mosque) => (
                  <TouchableOpacity
                    key={mosque.id}
                    onPress={() => {
                      setSelectedMosqueId(mosque.id);
                      setModalVisible(false);
                    }}
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalItemText}>{mosque.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Modal>

            <View style={styles.inputContainer}>
              <User color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Ime i prezime"
                placeholderTextColor={Colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email adresa"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Lozinka"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Potvrdite lozinku"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <UserPlus color={Colors.white} size={20} />
              <Text style={styles.registerButtonText}>
                {loading ? 'Registracija...' : 'Registrujte se'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLinkText}>Već imate nalog? Prijavite se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  selectInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    paddingVertical: 16,
    paddingLeft: 12,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});