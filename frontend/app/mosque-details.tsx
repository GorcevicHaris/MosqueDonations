import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/constants/Api";
import { Colors } from "@/constants/Colors";

export default function MosqueDetailsScreen() {
  const { user } = useAuth();
  const [mosque, setMosque] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.mosqueId) return;

    fetch(`${API_URL}/mosques/${user.mosqueId}`)
      .then(res => res.json())
      .then(data => {
        setMosque(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Greška:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />;
  }

  if (!mosque) {
    return <Text style={{ padding: 20, color: Colors.error }}>Džamija nije pronađena.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Naziv: {mosque.name}</Text>
      <Text style={styles.label}>Grad: {mosque.city}</Text>
      <Text style={styles.label}>Adresa: {mosque.address}</Text>
      <Text style={styles.label}>Dodato: {new Date(mosque.created_at).toLocaleDateString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.background,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
    color: Colors.text,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.textSecondary,
  },
});