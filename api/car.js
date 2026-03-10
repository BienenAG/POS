import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { cartId } = req.query;

    if (!cartId) {
        return res.status(400).json({ message: 'cartId ist erforderlich.' });
    }

    try {
        if (req.method === 'GET') {
            const cart = await kv.get(`cart:${cartId}`);
            if (cart) {
                return res.status(200).json(cart);
            } else {
                // Leeren Warenkorb zurückgeben, wenn keiner gefunden wird
                const emptyCart = {
                    cart: [],
                    depositReturn: 0,
                    receivedAmount: 0,
                    subtotal: 0,
                    total: 0,
                    isCheckout: false,
                    isFinished: false
                };
                return res.status(200).json(emptyCart);
            }
        }

        if (req.method === 'POST') {
            const newCart = req.body;
            
            // Erweiterte Validierung der Warenkorb-Daten
            const cartData = {
                cart: newCart.cart || [],
                depositReturn: newCart.depositReturn || 0,
                receivedAmount: newCart.receivedAmount || 0,
                subtotal: newCart.subtotal || 0,
                total: newCart.total || 0,
                isCheckout: newCart.isCheckout || false,
                isFinished: newCart.isFinished || false,
                lastUpdated: new Date().toISOString()
            };

            // Warenkorb mit 1 Stunde Ablaufzeit speichern
            await kv.set(`cart:${cartId}`, cartData, { ex: 3600 });
            
            return res.status(200).json({ message: 'Warenkorb erfolgreich aktualisiert.' });
        }

        if (req.method === 'DELETE') {
            // Warenkorb löschen
            await kv.del(`cart:${cartId}`);
            return res.status(200).json({ message: 'Warenkorb erfolgreich gelöscht.' });
        }

        return res.status(405).json({ message: 'Methode nicht erlaubt.' });
    } catch (error) {
        console.error("Fehler in der Cart-API-Route:", error);
        return res.status(500).json({ message: 'Interner Server-Fehler' });
    }
}
