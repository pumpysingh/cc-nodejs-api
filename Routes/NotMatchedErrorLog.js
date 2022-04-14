// server/routes/article.js
const NotMatchedErrorLog = require('./../Controllers/NotMatchedErrorLog.ctrl')

module.exports = function(router) {
    /**
     * Store the Error Logs
     */
    router
        .route('/ErrorLogs/create')
        .post( NotMatchedErrorLog.create)

    router
        .route('/ErrorLogs/filterErroLogs')
        .post( NotMatchedErrorLog.filterErroLogs)
}