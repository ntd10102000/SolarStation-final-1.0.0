const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Province = db.province;
var pool_db = require("../config/crdb.config").pool_db;
const { verifySignUp } = require("../middlewares");


const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res, next) => {
    // Save User to Database
    if (req.session.roles == "admin") {
        var errors = verifySignUp.checkvalidate(req, res, next);
        var message;
        var message1;
        var message2;
        if (!errors) {
            User.findOne({
                where: {
                    username: req.body.username
                }
            }).then(user => {
                if (user) {
                    pool_db.connect(function (err, client, done) {
                        if (err) {
                            return console.log("error:" + err);
                        } else {
                            client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function (err, result, row) {
                                done();
                                if (err) {
                                    res.end();
                                    return console.error('error running query', err);
                                } else {
                                    res.render("./signup", { provinces: result, errors: errors, message: "Failed! Username is already in use!", message1: message1, message2: message2 });
                                }
                            });
                        }
                    });
                    // message = "Failed! Username is already in use!";
                } else {
                    // Email
                    User.findOne({
                        where: {
                            email: req.body.email
                        }
                    }).then(user => {
                        if (user) {
                            pool_db.connect(function (err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function (err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            res.render("./signup", { provinces: result, errors: errors, message: message, message1: "Failed! Email is already in use!", message2: message2 });
                                        }
                                    });
                                }
                            });
                            // message = "Failed! Email is already in use!";
                        } else {
                            if (req.body.re_password != req.body.password) {
                                pool_db.connect(function (err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function (err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                res.render("./signup", { provinces: result, errors: errors, message: message, message1: message1, message2: "Failed! Re-enter incorrect password" });
                                            }
                                        });
                                    }
                                });
                                // message2 = "Failed! Re-enter incorrect password";
                            } else {
                                User.create({
                                    username: req.body.username,
                                    email: req.body.email,
                                    provinceId: req.body.provinceId,
                                    password: bcrypt.hashSync(req.body.password, 8)
                                })
                                    .then(user => {
                                        if (req.body.roles) {
                                            Role.findAll({
                                                where: {
                                                    name: {
                                                        [Op.or]: req.body.roles
                                                    }
                                                }
                                            }).then(roles => {
                                                user.setRoles(roles).then(() => {
                                                    res.send({ message: "User was registered successfully!" });
                                                });
                                            });
                                        } else {
                                            // user role = 1
                                            user.setRoles([1]).then(() => {
                                                res.redirect("./login");
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        res.status(500).send({ message: err.message });
                                    });
                            }
                        }

                    });
                }

            });

        } else {
            pool_db.connect(function (err, client, done) {
                if (err) {
                    return console.log("error:" + err);
                } else {
                    client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function (err, result, row) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('error running query', err);
                        } else {
                            res.render("./signup", { provinces: result, errors: errors, message: message, message1: message1, message2: message2 });
                        }
                    });
                }
            });
        }
    } else {
        res.redirect("../login");
    }
};

exports.signin = (req, res) => {

    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then(user => {
            if (!user) {
                res.render('login', { errUserName: "Email Not found.", errPassword: null });
            } else {
                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );
                if (!passwordIsValid) {
                    accessToken = null;
                    res.render('login', { errUserName: null, errPassword: "Invalid Password!" });
                }
                else {
                    var token = jwt.sign({ id: user.id }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });

                    var authorities = [];
                    user.getRoles().then(roles => {
                        for (let i = 0; i < roles.length; i++) {
                            authorities.push("ROLE_" + roles[i].name.toUpperCase());
                        }
                        Province.findOne({
                            where: {
                                id: user.provinceId
                            }
                        }).then(province => {
                            req.session.id = user.id;
                            req.session.User = user.username;
                            req.session.email = user.email;
                            req.session.roles = roles[0].name;
                            req.session.accessToken = token;
                            req.session.province = province.provinceName;
                            req.session.provinceId = province.id;
                            // console.log(req.session.roles);
                            if (req.session.User && req.session.provinceId && req.session.roles == "user") {
                                res.redirect("../");
                            }
                            if (req.session.User && req.session.provinceId && req.session.roles == "admin") {
                                res.redirect("../admin");
                            }
                        });
                    });
                }
            }


        })


    // .catch(err => {
    //     res.status(500).send({ message: err.message });
    // });
};

exports.register = (req, res) => {
    if (req.session.roles == "admin") {

        var errors = [];
        var messenge = "";
        var messenge2 = "";

        pool_db.connect(function (err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function (err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        res.render('signup', { provinces: result, errors: errors, message: messenge, message2: messenge2, message1: null });
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    }
};