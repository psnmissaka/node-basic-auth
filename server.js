const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash');

const config = require('./config');
const User = require('./models/user');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(passport.initialize());
app.use(flash());


app.set('view engine', 'ejs');
app.set('superSecret', config.secret);

mongoose.connect(config.database);

require('./app/routes.js')(app, passport);

app.listen(port, () => {
  console.log(`Running on port  ${port}`);
});