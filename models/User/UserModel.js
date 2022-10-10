
var { mongoose, Schema } = require('../index');

const { userSchema } = require('./UserSchema');
var userModelSchema = Schema(userSchema);
const bcrypt = require('bcryptjs');

userModelSchema.virtual('UID').get(function (){
    let UID;
    if(this._id) UID = this._id;
    return UID;
});



userModelSchema.statics.checkUserExistsByEmail = async function(Email){
    return await this.findOne({ Email: { $regex: new RegExp('^' + Email + '$', 'i')}});
}

userModelSchema.statics.createUser = async function(userObject){
    return await this.create(userObject);
}

userModelSchema.statics.getUserDetails = async function(UID){
    return await this.findOne({_id: UID});
}

userModelSchema.statics.validateUserSignin = async function(Email, Pwd){
  return await this.findOne({ Email: { $regex: new RegExp('^' + Email + '$', 'i')}, Pwd: Pwd});
}

userModelSchema.set('toObject', { getters: true });
userModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userModelSchema);