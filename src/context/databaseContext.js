const mysql = require('mysql');
const config = require('../config');

var mysqlConnection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user, 
    password: config.database.password,
    database: config.database.database
});

mysqlConnection.connect((err) => {
    if(!err)
        console.log('DB Connection succeded');
    else
        console.log('DB Connection Failed \n Error : ' + JSON.stringify(error, undefined, 2));
});

module.exports = mysqlConnection;