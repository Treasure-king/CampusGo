import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function BusAttendanceScreen() {
  const { busId } = useLocalSearchParams();
  const [users, setUsers] = useState([]);  // Changed to "users" to include both students and teachers
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateKey = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    const fetchData = async () => {
      console.log(busId );
        
      const snapshot = await getDocs(collection(db, 'users'));
      const filteredUsers = snapshot.docs
        .map(doc => {
          const userData = doc.data();
          return { id: doc.id, ...userData };
        })
        .filter(u => {
          // Check if busNumber and role are available before filtering
          return (u.role === 'Student' || u.role === 'Teacher') && u.busNumber == busId;
        });

      setUsers(filteredUsers);

      const ref = doc(db, 'attendance', busId, 'records', dateKey);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAttendance(snap.data().records);
      } else {
        const initial = {};
        filteredUsers.forEach(u => {
          initial[u.id] = 'absent';  // Initialize attendance status for all users
        });
        setAttendance(initial);
      }
    };

    fetchData();
  }, [busId, dateKey]);

  const toggleAttendance = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',  // Toggle attendance status
    }));
  };

  const saveAttendance = async () => {
    const ref = doc(db, 'attendance', busId, 'records', dateKey);
    await setDoc(ref, {
      date: dateKey,
      records: attendance,
    });
    alert('Attendance saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Attendance for Bus {busId}</Text>

      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={(e, date) => setSelectedDate(date || selectedDate)}
      />

      {users.map(user => (
        <View key={user.uid} style={styles.card}>
          <Text style={styles.name}>{user.name} ({user.role})</Text> {/* Display role along with name */}
          <Switch
            value={attendance[user.id] === 'present'}
            onValueChange={() => toggleAttendance(user.id)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
        <Text style={styles.saveText}>Save Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#eef2f5',
    flexGrow: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
