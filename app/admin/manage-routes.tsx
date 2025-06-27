import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const snapshot = await getDocs(collection(db, 'routes'));
    setRoutes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddOrUpdate = async () => {
    if (!routeName || !stops) return Alert.alert('Please fill all fields');
    const stopList = stops.split(',').map(s => s.trim());

    try {
      if (editingId) {
        await updateDoc(doc(db, 'routes', editingId), {
          name: routeName,
          stops: stopList
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'routes'), {
          name: routeName,
          stops: stopList
        });
      }

      setRouteName('');
      setStops('');
      fetchRoutes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (route: any) => {
    setRouteName(route.name);
    setStops(route.stops.join(', '));
    setEditingId(route.id);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Route', 'Are you sure you want to delete this route?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'routes', id));
          fetchRoutes();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>🛣️ Manage Routes</Text>

        <View style={styles.card}>
          <Text style={styles.subheading}>
            {editingId ? '✏️ Edit Route' : '➕ Add New Route'}
          </Text>

          <TextInput
            placeholder="Route Name"
            value={routeName}
            onChangeText={setRouteName}
            style={styles.input}
          />
          <TextInput
            placeholder="Stops (comma separated)"
            value={stops}
            onChangeText={setStops}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>{editingId ? 'Update Route' : 'Add Route'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>📋 Existing Routes</Text>
        {routes.length === 0 ? (
          <Text style={styles.emptyText}>No routes added yet.</Text>
        ) : (
          routes.map(route => (
            <View key={route.id} style={styles.routeCard}>
              <MaterialIcons name="alt-route" size={22} color="#20bf6b" />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>{route.name}</Text>
                <Text style={styles.routeStops}>Stops: {route.stops.join(', ')}</Text>
              </View>
              <View style={styles.iconButtons}>
                <TouchableOpacity onPress={() => handleEdit(route)} style={styles.icon}>
                  <MaterialIcons name="edit" size={20} color="#20bf6b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(route.id)} style={styles.icon}>
                  <MaterialIcons name="delete" size={20} color="#eb3b5a" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f1f2f6',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeStops: {
    color: '#666',
    marginTop: 4,
  },
  iconButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
