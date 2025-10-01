import React, { useState } from 'react';
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
import { router} from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import axios, { AxiosError } from 'axios';
import { API_URL } from '@/constants/Api';
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Greška', 'Molimo unesite email i lozinku');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data && response.data.token) {
      const success = await login(email, password); 
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Greška', 'Autentifikacija nije uspela');
      }
    } else {
      Alert.alert('Greška', 'Pogrešan email ili lozinka');
    }
  } catch (err) {
    const error = err as AxiosError;

    if (error.response?.status === 404) {
      Alert.alert('Greška', 'Korisnik nije pronađen');
    } else if (error.response?.status === 401) {
      Alert.alert('Greška', 'Neispravni podaci za prijavu');
    } else {
      Alert.alert('Greška', 'Greška prilikom povezivanja sa serverom');
    }

    console.error(error.response?.data || error.message);
  } finally {
    // ✅ always reset loading, success or error
    setLoading(false);
  }
};



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
          <View style={styles.header}>
            <Text style={styles.title}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</Text>
            <Text style={styles.subtitle}>Džamijski sistem donacija</Text>
            <Text style={styles.description}>Prijavite se za pristup sistemu</Text>
          </View>

          <View style={styles.form}>
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

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LogIn color={Colors.white} size={20} />
              <Text style={styles.loginButtonText}>
                {loading ? 'Prijavljivanje...' : 'Prijavite se'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.registerLinkText}>
                Nemate nalog? Registrujte se
              </Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Amiri-Bold',
    color: Colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});