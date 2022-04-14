// server/routes/article.js
const reportingvaribales = require('./../Controllers/ReportingVaribales.ctrl')

module.exports = (router) => {
   
    /**
     * Start Conversation
     */
    router
        .route('/Reporting/create')
        .post( reportingvaribales.create)
    
    router
        .route('/Reporting/update')
        .post( reportingvaribales.update)

    router
        .route('/Reporting/GetData/:conversationid')
        .get(reportingvaribales.get)

    router
        .route('/Reporting/WeeklyReport')
        .post(reportingvaribales.filter)
}