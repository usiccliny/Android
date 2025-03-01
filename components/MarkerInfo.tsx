// components/MarkerInfo.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult, MediaTypeOptions } from 'expo-image-picker'; // Импорт необходимых типов

interface MarkerInfoProps {
  marker: {
    id: number;
    coordinate: {
      latitude: number;
      longitude: number;
    };
  };
  onClose: () => void; // Функция для закрытия окна
}

const MarkerInfo: React.FC<MarkerInfoProps> = ({ marker, onClose }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const selectImage = async () => {
    // Запрашиваем разрешение на доступ к галерее
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    // Открываем галерею для выбора изображения
    const result: ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      // Проверка наличия assets и установка uri
      setImage(result.assets[0].uri); // Устанавливаем выбранное изображение
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marker Information</Text>
      <Text>ID: {marker.id}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter marker name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Select Image" onPress={selectImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Позиционируем абсолютно для перекрытия карты
    top: 50,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});

export default MarkerInfo;