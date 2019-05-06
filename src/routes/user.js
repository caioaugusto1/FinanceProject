'use strict';

const dbConnection = require('../context/databaseContext');
const crypt = require('bcryptjs');
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


    //create new user 
    app.post('/user/create', function(req, res, next){
        
        let errors = []; 

        const body = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        }

        if(!body.name || !body.email || !body.password || !body.confirmPassword){
            errors.push({msg: 'Please have errors'});
        }

        if(body.password !== body.confirmPassword){
            errors.push({msg: 'Passwords do not match'});
        }

        if(!body.password || body.password.length < 6){
            errors.push({msg: 'Password should be at least 6 characters'});
        }

        let sql = 'SELECT * FROM User WHERE UserName = ?';
        dbConnection.query(sql, [body.email], (err, result, fields) => {
            if(!err){
                if(result.lenght > 0){
                    errors.push({msg: 'E-mail exists'});  
                }
            }   
        });
        
        dbConnection.end();

        if(errors.length > 0){
            console.log('eaeaeaea');
            res.status(409).json({
                data: errors
            }).send();
        }

        var newPassword = '';
        crypt.genSalt(10, (err, salt) => {
            crypt.hash('body.password', salt, (err, hash) => {
                if(err) { 
                    throw err
                }else{
                    console.log(hash);
                    newPassword = hash;
                }
            })
        });

        let query = 'INSERT INTO User(IdUser, Name, UserName, Password, Available) VALUES ?';

        let param = {
            IdUser: uuidv1(),
            Name: body.name, 
            UserName: body.username,
            Password: body.password, 
            Available: true
        }

        // dbConnection.query(query, [param], (err, result, fields) => {
        //     if(!err){
        //         res.status(200).json({
        //             idUser: result
        //         }).send();

        //     }else{
        //         console.log(err);
        //     }   
        // });
        
        // dbConnection.end();
    });
}
