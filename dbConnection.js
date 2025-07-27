import mysql from "mysql";

const dbConn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    port:3306,
    database:"pravalika_04"
})
dbConn.connect((err)=>{
    if(err) throw err
    console.log("DB Connection Success");
})

export default dbConn;