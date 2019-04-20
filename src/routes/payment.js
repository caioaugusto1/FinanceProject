'use strict';

const dbConnection = require('../context/databaseContext');
const uuidv1 = require('uuid/v1');

module.exports = function(app)
{
    app.get('/payment', function(req, res, next){

        var listObj = [];

        var obj = {
            IdPayment: 123, 
            Name: 'teste', 
            Description: 'mercearia',
            Value: 133.33, 
            Date: '2018-10-10',
            IdPaymentType: 1,
            Imagelink: 'https://www.google.com/url?sa=i&source=images&cd=&ved=2ahUKEwiDmY2m5d_hAhX3WRUIHRGVC_MQjRx6BAgBEAU&url=https%3A%2F%2Fwww.ecosia.org%2Fimages%3Fc%3Den%26p%3D3%26q%3Dhow%2Bto%2Bcreate%2Ba%2Bhyperlink&psig=AOvVaw0Fd-b7jEoBlmnLKUzx5TK4&ust=155588818200202'
        };

        listObj.push(JSON.stringify(obj));

        obj = null;

        obj = {
            IdPayment: 123, 
            Name: 'Etc', 
            Description: 'Linix',
            Value: 80.00, 
            Date: '2018-10-01',
            IdPaymentType: 1,
            Imagelink: 'https://www.google.com/url?sa=i&source=images&cd=&ved=2ahUKEwiDmY2m5d_hAhX3WRUIHRGVC_MQjRx6BAgBEAU&url=https%3A%2F%2Fwww.ecosia.org%2Fimages%3Fc%3Den%26p%3D3%26q%3Dhow%2Bto%2Bcreate%2Ba%2Bhyperlink&psig=AOvVaw0Fd-b7jEoBlmnLKUzx5TK4&ust=1555888182002029'
        };
        
        listObj.push(JSON.stringify(obj));

        // res.writeHead(200, {'Content-Type': 'application/json'});
        //res.end(JSON.stringify(obj));
        
        res.status(200).json({
            data: listObj  
        }).send();

        // res.send(JSON.stringify(obj));

        next();
    });
}