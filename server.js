import express from "express";
import bodyParser from "body-parser";
import authRoute from "./auth.js";
import cors from "cors";
import productRoute from "./product.js";
import cartRoute from "./cart.js";
import orderRoute from "./order.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'FRONTEND')));

app.use("/auth", authRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);
app.use("/uploads", express.static("uploads"));

app.listen(3000);
