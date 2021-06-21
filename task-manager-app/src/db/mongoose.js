const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-db',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
})

/*const user1 = User({
    name:"Abhi",
    phone:9993033263,
    password: 'pass123'
})

user1.save().then(r => log('user saved : '+r)).catch(e => log('err in save user : '+e))*/



/*const task1 = new Task({
    desc:"   New Task ",
})
task1.save().then(r => log('task saved : '+r)).catch(e => log('err in save task : '+e))*/
