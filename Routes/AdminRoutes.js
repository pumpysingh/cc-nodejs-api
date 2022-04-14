// server/routes/article.js
const usercontroller = require('../Controllers/AdminUser.ctrl')
const reportingvaribales = require('../Controllers/ReportingVaribales.ctrl')
const conversationcontroller = require('../Controllers/Conversation.ctrl')
const messagedata = require('../Controllers/MessageData.ctrl')

module.exports = function(router) {

    router
        .route('/AdminUser/create')
        .post( usercontroller.create)

    router
        .route('/AdminUser/changepassword')
        .post(usercontroller.changepassword)

    router
        .route('/Reporting/Filter')
        .post(reportingvaribales.filter)

    router
        .route('/messagedata')
        .get(conversationcontroller.messagedata)

    router
        .route('/MessageData/GetMessages/:conversationid')
        .get( messagedata.get)

    router
        .route('/Conversation/updatestatus/:conversationid')
        .get(conversationcontroller.updatestatus)
        
    router
        .route('/GetTranscriptData')
        .get(messagedata.getTranscripts)
}