const log = console.log
const express = require('express')

//load mongoose.js so that it could run and establish connection with db
require('./db/mongoose')
const userRouter = require('./routers/user-router')
const taskRouter = require('./routers/tasks-router')

const app = express()
const port = process.env.PORT || 3000


//setting up middleware
/*app.use((req,res,next) => {
    res.send('site in under maintainance')
})*/

//converts the incoming json text body in any req to json object
app.use(express.json())

/*app.get('/test',(req,res)=>{
    throw new Error('Error by me ')
},(err,req,res,next) => {
    res.status(400).send({error:err.message})
})*/

//Register user and tasks routers
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    log('server started')
})

/*const Task = require('./models/task')
const User = require('./models/user')

const f1 = async () => {
    //get task and its respective user
    /!*const task = await Task.findById('60cc8d509e749b2f202bf623')
    log('task',task)
    await task.populate('owner').execPopulate()
    log('its user',task.owner)*!/

    //get user and its tasks
    const user = await User.findById('60cc8d3d9e749b2f202bf621')
    log('user',user)
    await user.populate('userTasks').execPopulate()
    log('user takss - ',user.userTasks)

}

f1()*/

