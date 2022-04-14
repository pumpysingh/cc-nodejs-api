const messagedata = require('../Controllers/MessageData.ctrl')

module.exports = function(router) {

    router
        .route('/DownloadTranscript/:conversationid')
        .get( messagedata.DownloadTranscript)

}