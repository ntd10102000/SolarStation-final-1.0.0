const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var path = require('path');
const session = require('express-session');
const ee = require('@google/earthengine');
const privateKey = require('./.private-key.json');


const app = express();
var expressValidator = require('express-validator');
app.use(expressValidator());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// set port, listen for requests
const PORT = process.env.PORT || 4320;


app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app/public')));
app.use(session({
    secret: "duongnt-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 8640000
    }
}));


console.log('Authenticating Earth Engine API using private key...');
ee.data.authenticateViaPrivateKey(
    privateKey,
    () => {
        console.log('Authentication successful.');
        ee.initialize(
            null, null,
            () => {
                console.log('Earth Engine client library initialized.');
                app.listen(PORT);
                console.log(`Listening on port ${PORT}`);
            },
            (err) => {
                console.log(err);
                console.log(
                    `Please make sure you have created a service account and have been approved.
Visit https://developers.google.com/earth-engine/service_account#how-do-i-create-a-service-account to learn more.`);
            });
    },
    (err) => {
        console.log(err);
    });

// routes
require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);
require('./app/routes/gee.routes')(app);
// require('./app/routes/province.routes')(app);


// const db = require("./app/models");
// const Role = db.role;
// const province = db.province;

// db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });

// function initial() {
//     Role.create({
//         id: 1,
//         name: "user"
//     });

//     Role.create({
//         id: 2,
//         name: "moderator"
//     });

//     Role.create({
//         id: 3,
//         name: "admin"
//     });
//     province.create({
//         provinceName: "Bắc Giang"
//     });

//     province.create({
//         provinceName: "Gia Lai"
//     });

//     province.create({
//         provinceName: "Dak Lak"
//     });
// }