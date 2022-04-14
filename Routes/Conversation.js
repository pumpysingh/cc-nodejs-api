// server/routes/article.js
const conversationcontroller = require('./../Controllers/Conversation.ctrl')

module.exports = (router) => {


    /**
     * Start Conversation
     */
    router
        .route('/Conversation')
        .post(conversationcontroller.startConversation)

    /**
     * GET URL
     * 
     */

    router
        .route('/StreamURL')
        .post(conversationcontroller.streamURL)

    router
        .route('/Conversation/update')
        .post(conversationcontroller.update)

    router
        .route('/Conversation/:conversationid/loan')
        .get(conversationcontroller.conversationloan)

    router
        .route('/tokenrefresh/:token')
        .get(conversationcontroller.tokenrefresh)

    router
        .route('/Conversation/CreateConversation')
        .post(conversationcontroller.createConversation)

    router
        .route('/GetThrottleCounter')
        .get(conversationcontroller.getThrottleCounter)

    router
        .route('/Conversation/:conversationid')
        .get(conversationcontroller.getConversation)
        
}