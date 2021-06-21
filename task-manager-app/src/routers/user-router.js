const log = console.log
const express = require('express')
const User = require('../models/user')
const authMiddleware = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()


//Create User
router.post('/users', async (req, res) => {
    const newUser = User(req.body)

    //using async-await
    try {
        const token = await newUser.generateJWTForTheUser()
        // await newUser.save()
        //code 201 denotes that the Task has been created
        res.status(201).send({newUser, token})
    } catch (e) {
        //status code 400 denotes that the error is from client side.
        //For ex.while creating a user if client does not pass proper data then this error will cause
        res.status(400).send({message: e})
    }

})

//Login User
router.post('/users/login', async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findUserByCredentials(email, password)
        const token = await user.generateJWTForTheUser()
        res.send({user, token})
    } catch (e) {
        console.log('erro login', e)
        res.status(400).send({message: e.message})
    }
})

//Logout
router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens
            .filter((tokenObj) => tokenObj.token !== req.token)
        await req.user.save()
        res.send({message: 'Logout Successful'})
    } catch (e) {
        res.status(500).send({message: 'server error'})
    }
})

//Logout from all device
router.post('/users/logoutFromAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({message: 'Logout From all devices Successful'})
    } catch (e) {
        res.status(500).send({message: 'server error'})
    }
})

//get user profile
router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user)
    //empty {} in find() shows all users
    /*try {
        res.send(await User.find({}))
    } catch (e) {
        //Here response code is 500 because there are no any chance of Client side error here
        //because client is not responsible to pass any data in query,param or body
        res.status(500).send({message: 'server error ' + e})
    }*/
})

//Upload user profile pic
const upload = multer({
    limits: {
        fileSize: 1000000  //In bytes //1 mb
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return callback(new Error('only jpg,jpeg and png formats are allowed'))
        callback(undefined, true)

        //callback(new Error('')) -> rejects upload with a error
        //callback(undefined,true) -> accepts the upload
        //callback(undefined,false) -> rejects the upload
    }
})

//Here we're using two middlewares first for authentication and second for image upload.
//if authMiddleware calls next() then only the upload middleware will run.

//if any of the middleware throws error then if in those middlewares catch() block is there then
//those errors will be handled there otherwise those errors will be handled in the below express error
//handler callback.
router.post('/users/me/avatar', authMiddleware, upload.single('profilePic'), async (req, res) => {


    //we can access the uploaded file using req.file only when we dont provide 'dest' in multer()
    //configuration object
    req.user.profilePic = await sharp(req.file.buffer).resize({width: 200, height: 200}).png().toBuffer()
    await req.user.save()
    res.send({message: 'Image uploaded successfully'})


}, (err, req, res, next) => {
    res.status(400).send({message: err.message})
})

//Get user profile pic
router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.profilePic)
            return res.status(404).send({message: "profile pic not found"})

        res.set('Content-Type', 'image/png')
        res.send(user.profilePic)
    } catch (e) {
        res.status(404).send({message: e.message})
    }


    /* if(!req.user.profilePic)
         return res.status(404).send({message:"profile pic not found"})*/

})


//Update user
router.patch('/users/me', authMiddleware, async (req, res) => {
    const updatableFields = ['name', 'email', 'password']
    const requestedUpdateFields = Object.keys(req.body)

    requestedUpdateFields.forEach((updateField) => {
        if (!updatableFields.includes(updateField))
            return res.status(400).send({message: 'only name,email & password fields are allowed to be updated'})
    })

    try {
        //Method -2
        //This way is required for ex. when we want to use 'save' middleware.
        //for example if we want to do something just before saving the Task then we use
        //pre('save') middleware on the scheme (While modeling the User).
        //So using the method-1 we can't take the advantage of 'save' middleware because 'save' middleware
        //requires the task.save() method to be called.
        //and if use the method-1 to update user (by using User.findByIdAndUpdate) then this method
        //does not call save() internally.
        /*const user = await User.findById(req.params.id)
        if (!user)
            return res.status(404).send({message: 'user not found to update'})*/
        requestedUpdateFields.forEach((updateField) => req.user[updateField] = req.body[updateField])
        await req.user.save()
        res.send(req.user)


        //Method-1
        //new:true -> returns the new updated user,
        // runValidators:true  -> runs validation on the new data provided to update
        /* const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
         if (!updatedUser)
             return res.status(404).send({message: 'user not found to update'})
         log(updatedUser)
         res.send(updatedUser)*/

    } catch (e) {
        //This catch can be invoked in two cases
        //1. If the validation gets failed for user provided data
        //2. server error
        log('Error', e)
        res.status(400).send({message: e})
    }
})

//Delete user profile pic
router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    req.user.profilePic = undefined
    await req.user.save()
    res.send({message: 'Profile Pic deleted'})
})

//Delete User
router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        /*const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser)
            return res.status(404).send({message: 'user not found to delete'})*/
        await req.user.remove()
        res.send({message: 'user deleted successfully'})

    } catch (e) {
        res.status(400).send({message: e})
    }
})


module.exports = router

//get user by id
/*router.get('/users/:id', async (req, res) => {
    //if client passes id that does not match the format decided for ObjectId by mongodb then
    //it will move to catch block
    //and if client passes the id that is in correct format but with that id there is no any documemt then
    //const user will contain null
    try {
        const user = await User.findById(req.params.id)
        if (!user)
            return res.status(404).send({message: 'user not found with this id'})
        res.send(user)
    } catch (e) {
        res.status(404).send({message: 'user not found'})
    }
})*/
