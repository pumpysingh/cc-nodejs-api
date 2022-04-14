const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const CONFIG = require('../cong');
let MessageDataSchema = mongoose.Schema({

    datetime: { type: Date },
    sender: { type: String },
    text: { type: String, trim: true },
    speechtext: { type: String },
    conversationid: { type: String },
    messagecounter: { type: String, index: true },
    channeldata: { type: String },
    msgtype: {type: String},
    attachments: {type: String},
    msg_reprompt: {type: Boolean}
}, { timestamps: true });

MessageDataSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        if(ret.channeldata){
            ret.channeldata = JSON.parse(ret.channeldata);
        }
        if(ret.attachments){
            ret.attachments = JSON.parse(ret.attachments);
        }
        delete ret._id;
        delete ret.__v;
    }
});



let MessageData = module.exports = mongoose.model('MessageData', MessageDataSchema);