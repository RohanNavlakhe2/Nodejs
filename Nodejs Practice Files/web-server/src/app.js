//1. This file demonstrates how to serve 'public' directory (which contains static data)
//   like html,css,js files and images.
//2. and return html tags,json and any file to browser

const path = require('path')
const express = require('express')
const app = express()
const log = console.log

const publicDirPath = path.join(__dirname,'../public')

//serving public dir
app.use(express.static(publicDirPath))

//This route won't be hit because we have index.html in public directory
//So when we will hit the url localhost:3000 then the above line -> app.use(express.static(publicDirPath)) will return
//index.html to the browser
app.get('',(req,res) => {
    res.send('welcome to node')
})

//so we hit localhost:3000/about.html then -> about.html will be returned to browser.
//and if we hit localhost:3000/about then -> the below route will be invoked which will return json.

//return object to browser
app.get('/about',(req,res) => {
    log("Req",req.path)
    res.send({
        name:'Yogxtreme',
        estd:2020
    })
})


//return html tag to browser
app.get('/help',(req,res) => {
    log("Req",req.path)
    res.send(`<h1 style="color: red">Help Page</h1>`)
})

//return a file to browser
app.get('/contact',(req,res)=>{
    res.sendFile(`${publicDirPath}/contact.html`)
})



//starts a server at port 3000
app.listen(3000,() => {
  log('server started')
})