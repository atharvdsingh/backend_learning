import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//we use (app.use) for using middlwares in express

//cors ogirin point is writtent in .env also it is pointed the * so that the server will accept every request 
// from any server 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

//for getting the data in json formate ,also setting the limit
app.use(express.json({limit:'16kb'}))
// for data that comes from url  like &='2341' like this 
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))

app.use(cookieParser())
//middleware -- middleware is processing of checking wheather the server requested by client is allowed to request the
// perticulare server{we have to check for this problem ,this checking inbetween is know as middlerware }


//normal cases in GET request we use these 
//(req , res) 
// in middlware we have to write next so that API understand that this is not a server this was aa middlware ,i have to go to next 
// (err,req,res,next)


// IMPORTING THE ROUTES

import userRouter from './routes/user.routes.js'

//router declration 
app.use('/api/v1/users',userRouter)// this will send the controller to userRouter when client goes to /user router
// https://localhost:3000/api/v1/users/register because the controller goes on userRouter

export {app}