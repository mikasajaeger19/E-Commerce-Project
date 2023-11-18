const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');


app.use(express.json());
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    origin: '*'
}));

const db = mysql.createConnection({
    host:'localhost',
    user:'naeem',
    password:'naeem',
    database:'e_commerce'
})

db.connect(function(err) {
    if(err){
        console.log(err);
        return;
    }
    console.log('Connected to MySQL');
});

const productsRoute = require('./routes/products');
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const ordersRoute = require('./routes/orders');

app.use('/api/products', productsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/orders', ordersRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});
// Other middleware and route setup if needed

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
