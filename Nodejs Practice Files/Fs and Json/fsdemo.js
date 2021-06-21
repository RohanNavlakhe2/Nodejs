const fs = require('fs')

const log = console.log

//we get buffer data (bytes) whenever we load data from any file using readFileSync
const dataBuffer = fs.readFileSync('data.json')
//use toString()
const jsonStr = dataBuffer.toString() 
const jsonObj = JSON.parse(jsonStr)

 

//Modify the data
jsonObj.title = "Sourabh"
jsonObj.age = 28

fs.writeFileSync('data.json',JSON.stringify(jsonObj))
 
