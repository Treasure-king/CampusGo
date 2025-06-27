import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { v4 as uuidv4 } from 'uuid';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [busNumber, setBusNumber] = useState('');
  const [role, setRole] = useState('Student');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
    setUsers(users.filter(user => user.id !== id));
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setBusNumber(user.busNumber || '');
    setRole(user.role || 'Student');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (selectedUser) {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        busNumber,
        role,
      });

      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, busNumber, role } : u
      ));
    } else {
      // Create new user
      if (!newUserName.trim() || !newUserEmail.trim()) return;
      const newId = uuidv4();
      const newUser = {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        busNumber,
        role,
        uid: newId,
      };
      await setDoc(doc(db, 'users', newId), newUser);
      setUsers([...users, { id: newId, ...newUser }]);
    }

    // Reset modal and fields
    setModalVisible(false);
    setSelectedUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setBusNumber('');
    setRole('Student');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Manage Users</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedUser(null);
          setBusNumber('');
          setRole('Student');
          setNewUserName('');
          setNewUserEmail('');
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>➕ Create User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <FontAwesome5 name="user" size={24} color="#4b7bec" />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.email}</Text>
              <Text>Role: {item.role}</Text>
              <Text>Bus: {item.busNumber || 'N/A'}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => openEditModal(item)} />
              <View style={{ height: 8 }} />
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </View>
        )}
      />

      {/* Modal for Create/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedUser ? 'Edit User' : 'Create User'}
            </Text>

            {!selectedUser && (
              <>
                <TextInput
                  placeholder="Name"
                  value={newUserName}
                  onChangeText={setNewUserName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Email"
                  value={newUserEmail}
                  onChangeText={setNewUserEmail}
                  style={styles.input}
                  keyboardType="email-address"
                />
              </>
            )}

            <TextInput
              placeholder="Enter Bus Number"
              value={busNumber}
              onChangeText={setBusNumber}
              style={styles.input}
            />

            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Teacher" value="Teacher" />
              <Picker.Item label="Admin" value="Admin" />
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f1f2f6',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actions: {
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#000',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
