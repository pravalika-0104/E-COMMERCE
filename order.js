//order.js
// order.js
import express from "express";
import dbConn from "./dbConnection.js";
import { authGuard } from "./auth.js";



const router = express.Router();


// GET orders for this vendor
router.get("/vendor/orders", authGuard, (req, res) => {
  const vendorid = req.user.userid;

  const query = `
    SELECT o.*, p.name AS pname, p.price, p.impath AS image,u.userid AS buyerid, u.username AS buyername
    FROM orders o
    JOIN my_product p ON o.pid = p.pid
    JOIN user u ON o.userid = u.userid
    WHERE p.vendorid = ?`
  ;

  dbConn.query(query, [vendorid], (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: true, message: "Database error" });
    }
    res.status(200).json({ error: false, data: result });
  });
});



// 🔹 Place Order
router.post("/place", authGuard, (req, res) => {
  const userId = req.user.userid;

  dbConn.query("SELECT * FROM cart WHERE userid = ?", [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ error: true, message: "DB error" });

    if (cartItems.length === 0)
      return res.status(400).json({ error: true, message: "Cart is empty" });

    // Create order data with default status as 'Placed'
    const orderData = cartItems.map(item => [userId, item.pid, 1, 'Placed']);

    dbConn.query(
      "INSERT INTO orders (userid, pid, quantity, status) VALUES ?",
      [orderData],
      (err2) => {
        if (err2) return res.status(500).json({ error: true, message: "Order failed" });

        dbConn.query("DELETE FROM cart WHERE userid = ?", [userId], (err3) => {
          if (err3) return res.status(500).json({ error: true, message: "Cart clear failed" });
          res.status(200).json({ error: false, message: "Order placed successfully!" });
        });
      }
    );
  });
});

// 🔹 View Orders
router.get("/view", authGuard, (req, res) => {
  const userId = req.user.userid;

  const query = `
    SELECT o.id AS orderid, o.status, o.quantity, p.pname, p.price
    FROM orders o
    JOIN products p ON o.pid = p.pid
    WHERE o.userid = ?
  `;

  dbConn.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: true, message: "DB error" });
    res.status(200).json({ error: false, result });
  });
});
router.get("/my", authGuard, (req, res) => {
  const userId = req.user.userid;

  dbConn.query(
    `SELECT o.orderid, o.quantity, o.pid, o.status, p.name, p.price, p.impath 
     FROM orders o 
     JOIN my_product p ON o.pid = p.pid 
     WHERE o.userid = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Order fetch failed", err);
        return res.status(500).json({ error: true, message: "Failed to load orders" });
      }

      res.status(200).json({ error: false, data: results });
    }
  );
});



// 🔹 Cancel Order
// Inside your Express Router (order.js or index.js)
router.delete("/cancel/:id", authGuard, (req, res) => {
  const orderId = req.params.id;

  dbConn.query("UPDATE orders SET status='Cancelled' WHERE orderid=?", [orderId], (err, dbRes) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: true, message: "Internal server error" });
    }

    if (dbRes.affectedRows === 0) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }

    res.json({ error: false, message: "Order cancelled successfully" });
  });
});



export default router;

