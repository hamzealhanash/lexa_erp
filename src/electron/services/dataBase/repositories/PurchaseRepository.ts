import { getDb } from '../connection.js';
import { purchase, IPurchaseRepository } from "@types";

export class PurchaseRepository implements IPurchaseRepository {
    async create(purchase: purchase): Promise<number | bigint> {
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

    async createMany(purchases: purchase[]): Promise<void> {
        const stmt = getDb().prepare(`
      INSERT INTO purchases (bill_id, item_id, quantity, price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
        const insertAll = getDb().transaction((items: purchase[]) => {
            for (const p of items) {
                stmt.run(p.bill_id, p.item_id, p.quantity, p.price || null, p.total_price || null);
            }
        });
        insertAll(purchases);
    }

    async getById(id: number): Promise<purchase | undefined> {
        return getDb().prepare('SELECT * FROM purchases WHERE purchase_id = ?').get(id) as purchase | undefined;
    }

    async getAll(): Promise<purchase[]> {
        return getDb().prepare('SELECT * FROM purchases').all() as purchase[];
    }

    async update(id: number, purchase: Partial<purchase>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        const fields: (keyof purchase)[] = ['bill_id', 'item_id', 'quantity', 'price', 'total_price'];

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
