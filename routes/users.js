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

//get user details

router.get('/:id', (req, res) => {

    let userId = req.params.id;

    const query = `
    SELECT u.id, u.username, u.email, u.fname, u.email
    FROM users as u
    WHERE u.id = ${userId};
    `;

    connection.query(query, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (user) {
            res.status(200).json(
                user[0]
            );
        } else {
            res.json({ message: 'No users found' });
        }
    });
});

router.put('/:id', (req, res) => {
    let userId = req.params.id;

    const details = {
        username: req.body.username,
        email: req.body.email,
        fname: req.body.fname,
    };
    
    const query = `
    UPDATE users
    SET username = '${details.username}', email = '${details.email}', fname = '${details.fname}'
    WHERE id = ${userId};
    `;


    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.status(200).json(req.body);
    });
});

router.delete('/:id', (req, res) => {
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

    let userId = req.params.id;

    const query = `
    DELETE FROM users WHERE userId = ${userId};
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
            res.json({ message: 'No users found' });
        }
    });
});

module.exports = router;