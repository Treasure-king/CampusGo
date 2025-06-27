import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Image
} from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { FontAwesome5, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function ManageBuses() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [routeId, setRouteId] = useState('');
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const routeSnapshot = await getDocs(collection(db, 'routes'));
      const routeList = routeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoutes(routeList);

      const driverSnapshot = await getDocs(collection(db, 'drivers'));
      const driverList = driverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(driverList);
    };
    fetchData();
  }, []);

  const handleAddOrUpdateDriver = async () => {
    if (!name || !phone || !routeId || !busNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'drivers', editingId), { name, phone, routeId, busNumber });
        Alert.alert('Updated', 'Driver updated successfully');
      } else {
        await addDoc(collection(db, 'drivers'), { name, phone, routeId, busNumber });
        Alert.alert('Success', 'Driver created successfully!');
      }

      setName('');
      setPhone('');
      setRouteId('');
      setBusNumber('');
      setEditingId(null);

      const driverSnapshot = await getDocs(collection(db, 'drivers'));
      const driverList = driverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(driverList);
    } catch (error) {
      Alert.alert('Error', 'Failed to save driver');
      console.error(error);
    }
  };

  const handleEdit = (driver) => {
    setName(driver.name);
    setPhone(driver.phone);
    setRouteId(driver.routeId);
    setBusNumber(driver.busNumber);
    setEditingId(driver.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'drivers', id));
      setDrivers(drivers.filter(driver => driver.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete driver');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🚌 Manage Buses & Drivers</Text>
      <Image source={require('../../assets/images/bus-driver.png')} style={styles.image} />

      <View style={styles.card}>
        <Text style={styles.subheading}>👨‍✈️ {editingId ? 'Edit Driver' : 'Create New Driver'}</Text>

        <View style={styles.inputContainer}>
          <FontAwesome5 name="user" size={20} color="#888" />
          <TextInput
            placeholder="Driver Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call" size={20} color="#888" />
          <TextInput
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="bus" size={20} color="#888" />
          <TextInput
            placeholder="Bus Number"
            value={busNumber}
            onChangeText={setBusNumber}
            style={styles.input}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={routeId}
            onValueChange={(value) => setRouteId(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Route" value="" />
            {routes.map(route => (
              <Picker.Item key={route.id} label={route.name || route.id} value={route.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAddOrUpdateDriver}>
          <Text style={styles.buttonText}>{editingId ? 'Update Driver' : 'Add Driver'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>📋 Existing Drivers</Text>
      {drivers.map(driver => (
        <View key={driver.id} style={styles.driverCard}>
          <View>
            <Text style={styles.driverText}>👤 {driver.name} | 📞 {driver.phone}</Text>
            <Text style={{ color: '#666' }}>🚌 Bus: {driver.busNumber} | 🗺️ Route: {driver.routeId}</Text>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity onPress={() => handleEdit(driver)}>
              <MaterialIcons name="edit" size={30} color="#20bf6b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(driver.id)}>
              <MaterialIcons name="delete" size={30} color="#20bf6b" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: 240,
    height: 140,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    width: '100%',
    borderRadius: 14,
    elevation: 4,
    marginBottom: 24,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 14,
    padding: 5,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 60,
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  driverText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
