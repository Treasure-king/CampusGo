import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { db, firebaseConfig } from '../../config/firebaseConfig'; // Ensure your config is exported
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form States
  const [busNumber, setBusNumber] = useState('');
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Needed for Auth creation

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserWithAuth = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    
    /**
     * TRICK: Initialize a secondary app to create users without 
     * logging out the current admin user.
     */
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      // 2. Create User Profile in Firestore
      const userData = {
        uid,
        name,
        email,
        busNumber,
        role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), userData);
      
      // 3. Update local state and cleanup
      setUsers([...users, { id: uid, ...userData }]);
      Alert.alert("Success", "User created successfully!");
      closeModal();
      
      // 4. Sign out of the secondary app and delete it to clean up memory
      await signOut(secondaryAuth);
    } catch (error: any) {
      Alert.alert("Creation Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const updatedData = { busNumber, role };
      await updateDoc(userRef, updatedData);

      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u));
      Alert.alert("Updated", "User profile updated.");
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete User", "Are you sure? This only removes them from the database, not Auth.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, 'users', id));
          setUsers(users.filter(user => user.id !== id));
        } 
      }
    ]);
  };

  const openModal = (user: any = null) => {
    setSelectedUser(user);
    if (user) {
      setBusNumber(user.busNumber || '');
      setRole(user.role || 'Student');
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      setBusNumber('');
      setRole('Student');
      setName('');
      setEmail('');
      setPassword('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4b7bec" />
      <Text style={{ marginTop: 10, color: '#777' }}>Loading Directory...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <MaterialIcons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.roleBadge, { backgroundColor: item.role === 'Admin' ? '#eb3b5a' : '#4b7bec' }]}>
               <Text style={styles.roleText}>{item.role}</Text>
            </View>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.busInfo}>
                <FontAwesome5 name="bus" size={14} color="#777" />
                <Text style={styles.busText}>Route: {item.busNumber || 'N/A'}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}>
                  <MaterialIcons name="edit" size={20} color="#4b7bec" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                  <MaterialIcons name="delete-outline" size={20} color="#eb3b5a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedUser ? 'Edit Profile' : 'New User Account'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            {!selectedUser && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput placeholder="John Doe" value={name} onChangeText={setName} style={styles.input} />
                
                <Text style={styles.label}>Email Address</Text>
                <TextInput placeholder="john@school.com" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
                
                <Text style={styles.label}>Temporary Password</Text>
                <TextInput placeholder="Min 6 characters" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
              </>
            )}

            <Text style={styles.label}>Bus Number</Text>
            <TextInput placeholder="e.g. B-102" value={busNumber} onChangeText={setBusNumber} style={styles.input} />

            <Text style={styles.label}>System Role</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="Student" value="Student" />
                <Picker.Item label="Teacher" value="Teacher" />
                <Picker.Item label="Admin" value="Admin" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, submitting && { opacity: 0.7 }]} 
              onPress={selectedUser ? handleUpdate : handleCreateUserWithAuth}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{selectedUser ? 'Update User' : 'Create Account'}</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 24, fontWeight: '800', color: '#2d3436' },
  fab: { backgroundColor: '#4b7bec', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  card: { 
    backgroundColor: '#fff', 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 16, 
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f2f6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#4b7bec' },
  info: { marginLeft: 12, flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#2d3436' },
  email: { fontSize: 14, color: '#778ca3', marginTop: 2 },
  roleBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardFooter: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f2f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  busInfo: { flexDirection: 'row', alignItems: 'center' },
  busText: { marginLeft: 6, fontSize: 13, color: '#777' },
  cardActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
  label: { fontSize: 14, fontWeight: '600', color: '#4b7bec', marginBottom: 6 },
  input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  pickerContainer: { backgroundColor: '#f1f2f6', borderRadius: 10, marginBottom: 20, overflow: 'hidden' },
  saveButton: { backgroundColor: '#4b7bec', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});