import express from "express";
import dbConn from "./dbConnection.js";
import { authGuard } from "./auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();
export default router;

// Image upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "_" + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// Upload Product (with image)
router.post("/upload", authGuard, upload.single("image"), (req, res) => {
    const { name, price, detail } = req.body;
    const image = req.file.filename;
    const vendorid = req.user.userid;

    if (!name || !price || !detail || !image) {
        return res.status(400).json({ error: true, message: "Missing fields" });
    }

    const sql = "INSERT INTO my_product (name, price, detail, impath, vendorid) VALUES (?, ?, ?, ?, ?)";
    dbConn.query(sql, [name, price, detail, image, vendorid], (err, result) => {
        if (err) return res.status(500).json({ error: true, message: "DB Error" });
        res.status(201).json({ error: false, message: "Product uploaded successfully!" });
    });
});

// Get all products for a vendor
router.get("/all", authGuard, (req, res) => {
    const vendorid = req.user.userid;

    dbConn.query("SELECT * FROM my_product WHERE vendorid = ?", [vendorid], (err, result) => {
        if (err) {
            console.log("DB Error:", err);  // ✅ Add this to see full error
            return res.status(500).json({ error: true, message: "DB Error" });
        }
        res.status(200).json({ error: false, data: result });
    });
});


// Delete a product
router.delete("/delete/:pid", authGuard, (req, res) => {
    const pid = req.params.pid;
    const vendorid = req.user.userid;

    dbConn.query("DELETE FROM my_product WHERE pid = ? AND vendorid = ?", [pid, vendorid], (err, result) => {
        if (err) return res.status(500).json({ error: true, message: "DB Error" });
        res.status(200).json({ error: false, message: "Product deleted successfully!" });
    });
});

// Get a single product by ID (for editing)
router.get("/single/:pid", authGuard, (req, res) => {
    const pid = req.params.pid;
    const vendorid = req.user.userid;

    dbConn.query("SELECT * FROM my_product WHERE pid = ? and Vendorid=? ", [pid], (err, result) => {
        if (err) {
        console.error("SQL Error:",err);
         return res.status(500).json({ error: true, message: "DB Error" });
        }
        if (result.length === 0) return res.status(404).json({ error: true, message: "Product not found" });
        res.status(200).json({ error: false, data: result[0] });
    });
});

// Update product details (with optional image)
router.put("/update/:pid", authGuard, upload.single("image"), (req, res) => {
    const pid = req.params.pid;
    const { name, price, detail } = req.body;
    const vendorid = req.user.userid;

    let query = "UPDATE my_product SET name=?, price=?, detail=?";
    const params = [name, price, detail];

    if (req.file) {
        const image = req.file.filename;
        query += ", impath=?";
        params.push(image);
    }

    query += " WHERE pid=? AND vendorid=?";
    params.push(pid, vendorid);

    dbConn.query(query, params, (err, result) => {
        if (err) {
          console.error("SQL Update Error:",err);
          return res.status(500).json({ error: true, message: "DB Error" });
        }
        res.status(200).json({ error: false, message: "Product updated successfully!" });
    });
});
// Get all products (publicly accessible for customers)
router.get("/public", (req, res) => {
    dbConn.query("SELECT * FROM my_product", (err, dbResult) => {
        if (err) return res.status(500).json({ error: true, message: "DB Error" });
        res.status(200).json({ error: false, data: dbResult });
    });
});


