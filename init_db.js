const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDB() {
    try {
        // Connect without database selected first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server.');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ai_showcase'}\`;`);
        console.log('Database ensured.');

        // Switch to the database
        await connection.query(`USE \`${process.env.DB_NAME || 'ai_showcase'}\`;`);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100)
            );
        `);
        console.log('Table users ensured.');

        // Create products table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_url VARCHAR(255),
                thumbnail_url VARCHAR(255),
                tech_tags VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table products ensured.');

        // Insert default admin if not exists
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query('INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)', ['admin', hashedPassword, 'System Administrator']);
            console.log('Default admin account created (admin / admin123).');
        } else {
            console.log('Admin account already exists.');
        }

        await connection.end();
        console.log('Database initialization completed successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

initDB();
