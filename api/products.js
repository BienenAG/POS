import { kv } from '@vercel/kv';

const mockProducts = [
    { id: 1, name: "Wasserflasche", price: 1.50, color: '#FFB6C1' },
    { id: 2, name: "Apfelsaft", price: 2.20, color: '#FFDAB9' },
    { id: 3, name: "Käsebrötchen", price: 3.50, color: '#FFFFE0' },
    { id: 4, name: "Schokoriegel", price: 1.10, color: '#E0FFDE' },
    { id: 5, name: "Joghurt", price: 0.90, color: '#B0E0E6' },
    { id: 6, name: "Kaffee", price: 2.00, color: '#ADD8E6' },
    { id: 7, name: "Salatbox", price: 4.80, color: '#E6E6FA' },
    { id: 8, name: "Milch", price: 1.20, color: '#D8BFD8' },
    { id: 9, name: "Kaugummi", price: 0.75, color: '#FFFACD' },
    { id: 10, name: "Eistee", price: 2.50, color: '#FFB6C1' },
    { id: 11, name: "Brezel", price: 1.80, color: '#FFDAB9' },
    { id: 12, name: "Brot", price: 3.00, color: '#FFFFE0' },
    { id: 13, name: "Kekse", price: 1.90, color: '#E0FFDE' },
    { id: 14, name: "Mineralwasser", price: 1.60, color: '#B0E0E6' },
    { id: 15, name: "Muffin", price: 2.10, color: '#ADD8E6' },
    { id: 16, name: "Gummibärchen", price: 1.30, color: '#E6E6FA' }
];

const PRODUCTS_KEY = 'products';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            let products = await kv.get(PRODUCTS_KEY);
            if (!products || products.length === 0) {
                products = mockProducts;
                await kv.set(PRODUCTS_KEY, products);
            }
            return res.status(200).json(products);
        }

        if (req.method === 'POST') {
            const newProducts = req.body;
            
            // Validierung der Produktdaten
            if (!Array.isArray(newProducts)) {
                return res.status(400).json({ message: 'Produktdaten müssen ein Array sein.' });
            }

            // Validierung jedes Produkts
            for (const product of newProducts) {
                if (!product.id || !product.name || typeof product.price !== 'number' || !product.color) {
                    return res.status(400).json({ message: 'Ungültige Produktdaten gefunden.' });
                }
            }

            await kv.set(PRODUCTS_KEY, newProducts);
            return res.status(200).json({ message: 'Produkte erfolgreich gespeichert.' });
        }

        return res.status(405).json({ message: 'Methode nicht erlaubt.' });
    } catch (error) {
        console.error("Fehler in der Products-API-Route:", error);
        return res.status(500).json({ message: 'Interner Server-Fehler' });
    }
}
