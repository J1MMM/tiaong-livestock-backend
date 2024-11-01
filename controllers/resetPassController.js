const User = require("../model/User");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const bcrypt = require("bcrypt");

const sendMail = async (req, res) => {
  const { email } = req.body.data;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser)
      return res
        .status(404)
        .json({ message: "We didn't recognize that email." });

    const payload = {
      email: foundUser.email,
      id: foundUser._id,
    };

    const resetToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "5m",
    });

    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      auth: {
        user: "devjim.emailservice@gmail.com",
        pass: "vfxdypfebqvgiiyn",
      },
    });

    // const resetPageUrl = 'http://localhost:5173'
    const resetPageUrl = "https://ppp-learning-tool.vercel.app";
    const html = `
		 		<!DOCTYPE html>
 				<html>
 				<head>
 					<link rel="preconnect" href="https://fonts.googleapis.com">
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
					<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

					<style>
						*{
							font-family: 'Poppins', sans-serif;
						}
						p{
							font-size: large
						}
					</style>
 				</head>

		 		<body>
		 		<div style="width: 100%; background-color: #F5F5F3; padding: 80px 10px; box-sizing: border-box">
				    <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 480px; margin: auto; border-radius: 10px; box-sizing: border-box">
				        <h1 style="margin: 0; text-align: center; font-weight: bold; font-size: xx-large">Reset your PPPedu password</h1>
			            <p style="text-align: center; margin: 0; margin-top: 16px;">Hi ${foundUser.firstname} ${foundUser.lastname},</p>
			            <p style="text-align: center; margin-top: 0;">We're sending you this email because you requested a password reset. Click on this link to create new password</p>

			            <a href='${resetPageUrl}/reset-password/${resetToken}' style="display: block; padding: 10px 20px; background-color: #2DA549; color: #FFF; text-decoration: none; border-radius: 10px; margin: 30px auto; width: fit-content; font-size: large; margin-top: 20px"> Set a new password </a>

			            <small style="display: block;text-align: center; max-width: 80%; margin: auto">If you did not request a password reset, you can safely ignore this email. Only a person with access to your email can reset your account password</small>
				    </div>
				</div>
			    </body>
			    </html>
		`;

    const info = await transport.sendMail({
      from: "PPPedu <pppedu@email.edu>",
      to: email,
      subject: "Password Reset",
      html: html,
    });

    res.json({ message: `We've sent password reset link to: ${email}` });
  } catch (err) {
    console.log(err);
  }
};

const checkToken = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ message: "Token is required" });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) return res.sendStatus(400);

    const foundUser = await User.findOne({ email: decoded.email }).exec();
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "token verified" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePwd = async (req, res) => {
  const { pwd, token } = req.body;
  if (!pwd || !token)
    return res.status(400).json({ message: "password and token are required" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) return res.status(400).json({ message: "Invalid token" });

    const foundUser = await User.findOne({ _id: decoded.id }).exec();
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const hashedPwd = await bcrypt.hash(pwd, 10);

    if (pwd) foundUser.password = hashedPwd;
    await foundUser.save();
    res.json({ message: "Your password has been changed successfully." });
  } catch (err) {
    console.log(err);
    res.json({ message: err.message });
  }
};

module.exports = { sendMail, updatePwd, checkToken };
