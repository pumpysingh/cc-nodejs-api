const mongoose        = require('mongoose');
const validate        = require('mongoose-validator');
const CONFIG            = require('../cong');
let UserSchema = mongoose.Schema({
  
    first:      {type:String,lowercase:true},
    last:       {type:String,lowercase:true},
    phone:     {type:String, lowercase:true, trim: true, index: true, unique: true, sparse: true,//sparse is because now we have two possible unique keys that are optional
        validate:[validate({
            validator: 'isNumeric',
            arguments: [7, 20],
            message: 'Not a valid phone number.',
        })]
    },
    email: {type:String, lowercase:true, trim: true, index: true, unique: true, sparse: true,
            validate:[validate({
                validator: 'isEmail',
                message: 'Not a valid email.',
            }),]
    },
    password:   {type:String},
    address:{type:String},
    ssn:{type:String,  index: true},
    accountno:{type:String,lowercase:true},

}, {timestamps: true});

UserSchema.methods.toWeb = function(){
    let json = this.toJSON();
    json.id = this._id;//this is for the front end
    return json;
};



UserSchema.set('toJSON', {
     transform: function (doc, ret, options) {
         ret.id = ret._id;
         delete ret._id;
         delete ret.__v;
     }
}); 
let User = module.exports = mongoose.model('User', UserSchema);
