const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decodeToken = await jwt.verify(token,'nodejstaskapp')

        //While creating the token using jwt sign() method in user.js we had provided user's _id.
        //So here we're extracting that id from the token using decodeToken._id

        //in User model there is array of objects (tokens) where each object has a property 'token'.
        //so here by 'tokens.token' we mean the 'token' property of all of those objects inside 'tokens' array.

        //So here we require a user whose id is equal to 'decodeToken._id' and whose 'tokens' array
        //contains a object whose 'token' property is equal to the token that we got from request header.

        //Here even if jwt has verified the token (passed by the user) we're comparing it to the tokens
        //saved for a user in our db.Because when user signout,we remove that token from our db.
        //So if someone (Hacker) somehow finds user token and tries to login with the token,it is required for
        // us to check if that token exists.Otherwise even if the real user Signs out,hacker will still
        // be able to access his account.


        const user = await User.findOne({_id:decodeToken._id,'tokens.token':token})
        if(!user)
            throw new Error()

        //setting token and user to request
        //These can be used inside our routes on req variable (Ex. req.user)
        //This way For ex. in update user route we don't need to fetch the user again
        //So in place of calling const user = await User.findById(req.params.id) we can directly
        //access the user req.user
        req.token = token
        req.user = user
        next()

    }catch (e) {
        res.status(401).send({message:'you are not allowed to access service'})
    }

}

module.exports = auth