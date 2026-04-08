import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { app, safeStorage } from 'electron';

const KEY_FILE_NAME = '.lexa_db_key';

/**
 * Gets the path to the key file.
 * The key is stored in the app's userData directory (e.g. %APPDATA%/lexa-erp on Windows).
 * This file contains the encryption key, itself encrypted by the OS via Electron's safeStorage.
 */
function getKeyFilePath(): string {
    return path.join(app.getPath('userData'), KEY_FILE_NAME);
}

/**
 * Generates a cryptographically secure random 32-byte hex key.
 * Each machine gets its own unique key the first time the app runs.
 */
function generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Retrieves the database encryption key.
 *
 * How it works:
 * 1. On first run: generates a random 64-char hex key, encrypts it with the OS keychain
 *    via `safeStorage.encryptString()`, and saves the encrypted blob to disk.
 * 2. On subsequent runs: reads the encrypted blob from disk and decrypts it with
 *    `safeStorage.decryptString()`.
 *
 * This means:
 * - Every machine gets a unique key automatically.
 * - The key file is useless if copied to another machine (OS-level encryption is tied to the user/machine).
 * - No hardcoded passwords anywhere in the code.
 */
export function getDbEncryptionKey(): string {
    const keyFilePath = getKeyFilePath();

    // Check if safeStorage is available (it requires the app to be ready)
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error(
            'Electron safeStorage is not available. Cannot securely store the database encryption key.'
        );
    }

    // If a key file already exists, read and decrypt it
    if (fs.existsSync(keyFilePath)) {
        const encryptedKey = fs.readFileSync(keyFilePath);
        return safeStorage.decryptString(encryptedKey);
    }

    // First run: generate a new unique key, encrypt it, and save to disk
    const newKey = generateKey();
    const encryptedKey = safeStorage.encryptString(newKey);

    // Ensure directory exists
    const dir = path.dirname(keyFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(keyFilePath, encryptedKey);
    console.log('Generated and stored new database encryption key.');

    return newKey;
}
