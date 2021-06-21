const log = console.log
require('../src/db/mongoose')
const Task = require('../src/models/task')

//Delete a taks and print the number of tasks which are "incomplete"

//Using Promise Chaining
/*Task.findByIdAndDelete('60c998be0c549a34485d8c45').then((deletedTask) => {
    log('Task Deleted ',deletedTask)
    return Task.countDocuments({completed:false})
}).then((incompleteTasksNo)=>{
    log('Incomplete tasks -',incompleteTasksNo)
}).catch((err)=>{
    log('error',err)
})*/

//Using async-await
const deleteTaskAndProvideInCompletedTasksCount = async (taskIdToDelete) => {
   const deletedTask = await Task.findByIdAndDelete(taskIdToDelete)
    log('deleted task : ',deletedTask)
    return Task.countDocuments({completed: false});
}

deleteTaskAndProvideInCompletedTasksCount('60c998c90c549a34485d8c46').then((incompleteTasks)=>{
    log('incomplete task : ',incompleteTasks)
}).catch((err)=>log(err))


