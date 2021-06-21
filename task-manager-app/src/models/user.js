const log = console.log
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: Number,
        //set:v => v+1, this functions is used to modify the data before saving
        validate(value) {
            if (value.toString().length !== 10)
                throw new Error('phone number must be of 10 digits')
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Invalid email')
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        /*set(v) {
            /!* const isModified = this.isModified('password')
              log(isModified)*!/
            log('password:', v)
            //Here 8 is a recommended no of algorithm call
            const hashedPwd = bcrypt.hashSync(v, 8)
            log('hashed pwd ', hashedPwd)
            return hashedPwd
        },*/
        validate(val) {
            if (val.toLowerCase().includes("password"))
                throw new Error('password cannot contain password')
        }

    },
    //Model will have a array of objects "tokens" and each object will have a field token of String and Required.
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    profilePic:{
        type:Buffer
    }
},{timestamps:true})

//setting the relationship with Task collection
userSchema.virtual('userTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//using userSchema.statics we defined our own findUserByCredentials()
//which we can call like we call other predefined functions Ex. User.findUserByCredentials()
//function defined using userSchema.statics can be considered as static function for User model.
userSchema.statics.findUserByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user)
        throw new Error('Login Failed-Incorrect Email')
    const isCorrectPassword = await bcrypt.compare(password, user.password)
    log('is correct password', isCorrectPassword)
    if (!isCorrectPassword)
        throw new Error('Login Failed-Incorrect password')
    return user
}

//functions defined using userSchema.methods can be considered as instance methods for User.
//Ex . const user = User({name:"a",email"a@.c.com",password:"123456aB@"})
// can be called like - user.generateJWTForTheUser()

//The reason why we are assiging a function() instead of a arrow function is that, arrow functions does not
//provide this bindings to us.
//And here we're calling the below function on user instance where we want to access the user which has called
//this method.
userSchema.methods.generateJWTForTheUser = async function () {
    const user = this
    //using sign() we create a token for user for that as a first argument we put the user specific unique
    //data to it and the second argument is a secret key which is user for creating (right now using sign method)
    // and validating the token later on (using verify method)
    const token = await jwt.sign({_id: user._id.toString()}, 'nodejstaskapp')
    user.tokens.push({token})
    await user.save()
    return token

}

userSchema.methods.toJSON = function () {
    const user = this
    //create copy of the user
    const userObjectToSendToClient = user.toObject()
    delete userObjectToSendToClient.password
    delete userObjectToSendToClient.tokens
    delete userObjectToSendToClient.__v
    return userObjectToSendToClient
}


//This is called Mongoose middleware which allows us to to certain tasks before or after some particular event.
//Here we want to hash the password before saving it to db.

//Note that we're passing the function(){} and not arrow function.Because we require this binding inside the
//function to access his/her password.

//we can either provide a normal function as callback or a async function
//if we want ot use normal callback then we need to call next() to indicate mongoose that we're done.

//async function as callback
userSchema.pre('save', async function () {
    const user = this
    //We will hash the password only if it has been changed
    if (user.isModified('password')) {
        console.log('password :', user.password)
        user.password = await bcrypt.hash(user.password, 8)
        console.log('Hashed password :', user.password)
    }

})

//normal callback
/*userSchema.pre('save', function (next) {
    const user = this
    //We will hash the password only if it has been changed
    if(user.isModified('password')){
        //console.log('password :',user.password)
         bcrypt.hash(user.password,8).then((hashedPassword) => {
             user.password = hashedPassword
             next()
         })
        //console.log('Hashed password :',user.password)
    }else
        next()

})*/

userSchema.pre('remove', async function () {
    const user = this
    await Task.deleteMany({owner: user._id})
})

const User = mongoose.model('User', userSchema)

//This is required to unique:true to work for email field
User.createIndexes()

module.exports = User

//Why are we taking record of tokens for user ?
/*  While creating the user and on every login we will create a seperate token and save it to the list.
*   so for example user created his account on pc,he got a token,now user wants to access his account on
*   Mobile also,so he does login there,and we created and stored another token for him.
*
*   Now when he will logout for any of he device we will remove the token particular to the device.
*   This way on Logout that particular token can't be used to access his account.
*   So this means if somehow that particular token is found by some hacker and he is accessing real
*    user's account then after logging out from the account hacker won't also able to access the account.   */
