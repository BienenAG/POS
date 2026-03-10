// Konfiguration für Upstash Redis mit LV_URL_-Variablen
import { createClient } from 'redis';

let kvClient = null;

export function getKvClient() {
    if (!kvClient) {
        // Verwende die LV_URL_-Variablen statt der Standard-KV_-Variablen
        const redisUrl = process.env.LV_URL_REDIS_URL || process.env.LV_URL_KV_URL;
        
        if (!redisUrl) {
            throw new Error('Redis URL nicht gefunden. Bitte stelle sicher, dass LV_URL_REDIS_URL oder LV_URL_KV_URL gesetzt ist.');
        }

        kvClient = createClient({
            url: redisUrl
        });

        kvClient.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        kvClient.connect().catch((err) => {
            console.error('Fehler beim Verbinden mit Redis:', err);
        });
    }

    return kvClient;
}

// Wrapper-Funktionen für einfache Kompatibilität
export const kv = {
    async get(key) {
        const client = getKvClient();
        try {
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Fehler beim Abrufen von ${key}:`, error);
            return null;
        }
    },

    async set(key, value, options = {}) {
        const client = getKvClient();
        try {
            const serialized = JSON.stringify(value);
            if (options.ex) {
                // ex = expire in seconds
                await client.setEx(key, options.ex, serialized);
            } else {
                await client.set(key, serialized);
            }
        } catch (error) {
            console.error(`Fehler beim Speichern von ${key}:`, error);
        }
    },

    async del(key) {
        const client = getKvClient();
        try {
            await client.del(key);
        } catch (error) {
            console.error(`Fehler beim Löschen von ${key}:`, error);
        }
    }
};
