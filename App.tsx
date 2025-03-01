import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MapComponent from './components/Map'; // Убедитесь, что путь правильный

const App: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <MapComponent />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;