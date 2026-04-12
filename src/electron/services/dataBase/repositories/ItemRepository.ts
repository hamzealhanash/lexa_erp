import { getDb } from '../connection.js';
import { item, IItemRepository } from "@types";

export class ItemRepository implements IItemRepository {
    async create(item: item): Promise<string> {
        const stmt = getDb().prepare(`
      INSERT INTO items (item_id, item_name, price, company_id)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(item.item_id, item.item_name, item.price, item.company_id);
        return item.item_id as string;
    }

    async getById(id: string): Promise<item | undefined> {
        return getDb().prepare('SELECT * FROM items WHERE item_id = ?').get(id) as item | undefined;
    }

    async getAll(): Promise<item[]> {
        return getDb().prepare('SELECT * FROM items').all() as item[];
    }

    async update(id: string, item: Partial<item>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        if (item.item_name !== undefined) { sets.push('item_name = ?'); values.push(item.item_name); }
        if (item.price !== undefined) { sets.push('price = ?'); values.push(item.price); }
        if (item.company_id !== undefined) { sets.push('company_id = ?'); values.push(item.company_id); }

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE items SET ${sets.join(', ')} WHERE item_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: string): Promise<boolean> {
        return getDb().prepare('DELETE FROM items WHERE item_id = ?').run(id).changes > 0;
    }
}
