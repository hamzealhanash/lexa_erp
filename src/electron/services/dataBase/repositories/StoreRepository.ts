import { getDb } from '../connection.js';
import { store, IStoreRepository } from "@types";

export class StoreRepository implements IStoreRepository {
    async create(store: store): Promise<number | bigint> {
        const stmt = getDb().prepare(`
      INSERT INTO stores (store_name, location)
      VALUES (?, ?)
    `);
        const info = stmt.run(store.store_name, store.location);
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<store | undefined> {
        return getDb().prepare('SELECT * FROM stores WHERE store_id = ?').get(id) as store | undefined;
    }

    async getAll(): Promise<store[]> {
        return getDb().prepare('SELECT * FROM stores').all() as store[];
    }

    async update(id: number, store: Partial<store>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        if (store.store_name !== undefined) { sets.push('store_name = ?'); values.push(store.store_name); }
        if (store.location !== undefined) { sets.push('location = ?'); values.push(store.location); }

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE stores SET ${sets.join(', ')} WHERE store_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM stores WHERE store_id = ?').run(id).changes > 0;
    }
}
