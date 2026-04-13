// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import * as Location from 'expo-location';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Use PROVIDER_GOOGLE for better UI on Android
// import { db } from '../../config/firebaseConfig'; 
// import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

// // TODO: Replace this with your actual Auth User Context/State
// const authUser = { 
//   uid: "AC6jxHDVOhUXSkNp5n6OUWdG7im2", 
//   role: "Driver", // Change to "Student" to test passenger view
//   busNumber: "2" 
// };

// export default function BusTracking() {
//   const [busLocation, setBusLocation] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // --- ROLE: DRIVER (SENDING DATA) ---
//     if (authUser.role === 'Driver') {
//       let locationSubscription: any;

//       const startTracking = async () => {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert("Permission Denied", "Drivers must allow location to track the bus.");
//           setLoading(false);
//           return;
//         }

//         // Real-time tracking for Mobile
//         locationSubscription = await Location.watchPositionAsync(
//           { 
//             accuracy: Location.Accuracy.Balanced, // Balanced saves battery vs High
//             timeInterval: 5000, 
//             distanceInterval: 5 
//           },
//           async (loc) => {
//             try {
//               const driverRef = doc(db, "drivers", authUser.uid); 
//               await updateDoc(driverRef, {
//                 lastKnownLat: loc.coords.latitude,
//                 lastKnownLng: loc.coords.longitude,
//                 lastUpdated: new Date().toISOString(),
//               });
              
//               // Also update local state so the driver sees themselves on map
//               setBusLocation({
//                 latitude: loc.coords.latitude,
//                 longitude: loc.coords.longitude,
//                 name: "You (Driver)"
//               });
//             } catch (e) {
//               console.error("Firebase Update Error: ", e);
//             }
//           }
//         );
//         setLoading(false);
//       };

//       startTracking();
//       return () => {
//         if (locationSubscription) locationSubscription.remove();
//       };
//     }

//     // --- ROLE: STUDENT (RECEIVING DATA) ---
//     if (authUser.role === 'Student') {
//       const q = query(
//         collection(db, "drivers"), 
//         where("busNumber", "==", authUser.busNumber)
//       );

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         if (!snapshot.empty) {
//           const driverData = snapshot.docs[0].data();
//           if (driverData.lastKnownLat && driverData.lastKnownLng) {
//             setBusLocation({
//               latitude: driverData.lastKnownLat,
//               longitude: driverData.lastKnownLng,
//               name: driverData.name
//             });
//           }
//         } else {
//           console.log("No driver found for this bus number.");
//         }
//         setLoading(false);
//       });

//       return () => unsubscribe();
//     }
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={styles.loadingText}>Initializing {authUser.role} View...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE} // Ensure Google Maps is used on Android
//         style={styles.map}
//         region={{
//           latitude: 30.901,
//           longitude:  75.857,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//       >
//         {busLocation && (
//           <Marker
//             coordinate={{ 
//               latitude: 30.901, 
//               longitude: 75.857 
//             }}
//             title={`Bus ${authUser.busNumber}`}
//             description={`Driver: ${busLocation.name}`}
//           >
//             {/* Custom Bus Icon for Mobile */}
//             <View style={styles.markerContainer}>
//               <Text style={{ fontSize: 30 }}>🚌</Text>
//             </View>
//           </Marker>
//         )}
//       </MapView>
      
//       {/* Overlay UI */}
//       <View style={styles.overlay}>
//         <Text style={styles.statusText}>
//           {authUser.role === 'Driver' ? '🔴 Live: Streaming Location' : '🟢 Tracking Bus ' + authUser.busNumber}
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { width: '100%', height: '100%' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
//   loadingText: { marginTop: 10, color: '#666' },
//   markerContainer: {
//     backgroundColor: 'white',
//     padding: 5,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: '#4a90e2',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   overlay: {
//     position: 'absolute',
//     top: 50,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     elevation: 5,
//   },
//   statusText: { fontWeight: 'bold', color: '#333' }
// });