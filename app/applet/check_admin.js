import BetterSqlite3 from 'better-sqlite3';
const db = new BetterSqlite3('printex.db');
const user = db.prepare("SELECT * FROM users WHERE email = ?").get('admin');
console.log('Admin user:', user);
