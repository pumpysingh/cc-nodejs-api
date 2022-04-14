// server/routes/article.js
const usercontroller = require('./../Controllers/AdminUser.ctrl')

module.exports = function(router) {
          /**
     * GET URL
     * 
     */
    router
        .route('/AdminUser/check')
        .post(usercontroller.get)
}