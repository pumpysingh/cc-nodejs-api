const mongoose        = require('mongoose');
const validate        = require('mongoose-validator');
const CONFIG            = require('../cong');
let NotMatchedErrorLogSchema = mongoose.Schema({
    conversationid: { type: String },
    intent_name: { type: String },
    error_message: {type:String}
}, {timestamps: true});

NotMatchedErrorLogSchema.set('toJSON', {
     transform: function (doc, ret, options) {
        console.log("In model");
        console.log(doc); 
        ret.id = ret._id;
     }
});
let NotMatchedErrorLog = module.exports = mongoose.model('NotMatchedErrorLog', NotMatchedErrorLogSchema);