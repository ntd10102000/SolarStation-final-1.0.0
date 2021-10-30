const { PASSWORD } = require("../config/db.config");
const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

// checkDuplicateUsernameOrEmail = (req, res, next) => {
//     // Username
//     User.findOne({
//         where: {
//             username: req.body.username
//         }
//     }).then(user => {
//         if (user) {
//             var message = "Failed! Username is already in use!";
//             return message;

//         }

//         // Email
//         User.findOne({
//             where: {
//                 email: req.body.email
//             }
//         }).then(user => {
//             if (user) {
//                 var message = "Failed! Email is already in use!";
//                 return message;

//             }

//         });
//     });
//     next();

// };

// checkRolesExisted = (req, res, next) => {

//     if (req.body.roles) {
//         for (let i = 0; i < req.body.roles.length; i++) {
//             if (!ROLES.includes(req.body.roles[i])) {
//                 var message = "Failed! Role does not exist = " + req.body.roles[i];
//                 return message;

//             }
//         }
//     };
//     next();

// };
// checkRePassword = (req, res, next) => {
//     if (req.body.re_password) {
//         if (req.body.re_password == req.body.password) {
//             var message = "Failed! Re-enter incorrect password";
//             return message;

//         }
//     };
//     next();
// };

checkvalidate = (req, res, next) => {
    req.checkBody("username", "Username is required").notEmpty(); //validate để trống trường email sử dụng hàm notEmpty()
    req.checkBody("username", "Account name must be between 3 and 20 characters").matches(/^[a-z0-9_-]{3,20}$/);
    req.checkBody("email", "Email is required").notEmpty(); //validate để trống trường email sử dụng hàm notEmpty()
    req.checkBody("email", "Email is not invalid").matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/); //Validate định dạng email sử dụng regex, sử dụng hàm matches()
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password", "Password must be between 6 and 40 characters, password must be in lower case and no special characters").matches(/^[a-z0-9_-]{6,40}$/);
    return req.validationErrors();
}


const verifySignUp = {
    // checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    // checkRolesExisted: checkRolesExisted,
    // checkRePassword: checkRePassword,
    checkvalidate: checkvalidate
};

module.exports = verifySignUp;