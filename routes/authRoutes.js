const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM admin WHERE username=? AND password=?",
        [username, password],
        (err, result) => {
            if (result.length > 0) {
                req.session.user = username;
                res.redirect('/dashboard');
            } else {
                res.send("Invalid Credentials");
            }
        });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
