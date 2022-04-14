const mongoose        = require('mongoose');
const validate        = require('mongoose-validator');
const CONFIG            = require('../cong');
let AdminUserSchema = mongoose.Schema({
  
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
    role: {type:String}
}, {timestamps: true});

// AdminUserSchema.methods.toWeb = function(){
//     let json = this.toJSON();
//     json.id = this._id;//this is for the front end
//     return json;
// };

AdminUserSchema.set('toJSON', {
     transform: function (doc, ret, options) {
        ret.id = ret._id;
         delete ret.password;
         delete ret._id;
         delete ret.__v;
     }
}); 
let AdminUser = module.exports = mongoose.model('AdminUser', AdminUserSchema);
