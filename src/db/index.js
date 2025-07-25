import mongoose from "mongoose";
import  {DB_NAME} from '../constant.js'

const connectDb=async ()=>{
    try {
        const connectionInstances= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)        
        console.log(`\nDATABASE CONNECTED SUCESSFULY : Host at:  ${connectionInstances.connection.host}`);
        
    } catch (error) {
        console.log('MONGODB CONNECTION FAILED',error)
        process.exit(1)

    }
}

export default connectDb