import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';
import { isDev } from '../../utils.js';
import { getDbEncryptionKey } from './keyManager.js';

// ─── Database Path ───────────────────────────────────────────────────────────
let dbPath: string;
try {
    if (isDev()) {
        dbPath = path.join(app.getAppPath(), 'modular_DataBase.db');
    } else {
        dbPath = path.join(app.getPath('userData'), 'modular_DataBase.db');
    }
} catch (e) {
    dbPath = path.join(app.getAppPath(), 'modular_DataBase.db');
}

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// ─── Lazy-initialized encrypted database ────────────────────────────────────
let db: Database.Database | null = null;


/**
 * Initializes the encrypted database connection.
 * MUST be called after app.whenReady() since safeStorage requires it.
 *
 * This function:
 * 1. Gets/generates a unique encryption key for this machine
 * 2. Migrates an existing unencrypted DB if found
 * 3. Opens the encrypted database
 */
export function initConnection(): Database.Database {
    if (db) return db;

    const encryptionKey = getDbEncryptionKey();

    // ─── Migration Logic ─────────────────────────────────────────────────────
    if (fs.existsSync(dbPath)) {
        // Check if the database is currently unencrypted
        const checkDb = new Database(dbPath);
        let isUnencrypted = false;
        try {
            // An unencrypted DB will allow reading the schema_version without a key
            checkDb.pragma('schema_version');
            isUnencrypted = true;
        } catch (e) {
            // If it throws "file is not a database", it's likely already encrypted
        } finally {
            checkDb.close();
        }

        if (isUnencrypted) {
            console.log('Unencrypted database detected. Migrating to encrypted...');
            const tempPath = dbPath + '.tmp';
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            fs.renameSync(dbPath, tempPath);

            // Create a new encrypted database and export data into it
            const encryptedDb = new Database(dbPath);
            // Use x'...' for raw hex keys
            encryptedDb.pragma(`key = "x'${encryptionKey}'"`);
            encryptedDb.pragma(`ATTACH DATABASE '${tempPath.replace(/'/g, "''")}' AS plaintext KEY ''`);
            encryptedDb.pragma("SELECT sqlcipher_export('main', 'plaintext')");
            encryptedDb.pragma("DETACH DATABASE plaintext");
            encryptedDb.close();

            fs.unlinkSync(tempPath);
            console.log('Migration to encrypted database successful.');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Open the database
    if (isDev()) {
        db = new Database(dbPath, { verbose: console.log });
        console.log('Database path:', dbPath);
    } else {
        db = new Database(dbPath);
    }

    // Apply encryption key FIRST
    // Use x'...' format to tell SQLCipher this is a raw hex key, not a passphrase string
    db.pragma(`key = "x'${encryptionKey}'"`);

    // Database settings
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    return db;
}

/**
 * Returns the active database instance.
 * Throws if initConnection() hasn't been called yet.
 */
export function getDb(): Database.Database {
    if (!db) {
        throw new Error('Database not initialized. Call initConnection() first after app.whenReady().');
    }
    return db;
}

// ─── Schema Initialization ──────────────────────────────────────────────────
export const initDb = () => {
    const database = getDb();
    const schema = `
    -- contracts definition
    CREATE TABLE IF NOT EXISTS contracts (
        contract_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        contract_name TEXT,
        percentage INTEGER NOT NULL
    );

    -- stores definition
    CREATE TABLE IF NOT EXISTS stores (
        store_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        store_name TEXT NOT NULL,
        location TEXT
    );

    -- bills definition
    CREATE TABLE IF NOT EXISTS bills (
        bill_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        issue_date TEXT NOT NULL,
        location TEXT,
        total_bill INTEGER NOT NULL DEFAULT 0,
        total_quantity INTEGER NOT NULL DEFAULT 0,
        store_id INTEGER NOT NULL,
        seller TEXT,
        FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- collection definition
    CREATE TABLE IF NOT EXISTS collection (
        payment_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        payment_date TEXT NOT NULL,
        bill_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        amount_total INTEGER NOT NULL,
        amount_received INTEGER NOT NULL DEFAULT 0,
        amount_remaining INTEGER GENERATED ALWAYS AS (amount_total - amount_received) VIRTUAL,
        delivery_status TEXT NOT NULL,
        collection_status TEXT NOT NULL,
        FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- companys definition
    CREATE TABLE IF NOT EXISTS companys (
        company_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        contract_id INTEGER NOT NULL,
        extra_services TEXT,
        CONSTRAINT company_contracts_FK FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
    );

    -- items definition
    CREATE TABLE IF NOT EXISTS items (
        item_id TEXT NOT NULL PRIMARY KEY,
        item_name TEXT NOT NULL,
        price INTEGER DEFAULT (0),
        company_id INTEGER NOT NULL,
        CONSTRAINT items_companys_FK FOREIGN KEY (company_id) REFERENCES companys(company_id) ON DELETE CASCADE
    );

    -- purchases definition
    CREATE TABLE IF NOT EXISTS purchases (
        purchase_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER,
        total_price INTEGER,
        FOREIGN KEY (item_id) REFERENCES items(item_id),
        FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- item_notes definition
    CREATE TABLE IF NOT EXISTS item_notes (
        item_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        content TEXT,
        PRIMARY KEY (item_id, start_date, end_date),
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
    );

    -- Views
    DROP VIEW IF EXISTS view_records;
    CREATE VIEW view_records AS
    SELECT 
    b.bill_id,
    b.total_quantity AS quantity,
    b.issue_date,
    s.store_name,
    b.total_bill,
    c.delivery_status,
    c.collection_status
    FROM bills b
    JOIN stores s ON b.store_id = s.store_id
    LEFT JOIN collection c ON b.bill_id = c.bill_id;

    DROP VIEW IF EXISTS view_sales;
    CREATE VIEW view_sales AS
    SELECT 
        i.item_id, 
        i.item_name AS item, 
        p.quantity, 
        p.price, 
        p.total_price, 
        b.bill_id, 
        comp.company_id, 
        comp.company_name, 
        b.issue_date
    FROM purchases p
    JOIN items i ON p.item_id = i.item_id
    JOIN bills b ON p.bill_id = b.bill_id
    JOIN companys comp ON i.company_id = comp.company_id;

    DROP VIEW IF EXISTS view_items_sales;
    CREATE VIEW view_items_sales AS
    SELECT i.item_id, i.item_name AS item, SUM(p.quantity) AS total_quantity, p.price, SUM(p.total_price) AS total_revenue, b.issue_date, n.content AS note
    FROM items i
    JOIN purchases p ON i.item_id = p.item_id
    JOIN bills b ON p.bill_id = b.bill_id
    LEFT JOIN item_notes n ON (i.item_id = n.item_id AND b.issue_date BETWEEN n.start_date AND n.end_date)
    GROUP BY i.item_id, b.issue_date;
    `;

    database.exec(schema);
};
