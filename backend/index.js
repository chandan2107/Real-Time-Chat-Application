import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/dbConfig.js";
import authRouter from "./routes/authRoute.js";
import chatRouter from "./routes/chatRoute.js";
import http from "http"
import { initializeSocket } from "./services/socket.service.js";
import statusRouter from "./routes/statusRoute.js";


const PORT = process.env.PORT || 3000;
const app = express();

const corsOption ={
    origin:process.env.FRONTEND_URL,
    credentials:true
}
app.use(cors(corsOption))

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}))

//db
connectDB()

//server
const server=http.createServer(app)
const io=initializeSocket(server)

//apply socket middleware before routes
app.use((req,res,next)=>{
    req.io=io;
    req.socketUserMap=io.socketUserMap
    next()
})






//routes
app.use("/api/auth",authRouter)
app.use("/api/chat",chatRouter)
app.use("/api/status",statusRouter)












server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});