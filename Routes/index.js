const Conversation = require('./Conversation')
const User =require('./User')
const MessageData=require('./MessageData')
const AdminUser=require('./AdminUser')
const Mail=require('./Mail')
const ReportingVariables = require('./ReportingVariables')
const AdminRoutes = require('./AdminRoutes')
const ClientAuthRoutes = require('./ClientAuthRoutes')
const NotMatchedErrorLog = require('./NotMatchedErrorLog')
module.exports.Not_Authenticate = (router) => {
    Conversation(router)
    User(router)
    MessageData(router)
    AdminUser(router)
    Mail(router)
    ReportingVariables(router)
    NotMatchedErrorLog(router)
}

module.exports.Authenticate = (router) => {
    AdminRoutes(router);
}


module.exports.ClientAuthenticate = (router) => {
    ClientAuthRoutes(router);
}