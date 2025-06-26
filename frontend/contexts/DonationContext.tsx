// DonationContext.tsx
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
interface FitrZakatPayload {
  mosque_id: number;
  user_id: number;
  amount: number;
  year: number;
}
interface Purpose {
  id: string;
  name: string;
}
interface Summary{
  userId :number;
}
interface DonationContextType {
  fridayDonations: Donation[];
  purposes: Purpose[];
  addFridayDonation: (donation: Omit<Donation, 'id' | 'created_at'>) => Promise<void>;
  deleteDonation: (donationId: number) => Promise<void>;
  fetchDonations: (userId: number) => Promise<void>;
  getTotalDonations: () => number;
  getDonationsByPurpose: () => Record<string, number>;
  addFitrDonation: (donation: FitrZakatPayload) => Promise<void>;
  addZakatDonation: (donation: FitrZakatPayload) => Promise<void>;
  fetchSummary: (userId:number) => Promise<void>;
  summary: { friday: number; fitr: number; zakat: number };  // <--- Dodaj ovo
}


const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fridayDonations, setFridayDonations] = useState<Donation[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [summary, setSummary] = useState<{ friday: number, fitr: number, zakat: number }>({
  friday: 0,
  fitr: 0,
  zakat: 0
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
      console.log('Token za purposes:', token);
      if (!token) return;
      const response = await fetch('http://192.168.0.103:8080/purposes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch purposes: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch purposes: ${response.statusText}`);
      }
      const data: Purpose[] = await response.json();
      console.log('Fetched purposes data:', data); // Dodaj ovu liniju
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
      console.log('Fetching donations for userId:', userId, 'with token:', token);
      if (!token) throw new Error('No authentication token');
      const response = await fetch(`http://192.168.0.103:8080/donations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text(); // Get response body for more details
        console.log('Fetch error:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch donations: ${response.statusText} - ${errorText}`);
      }
      const data: Donation[] = await response.json();
      console.log('Fetched data:', data);
      setFridayDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error; // Re-throw to handle in the caller
    }
  };

   const addFitrDonation = async (donation: FitrZakatPayload) => {
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
};

const addZakatDonation = async (donation: FitrZakatPayload) => {
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
};

  const addFridayDonation = async (donation: Omit<Donation, 'id' | 'created_at'>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.103:8080/donation/friday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mosque_id: donation.mosque_id,
          user_id: donation.user_id,
          amount: donation.amount,
          purpose_id: donation.purpose_id,
          donation_date: donation.donation_date,
        }),
      });
      if (!response.ok) throw new Error('Failed to add donation');
      const { id } = await response.json();
      const newDonation: Donation = {
        ...donation,
        id,
        created_at: new Date().toISOString(),
      };
      setFridayDonations([...fridayDonations, newDonation]);
      await fetchDonations(donation.user_id);
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  };
  

  const deleteDonation = async (donationId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.0.103:8080/donation/friday/${donationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete donation');
      setFridayDonations(fridayDonations.filter((donation) => donation.id !== donationId));
      await fetchDonations(fridayDonations.find((d) => d.id === donationId)?.user_id || 0);
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  };

  const getTotalDonations = () => {
    return fridayDonations.reduce((total, donation) => total + donation.amount, 0);
  };

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
        summary
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
