// what we use to make the database
const Sequelize = require('sequelize');

// the database itself
const sequelize = new Sequelize('database', 'user', 'password', {
    // what we're using
    dialect: 'sqlite',
    // local host: running on your computer
    host: 'localhost',
    storage: 'database.sqlite',
    logging: false,
});

// exporting database
module.exports = sequelize;

