import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Book,
  AlertCircle,
} from 'lucide-react-native';

export default function HelpSupportScreen() {
  const handleEmail = () => {
    Linking.openURL('mailto:podrska@dzamija-donacije.ba');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+38762123456');
  };

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
          <HelpCircle color={Colors.white} size={40} />
          <Text style={styles.headerTitle}>Pomoć i podrška</Text>
          <Text style={styles.headerSubtitle}>
            Tu smo da vam pomognemo
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Ako imate bilo kakvih pitanja ili problema sa aplikacijom, slobodno
            nas kontaktirajte. Naš tim je dostupan da vam pomogne.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIconContainer}>
              <Mail color={Colors.primary} size={24} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>
                podrska@dzamija-donacije.ba
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handlePhone}>
            <View style={styles.contactIconContainer}>
              <Phone color={Colors.primary} size={24} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Telefon</Text>
              <Text style={styles.contactValue}>+387 62 123 456</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <MessageCircle color={Colors.primary} size={24} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Radno vreme</Text>
              <Text style={styles.contactValue}>
                Ponedeljak - Petak, 9:00 - 17:00
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Česta pitanja</Text>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Book color={Colors.primary} size={20} />
              <Text style={styles.faqQuestion}>
                Kako da dodam novu donaciju?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Idite na tab "Dodaj" u meniju, unesite iznos donacije, odaberite
              namenu i datum, zatim pritisnite dugme "Dodaj donaciju".
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Book color={Colors.primary} size={20} />
              <Text style={styles.faqQuestion}>
                Kako da vidim sve svoje donacije?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Sve vaše donacije možete videti na početnoj stranici. Možete ih
              filtrirati po tipu donacije (petak, fitr, zakat) i pregledati
              detaljnu istoriju.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Book color={Colors.primary} size={20} />
              <Text style={styles.faqQuestion}>
                Mogu li obrisati donaciju?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Da, možete obrisati petkovne donacije pritiskom na dugme za
              brisanje pored svake donacije u listi.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Book color={Colors.primary} size={20} />
              <Text style={styles.faqQuestion}>
                Šta znače različite namene donacija?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Namene donacija omogućavaju džamiji da prati kako se sredstva
              koriste (tekući troškovi, pomoć siromašnima, renoviranje, itd.).
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <AlertCircle color={Colors.accent} size={24} />
            <Text style={styles.tipTitle}>Savet</Text>
          </View>
          <Text style={styles.tipText}>
            Redovno upisujte svoje donacije kako biste imali tačnu evidenciju i
            pomogli džamiji u boljem planiranju.
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
  introCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    lineHeight: 22,
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
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginLeft: 12,
  },
  tipText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});