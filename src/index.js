import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDb()
.then(()=>{

    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`app is listenning at PORT: https://localhost:${process.env.PORT} `)
    })
}
)
.catch((error)=>{
    console.log( 'MONGODB CONNECTION ERROR', error)
})

















//THIS CODE BELOW IS A VALID APPROACH ALSO IN THIS SPECIFIC CODE WE ALSO POLUTED THE INDEX.JS WHICH IS NOT LOOKCING BUT 
//WE IN SECOND (SO CALLED GOOD APPROACH )WE GONNA DO ALL THE SHIT IN DB FOLDER BUT ONLY DO CALL THE FUNCTION 

// import mongoose from 'mongoose'
// import { DB_NAME } from './constant';
// import express from 'express'

// const App=express()

// //this is special type of writing the function that excutes just after completing the function 

// //fucntion a(){}
// //a()

// // we can write this above code but this is not a better approach

// ;( async  ()=>{
//      try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         App.on('Error',(error)=>{
//                 console.log('error',error);                
//         })
//         App.listen(process.env.PORT,()=>{
//             console.log(`app is listening at port ${process.env.PORT}`);
            
//         })
//      } catch (error) {
//          console.log('DATABASE ERROR:',error)
//      }
// })()