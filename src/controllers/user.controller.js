import {asyncHandler} from '../utils/asyncdHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudnari.js'
import { ApiRespons } from '../utils/ApiResopns.js'
import jwt from 'jsonwebtoken'
import { upload } from '../middlewares/mullter.middleware.js'

const generateAccessAndRefereshToken=async (userId)=>{
    try {
         const user= await User.findById(userId)
         const accessToken=user.generateAccessToken()
         const refreshToken=user.generateRefreshToken()
         user.refreshToken=refreshToken
         user.save({validateBeforeSave:false})
         return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,'something went wrong while generating access and referesh token ')
    }
}

//register user 
const registerUser=asyncHandler(async (req,res)=>{
    //THIS FOR SPECIFIC THIS PROJECT - these steps vary from project to project

    //  get the user detail from frontend 
    //  validate the user - make sure that the user is not empty (this also checked on frontend side 
    //  check either user already exist of not : using username or email
    //chekc for images-avatar
        //upload them into cloudinary
    //create user object - create entry in database 
    //mongo db will return a respons  from this respons remove the password and refresh token 
    //check the user creation - respons might be empty 
    //return res -in fronend we have to send the respons 

    // now handle the datq from frontend

    // data comes from form , json and url - json and from come from req.body 
    const   { fullName, userName,email,password} = req.body

    //now validate the user 

    /*
    we can check and validate like if(username){
    ApiError(400,'userName is required ')

    }*/

    if([userName,email,fullName,password].some((fields)=> fields?.trim()==='')){
        throw new ApiError(400,"all fields are required")
    }

    //lets check for if the user is already existed
    
    //first call the user and get the user from database if exited using moongoose
    const existedUser= await User.findOne(
        {
            $or:[{userName},{email}]
        }
    )
    if(existedUser){
        throw new ApiError(409,"user already exited ")
    }
    
    // now for further step lets validate weather the client uploaded the avatar
    
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,'please upload avatar image')
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const cover= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,'please upload avatar image ')
    }

    //now lets create the user 
   const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:cover?.url || '',
        email,
        password,
        userName:userName.toLowerCase()
    })
    const createdUser= await User.findById(user._id).select("-password -refreshToken ")
    if(!createdUser){
        throw new ApiError(500,'some thing went wrong on MongoDb while creating the user ')
    }
    return res.status(201).json(
        new ApiRespons(201,createdUser,'user created successfully ')
    )
})

//login user
const loginUser=asyncHandler(async (req,res)=>{
    //get the email and password from backend 
    //validate the (email or userName) password -weather and it is empty or not 
    //using the given email from the mongoose check the user existe or not 
    //if exist then check password is correct -- if not then return wrong password
    // password is correct 
    //generate the refresh and access token 
    //send the respons -LOGIN SECCESS FULLY
     

    const {userName,email,password} = req.body
    if(!userName && !email){
        
        throw new ApiError(400,'Either enter email or Username')
    }    
    const user=await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(404,'user does not exist')
    }
    const isPasswordvalid= await user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new ApiError(401,'Wrong password')
    }
    const {accessToken,refreshToken}=await generateAccessAndRefereshToken(user._id)
    //call again the data to check get all the data because we have to remove password and latest infromation
    const loggedUser=await User.findById(user._id).select('-password -refreshToken')
    const option={
        httpOnly:true,
        secure:true
    }
    return res.
    status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiRespons(
            200,
            {
                user:loggedUser,refreshToken,accessToken
            },
            "user logged in successfully"
        )
    )

})

const logout=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {
                refreshToken:undefined
            },
            
        },
        {
            new:true
        }
    )
    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("refreshToken",option)
    .clearCookie("accessToken",option)
    .json(new ApiRespons(
        200,
        {},
        'user deleted successfull'
    ))
})
const refreshAccessToken=asyncHandler( async (req,res)=>{
    const incomingToken= req.cookies.refreshToken || req.body.refreshToken
    if(!incomingToken){
        throw new ApiError(401,'unAuthorized user')
    }
   try {
     const decodedToken=jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodedToken._id)
     if(!user){
         throw new ApiError(401,'invalide token')
     }
     if(incomingToken !== user.refreshToken){
         throw new ApiError(401,'the token is expired')
     }
     const option={
         httpOnly:true,
         secure:true
     }
 
     const {newAccessToken,newRefreshToken}=await generateAccessAndRefereshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",newAccessToken,option)
     .cookie("refreshToken",newRefreshToken,option)
     .ApiRespons(
         200,
         {
             newRefreshToken:newRefreshToken,
             accessToken:newAccessToken
         },
         'Access token generated successfully'
     )
 
   } catch (error) {
    throw new ApiError("error",error?.message || 'invalide refresh token')
   }
})

   const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {newPassword,oldPassword}=req.body
    const user=await User.findById(req.body?._id)

    const verifyWritepassword=await user.isPasswordCorrect(oldPassword)

    if(!verifyWritepassword){
        throw new ApiError(401,'password is wrong ')
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(ApiRespons(200,
        {},
        'password changed'
    ))
   })
   const currentUser=asyncHandler(  async (req,res)=>{
       
       // THIS WAS WRITTEN BY ME 
       // BUT THE PROBLEM IS I DONT HAVE TO DO THIS 
       // DURING VARAFATION ALL ALREADY ADDED THE USER 
    //    const user=await User.findById(req.body?._id)
    // if(!user){
    //     throw new ApiError(401,'user not found')
    // }
    //  res.status(200)
    //  .json(ApiRespons(200,{user},'user send successfully '))
    return res.status(200).json(ApiError(200,req.body,'send the current user'))
   } )
   
   const updateCurrentUser=asyncHandler( async (req,res)=>{
    const {email,fullName}=req.body
    if(!email || !fullName ){
        throw new ApiError(401,"email or password")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,email
        }


    },{new:true}).select('-password -refreshToken')

    return res.status(200)
    .json(ApiRespons(200,user,'updated secessfully'))
   })
const updateAvatar=asyncHandler(async (req,res)=>{
    const avatartLocalPath=await req.file.path
    if(!avatartLocalPath){
        throw new ApiError(400,'upload avatar')
    }

    const avatarUrlFrom = await uploadOnCloudinary(avatartLocalPath)
    
    if(!avatarUrlFrom){
        throw new ApiError(500,'error from cloudnary error')
    }

   const user= await User.findOneAndUpdate(req.user?._id,{
        $set:{
            avatar:avatarUrlFrom.url
        },
        
    },{
        new:true
    }).select('-password')

    return res.status(200)
    .json(ApiRespons(200,user,'file uploaded successfully'))



})

const updateCover=asyncHandler( async(req,res)=>{
    const coverUrl=req.file.path
    if(!coverUrl){
        throw new ApiError(400,'file is required')
    }
    const updatedUrl=await uploadOnCloudinary(coverUrl)
    if(!updatedUrl){
        throw new ApiError(500,'error from cloudinary ')
    }
    const user=await User.findOneAndUpdate(req.user?._id,{
        $set:{
            coverImage:updatedUrl.url        
        }
    },{
        new:true
    }).select('-password')

    if(!user){
        throw new ApiError(500,'error from Mongodb file is not uploaded')
    }

    return res.status(200)
    .json(ApiRespons(200,user,'cover uploades succefully'))

} )

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {userName}= req.params

    await User.aggregate([{
        $match:{
            userName:userName?.toLowerCase()
        }
    },{
        $lookup:{
            from:'subscriptions',
            localField:"_id",
            foreignField:"channel",as:'subscribers'
        },$lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"users",as:'subscribred    '
        }
    },{
        $addFields:{
                subscribersCount:{
                    $size:"$subscibers"
                },subscribedCount:{
                    $size:"$subscribred"
                },isSubcribed:{
                    $if:{$in:[req.body?._id,'']}
                }
        }
    }
])

})

export {registerUser,loginUser,logout,refreshAccessToken,changeCurrentPassword,currentUser,updateAvatar,updateCurrentUser,updateCover}