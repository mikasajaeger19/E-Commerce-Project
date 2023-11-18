
const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'naeem',
    password: 'naeem',
    database: 'e_commerce'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Get all products
router.get('/', (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;

    let startValue, endValue;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = (page * limit);
    } else {
        startValue = 0;
        endValue = 10;
    }

    const query = `
        SELECT c.title as category, p.title as name, p.price, p.image, p.id
        FROM products p
        JOIN categories c ON c.id = p.cat_id
        ORDER BY p.id ASC
        LIMIT ${startValue}, ${endValue}
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (rows.length > 0) {
            res.status(200).json({
                count: rows.length,
                products: rows
            });
        } else {
            res.json({ message: 'No products found' });
        }
    });
});

//get products from a category
router.get('/:catName', (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;

    let startValue, endValue;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = (page * limit);
    } else {
        startValue = 0;
        endValue = 10;
    }

    let catName = req.params.catName;

    const query = `
    SELECT c.title as category, p.title as name, p.price, p.image, p.id
    FROM products as p
    JOIN categories as c ON c.id = p.cat_id
    WHERE c.title LIKE '%${catName}%'
    ORDER BY p.id ASC
    LIMIT ${startValue}, ${limit};
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (rows.length > 0) {
            res.status(200).json({
                count: rows.length,
                products: rows
            });
        } else {
            res.json({ message: 'No products found' });
        }
    });
});

//product with id
router.get('/id/:id', (req, res) => {
    

    let productid = req.params.id;

    const query = `
    SELECT c.title as category, p.title as name, p.price, p.image, p.id
    FROM products as p
    JOIN categories as c ON c.id = p.cat_id
    WHERE p.id = ${productid};
    `;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (rows.length > 0) {
            res.status(200).json({
                count: rows.length,
                products: rows
            });
        } else {
            res.json({ message: 'No products found' });
        }
    });
});

// Close the MySQL connection on application exit
process.on('exit', () => {
    connection.end();
});

module.exports = router;

