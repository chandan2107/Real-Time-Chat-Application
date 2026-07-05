import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const app = express();

//db
import connectDB from "./config/dbConfig.js";
connectDB()








//git add .
//git commit -m "Describe your changes"
//git push










app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});