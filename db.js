const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "H@numanji789887",
    database: "garments_shop"
});

db.connect(err => {
    if (err) {
        console.log("Database Connection Failed");
    } else {
        console.log("Database Connected");
    }
});

module.exports = db;
