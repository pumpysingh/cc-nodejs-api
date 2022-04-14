// server/routes/article.js
const usercontroller = require('./../Controllers/User.ctrl')

module.exports = (router) => {
   
    /**
     * Start Conversation
     */
    router
        .route('/User')
        .post( usercontroller.create)

}