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

router.get('/:id', (req, res) => {

const userId = req.params.id;

const query = `
    SELECT o.id, p.title as name, p.description, p.price, od.quantity as quantityOrdered, u.username
    FROM orders_details as od
    JOIN orders as o ON o.id = od.order_id
    JOIN products as p ON p.id = od.product_id
    JOIN users as u ON u.id = o.user_id
    WHERE o.user_id = ?
    ORDER BY o.id DESC;
`;

connection.query(query, [userId], (error, results) => {
    if (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } else {
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.json({ message: 'No orders found' });
        }
    }
});

})

router.get('/order/:id', (req, res) => {

    const orderId = req.params.id;
    
    const query = `
        SELECT o.id, p.title as name, p.description, p.price, od.quantity as quantityOrdered, u.username
        FROM orders_details as od
        JOIN orders as o ON o.id = od.order_id
        JOIN products as p ON p.id = od.product_id
        JOIN users as u ON u.id = o.user_id
        WHERE o.id = ?
    `;
    
    connection.query(query, [orderId], (error, results) => {
        if (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results);
            } else {
                res.json({ message: 'No orders found' });
            }
        }
    });
    
})

router.post('/new', async (req, res) => {
    const { user_id, products } = req.body;

    //const cartQuery = `SELECT * FROM cart WHERE userid = ${user_id}`;

    try {
        // Insert new order
        const insertOrderQuery = 'INSERT INTO orders (user_id, created_at) VALUES (?, NOW())';
        const [newOrderResult] = await pool.query(insertOrderQuery, [user_id]);

        const newOrderId = newOrderResult.insertId;

        // Insert order details for each product
        for (const product of products) {
            const { product_id, quantity } = product;

            const insertOrderDetailsQuery = 'INSERT INTO orders_details (order_id, product_id, quantity) VALUES (?, ?, ?)';
            await pool.query(insertOrderDetailsQuery, [newOrderId, product_id, quantity]);
        }

        res.json({
            message: `Order successfully placed with order id ${newOrderId}`,
            success: true,
            order_id: newOrderId,
            products: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
});

router.post('/payment', (req, res) => {
    res.send("Payment successful")
 });
module.exports = router;