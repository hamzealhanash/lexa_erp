import Database from 'better-sqlite3-multiple-ciphers';
import fs from 'fs';

const dbFile = 'test_unencrypted.db';
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);

// 1. Create a plain DB
const db1 = new Database(dbFile);
db1.exec('CREATE TABLE test (name TEXT); INSERT INTO test VALUES ("hamze");');
db1.close();

console.log('Plain DB created.');

// 2. Open it, then rekey (encrypt) it
const db2 = new Database(dbFile);
db2.pragma(`rekey='mysecret'`);
db2.close();

console.log('DB rekeyed (encrypted).');

// 3. Try to open it WITHOUT key (should fail or result in unreadable db)
try {
  const db3 = new Database(dbFile);
  db3.prepare('SELECT * FROM test').all();
  console.log('Opened without key?! This means it did NOT encrypt.');
} catch (e) {
  console.log('Failed to open plain (Expected):', e.message);
}

// 4. Try to open it WITH key
try {
  const db4 = new Database(dbFile);
  db4.pragma(`key='mysecret'`);
  const rows = db4.prepare('SELECT * FROM test').all();
  console.log('Opened with key! Rows:', rows);
} catch (e) {
  console.log('Failed to open encrypted:', e.message);
}
