import express from "express";
import cors from 'cors'

const app = express()

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

import { userRouter } from "./routes/user.route.js";

app.use('/api/user', userRouter)

export { app }