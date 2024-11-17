const user = require("../models/User");
const file=require("../models/File")
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")




exports.login=async(req,res)=>{
    const {email,password}=req.body
  
    try{
    const checkUser=await user.findOne({email:email})
    if (checkUser){
      const checkPassword=await bcrypt.compare(password,checkUser.password)
      if (checkPassword){
        const payload={
          email,
          password
        }
        const jwtToken=await jwt.sign(payload,"abcdef")
        res.status(200).send({jwtToken})
      }else{
        res.status(403).send({message:"Invalid Password"})
      }
    }else{
      res.status(403).send({message:"Invalid Email or Unregistered User"})
    }
    }catch(e){
      res.status(400).send({message:`Error:${e.message}`})
    }
  }

exports.fileUpload=async(req,res)=>{
    if (!req.file) {
        return res.status(400).send("No file uploaded or invalid file type.");
      }
    const uploadedFile=req.file
      const newFile=new file({
        fileName: uploadedFile.originalname,
        filePath: uploadedFile.path,
      })
      await newFile.save()
      return res.send({message:"File uploaded successfully."});
}

