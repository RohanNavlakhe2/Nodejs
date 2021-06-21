const log = console.log
const express = require('express')
const Task = require('../models/task')
const authMiddleware = require('../middlewares/auth')
const router = new express.Router()

//Create Task
router.post('/tasks',authMiddleware,async (req, res) => {
    //const newTask = Task(req.body)

    //copying the body to the new object and providing the user id who has called this endpoint
    const newTask = Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        await newTask.save()
        res.status(201).send({message: 'task added succefully'})
    } catch (e) {
        //status code 400 denotes that the error is from client side.
        //For ex.while creating a task if client does not pass proper data then this error will cause
        res.status(400).send({message: e.message})
    }

})

//Get all tasks
router.get('/tasks',authMiddleware,async (req, res) => {

    //Filter Tasks based on completed or not
    const filter = {}

    //if true means we got a completed=true/false in query Ex. /tasks/completed=true
    if(req.query.completed)
        filter.completed = req.query.completed === 'true'

    //Pagination
    const limit = parseInt(req.query.limit)
    const pageNo = parseInt(req.query.page)
    if(pageNo < 1 || limit < 1){
        res.status(400).send({message:"page no & limit cannot be less than 1"})
        return
    }

    //options in populate() takes limit and skip properties.
    //limit - limits the no of results and skip - skips the no of results.
    //For ex. if total results = 30 and limit = 10 and skip = 15 then we will get the last 5 results only.

    //In query we're getting the pageno and limit
    //so here finding the number of results to skip based on the pageno and limit.
    const skip = (pageNo - 1) * limit

    //Sort Tasks based on Created at
    const sort = {}
    const sortQuery = req.query.sortBy

    //if client provides sortBy in query then put (createdBy:the value user provided) in sort object
    //Ex. /tasks?sortBy=createdAt:desc
    //Otherwise empty sort object will be passed in options:{sort} in populate() which means no any sorting
    if(sortQuery){
        const splittedSortQuery = sortQuery.split(':')
        sort[splittedSortQuery[0]] = splittedSortQuery[1]
    }

    try {
        //1 way
        //res.send(await Task.find({owner:req.user._id}))

        //2 way
        await req.user.populate({
            path:'userTasks',
            match:filter,
            options:{limit,skip,sort}
        }).execPopulate()
        res.send(req.user.userTasks)
    } catch (e) {
        res.status(500).send({message: 'server error : ' + e})
    }
})

//get tasks by id
router.get('/tasks/:id', authMiddleware,async (req, res) => {
    const _id = req.params.id

    //if client passes id that does not match the format decided for ObjectId by mongodb then
    //it will move to catch block
    //and if client passes the id that is in correct format but with that id there is no any documemt then
    //const task will contain null
    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({_id,owner:req.user._id})
        if (!task)
            return res.status(400).send({message: 'Task not avbl with this id'})
        res.send(task)
    } catch (e) {
        console.log('error in get task by id',e)
        res.status(400).send({message: 'Task not found'})
    }
})

//Update Task
router.patch('/tasks/:id',authMiddleware,async (req, res) => {
    const updatableFields = ['desc', 'completed']
    const requestedUpdateFields = Object.keys(req.body)

    if(requestedUpdateFields.length === 0)
        return res.status(400).send({message: 'please provide fields to update'})

    requestedUpdateFields.forEach((updateField) => {
        if (!updatableFields.includes(updateField))
            return res.status(400).send({message: 'only desc & completed fields are allowed to be updated'})
    })



    try {

        //Method -1
        //const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const updatedTask = await Task
            .findOneAndUpdate({_id:req.params.id,owner:req.user._id},req.body,{new:true,runValidators:true})

        if (!updatedTask)
            return res.status(404).send({message: 'no task found to update'})

        res.send(updatedTask)


        //Method -2
        //This way is required for ex. when we want to use 'save' middleware.
        //for example if we want to do something just before saving the Task then we use
        //pre('save') middleware on the scheme (While modeling the User).
        //So using the method-1 we can't take the advantage of 'save' middleware because 'save' middleware
        //requires the task.save() method to be called.

       /* const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task)
            return res.status(404).send({message: 'no task found to update'})

        requestedUpdateFields.forEach((field) => task[field] = req.body[field])
        await task.save()
        res.send(task)*/




    } catch (e) {
        //This catch can be invoked in two cases
        //1. If the validation gets failed for task provided data
        //2. server error
        res.status(400).send({message: e})
    }

})

//Delete Task
router.delete('/tasks/:id',authMiddleware,async (req,res) => {
    try {
        //const deletedTask = await Task.findByIdAndDelete(req.params.id)
        const deletedTask = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!deletedTask)
            return res.status(404).send({message:'no any task found to delete'})
        res.send({message:'Task Deleted Successfully'})

    }catch (e) {
        res.status(400).send({message:e})
    }
})

module.exports = router