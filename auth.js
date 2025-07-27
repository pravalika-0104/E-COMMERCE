import dbConn from "./dbConnection.js";
import express from "express";
import jwt from "jsonwebtoken";

const SECRETKEY="pravalika1234"

const router=express.Router()
export default router


router.post("/signup",(req,res)=>{
    console.log("REQ Body=",req.body)
    const{username,password,role}=req.body;

    //TASK: Hash the password before Storing to DB

    //validation
    if(!username || !password || !role){
        res.status(400).json({error:true,message:"Missing fields"})
        return
    }

    dbConn.query("insert into user(username,password,role) values(?,?,?)",[username,password,role],(err,result)=>{
        if(err) {
            res.status(400).json({error:true,message:err.message});
            return
        }
        res.status(201).json({error:false,message:"Signup success",token:token})
    })
})
router.post("/login",(req,res)=>{
    console.log("REQ Body=",req.body)
    const {username,password}=req.body

    if(!username||!password){
        res.status(400).json({error:true,message:"Missing fields"})
        return
    }
    dbConn.query("Select * from user where username=? and password=? and status=?",
        [username,password,1],(err,dbResult)=>{
        if(!dbResult.length){
            res.status(404).json({error:true,message:"User not Found"})
            return
        }
        console.log("dbResult=",dbResult)
        const payload={userid:dbResult[0].userid,username:dbResult[0].username,role:dbResult[0].role}
        //jwt.sign(payload,SECRET_KEY,jwt_Options)
        const token=jwt.sign(payload,SECRETKEY,{expiresIn:"1h"})
        res.status(200).json({error:false,message:"Login Success",token:token,role:payload.role})

    })
})
router.get("/users",authGuard,(req,res)=>{
    
        dbConn.query("select userid,username,role,created_date  from user where status=1",(err,dbResult)=>{
            if(err) throw err
            console.log("USER DB Result=",dbResult)
            res.status(200).json(dbResult)
        })
})
export function authGuard(req,res,next){
    try{
        console.log("REQ Headers=",req.headers.authorization)
        if(!req.headers.authorization){
        throw "Token Not Found"
       }
        const token=req.headers.authorization
        jwt.verify(token,SECRETKEY,(err,decodedPayload)=>{
            if(err) throw "Invalid token"
            console.log("Decoded Payload",decodedPayload)
            req.user=decodedPayload
            next()
        })
    }
    catch(exception){  
    res.status(403).json({error:true,message:exception,token:token});
    }
}







