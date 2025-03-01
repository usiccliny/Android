// components/Map.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MarkerInfo from './MarkerInfo';

const MapComponent = () => {
  const [markers, setMarkers] = useState<{ id: number; coordinate: { latitude: number; longitude: number }; name?: string }[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedMarker, setSelectedMarker] = useState<{ id: number; coordinate: { latitude: number; longitude: number }; name?: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleLongPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const newMarker = {
      id: markers.length + 1,
      coordinate,
    };
    setMarkers(prevMarkers => [...prevMarkers, newMarker]); // Добавляем маркер в состояние
  };

  const handleMarkerPress = (marker: { id: number; coordinate: { latitude: number; longitude: number }; name?: string }) => {
    setSelectedMarker(marker);
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={region} 
        onLongPress={handleLongPress} // Добавляем обработчик долгого нажатия
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)} // Обработчик нажатия на маркер
          />
        ))}
      </MapView>
      
      {selectedMarker && (
        <MarkerInfo
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      )}
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
});

export default MapComponent;