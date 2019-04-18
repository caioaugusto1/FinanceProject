const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

//loading routes
const index = require('./routes/index');
const paymentType = require('./routes/paymenttype')

const conectionDatabase = require('./context/databaseContext');

app.use(bodyParser.json());

app.use('/', index);
app.use('/paymenttype', paymentType);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/views'));

app.use(express.static(__dirname + '/views/themebootstrap'));

// app.use(express.static(__dirname + '/views/themebootstrap/vendor'));

// app.use(express.static(__dirname + '/views/themebootstrap/vendor/bootstrap'));

// app.use(express.static(__dirname + '/views/themebootstrap/vendor/bootstrap/css'));

// app.set('fontawesome-free', __dirname + '/views/themebootstrap/vendor/fontawesome-free');
// app.use(express.static(__dirname + '/views/themebootstrap/vendor/fontawesome-free'));

app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log('Express server is running at PORT: ' + port);
});





