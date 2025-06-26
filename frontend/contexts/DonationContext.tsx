import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Api';

interface Donation {
  id: number;
  mosque_id: number;
  user_id: number;
  amount: number;
  purpose_id: number;
  purposeName: string;
  donation_date: string;
  created_at: string;
}

interface FitrZakatFridayPayload {
  mosque_id: number;
  user_id: number;
  amount: number;
  year: number;
}

interface Purpose {
  id: string;
  name: string;
}

interface Summary {
  friday: number;
  fitr: number;
  zakat: number;
  countFriday: number;
  countFitr: number;
  countZakat: number;
}

interface DonationContextType {
  fridayDonations: Donation[];
  purposes: Purpose[];
  deleteDonation: (donationId: number) => Promise<void>;
  fetchDonations: (userId: number) => Promise<void>;
  getTotalDonations: () => number;
  getDonationsByPurpose: () => Record<string, number>;
  addFitrDonation: (donation: FitrZakatFridayPayload) => Promise<void>;
  addZakatDonation: (donation: FitrZakatFridayPayload) => Promise<void>;
  addFridayDonation: (donation: FitrZakatFridayPayload) => Promise<void>;
  fetchSummary: (userId: number) => Promise<void>;
  getTotalDonationsCount: () => number;
  summary: Summary;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fridayDonations, setFridayDonations] = useState<Donation[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [summary, setSummary] = useState<Summary>({
    friday: 0,
    fitr: 0,
    zakat: 0,
    countFriday: 0,
    countFitr: 0,
    countZakat: 0,
  });

  const fetchSummary = async (userId: number) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_URL}/donations/summary/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSummary(data);
  };

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`${API_URL}/purposes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch purposes');
        const data: Purpose[] = await response.json();
        setPurposes(data);
      } catch (error) {
        console.error('Error fetching purposes:', error);
      }
    };
    fetchPurposes();
  }, []);

  const fetchDonations = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token');
      const response = await fetch(`${API_URL}/donations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch donations');
      const data: Donation[] = await response.json();
      setFridayDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  };

  const addFridayDonation = async (donation: FitrZakatFridayPayload) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/donation/friday`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donation),
      });
      if (!response.ok) throw new Error('Greska prilikom dodavanja petkovne donacije');

      await fetchDonations(donation.user_id);
      await fetchSummary(donation.user_id);
    } catch (error) {
      console.error('Error adding friday donation:', error);
      throw error;
    }
  };

  const addFitrDonation = async (donation: FitrZakatFridayPayload) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/donation/fitr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donation),
      });
      if (!response.ok) throw new Error('Greska prilikom dodavanja fitr donacije');

      await fetchSummary(donation.user_id);
    } catch (error) {
      console.error('Error adding fitr donation:', error);
      throw error;
    }
  };

  const addZakatDonation = async (donation: FitrZakatFridayPayload) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/donation/zakat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donation),
      });
      if (!response.ok) throw new Error('Greska prilikom dodavanja zakat donacije');

      await fetchSummary(donation.user_id);
    } catch (error) {
      console.error('Error adding zakat donation:', error);
      throw error;
    }
  };

  const deleteDonation = async (donationId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const donationToDelete = fridayDonations.find(d => d.id === donationId);
      if (!donationToDelete) throw new Error('Donacija nije pronađena');

      const response = await fetch(`${API_URL}/donation/friday/${donationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Greska prilikom brisanja donacije');

      await fetchDonations(donationToDelete.user_id);
      await fetchSummary(donationToDelete.user_id);
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  };

  const getTotalDonations = () => {
    return fridayDonations.reduce((total, donation) => total + donation.amount, 0);
  };

const getTotalDonationsCount = () => {
    return summary.countFriday + summary.countFitr + summary.countZakat;
  };

  // console.log(getTotalDonationsCount(),"broj ukupan")
  
  const getDonationsByPurpose = () => {
    return fridayDonations.reduce((acc, donation) => {
      acc[donation.purposeName] = (acc[donation.purposeName] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <DonationContext.Provider
      value={{
        fridayDonations,
        purposes,
        addFridayDonation,
        deleteDonation,
        fetchDonations,
        getTotalDonations,
        getDonationsByPurpose,
        addZakatDonation,
        addFitrDonation,
        fetchSummary,
        summary,
        getTotalDonationsCount,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonations = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonations must be used within a DonationProvider');
  }
  return context;
};
