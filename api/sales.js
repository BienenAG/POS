import { kv } from '@vercel/kv';

const SALES_KEY = 'sales';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // Abrufen aller Verkäufe
            let sales = await kv.get(SALES_KEY);
            if (!sales) {
                sales = [];
            }
            return res.status(200).json(sales);
        }

        if (req.method === 'POST') {
            // Neuen Verkauf hinzufügen
            const newSale = req.body;
            
            // Validierung der Verkaufsdaten
            if (!newSale.items || !Array.isArray(newSale.items) || newSale.items.length === 0) {
                return res.status(400).json({ message: 'Verkaufsdaten sind ungültig.' });
            }

            // Eindeutige ID für den Verkauf generieren
            const saleId = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            // Verkaufsdaten mit Metadaten erweitern
            const saleData = {
                _id: saleId,
                items: newSale.items,
                subtotal: newSale.subtotal || 0,
                depositReturn: newSale.depositReturn || 0,
                total: newSale.total || 0,
                receivedAmount: newSale.receivedAmount || 0,
                change: (newSale.receivedAmount || 0) - (newSale.total || 0),
                cartId: newSale.cartId || '',
                createdAt: new Date().toISOString(),
                cancelled: false
            };

            // Bestehende Verkäufe abrufen
            let sales = await kv.get(SALES_KEY);
            if (!sales) {
                sales = [];
            }

            // Neuen Verkauf hinzufügen
            sales.push(saleData);

            // Verkäufe speichern
            await kv.set(SALES_KEY, sales);

            return res.status(201).json(saleData);
        }

        if (req.method === 'DELETE') {
            // Verkauf stornieren
            const { id } = req.query;
            
            if (!id) {
                return res.status(400).json({ message: 'Verkaufs-ID ist erforderlich.' });
            }

            // Bestehende Verkäufe abrufen
            let sales = await kv.get(SALES_KEY);
            if (!sales) {
                return res.status(404).json({ message: 'Verkauf nicht gefunden.' });
            }

            // Verkauf finden und als storniert markieren
            const saleIndex = sales.findIndex(sale => sale._id === id);
            if (saleIndex === -1) {
                return res.status(404).json({ message: 'Verkauf nicht gefunden.' });
            }

            // Verkauf als storniert markieren statt zu löschen
            sales[saleIndex].cancelled = true;
            sales[saleIndex].cancelledAt = new Date().toISOString();

            // Aktualisierte Verkäufe speichern
            await kv.set(SALES_KEY, sales);

            return res.status(200).json({ message: 'Verkauf erfolgreich storniert.' });
        }

        return res.status(405).json({ message: 'Methode nicht erlaubt.' });
    } catch (error) {
        console.error("Fehler in der Sales-API-Route:", error);
        return res.status(500).json({ message: 'Interner Server-Fehler' });
    }
}
