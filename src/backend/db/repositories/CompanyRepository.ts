import { getDb } from '../connection.js';
import { Company, ICompanyRepository } from "@/types";

export class CompanyRepository implements ICompanyRepository {
    async create(company: Company): Promise<number | bigint> {
        const stmt = getDb().prepare(`
      INSERT INTO companys (company_name, contract_id, extra_services)
      VALUES (?, ?, ?)
    `);
        const info = stmt.run(company.company_name, company.contract_id, company.extra_services);
        return info.lastInsertRowid;
    }

    async getById(id: number): Promise<Company | undefined> {
        return getDb().prepare('SELECT * FROM companys WHERE company_id = ?').get(id) as Company | undefined;
    }

    async getAll(): Promise<Company[]> {
        return getDb().prepare('SELECT * FROM companys').all() as Company[];
    }

    async update(id: number, company: Partial<Company>): Promise<boolean> {
        const sets: string[] = [];
        const values: any[] = [];

        if (company.company_name !== undefined) { sets.push('company_name = ?'); values.push(company.company_name); }
        if (company.contract_id !== undefined) { sets.push('contract_id = ?'); values.push(company.contract_id); }
        if (company.extra_services !== undefined) { sets.push('extra_services = ?'); values.push(company.extra_services); }

        if (sets.length === 0) return false;

        values.push(id);
        const stmt = getDb().prepare(`UPDATE companys SET ${sets.join(', ')} WHERE company_id = ?`);
        return stmt.run(...values).changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        return getDb().prepare('DELETE FROM companys WHERE company_id = ?').run(id).changes > 0;
    }
}
