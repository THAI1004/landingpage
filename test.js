const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT, // 👈 rất quan trọng
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Connected to MySQL (XAMPP)');
        await connection.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testDB();