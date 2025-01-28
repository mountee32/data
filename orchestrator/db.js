const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(
            path.join(__dirname, '..', 'db', 'banking.db'),
            sqlite3.OPEN_READWRITE,
            (err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    throw err;
                }
            }
        );
    }

    // Authentication methods
    async validateCredentials(accountNumber, code) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM customers WHERE account_number = ? AND online_banking_code = ?',
                [accountNumber, code],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async createSession(sessionToken, accountNumber) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO sessions (token, customer_id, is_valid) VALUES (?, ?, 1)',
                [sessionToken, accountNumber],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async validateSession(token) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT customer_id FROM sessions WHERE token = ? AND is_valid = 1',
                [token],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    // Chat history methods
    async storeMessage(sessionId, customerId, message, isBot) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO chat_history (session_id, customer_id, message, is_bot) VALUES (?, ?, ?, ?)',
                [sessionId, customerId, message, isBot ? 1 : 0],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getRecentMessages(sessionId, limit = 5) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM chat_history WHERE session_id = ? ORDER BY id DESC LIMIT ?',
                [sessionId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // Banking data methods
    async getCustomerAccounts(customerId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM accounts WHERE customer_id = ? AND is_active = 1',
                [customerId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    async getAccountTransactions(accountId, limit = 5) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT ?',
                [accountId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // Utility methods
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = new Database();