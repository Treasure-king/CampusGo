// AttendanceIndex.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';  // Use `useRouter` from `expo-router`

import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function AttendanceIndex() {
const [busNumbers, setBusNumbers] = useState<number[]>([]);
  const router = useRouter();  // Using useRouter hook

  useEffect(() => {
    const fetchBusNumbers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const students = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.role === 'Student' || user.role === 'Teacher');

      const uniqueBusNumbers = [
        ...new Set(students.map(student => student.busNumber).filter(Boolean)),
      ];

      setBusNumbers(uniqueBusNumbers);
    };

    fetchBusNumbers();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select a Bus</Text>
      {busNumbers.map((busNum, index) => (
        <TouchableOpacity
        key={index}
        style={styles.busCard}
        onPress={() => router.push({ pathname: '/attendance/[busId]', params: { busId: busNum } })}
        >
          <Text style={styles.busText}>🚌 Bus {busNum}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  busCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  busText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


