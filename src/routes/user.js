'use strict';

const dbConnection = require('../context/databaseContext');
const uuidv1 = require('uuid/v1');

module.exports = function(app){

    app.get('/user', function(req, res, next){
        
        dbConnection.query('SELECT * FROM paymentType', (err, result, fields) => {
            if(!err){
                res.status(200).json({
                    data: result
                }).send();

            }else{
                console.log(err);
            }   
        });
        
        dbConnection.end();
    });

    app.post('/user/create', function(req, res, next){

        let query = 'INSERT INTO User(IdUser, Name, UserName, Password, Available) VALUES ?';

        let param = {
            IdUser: uuidv1(),
            Name: req.body.name, 
            UserName: req.body.username,
            Password: 123, 
            Available: true
        }

        dbConnection.query(query, [param], (err, result, fields) => {
            if(!err){
                res.status(200).json({
                    idUser: result
                }).send();

            }else{
                console.log(err);
            }   
        });
        
        dbConnection.end();
    });
}
