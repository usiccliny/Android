import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapComponent from './components/Map';
import MarkerInfo from './components/MarkerInfo';
import { DatabaseProvider } from './contexts/DatabaseContext';
import * as Notifications from 'expo-notifications';

export type RootStackParamList = {
    Map: undefined;
    MarkerInfo: { markerId: number, markerLongitude: number, markerLatitude : number };
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    
    React.useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to send notifications was denied');
            }
        };

        requestPermissions();
    }, []);

    return (
        <DatabaseProvider>
            <NavigationContainer>
            <Stack.Navigator initialRouteName="Map">
                <Stack.Screen name="Map" component={MapComponent} />
                <Stack.Screen name="MarkerInfo" component={MarkerInfo} />
            </Stack.Navigator>
        </NavigationContainer>
        </DatabaseProvider>
    );
};

export default App;