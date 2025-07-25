import {v2 as cloudnari} from 'cloudinary'
import fs from 'fs'

cloudnari.config({
       cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

const uploadOnCloudinary=async (localfileurl)=>{
    try {
        if(!localfileurl) return null
        //if file exist then upload the file on cloudnary
            const respons=await cloudnari.uploader.upload(localfileurl,{
                resource_type:'auto'
        })
        //if file uploaded successfully then 
        fs.unlinkSync(localfileurl)
    return respons        
        
    } catch (error) {
        fs.unlinkSync(localfileurl) //in case of file haven't been uploaded then even this will deleter the
                                    //file for the server so that temporary file can be deleted
        return null
        
    }

}

export { uploadOnCloudinary }