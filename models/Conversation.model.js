const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const mongoosePaginate = require('mongoose-paginate');
const CONFIG = require('../cong');
let ConversationSchema = mongoose.Schema({

    conversationid: { type: String },
    userIP: { type: String },
    websiteURL: { type: String },
    phone: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true, //sparse is because now we have two possible unique keys that are optional
        validate: [validate({
            validator: 'isNumeric',
            arguments: [7, 20],
            message: 'Not a valid phone number.',
        })]
    },
    botbuilderobject: { type: String },
    conversationobject: { type: String },
    ssn: { type: String, index: true },
    accountno: { type: String, lowercase: true },
    status: {type: String, default: 'active'},
    channel: {type: String }
}, { timestamps: true });

/*ConversationSchema.methods.toWeb = function(){
    let json = this.toJSON();
    json.id = this._id;//this is for the front end
   // let data=JSON.parse(json.botbuilderobject);
   // json.botbuilderobject="";
   // json.data=data;
    return json;
};*/
ConversationSchema.set('toJSON', {
    
    transform: function(doc, ret, options) {
        
        ret.id = ret._id;
        let data =ret.botbuilderobject? JSON.parse(ret.botbuilderobject):{};
        if (ret.conversationobject) {
            let cnversationdata = JSON.parse(ret.conversationobject);
            // ret.conversationData = cnversationdata;
        }
        ret.data = data;

        delete ret._id;
        delete ret.__v;
        delete ret.botbuilderobject;
        delete ret.conversationobject;
    }
});


ConversationSchema.plugin(mongoosePaginate);
let Conversation = module.exports = mongoose.model('Conversation', ConversationSchema);