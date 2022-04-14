const { User } = require('../models');

const create = function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.unique_key && !body.email && !body.phone && !body.ssn) {
        return res.status(500).send('Please enter an email,phone number,ssn to register.');
    } else if (!body.password) {
        return res.status(500).send('Please enter a password to register.');
    } else {

        User.create((body), function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send('Server Server');
            }
            return res.send({ message: 'Successfully created new user.', user: user.toWeb() }, 201);
        });
    }
}

module.exports.create = create;