import { getDb } from '../connection.js';
import { collection, ICollectionRepository } from "@types";

export class CollectionRepository implements ICollectionRepository {
    async create(collection: collection): Promise<number | bigint> {
        let storeId = collection.store_id;

        // If store_id is missing, try to resolve it from the bill
        if (!storeId && collection.bill_id) {
            const bill = getDb().prepare('SELECT store_id FROM bills WHERE bill_id = ?').get(collection.bill_id) as { store_id: number } | undefined;
            if (bill) {
                storeId = bill.store_id;
            }
        }

        const stmt = getDb().prepare(`
      INSERT INTO collection (payment_date, bill_id, store_id, amount_total, amount_received, delivery_status, collection_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const info = stmt.run(
            collection.payment_date,
            collection.bill_id,
            storeId || 1,
            collection.amount_total,
            collection.amount_received,
            collection.delivery_status,
            collection.collection_status
        );
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<collection | undefined> {
        return getDb().prepare('SELECT * FROM collection WHERE payment_id = ?').get(id) as collection | undefined;
    }

    async getAll(): Promise<collection[]> {
        return getDb().prepare('SELECT * FROM collection').all() as collection[];
    }

    async update(id: number, collection: Partial<collection>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        const editableFields: (keyof collection)[] = [
            'payment_date', 'bill_id', 'store_id', 'amount_total', 'amount_received', 'delivery_status', 'collection_status'
        ];

        editableFields.forEach(field => {
            if (collection[field] !== undefined) {
                sets.push(`${field} = ?`);
                values.push(field === 'delivery_status' || field === 'collection_status' ? Number(collection[field]) : collection[field]);
            }
        });

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE collection SET ${sets.join(', ')} WHERE payment_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM collection WHERE payment_id = ?').run(id).changes > 0;
    }
}
