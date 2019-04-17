'use strict';

const context = require('../context/databaseContext');

exports.get = (req, res, next) => {
    context.query('SELECT * FROM paymentType', (err, result, fields) => {
        if(!err){
            //res.render('paymenttype.list');
        }else{
            console.log(err);
        }   
    })
};

exports.post = (req, res, next) => {
    
};
