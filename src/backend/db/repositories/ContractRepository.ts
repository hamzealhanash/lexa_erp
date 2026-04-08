import { getDb } from '../connection.js';
import { Contract, IContractRepository } from "@/types";

export class ContractRepository implements IContractRepository {
    async create(contract: Contract): Promise<number | bigint> {
        const stmt = getDb().prepare(`
      INSERT INTO contracts (contract_name, percentage)
      VALUES (?, ?)
    `);
        const info = stmt.run(contract.contract_name, contract.percentage);
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<Contract | undefined> {
        return getDb().prepare('SELECT * FROM contracts WHERE contract_id = ?').get(id) as Contract | undefined;
    }

    async getAll(): Promise<Contract[]> {
        return getDb().prepare('SELECT * FROM contracts').all() as Contract[];
    }

    async update(id: number, contract: Partial<Contract>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        if (contract.contract_name !== undefined) { sets.push('contract_name = ?'); values.push(contract.contract_name); }
        if (contract.percentage !== undefined) { sets.push('percentage = ?'); values.push(contract.percentage); }

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE contracts SET ${sets.join(', ')} WHERE contract_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM contracts WHERE contract_id = ?').run(id).changes > 0;
    }
}
