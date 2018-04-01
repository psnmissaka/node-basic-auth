const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const config = require('./config');
const User = require('./models/user');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.set('view engine', 'ejs');
app.set('superSecret', config.secret);

mongoose.connect(config.database);

app.listen(port, () => {
    console.log(`Running on port  ${port}`);
});

app.post('/setup', (req, res) => {
    let user = new User({
        name: req.body.name,
        password: req.body.password,
        admin: req.body.admin
    });

    user.save((err) => {
        if (err) {
            res.send({ message: 'Couldn\'t save the user' }).status(500);
        } else {
            res.send({ message: 'user saved!' });
        }
    });
});

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', (req, res) => {
    User.find({ name: req.body.name }, (err, user) => {
        if (err) {
            res.send({ 'message': 'mongo error' }).status(500);
        }
       
        if (user.length === 0) {
            res.json({ success: false, message: 'Authentication failed user does not exist' }).status(401);
        } else if (user.length !== 0) {
            if (user[0].password !== req.body.password) {
                res.json({ success: false, message: 'invalid credentials!' }).status(401);
            } else {
                const payload = {
                    admin: user.admin
                };
                let token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: '1d'
                });

                res.json({
                    sucess: true,
                    message: 'Here is your token',
                    token: token
                })
                    .status(200);
            }
        }
    })
});

// middleware to verify the token
apiRoutes.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'can\'t authenticate the token ' }).status(401);
            } else {
                req.decoded = decoded;
                next()
            }
        })
    } else {
        return res.status(403).send({ success : false , message : 'couldn\'t find token'});
    }
});

apiRoutes.get('/users', (req, res) => {
    User.find({}, (err, result) => {
        if (err) {
            res.send({ message: 'Can\'t retrieve users' }).status(500);
        } else {
            res.json(result);
        }
    })
});

apiRoutes.get('/', (req, res) => {
    res.json({ message: 'Hello User welcome to the api' });
});

app.use('/api', apiRoutes)