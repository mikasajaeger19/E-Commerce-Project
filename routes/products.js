
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
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 4;

    let startValue, endValue;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = (page * limit);
    } else {
        startValue = 0;
        endValue = 4;
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
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 4;

    let startValue, endValue;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = (page * limit);
    } else {
        startValue = 0;
        endValue = 4;
    }

    let catName = req.params.catName;

    

    const query1 = `
    SELECT c.title as category, p.title as name, p.price, p.image, p.id
    FROM products as p
    JOIN categories as c ON c.id = p.cat_id
    WHERE c.title LIKE '%${catName}%'
    ORDER BY p.id ASC
    LIMIT ${startValue}, ${limit};
    `;

    const query2 = `
    SELECT c.title as category, p.title as name, p.price, p.image, p.id
    FROM products p
    JOIN categories c ON c.id = p.cat_id
    ORDER BY p.id ASC
    LIMIT ${startValue}, ${endValue}
    `;

    let query = catName === 'All' ? query2 : query1;

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
router.get('/name/:name', (req, res) => {
    

    let pname = req.params.name;
    console.log(pname);
    const query = `
    SELECT c.title as category, p.title as name, p.price, p.image, p.id
    FROM products as p
    JOIN categories as c ON c.id = p.cat_id
    WHERE p.title LIKE '%${pname}%';
`;


    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const item = rows[0];
        console.log(rows[0]);

        if (rows.length > 0) {
            res.status(200).json({
                products: item
            });
        } else {
            console.log("No products found");
            res.json({ message: 'No products found' });
        }
    });
});

// Close the MySQL connection on application exit
process.on('exit', () => {
    connection.end();
});

router.get('/admin', (req, res) => {
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

router.post('/admin/new', (req, res) => {
    const { title, price, image, cat_id} = req.body;

    //INSERT INTO `products` (`id`, `title`, `image`, `images`, `description`, `price`, `quantity`, `short_desc`, `cat_id`) VALUES

    const query = `INSERT INTO products (title, image, price, cat_id) VALUES ('${title}', '${image}','${price}','${cat_id}')`;

    connection.query(query, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
    
        res.status(200).json(req.body);
    });
});

router.put('/admin/edit/:id', (req, res) => {
    let productId = req.params.id;

    const details = {
        title: req.body.title,
        price: req.body.price,
        image: req.body.image,
        cat_id: req.body.cat_id
    };
    
    const query = `
    UPDATE products
    SET title = '${details.title}', price = '${details.price}', image = '${details.image}', cat_id = '${details.cat_id}'
    WHERE id = ${productId};
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

router.delete('/admin/delete/:id', (req, res) => {
    let productId = req.params.id;

    const query = `
    DELETE FROM products WHERE id = ${productId};
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

module.exports = router;

