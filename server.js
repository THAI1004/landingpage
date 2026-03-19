// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash Messages Setup
app.use(flash());

// Global Variables Middleware (makes flash messages available in all views)
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/videos');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file video MP4 hoặc WebM!'));
        }
    }
});

// Authentication Middleware
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user_id) {
        next();
    } else {
        res.redirect('/login');
    }
};

// ================= ROUTES ================= //

// 1. Public Landing Page
app.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        let dataQuery = 'SELECT * FROM products';
        // console.error(dataQuery);
        let countQuery = 'SELECT COUNT(*) as total FROM products';
        const queryParams = [];

        if (searchQuery) {
            dataQuery += ' WHERE title LIKE ?';
            countQuery += ' WHERE title LIKE ?';
            queryParams.push(`%${searchQuery}%`);
        }

        dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        // Execute queries
        const [countResult] = await pool.query(countQuery, queryParams);
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        const [products] = await pool.query(dataQuery, [...queryParams, limit, offset]);

        res.render('index', { 
            products, 
            currentPage: page, 
            totalPages, 
            searchQuery 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ');
    }
});

// 2. Authentication
app.get('/login', (req, res) => {
    if (req.session.user_id) return res.redirect('/admin');
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length > 0) {
            const match = await bcrypt.compare(password, users[0].password);
            if (match) {
                req.session.user_id = users[0].id;
                req.session.username = users[0].username;
                return res.redirect('/admin');
            }
        }
        res.render('login', { error: 'Sai tài khoản hoặc mật khẩu!' });
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Đã xảy ra lỗi, vui lòng thử lại.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 3. Admin Dashboard
app.get('/admin', isAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.render('admin', { products, user: req.session.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Add Product
app.get('/admin/add', isAdmin, (req, res) => {
    res.render('add', { user: req.session.username });
});

app.post('/admin/add', isAdmin, upload.single('video'), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const video_url = req.file ? '/uploads/videos/' + req.file.filename : null;

        await pool.query(
            'INSERT INTO products (title, description, video_url, tech_tags) VALUES (?, ?, ?, ?)',
            [title, description, video_url, tags]
        );
        req.flash('success', 'Đã thêm sản phẩm thành công!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Lỗi khi tải lên sản phẩm.');
        res.redirect('/admin/add');
    }
});

// Edit Product
app.get('/admin/edit/:id', isAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).send('Không tìm thấy sản phẩm');
        res.render('update', { product: products[0], user: req.session.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ');
    }
});

app.post('/admin/edit/:id', isAdmin, upload.single('video'), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        let video_url = null;
        
        if (req.file) {
            video_url = '/uploads/videos/' + req.file.filename;
            // Get old video to delete
            const [oldProds] = await pool.query('SELECT video_url FROM products WHERE id = ?', [req.params.id]);
            if (oldProds.length > 0 && oldProds[0].video_url) {
                const oldPath = path.join(__dirname, 'public', oldProds[0].video_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        if (video_url) {
            await pool.query(
                'UPDATE products SET title = ?, description = ?, tech_tags = ?, video_url = ? WHERE id = ?',
                [title, description, tags, video_url, req.params.id]
            );
        } else {
            await pool.query(
                'UPDATE products SET title = ?, description = ?, tech_tags = ? WHERE id = ?',
                [title, description, tags, req.params.id]
            );
        }
        req.flash('success', 'Đã cập nhật sản phẩm thành công!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Lỗi khi cập nhật sản phẩm.');
        res.redirect(`/admin/edit/${req.params.id}`);
    }
});

// Delete Product
app.post('/admin/delete/:id', isAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT video_url FROM products WHERE id = ?', [req.params.id]);
        if (products.length > 0 && products[0].video_url) {
            const videoPath = path.join(__dirname, 'public', products[0].video_url);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        req.flash('success', 'Đã xóa sản phẩm thành công!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Lỗi khi xóa sản phẩm.');
        res.redirect('/admin');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
