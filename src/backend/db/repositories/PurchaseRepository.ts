import { getDb } from '../connection.js';
import { Purchase, IPurchaseRepository } from "@/types";

export class PurchaseRepository implements IPurchaseRepository {
    async create(purchase: Purchase): Promise<number | bigint> {
        const stmt = getDb().prepare(`
      INSERT INTO purchases (bill_id, item_id, quantity, price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
        const info = stmt.run(
            purchase.bill_id,
            purchase.item_id,
            purchase.quantity,
            purchase.price || null,
            purchase.total_price || null
        );
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<Purchase | undefined> {
        return getDb().prepare('SELECT * FROM purchases WHERE purchase_id = ?').get(id) as Purchase | undefined;
    }

    async getAll(): Promise<Purchase[]> {
        return getDb().prepare('SELECT * FROM purchases').all() as Purchase[];
    }

    async update(id: number, purchase: Partial<Purchase>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        const fields: (keyof Purchase)[] = ['bill_id', 'item_id', 'quantity', 'price', 'total_price'];

        fields.forEach(field => {
            if (purchase[field] !== undefined) {
                sets.push(`${field} = ?`);
                values.push(purchase[field]);
            }
        });

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE purchases SET ${sets.join(', ')} WHERE purchase_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM purchases WHERE purchase_id = ?').run(id).changes > 0;
    }
}
