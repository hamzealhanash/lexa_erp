import { getDb } from './connection.js';

export default class dbController {
    getAllItems = () => {
        return getDb().prepare(`
            SELECT 
                i.item_id, 
                i.item_name, 
                i.price, 
                c.company_name
            FROM items i
            LEFT JOIN companys c ON i.company_id = c.company_id
        `).all();
    };
    getRecords = () => {
        return getDb().prepare('SELECT * FROM view_records ORDER BY issue_date DESC').all();
    };
    getCompanySales = (dateFilterType: 'daily' | 'weekly' | 'monthly') => {
        // Define the SQLite strftime format based on the period type
        let periodFormat: string;
        if (dateFilterType === 'daily') {
            periodFormat = '%Y/%m/%d';      // e.g. 2024-03-08
        } else if (dateFilterType === 'weekly') {
            periodFormat = '%Y/W%W';        // e.g. 2024-W10 (W10 = 10th week of the year)
        } else if (dateFilterType === 'monthly') {
            periodFormat = '%Y/%m';         // e.g. 2024-03
        } else {
            throw new Error('Invalid dateFilterType');
        }

        // Query: Group by both the Period and the Item
        const rows = getDb().prepare(`
        SELECT 
            strftime(?, issue_date) as period,
            item_id, item, company_id, company_name, price,
            SUM(quantity) as quantity, 
            SUM(total_price) as total_price,
            GROUP_CONCAT(DISTINCT bill_id) as bills
        FROM view_sales 
        GROUP BY period, item_id
        ORDER BY period DESC, company_name ASC, item ASC
    `).all(periodFormat) as any[];
        return rows;
    };
    getItemSales = (startDate: string, endDate: string) => {
        return getDb().prepare('SELECT * FROM view_items_sales WHERE issue_date BETWEEN ? AND ?')
            .all(startDate, endDate);
    };
    saveItemNote = (itemId: string, startDate: string, endDate: string, content: string) => {
        const stmt = getDb().prepare(`
        INSERT INTO item_notes (item_id, start_date, end_date, content)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(item_id, start_date, end_date) DO UPDATE SET content = excluded.content
    `);
        return stmt.run(itemId, startDate, endDate, content);
    };
}
