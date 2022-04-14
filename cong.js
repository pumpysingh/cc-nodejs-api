require('dotenv').config(); //instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

var Deployment_Environment = process.env.Deployment_Environment ? process.env.Deployment_Environment : "stage"

if (Deployment_Environment === "stage") {
    CONFIG = {
        clienturl: 'https://prestosolvo.sculptsoftdemo.in/v19/#/home?invite=admin&type=PSLF&source=email',
        dburl: 'mongodb+srv://sa:Prash131@prod-cche.zdlck.mongodb.net/CC',
        directlinesecert: 'PZxxdXJfJhM.0K2tH4VvzcNfc9MIZHxpf2lxASt2QUgD1GvbeuEaycM',
        app: process.env.APP || 'development',
        port: process.env.PORT || '3000',
        token_secret: 'Qs5fl6UindclA_be0_t7kc_RX_m4LWM_btXWMVSQu6A',
        maximumuserperday:5,
        NNBlobStorageConnectionString:'DefaultEndpointsProtocol=https;AccountName=nelnetbotstorage;AccountKey=idE0BdnN4CKjGpgLnybXDN9RVbVQn+wFZOrPqKM/K6+8vvacLHE0hq8YfdR0OgTYd5uWEGr2kfg23z+hwldrTA==;EndpointSuffix=core.windows.net',
        StoragePath:'https://nelnetbotstorage.blob.core.windows.net/transcripts/',
        cognitiveToken:"4b7573f2d53743a6b291adf7c8066c0e",
        headers: [
            "ReportingData.conversationid",
            "ReportingData.channelId",
            "ReportingData.createdAt",
            "ReportingData.repromptvariables.userhelpfulfeedback",
            "ReportingData.repromptvariables.usercomment",
            "ReportingData.repromptvariables.EndConversation"
        ],
        errorHeaders: [
            "ReportingData.conversationid",
            "ReportingData.createdAt",
            "ReportingData.intent_name",
            "ReportingData.error_message"
        ],
        errorHeaderNames: [
            "Conversation Id",
            "Question Asked At",
            "Question Purpose",
            "User Response"
        ],
        errorReportHeaders: [
            "fname",
            "userhelpfulfeedback"
        ],
        errorReportHeaderNames: [
            "Name",
            "Feedback"
        ],
        HeaderNames: [
            "Conversation Id",
            "Channel Id",
            "CreatedAt",
            "Name",
            "Feedback",
            "Comment",
            "End Conversation"
        ]
    }
} else if (Deployment_Environment === "prod") {
    CONFIG = {
        clienturl: 'https://ah-ha-bot.herokuapp.com/#/home?invite=admin&type=PSLF&source=email',
        dburl: 'mongodb+srv://sa:Prash131@prod-cche.zdlck.mongodb.net/CC',
        directlinesecert: 'PZxxdXJfJhM.0K2tH4VvzcNfc9MIZHxpf2lxASt2QUgD1GvbeuEaycM',
        app: process.env.APP || 'production',
        port: process.env.PORT || '3000',
        token_secret: 'Qs5fl6UindclA_be0_t7kc_RX_m4LWM_btXWMVSQu6A',
        maximumuserperday:5,
        NNBlobStorageConnectionString:'DefaultEndpointsProtocol=https;AccountName=nelnetbotstorage;AccountKey=idE0BdnN4CKjGpgLnybXDN9RVbVQn+wFZOrPqKM/K6+8vvacLHE0hq8YfdR0OgTYd5uWEGr2kfg23z+hwldrTA==;EndpointSuffix=core.windows.net',
        StoragePath:'https://nelnetbotstorage.blob.core.windows.net/transcripts/',
        cognitiveToken:"4b7573f2d53743a6b291adf7c8066c0e",
        headers: [
            "ReportingData.conversationid",
            "ReportingData.channelId",
            "ReportingData.createdAt",
            "ReportingData.repromptvariables.fname",
            "ReportingData.repromptvariables.userhelpfulfeedback",
            "ReportingData.repromptvariables.usercomment",
            "ReportingData.repromptvariables.EndConversation"
        ],
        errorHeaders: [
            "ReportingData.conversationid",
            "ReportingData.createdAt",
            "ReportingData.intent_name",
            "ReportingData.error_message"
        ],
        errorHeaderNames: [
            "Conversation Id",
            "Question Asked At",
            "Question Purpose",
            "User Response"
        ],
        errorReportHeaders: [
            "fname",
            "userhelpfulfeedback"
        ],
        errorReportHeaderNames: [
            "Name",
            "Feedback"
        ],
        HeaderNames: [
            "Conversation Id",
            "Channel Id",
            "CreatedAt",
            "Name",
            "Feedback",
            "Comment",
            "End Conversation"
        ]
    }
}

const exportconfig = CONFIG;
module.exports = exportconfig;