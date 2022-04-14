const jwt = require('jsonwebtoken');
const CONFIG = require('../cong');
const { AdminUser } = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const create = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.email || !body.password) {
        return res.status(500).send('Please enter an email and password to register.');
    } else if (!body.password) {
        return res.status(500).send('Please enter a password to register.');
    } else {
        const hash = bcrypt.hashSync(body.password, saltRounds);
        body.password = hash;
        AdminUser.create((body), function (err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send({"error":err});
            }
            return res.send({ message: 'Successfully created new admin user.', user: user }, 201);
        });
    }
}


const get = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.email || !body.password) {
        return res.status(500).send({
            status: "Not matched",
            error: 'Please enter valid email id and password'
        });
    }
    else {
        AdminUser.findOne({ email: body.email}, function (err, user) {
            if (err) {
                console.log(err);
                return res.status(401).send({ status: "Not matched", error: err });
            }

            if (user != null) {
                var passwordcheck = bcrypt.compareSync(body.password, user.password); // true
                if(passwordcheck){
                    var payload = {
                        email: user.email
                    }
                    var token = jwt.sign(payload, CONFIG.token_secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    return res.status(200).send({ status: "Matched", user: user, token: token });
                }
                else{
                    return res.status(200).send({ status: "Not matched", error: "Invalid username or password" });
                }
            }
            else {
                return res.status(200).send({ status: "Not matched", error: 'User Not Found with provided credential' });
            }
        });

    }
}

const changepassword = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.email || !body.password || !body.oldpassword) {
        return res.status(500).send({
            status: "Error",
            error: 'Please enter valid email and password'
        });
    }
    else {
        AdminUser.findOne({ email: body.email }, function (err, user) {
            if (err) {
                console.log(err);
                return res.status(401).send({ status: "Error", error: "Something went wrong!" });
            }
            if (user != null) {
                var passwordcheck = bcrypt.compareSync(body.oldpassword, user.password); // true
                if(passwordcheck){
                    var matcholdandNewPwd = bcrypt.compareSync(body.password, user.password); // true
                    if(matcholdandNewPwd){
                        return res.status(200).send({
                            status: "Error",
                            error: 'The new password must be different from the old password!'
                        });
                    }
                    else{
                        const hash = bcrypt.hashSync(body.password, saltRounds);
                        user.password = hash;
                        user.save();
                        return res.send({ status: "Password changed successfully", user: user }, 200);
                    }
                }
                else{
                    return res.status(200).send({
                        status: "Error",
                        error: 'Please enter correct old password'
                    });
                }
            }
            else {
                return res.status(200).send({
                    status: "Error",
                    error: 'Invalid username'
                });
            }
        });
    }
}

module.exports.create = create;
module.exports.get = get;
module.exports.changepassword = changepassword;