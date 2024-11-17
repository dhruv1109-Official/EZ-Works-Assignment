const user = require("../models/User");
const file = require("../models/File");
const nodemailer = require("nodemailer");
const randomToken = require("rand-token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");


dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASS}`,
  },
});

exports.signup = async (req, res) => {
  const { name, email, password,role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!name || !email || !password) {
    return res.status(400).status({ error: "All fields are required" });
  }
  const newUser = new user({
    name,
    email,
    password: hashedPassword,
    role
  });
  try {
    const addUser = await newUser.save();
    const verificationToken = await randomToken.generate(16);
    const verificationUrl = `${process.env.HOST}client/verify?email=${email}&token=${verificationToken}`;
    if (addUser) {
      res.status(200).send({
        message:
          "User Registered, A Email for verification is sent on your registered Email-ID.Please Verify!",
      });
      await user.findOneAndUpdate(
        { email: email },
        { verifyToken: verificationToken }
      );
      transporter.sendMail({
        from: `${process.env.EMAIL_USER}`,
        to: email,
        subject: "Email Verification!",
        html: `<div style="border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #4CAF50; font-family: Arial, sans-serif; text-align: center;">Hello ${name}, Please Verify Your Email!</h1>
                    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                        Here, is the verification link:
                    </p>
                    <center>
                    <a style="font-family: Arial, sans-serif; font-size: 16px; color: #333; text-align: center;" href="${verificationUrl}">Verify Email</a>
                    </center>
                    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; text-align: center; font-weight: bold;">
                        Thank You
                    </p>
                </div>`,
      });
    } else {
      console.log("Error Registering User");
    }
  } catch (e) {
    res.status(500).send({ message: `Error:${e.message}` });
  }
};

exports.verify = async (req, res) => {
  const { token, email } = req.query;
  const verificationToken = await user.findOne({ email: email });

  if (verificationToken.verifyToken === token) {
    try {
      const updateVerifyStatus = await user.findOneAndUpdate(
        { email: email },
        { isVerified: true }
      );
      if (updateVerifyStatus) {
        console.log("Verified");
        res.status(200).send({ message: "Email Verified" });
        transporter.sendMail({
          from: `${process.env.EMAIL_USER}`,
          to: email,
          subject: "Confirmation! Email Verified!",
          html: `<div style="border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #4CAF50; font-family: Arial, sans-serif; text-align: center;">Your Email is Verified!</h1>
                    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; text-align: center; font-weight: bold;">
                        Thank You
                    </p>
                </div>`,
        });
      }
    } catch (e) {
      console.log("Error", e.message);
      transporter.sendMail({
        from: `${process.env.EMAIL_USER}`,
        to: email,
        subject: "Sorry!Error Occurred during Email Verification !",
        html: `<div style="border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #4CAF50; font-family: Arial, sans-serif; text-align: center;">Some Error Occurred during Email Verification.</h1>
                  <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                        Please Retry from the same link provided in the Verification mail
                    </p>
                  <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; text-align: center; font-weight: bold;">
                      Apologies! for Inconvenience
                  </p>
              </div>`,
      });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await user.findOne({ email: email });
    if (checkUser) {
      const checkPassword = await bcrypt.compare(password, checkUser.password);
      if (checkPassword) {
        const payload = {
          email,
          password,
          role:checkUser.role
        };
        const jwtToken = await jwt.sign(payload, `${process.env.JWT_SECRET}`);
        res.status(200).send({ jwtToken });
      } else {
        res.status(403).send({ message: "Invalid Password" });
      }
    } else {
      res.status(403).send({ message: "Invalid Email or Unregistered User" });
    }
  } catch (e) {
    res.status(400).send({ message: `Error:${e.message}` });
  }
};

exports.listFiles = async (req, res) => {
  try {
    getFiles = await file.find({});
    if (getFiles.length > 0) {
      res.send([getFiles]);
    } else {
      res.status(204).send("No Files Uploaded Yet");
    }
  } catch (e) {
    res.status(500).send({ message: `Error ${e.message}` });
  }
};

exports.encryptedDownloadLink = async (req, res) => {
  const fileUId = req.params.fileId;

  try {
    // Construct the encrypted URL
    const downloadUrl = `${process.env.HOST}client/download/${fileUId}`;
    const encryptedUrl = encodeURIComponent(downloadUrl);

    // Send the link in the response
    res.send({
      downloadLink: `${process.env.HOST}client/decrypt?url=${encryptedUrl}`,
    });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};


exports.DencryptDownloadLink = async (req, res) => {
  const fileUrl = req.query.url;
  try{
    const decodedUrl=decodeURI(fileUrl)
    // console.log(decodedUrl)
    res.redirect(decodedUrl)
  }catch(e){
    res.status(500).send({error:e.message})
  }
};

exports.downloadFile = async (req, res) => {
  const fileUId = req.params.fileId;

  try {
    // Fetch file details from the database
    const fileDetails = await file.findOne({ fileId: fileUId });

    if (!fileDetails) {
      return res.status(404).send({ message: "File not found" });
    }

    // const extractedPath = fileDetails.filePath;
    const filePath = path.join(__dirname, "..", fileDetails.filePath);
    // Send the file as a download
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(500).send({ message: "Error downloading file" });
      }
    });
  } catch (e) {
    console.error("Error fetching file details:", e);
    res.status(500).send({ message: "Server error" });
  }
};
