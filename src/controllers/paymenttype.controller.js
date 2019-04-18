'use strict';

const context = require('../context/databaseContext');

exports.get = async (req, res, next) => {
    await context.query('SELECT * FROM paymentType', (err, result, fields) => {
        if(!err){
            //console.log(result);
            
            //res.render('/list', { result });
        }else{
            console.log(err);
        }   
    })
};

exports.getCreate = (req, res, next) => {
    //res.send('EAEAE'); 
    res.render('../views/paymenttype/create');   
};

exports.post = (req, res, next) => {
    
};
