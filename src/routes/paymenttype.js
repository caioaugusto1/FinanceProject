'use strict';
const dbConnection = require('../context/databaseContext');
const uuidv1 = require('uuid/v1');

module.exports = function(app){

    app.get('/paymenttype/', function(req, res, next){
        
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

    app.post('/paymenttype/create', function(req, res, next){
        
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
}
