import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { MarkerInfo} from '../types';

interface DatabaseContextType {
    markers: MarkerInfo[];
    images: {id:number, uri:string}[];
    loading: boolean;
    error: string | null;
    addMarker: (latitude: number, longitude: number) => Promise<void>;
    removeMarker: (id: number) => Promise<void>;
    addImage: (markerId: number, uri: string) => Promise<void>;
    removeImage: (id: number, markerId: number) => Promise<void>;
    fetchMarkers: () => Promise<MarkerInfo[]>;
    fetchImages: (markerId: number) => Promise<{ id: number; uri: string }[]>;
}

interface DatabaseProviderProps {
    children: React.ReactNode;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
    const [markers, setMarkers] = useState<MarkerInfo[]>([]);
    const [images, setImages] = useState<{id:number, uri:string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [db, setDb] = useState< SQLite.SQLiteDatabase | null>(null);

    useEffect(() => {
        const initDb = async () => {
            try {
                const database = await SQLite.openDatabaseAsync('markers.db');
                setDb(database);

                const createTables = `
                    CREATE TABLE IF NOT EXISTS markers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        marker_name TEXT,
                        latitude REAL NOT NULL,
                        longitude REAL NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS marker_images (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        marker_id INTEGER NOT NULL,
                        uri TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
                    );
                `;
                await database.execAsync(createTables);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            } finally {
                setLoading(false);
            }
        };

        initDb();
    }, []);

    useEffect(() => {
        if (db) {
            fetchMarkers();
        }
    }, [db]);

    const fetchMarkers = async (): Promise<MarkerInfo[]> => {
        if (!db) {
            return []; 
        }
    
        try {
            const result = await db.getAllAsync('SELECT * FROM markers');
    
            const fetchedMarkers = result as MarkerInfo[];
            setMarkers(fetchedMarkers);
    
            return fetchedMarkers; 
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            return []; 
        }
    };

    const addMarker = async (latitude: number, longitude: number) => {
        if (!db) {
            return;
        }
    
        try {
            await db.runAsync(
                'INSERT INTO markers (latitude, longitude) VALUES (?, ?);',
                [latitude, longitude]
            );
            await fetchMarkers();
        } catch (err) {
            setError('Не удалось добавить маркер');
        }
    };

    const removeMarker = async (id: number) => {
        if (!db) return;

        try {
            await db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
            await fetchMarkers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        }
    };

    const addImage = async (markerId: number, uri: string) => {
        if (!db) return;

        try {
            await db.runAsync('INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)', [markerId, uri]);
            await fetchImages(markerId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        }
    };

    const removeImage = async (id: number, markerId: number) => {
        if (!db) return;
    
        try {
            await db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
    
            await fetchImages(markerId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        }
    };

    const fetchImages = async (markerId: number) => {
        if (!db) return [];
    
        try {
            const result = await db.getAllAsync('SELECT id, uri FROM marker_images WHERE marker_id = ?',[markerId]);
    
            if (!result || result.length === 0) return [];
    
            const imagesWithIds = result.map((row: any) => ({
                id: row.id,
                uri: row.uri,
            }));

            setImages(imagesWithIds);
    
            return imagesWithIds;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            return [];
        }
    };

    return (
        <DatabaseContext.Provider
            value={{
                markers,
                images,
                loading,
                error,
                addMarker,
                removeMarker,
                addImage,
                removeImage,
                fetchMarkers,
                fetchImages,
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};