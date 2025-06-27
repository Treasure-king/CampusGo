import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👨‍💼 Admin Dashboard</Text>

      <Image
        source={require('../../assets/images/admin-dashboard.png')}
        style={styles.image}
      />

      <View style={styles.grid}>
        <Link href="/admin/manage-users" asChild>
          <TouchableOpacity style={styles.card}>
            <FontAwesome5 name="user-cog" size={30} color="#2d98da" />
            <Text style={styles.cardText}>Manage Users</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/manage-routes" asChild>
          <TouchableOpacity style={styles.card}>
            <MaterialCommunityIcons name="map-marker-path" size={30} color="#20bf6b" />
            <Text style={styles.cardText}>Manage Routes</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/manage-buses" asChild>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="bus" size={30} color="#fa8231" />
            <Text style={styles.cardText}>Manage Buses</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e272e',
  },
  image: {
    width: 280,
    height: 170,
    marginBottom: 28,
    resizeMode: 'contain',
  },
  grid: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    gap: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
  },
});


//prfoiles