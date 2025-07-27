import express from "express"
import bodyparser from "body-parser"
var app=express();
app.use(bodyparser.json())
app.get("/home",(req,res)=>{
    console.log("Receieved query params=",req.query.name,req.query.age)
    res.status(200).send("Home is working")
})
app.get("/login/:userid",(req,res)=>{
    console.log("Recieved params", req.params.userid)
    res.status(500).send("This is not working")
})
app.post("/signup",(req,res)=>{
    console.log("Recieved body=",req.body)
    res.send(`<h1>Favourite outdoor hobbies is ${req.body.hobbies.outdoor[0]}</h1>`)
})
app.listen(3000)
console.log("Listening to port 3000")