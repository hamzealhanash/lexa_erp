import { getDb } from '../connection.js';
import { itemNote, IItemNoteRepository } from "@types";

export class ItemNoteRepository implements IItemNoteRepository {
    async create(note: itemNote): Promise<string> {
        const stmt = getDb().prepare(`
      INSERT INTO item_notes (item_id, start_date, end_date, content)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(note.item_id, note.start_date, note.end_date, note.content);
        return note.item_id;
    }

    async getById(id: string): Promise<itemNote | undefined> {
        return getDb().prepare('SELECT * FROM item_notes WHERE item_id = ?').get(id) as itemNote | undefined;
    }

    async getAll(): Promise<itemNote[]> {
        return getDb().prepare('SELECT * FROM item_notes').all() as itemNote[];
    }

    async update(id: string, note: Partial<itemNote>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        if (note.item_id !== undefined) { sets.push('item_id = ?'); values.push(note.item_id); }
        if (note.start_date !== undefined) { sets.push('start_date = ?'); values.push(note.start_date); }
        if (note.end_date !== undefined) { sets.push('end_date = ?'); values.push(note.end_date); }
        if (note.content !== undefined) { sets.push('content = ?'); values.push(note.content); }

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE item_notes SET ${sets.join(', ')} WHERE item_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: string): Promise<boolean> {
        return getDb().prepare('DELETE FROM item_notes WHERE item_id = ?').run(id).changes > 0;
    }
}
