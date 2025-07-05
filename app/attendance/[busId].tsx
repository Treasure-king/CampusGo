import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function BusAttendanceScreen() {
  const { busId } = useLocalSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const filteredUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => (u.role === 'Student' || u.role === 'Teacher') && u.busNumber == busId);

      setUsers(filteredUsers);

      const ref = doc(db, 'attendance', String(busId), 'records', dateKey);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAttendance(snap.data().records);
      } else {
        const initial: { [key: string]: string } = {};
        filteredUsers.forEach(u => {
          initial[u.id] = 'absent';
        });
        setAttendance(initial);
      }
    };

    if (busId) fetchData();
  }, [busId, dateKey]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const saveAttendance = async () => {
    try {
      const ref = doc(db, 'attendance', String(busId), 'records', dateKey);
      await setDoc(ref, {
        date: dateKey,
        records: attendance,
      });
      Alert.alert('Success', 'Attendance saved!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save attendance.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🚌 Attendance for Bus {busId}</Text>

      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>📅 {dateKey}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {users.map(user => (
        <View key={user.id} style={styles.userCard}>
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>({user.role})</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusButton,
              attendance[user.id] === 'present' ? styles.present : styles.absent
            ]}
            onPress={() => toggleAttendance(user.id)}
          >
            <Text style={styles.statusText}>
              {attendance[user.id] === 'present' ? 'Present' : 'Absent'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
        <Text style={styles.saveText}>💾 Save Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f6fc',
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  datePickerButton: {
    backgroundColor: '#dfefff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2a7ae4',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    color: '#888',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  present: {
    backgroundColor: '#d4edda',
  },
  absent: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
