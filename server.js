const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true
}));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');

app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', salesRoutes);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
