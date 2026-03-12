const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


// DASHBOARD
router.get('/dashboard', (req, res) => {

    db.query("SELECT COUNT(*) AS totalProducts FROM products", (err, p) => {
        db.query("SELECT COUNT(*) AS totalSales FROM sales", (err, s) => {
            db.query("SELECT SUM(total_price) AS revenue FROM sales", (err, r) => {

                db.query(`
                    SELECT DATE(sale_date) as date,
                    SUM(total_price) as dailyTotal
                    FROM sales
                    GROUP BY DATE(sale_date)
                `, (err, chartData) => {

                    // Top 4 products
                    db.query("SELECT * FROM products ORDER BY id DESC LIMIT 4",
                        (err, topProducts) => {

                            res.render('dashboard', {
                                products: p[0].totalProducts,
                                sales: s[0].totalSales,
                                revenue: r[0].revenue || 0,
                                chartData,
                                topProducts
                            });

                        });

                });

            });
        });
    });
});


// PRODUCTS PAGE
router.get('/products', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        res.render('products', { products: results });
    });
});


// ADD PRODUCT PAGE
router.get('/add-product', (req, res) => {
    res.render('addProduct');
});


// ADD PRODUCT (WITH IMAGE)
router.post('/add-product', upload.single('image'), (req, res) => {

    const { name, category, size, price, quantity } = req.body;
    const image = req.file ? req.file.filename : null;

    db.query(
        "INSERT INTO products (name, category, size, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)",
        [name, category, size, price, quantity, image],
        () => res.redirect('/products')
    );
});
// Edit page
router.get('/edit-product/:id', (req, res) => {
    db.query("SELECT * FROM products WHERE id=?", 
    [req.params.id], 
    (err, result) => {
        res.render('editProduct', { product: result[0] });
    });
});

// Update
router.post('/edit-product/:id', (req, res) => {
    const { name, category, size, price, quantity } = req.body;

    db.query(
        "UPDATE products SET name=?, category=?, size=?, price=?, quantity=? WHERE id=?",
        [name, category, size, price, quantity, req.params.id],
        () => res.redirect('/products')
    );
});
// RESET SALES DATA
router.get('/reset-sales', (req, res) => {

    db.query("DELETE FROM sales", (err) => {
        if (err) {
            console.log(err);
            return res.send("Error resetting sales");
        }

        db.query("ALTER TABLE sales AUTO_INCREMENT = 1");

        res.redirect('/dashboard');
    });

});


// Delete
router.get('/delete-product/:id', (req, res) => {
    db.query("DELETE FROM products WHERE id=?", 
    [req.params.id], 
    () => res.redirect('/products'));
});


module.exports = router;
