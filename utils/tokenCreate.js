import Token from "../models/token.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const getRefreshToken= async (userId,oldToken=null)=>{

if(oldToken){
    await Token.deleteOne({ userId, token: oldToken });
}

    // creating a refreh token
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    // store the refresh token in the database
    const newToken= new Token({
        userId,
        token:refreshToken,
        expiresAt:Date.now()+7*24*60*60*1000,

    })
    await newToken.save()
    return refreshToken;
}


export const getAccessToken=(userId)=>{
    return  jwt.sign(
        {userId},
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

export const verifyToken=(token,secret)=>{
    // now will retrun is the jwt verified

    return jwt.verify(token,secret)

}