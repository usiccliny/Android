import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MarkerInfo } from '../types';
import * as Location from 'expo-location';
import { useDatabase } from '../contexts/DatabaseContext';
import * as Notifications from 'expo-notifications';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'

interface MapComponentProps {
    navigation: StackNavigationProp<RootStackParamList, 'Map'>;
}

const MapComponent: React.FC<MapComponentProps> = ({ navigation }) => {
    const { markers, addMarker } = useDatabase();
    const [region, setRegion] = useState<Location.LocationObject | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);

                const { granted } = await Location.getForegroundPermissionsAsync();
                if (!granted) {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert("Location Permission Denied", "Please enable location permissions in your device settings.");
                        setIsLoading(false);
                        return;
                    }
                }

                const location = await Location.getCurrentPositionAsync({});
                setRegion(location);

                setIsLoading(false);
            } catch (error) {
                console.error("Error during initialization:", error);
                Alert.alert("Error", "Failed to initialize the map. Please try again later.");
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        let watcher: Location.LocationSubscription;

        const startLocationTracking = async () => {
            try {
                watcher = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000, // Обновление каждые 5 секунд
                        distanceInterval: 2, // Обновление каждые 5 метров
                    },
                    (newLocation) => {
                        checkProximity(newLocation.coords);
                    }
                );
            } catch (error) {
                console.error("Error starting location tracking:", error);
            }
        };

        const checkProximity = async (currentCoords: Location.LocationObjectCoords) => {
            markers.forEach(async (marker) => {
                const distance = getDistanceFromLatLonInMeters(
                    currentCoords.latitude,
                    currentCoords.longitude,
                    marker.latitude,
                    marker.longitude
                );
        
                if (distance <= 100) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "You're near a marker!",
                            body: `You are ${Math.round(distance)} meters away from marker ID: ${marker.id}.`,
                            sound: true,
                        },
                        trigger: null,
                    });
                }
            });
        };

        if (!isLoading && region) {
            startLocationTracking();
        }

        return () => {
            if (watcher) {
                watcher.remove();
            }
        };
    }, [markers, region, isLoading]);

    const getDistanceFromLatLonInMeters = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371e3; // Радиус Земли в метрах
        const x1 = (lat1 * Math.PI) / 180;
        const x2 = (lat2 * Math.PI) / 180;
        const y1 = ((lat2 - lat1) * Math.PI) / 180;
        const y2 = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(y1 / 2) * Math.sin(y1 / 2) +
            Math.cos(x1) * Math.cos(x2) * Math.sin(y2 / 2) * Math.sin(y2 / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Расстояние в метрах
    };

    const handleLongPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
       const { coordinate } = event.nativeEvent;
    
        if (!coordinate || !coordinate.latitude || !coordinate.longitude) {
            console.error("Invalid or missing coordinate data:", event.nativeEvent);
            return;
        }
    
        addMarker(coordinate.latitude, coordinate.longitude);
    };

    const handleMarkerPress = (marker: MarkerInfo) => {
        navigation.navigate('MarkerInfo', { markerId: marker.id, markerLongitude: marker.longitude, markerLatitude : marker.latitude });
    };

    
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView 
                style={styles.map}
                initialRegion={{
                    latitude: region?.coords?.latitude || 58.0,
                    longitude: region?.coords?.longitude || 56.3167,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                followsUserLocation={true}
                showsUserLocation={true}  
                onLongPress={handleLongPress}
            >
                {markers.map(marker => (
                    <Marker
                        key={marker.id}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        onPress={() => handleMarkerPress(marker)}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapComponent;