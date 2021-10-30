const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.get('/login', (req, res) => {
        if (req.session.User) {
            res.redirect("../");
        } else {
            var errUserName;
            var errPassword;
            res.render('login', { errUserName: errUserName, errPassword: errPassword });
        }

    });
    app.get('/register',
        controller.register
    );
    app.post(
        "/signup",
        controller.signup
    );
    app.post("/login",
        controller.signin
    );
    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect("./login");
    })
};