import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { FontAwesome5, MaterialCommunityIcons, Entypo, Feather } from '@expo/vector-icons';

function Home() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalDrivers: 0,
    totalStudentsToday: 0,
    totalTeachers: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubBuses = onSnapshot(collection(db, 'buses'), snapshot => {
      setStats(prev => ({ ...prev, totalBuses: snapshot.size }));
    });

    const unsubDrivers = onSnapshot(collection(db, 'drivers'), snapshot => {
      setStats(prev => ({ ...prev, totalDrivers: snapshot.size }));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
      const students = snapshot.docs.filter(doc => doc.data().role === 'student').length;
      const teachers = snapshot.docs.filter(doc => doc.data().role === 'teacher').length;
      setStats(prev => ({ ...prev, totalStudentsToday: students, totalTeachers: teachers }));
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), snapshot => {
      const attended = snapshot.docs.filter(doc => doc.data().status === 'present').length;
      const total = snapshot.size;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

      setStats(prev => ({ ...prev, attendancePercentage: percentage }));
      setLoading(false);
    });

    return () => {
      unsubBuses();
      unsubDrivers();
      unsubUsers();
      unsubAttendance();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome to Bus Tracking App 🚍</Text>

      <View style={styles.card}>
        <FontAwesome5 name="bus" size={26} color="#2563eb" />
        <Text style={styles.cardTitle}>Total Buses</Text>
        <Text style={styles.cardValue}>{stats.totalBuses}</Text>
      </View>

      <View style={styles.card}>
        <MaterialCommunityIcons name="account-tie" size={28} color="#2563eb" />
        <Text style={styles.cardTitle}>Total Drivers</Text>
        <Text style={styles.cardValue}>{stats.totalDrivers}</Text>
      </View>

      <View style={styles.card}>
        <Entypo name="graduation-cap" size={26} color="#2563eb" />
        <Text style={styles.cardTitle}>Students Today</Text>
        <Text style={styles.cardValue}>{stats.totalStudentsToday}</Text>
      </View>

      <View style={styles.card}>
        <Feather name="user-check" size={26} color="#2563eb" />
        <Text style={styles.cardTitle}>Total Teachers</Text>
        <Text style={styles.cardValue}>{stats.totalTeachers}</Text>
      </View>

      <View style={styles.card}>
        <FontAwesome5 name="calendar-check" size={26} color="#2563eb" />
        <Text style={styles.cardTitle}>Attendance</Text>
        <Text style={styles.cardValue}>{stats.attendancePercentage}%</Text>
      </View>

      <Text style={styles.footerNote}>Last updated in real time 🔄</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1f2937',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 6,
  },
  cardValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 4,
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Home;
