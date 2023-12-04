
const express = require('express');
const { check, validationResult, body } = require('express-validator');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'naeem',
    password: 'naeem',
    database: 'e_commerce'
});


router.get('/', (req, res) => {
    res.send("test");
    console.log("auth test");
})
// LOGIN ROUTE
router.post('/login', [
    check('email').not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({ all_lowercase: true }),
    check('password').not().isEmpty().withMessage('Field can\'t be empty')
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if the user exists in the database
    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        //res.send(user);

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, user.password, (bcryptError, isMatch) => {
            if (bcryptError) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (isMatch) {
                // Passwords match, generate and send a JWT token
                const token = jwt.sign(
                    { email: user.email, username: user.username },
                    'your-secret-key', // Replace with your actual secret key
                    { expiresIn: '4h' }
                );

                res.json({ token, auth: true, email: user.email, username: user.username, userId: user.id, role: user.role });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// REGISTER ROUTE
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({ all_lowercase: true }),
    check('password').escape().trim().not().isEmpty().withMessage('Field can\'t be empty')
        .isLength({ min: 6 }).withMessage("must be 6 characters long"),
    body('email').custom(value => {
        return new Promise((resolve, reject) => {
            // Check if email/username already exists in the database
            pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [value, value.split("@")[0]], (error, results) => {
                if (results && results.length > 0) {
                    reject('Email / Username already exists, choose another one.');
                } else {
                    resolve();
                }
            });
        });
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        let email = req.body.email;
        let username = email.split("@")[0];
        let password = await bcrypt.hash(req.body.password, 10);
        let fname = req.body.firstName;
        let lname = req.body.lastName;

        // Insert user into the database
        pool.query('INSERT INTO users (username, password, email, role, lname, fname) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, email, 555, lname || null, fname || null], (error, results) => {
                if (results && results.affectedRows > 0) {
                    res.status(201).json({ message: 'Registration successful.' });
                } else {
                    res.status(501).json({ message: 'Registration failed.' });
                }
            });
    }
});

module.exports = router;
