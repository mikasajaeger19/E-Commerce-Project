const MySqli = require('mysqli');

let conn = new MySqli(config = {
    host: 'localhost',
    post: 3306,
    user: "naeem",
    passwd: "naeem",
    db: "e_commerce"
})

let db = conn.emit(false, '');

module.exports = {
    database: db
}