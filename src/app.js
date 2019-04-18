const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

module.exports = function(){
    var app = express();
    
    app.use(expressValidator());
    app.use(bodyParser.json());
    app.use(express.static('./public'));

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');

    require('./routes/index')(app);
    require('./routes/paymenttype')(app);
    require('./routes/user')(app);

    return app;
};








