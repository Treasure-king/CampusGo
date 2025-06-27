import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

interface Driver {
  id: string;
  name: string;
  phone: string;
  routeId: string;
}

interface Route {
  id: string;
  name: string;
  stops: string[];
}

function DriversAndRoutesScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Record<string, Route>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriversAndRoutes = async () => {
      try {
        const driverSnapshot = await getDocs(collection(db, 'drivers'));
        const driverList: Driver[] = [];

        driverSnapshot.forEach((doc) => {
          driverList.push({ id: doc.id, ...doc.data() } as Driver);
        });

        const routePromises = driverList.map((driver) =>
          getDoc(doc(db, 'routes', driver.routeId))
        );

        const routeDocs = await Promise.all(routePromises);
        const routeMap: Record<string, Route> = {};

        routeDocs.forEach((routeDoc) => {
          if (routeDoc.exists()) {
            const data = routeDoc.data() as Route;
            routeMap[routeDoc.id] = {  ...data,id: routeDoc.id };
          }
        });

        setDrivers(driverList);
        setRoutes(routeMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDriversAndRoutes();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <FlatList
      data={drivers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        const route = routes[item.routeId];
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/1995/1995535.png',
                }}
                style={styles.avatar}
              />
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={18} color="#2d3436" />
                  <Text style={styles.text}>{item.phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="route" size={20} color="#0984e3" />
              <Text style={styles.route}>
                {route ? route.name : 'Unknown Route'}
              </Text>
            </View>

            {route?.stops && (
              <View style={styles.infoRow}>
                <FontAwesome5 name="map-marker-alt" size={18} color="#e17055" />
                <Text style={styles.stops}>
                  {route.stops.join(', ')}
                </Text>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dfe6e9',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  text: {
    marginLeft: 8,
    fontSize: 15,
    color: '#636e72',
  },
  route: {
    marginLeft: 8,
    fontSize: 15,
    color: '#0984e3',
    fontWeight: '600',
  },
  stops: {
    marginLeft: 8,
    fontSize: 14,
    color: '#636e72',
    flexWrap: 'wrap',
    flex: 1,
  },
});

export default DriversAndRoutesScreen;