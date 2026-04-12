import { getDb } from '../connection.js';
import { bill, IBillRepository } from "@types";

export class BillRepository implements IBillRepository {
    async create(bill: bill): Promise<number | bigint> {
        let storeId = bill.store_id;

        if (!storeId && bill.store_name) {
            const existingStore = getDb().prepare('SELECT store_id FROM stores WHERE store_name = ?').get(bill.store_name) as { store_id: number } | undefined;
            if (existingStore) {
                storeId = existingStore.store_id;
            } else {
                const storeInfo = getDb().prepare('INSERT INTO stores (store_name) VALUES (?)').run(bill.store_name);
                storeId = storeInfo.lastInsertRowid as number;
            }
        }

        const stmt = getDb().prepare(`
      INSERT INTO bills (issue_date, location, total_bill, total_quantity, store_id, seller)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const info = stmt.run(
            bill.issue_date,
            bill.location || null,
            bill.total_bill,
            bill.total_quantity,
            storeId || 1,
            bill.seller || null
        );
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<bill | undefined> {
        return getDb().prepare('SELECT bills.*, stores.store_name FROM bills LEFT JOIN stores ON bills.store_id = stores.store_id WHERE bills.bill_id = ?').get(id) as bill | undefined;
    }

    async getAll(): Promise<bill[]> {
        return getDb().prepare('SELECT bills.*, stores.store_name FROM bills LEFT JOIN stores ON bills.store_id = stores.store_id').all() as bill[];
    }

    async update(id: number, bill: Partial<bill>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        const fields: (keyof bill)[] = ['issue_date', 'location', 'total_bill', 'total_quantity', 'store_id', 'seller'];

        fields.forEach(field => {
            if (bill[field] !== undefined) {
                sets.push(`${field} = ?`);
                values.push(bill[field]);
            }
        });

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE bills SET ${sets.join(', ')} WHERE bill_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM bills WHERE bill_id = ?').run(id).changes > 0;
    }
}
