const mailcontroller = require('../Controllers/mail.ctrl');


module.exports = function(router) {

    router
        .route('/Mail/send')
        .get(mailcontroller.sendemail)

}