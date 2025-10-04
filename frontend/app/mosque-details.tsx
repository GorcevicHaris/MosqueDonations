import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/constants/Api";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Building2, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MosqueDetailsScreen() {
  const { user } = useAuth();
  const [mosque, setMosque] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMosqueDetails = async () => {
      if (!user?.mosqueId) {
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/mosque/${user.mosqueId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMosque(data);
      } catch (err) {
        console.error("Greška pri učitavanju džamije:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMosqueDetails();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Učitavanje podataka...</Text>
      </View>
    );
  }

  if (!mosque) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={Colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Džamija nije pronađena.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <ArrowLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Building2 color={Colors.white} size={40} />
          <Text style={styles.headerTitle}>Podaci o džamiji</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.mosqueNameCard}>
          <Text style={styles.mosqueName}>{mosque.name}</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MapPin color={Colors.primary} size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Grad</Text>
              <Text style={styles.detailValue}>{mosque.city}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Building2 color={Colors.primary} size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Adresa</Text>
              <Text style={styles.detailValue}>{mosque.address}</Text>
            </View>
          </View>

          <View style={[styles.detailRow, styles.lastRow]}>
            <View style={styles.detailIconContainer}>
              <Calendar color={Colors.primary} size={20} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Datum dodavanja</Text>
              <Text style={styles.detailValue}>
                {new Date(mosque.created_at).toLocaleDateString('sr-RS', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonHeader: {
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
  },
  content: {
    padding: 20,
  },
  mosqueNameCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  mosqueName: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: Colors.text,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 40,
  },
});