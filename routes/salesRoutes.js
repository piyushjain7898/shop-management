const express = require('express');
const router = express.Router();
const db = require('../db');

const PDFDocument = require('pdfkit');
const fs = require('fs');

// GET BILL PAGE
router.get('/bill', (req, res) => {
    db.query("SELECT * FROM products", (err, products) => {
        res.render('bill', { products });
    });
});
router.post('/bill', (req, res) => {

    const { product_id, quantity } = req.body;

    db.query("SELECT * FROM products WHERE id=?", [product_id], (err, product) => {

        if (!product || product.length === 0) {
            return res.status(400).json({ error: "Product not found" });
        }

        const total = product[0].price * quantity;

        // Insert sale
        db.query(
            "INSERT INTO sales (product_id, quantity, total_price) VALUES (?, ?, ?)",
            [product_id, quantity, total]
        );

        // Update stock
        db.query(
            "UPDATE products SET quantity = quantity - ? WHERE id=?",
            [quantity, product_id]
        );

        const PDFDocument = require('pdfkit');
        const fs = require('fs');

        const doc = new PDFDocument();
        const filename = `invoice_${Date.now()}.pdf`;
        const filepath = `./public/${filename}`;

        doc.pipe(fs.createWriteStream(filepath));

        doc.fontSize(22).text("Garments Shop Invoice", { align: 'center' });
        doc.moveDown();
        doc.text(`Product: ${product[0].name}`);
        doc.text(`Price: ₹ ${product[0].price}`);
        doc.text(`Quantity: ${quantity}`);
        doc.text(`Total: ₹ ${total}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.end();

        res.json({ file: filename });

    });
});

module.exports = router;
