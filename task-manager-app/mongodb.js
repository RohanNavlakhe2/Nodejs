const log = console.log
/*const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient*/

const {MongoClient,ObjectId} = require('mongodb')

//when we start the database server from the terminal it starts on port 27017 that's why we used that port below
const connectionUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'task-manager-db'

//useNewUrlParser:true - for parsing url properly
//useUnifiedTopology:true - suggested by a warning
MongoClient.connect(connectionUrl,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
    if(err)
        return log(`Error in connecting to mongodb ${err.message}`)

    log('connected to mongodb')

    const db = client.db(dbName)

    //Read

    /*db.collection('tasks').findOne({_id:new ObjectId("60c74879f84c6024b02cb1bf")},(err,task) => {
        if(err)
            return log('failed to get the task')
        log('got task : ',task)
    })

    db.collection('tasks').find({completed:false}).toArray((err,tasks)=>{
        if(err)
            return log('failed to get the tasks')
        log('got tasks : ',tasks)
    })*/


    //Create

   /* db.collection('tasks').insertMany([
        {desc:"Offline mode",completed:false},
        {desc:"Email",completed:false},
        {desc:"Customer edit",completed:false}
    ],(err,result)=>{

        if(err)
            return log('failed to save data')
        log('data added successfully to db ',result.ops)
    })*/

    /*db.collection('users').insertOne({
        name:"Rohan",
        age:23
    })*/



    //Update

    /*db.collection('tasks').updateMany(
        {completed:false},
        {
            //set update operator is used to update the fields,if the specified field is not already there
            //then it creates that field
            $set:{
                completed:false
            },
            //currentDate update operator is used to set the current date
            $currentDate:{
                dateModified:true
            },
            //Removes the specified field from a document.
            /!*$unset:{
                completed:""
            }*!/
        }
    ).then((result)=>{
        log('update successful '+result)
    }).catch((err)=>{
        log(`failed to update : ${err}`)
    })*/

    //Delete
    db.collection('tasks').deleteOne({desc:"Customer edit"}).then((res)=>{
        log(`task deleted : ${res}`)
    }).catch((err)=>{
        log(`failed to delete task : ${err}`)
    })


})