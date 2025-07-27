import http from "http" // ES2016standard
http.createServer((req,res)=>{
    console.log("Received URL=",req.method,req.url)
    if(req.url=="/home"){
        res.end("Hi Home")
    }
    else{
        res.end("Invalid route")
    }
}).listen(3001)
console.log("Server is listening to port 3000")
//common Js
//var http=require('http')
//http.createServer