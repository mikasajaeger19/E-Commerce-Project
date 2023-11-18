const express = require('express');
const router = express.Router();
const db = require('../config/helpers');

// Get all orders by a user
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    db.table('orders_details as od')
        .join([
            { table: 'orders as o', on: 'o.orderId = od.orderId' },
            { table: 'products as p', on: 'p.productId = od.productId' },
            { table: 'users as u', on: 'u.id = o.userId' }
        ])
        .withFields(['o.orderId', 'p.title as name', 'p.description', 'p.price', 'od.quantity as quantityOrdered', 'u.username'])
        .filter({ 'o.userId': userId })
        .sort({ id: -1 })
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.json({ message: 'No orders found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// Get single order
router.get('/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    db.table('orders_details as od')
        .join([
            { table: 'orders as o', on: 'o.orderId = od.orderId' },
            { table: 'products as p', on: 'p.productId = od.productId' },
            { table: 'users as u', on: 'u.id = o.userId' }
        ])
        .withFields(['o.orderId', 'p.title as name', 'p.description', 'p.price', 'od.quantity as quantityOrdered', 'u.username'])
        .filter({ 'o.orderId': orderId })
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.json({ message: 'No orders found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// Place new order
router.post('/new', async (req, res) => {
    const { user_id, products } = req.body;

    try {
        if (user_id !== null && user_id > 0 && !isNaN(user_id)) {
            const newOrderId = await db.table('orders').insert({ user_id });
            
            if (newOrderId > 0) {
                for (const p of products) {
                    const inCart = parseInt(p.incart);
                    const data = await db.table('products').filter({ id: p.id }).withFields(['quantity']).get();

                    // Insert order details w.r.t the newly created order Id
                    await db.table('orders_details').insert({
                        order_id: newOrderId,
                        product_id: p.id,
                        quantity: inCart
                    });
                    console.log("Order details inserted successfully.");
                }

                res.json({
                    message: `Order successfully placed with order id ${newOrderId}`,
                    success: true,
                    order_id: newOrderId,
                    products: products
                });
            } else {
                res.status(500).json({ message: 'New order failed while adding order details', success: false });
            }
        } else {
            res.status(400).json({ message: 'Invalid user_id for placing a new order', success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
});

// Payment Gateway
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ success: true });
    }, 3000);
});

module.exports = router;
