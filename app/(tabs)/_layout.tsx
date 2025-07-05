import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#b2bec3',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          height: 60 + insets.bottom, // Adjust height based on safe area
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size + 2} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bus-location"
        options={{
          title: 'Track Bus',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bus-clock" size={size + 4} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size + 2} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size + 2} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="drivers-and-routes"
        options={{
          title: 'Drivers',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-tie" size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
