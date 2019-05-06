const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

module.exports = function(){
    
    var app = express();
    
    app.use(expressValidator());
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Express session
    app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
        })
    );

    // Connect flash
    app.use(flash());

    // Global variables
    app.use(function(req, res, next) {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        next();
    });

    app.use(express.static('./public'));

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    //app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');

    require('./routes/index')(app);
    require('./routes/paymenttype')(app);
    require('./routes/user')(app);
    require('./routes/payment')(app);

    return app;
};








