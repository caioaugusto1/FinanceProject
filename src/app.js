const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//loading routes
const index = require('./routes/index');
const paymentType = require('./routes/paymenttype')

const conectionDatabase = require('./context/databaseContext');

app.use(bodyParser.json());

app.use('/', index);
app.use('/paymenttype', paymentType);

app.listen(3000, () => {
    console.log('Express server is running at PORT: 3000');
});




