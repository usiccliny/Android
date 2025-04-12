import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useDatabase } from '../contexts/DatabaseContext';
import ImageGallery from './ImageGallery';

interface MarkerInfoProps {
    route: RouteProp<RootStackParamList, 'MarkerInfo'>;
    navigation: StackNavigationProp<RootStackParamList, 'MarkerInfo'>;
}

const MarkerInfo: React.FC<MarkerInfoProps> = ({ route, navigation }) => {
    const { markerId } = route.params;
    const { markerLongitude } = route.params;
    const { markerLatitude } = route.params;
    const [imageUris, setImageUris] = useState<{ id: number; uri: string }[]>([]);
    const { removeMarker, addImage, fetchImages, removeImage } = useDatabase();

    useEffect(() => {
        const loadImages = async () => {
            const result = await fetchImages(markerId);
            setImageUris(result);
        };

        loadImages();
    }, [imageUris, fetchImages]);

    const selectImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
          });
    
        if (!result.canceled && result.assets) {
            await addImage(markerId, result.assets[0].uri);
        }
    };

    const handleDelete = async () => {
        try {
            await removeMarker(markerId);

            navigation.goBack();
        } catch (error) {
            console.error('Error deleting marker:', error);
            Alert.alert('Error', 'Failed to delete marker.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Marker Information</Text>
            <Text>ID: {markerId}</Text>
            <Text>Координаты: {markerLatitude} : {markerLongitude}</Text>
            <Button title="Select Image" onPress={selectImage} />
            <ImageGallery
                images={imageUris}
                onLongPress={removeImage}
                markerId={markerId}
            />
            <View style={styles.buttonContainer}>
                <Button title="Close" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Delete" onPress={handleDelete} />
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 10,
    },
});

export default MarkerInfo;