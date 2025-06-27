import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; // Adjust this import path to your config
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';  // Use useRouter from expo-router

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();  // Initialize router for navigation

  const fetchUserData = async () => {
    const user = getAuth().currentUser;

    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (err) {
      console.log('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());  // Sign out from Firebase
      router.push('../auth/login');  // Redirect to the login screen
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Unable to load user data.</Text>
      </View>
    );
  }

  const { name, email, role, busNumber, profilePic } = userData;

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1050&q=80' }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.title}>👤 My Profile</Text>

        <View style={styles.profilePicWrapper}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePic} />
          ) : (
            <View style={styles.placeholderPic}>
              <Text style={styles.placeholderInitial}>{name?.charAt(0)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.infoCard}>
          <Ionicons name="person" size={22} color="#4a90e2" />
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{role}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="bus" size={22} color="#4a90e2" />
          <Text style={styles.infoLabel}>Assigned Bus</Text>
          <Text style={styles.infoValue}>{busNumber}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  profilePicWrapper: {
    marginBottom: 16,
  },
  profilePic: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  placeholderPic: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#cfe0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#ffffffee',
    opacity: 0.7,
    width: '100%',
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: 'black',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4c4c',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 30,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
  flex: 1,
  alignItems: 'center',
  padding: 24,
  backgroundColor: '#f5f5f5', // or any background you prefer
},
});
