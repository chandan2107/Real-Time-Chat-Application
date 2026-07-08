import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/authRoute.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}))


//db
import connectDB from "./config/dbConfig.js";


connectDB()




//routes
app.use("/api/auth",authRouter)




















//git add .
//git commit -m "Describe your changes"
//git push










app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});