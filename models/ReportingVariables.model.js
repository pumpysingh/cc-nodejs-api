const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const CONFIG = require('../cong');
let ReportingVariablesSchema = mongoose.Schema({

    datetime: { type: Date },
    conversationid: { type: String },
    channeldata: { type: String },
    channelId: { type: String },
    repromptvariables: { 
        transctiptDownload: { type: Boolean },
        userhelpfulfeedback: { type: String },
        usercomment: { type: String },
        EndConversation: { type: String },
    }
}, { timestamps: true });

ReportingVariablesSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        if(ret.channeldata){
            ret.channeldata = JSON.parse(ret.channeldata);
        }
        delete ret._id;
        delete ret.__v;
    }
});



let ReportingVariablesData = module.exports = mongoose.model('reportingvariables', ReportingVariablesSchema);