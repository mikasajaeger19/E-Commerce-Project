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
// ...
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    const query = `
       SELECT c.product_id, c.quantity, p.title, p.price, p.image
       FROM cart as c
       JOIN products as p ON p.id = c.product_id
       WHERE c.userid = ?;
    `;

    connection.query(query, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.status(200).json(rows);
    });
});


// router.post('/new/:id', async (req, res) => {
//     const { product_id, quantity } = req.body;
//     const user_id = req.params.id;

//     try {
//         // Insert new order
//         const insertCartQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
//         const newCartResult = await pool.query(insertCartQuery, [user_id, product_id, quantity]);

//         res.json({
//             message: 'Added to cart successfully',
//             success: true,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error', success: false });
//     }
// });

router.post('/new/:id', async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.params.id;

    const query = `INSERT INTO cart (userid, product_id, quantity) VALUES (${user_id}, ${product_id}, ${quantity})`;

    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
    
        res.status(200).json(req.body);
    });
});

module.exports = router;
