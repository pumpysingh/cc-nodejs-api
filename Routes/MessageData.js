// server/routes/article.js
const messagedata = require('./../Controllers/MessageData.ctrl')

module.exports = (router) => {
   
    /**
     * Start Conversation
     */
    router
        .route('/MessageData/storemessages')
        .post( messagedata.create)
    
    router
        .route('/GetPDF/:link')
        .get(messagedata.DownloadPDF)
}