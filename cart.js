import express from "express";
import dbConn from "./dbConnection.js";
import { authGuard } from "./auth.js";

const router=express.Router();
export default router;

router.post('/add', authGuard, (req, res) => {
    dbConn.query(
        "INSERT INTO cart(pid, userid, quantity) VALUES (?, ?, 1)",
        [req.body.pid, req.user.userid],
        (err, dbResult) => {
            if (err) {
                console.log("Add to cart error:", err);
                return res.status(500).json({ error: true, message: "Something went wrong" });
            }
            res.status(201).json({ error: false, message: "Product added to cart successfully!" });
        }
    );
});


router.get("/all", authGuard, (req, res) => {
    dbConn.query(
        `SELECT cart.cartid AS cartid, my_product.name, my_product.price, my_product.detail,
                my_product.impath, cart.quantity 
         FROM cart 
         JOIN my_product ON cart.pid = my_product.pid  
         WHERE cart.userid = ?`,
        [req.user.userid],
        (err, dbResult) => {
            if (err) {
                console.error("Cart fetch error:", err);
                return res.status(500).json({ error: true, message: "Failed to load cart" });
            }
            res.status(200).json({ error: false, data: dbResult, message: "Cart Result Success!" });
        }
    );
});


router.delete("/delete/:cartid",authGuard,(req,res)=>{
    dbConn.query("delete from cart  where cartid=?",[req.params.cartid],(err,dbResult)=>{
        if(err) throw err
        res.status(200).json({error:false,data:dbResult,message:"Item Removed"})
    })
})
router.put('/update', authGuard, (req, res) => {
    const { cid, quantity } = req.body;

    dbConn.query(
        "UPDATE cart SET quantity=? WHERE cartid=? AND userid=?",
        [quantity, cid, req.user.userid],
        (err, result) => {
            if (err) {
                console.error("Update error:", err);
                return res.status(500).json({ error: true, message: "Database error" });
            }
            res.json({ error: false, message: "Quantity updated" });
        }
    );
});
