const mongoose        = require('mongoose');
const validate        = require('mongoose-validator');
const CONFIG            = require('../cong');
let ThrottleUserSchema = mongoose.Schema({
    counter: { type: Number }
}, {timestamps: true});


ThrottleUserSchema.set('toJSON', {
     transform: function (doc, ret, options) {
        ret.id = ret._id;
         delete ret._id;
         delete ret.__v;
     }
}); 
let ThrottleUser = module.exports = mongoose.model('throttleusers', ThrottleUserSchema);
