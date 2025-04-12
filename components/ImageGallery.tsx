import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ImageGalleryProps {
    images: { id: number; uri: string }[];
    onLongPress: (id: number, markerId: number) => Promise<void>;
    markerId: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onLongPress, markerId }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Images</Text>
                {images.map((image) => (
                    <TouchableOpacity
                        key={image.id}
                        onLongPress={() => onLongPress(image.id, markerId)}
                        style={styles.imageContainer}
                    >
                        <Image source={{ uri: image.uri }} style={styles.image} />
                    </TouchableOpacity>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    imageContainer: {
        marginRight: 10,
    },
    image: {
        width: 100,
        height: 100,
    },
});

export default ImageGallery;