import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.replace('../auth/login');
        return;
      }

      const docRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(docRef);
      const userData = userSnap.data();

      if (userData) {
        setUser({ ...userData, uid: currentUser.uid });
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  const OptionCard = ({
    icon,
    label,
    onPress,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {icon}
      <Text style={[styles.cardText, { color: color || '#2f3542' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAdminOptions = () => (
    <>
      <OptionCard
        icon={<FontAwesome5 name="user-tie" size={24} color="#2d98da" />}
        label="Manage Drivers & Routes"
        onPress={() => router.push('/admin')}
      />
      <OptionCard
        icon={<MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#20bf6b" />}
        label="View Attendance Logs"
        onPress={() => router.push('/attendance')}
      />
      <OptionCard
        icon={<Ionicons name="cash-outline" size={24} color="#fa8231" />}
        label="Bus Fee Management"
        onPress={() => router.push('./bus-fee')}
      />
    </>
  );

  const renderUserOptions = () => (
    <>
      <OptionCard
        icon={<MaterialCommunityIcons name="check-decagram" size={24} color="#20bf6b" />}
        label="Mark Attendance"
        onPress={() => router.push('/attendance')}
      />
      <OptionCard
        icon={<Ionicons name="bus-outline" size={24} color="#4a90e2" />}
        label="Track My Bus"
        onPress={() => router.push('/bus-location')}
      />
      <OptionCard
        icon={<Ionicons name="wallet-outline" size={24} color="#fa8231" />}
        label="Pay Bus Fee"
        onPress={() => router.push('./bus-fee')}
      />
      <OptionCard
        icon={<Ionicons name="person-circle-outline" size={24} color="#8854d0" />}
        label="My Profile"
        onPress={() => router.push('/profile')}
      />
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome, {user?.name || 'User'} 👋</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>

      <View style={{ marginTop: 24, gap: 12 }}>
        {user?.role === 'admin' ? renderAdminOptions() : renderUserOptions()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#f9fafd',
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e272e',
  },
  role: {
    fontSize: 16,
    color: '#8395a7',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
