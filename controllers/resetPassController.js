const User = require("../model/User");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const resetPassEmail = require("../helper/resetPass");

function generateVerificationCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const sendMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email are required" });

    const foundUser = await User.findOne({
      email,
    });
    if (!foundUser) return res.status(400).json({ message: "User not found" });
    console.log(email);
    const verificationCode = generateVerificationCode();
    foundUser.otp = verificationCode;
    const html = resetPassEmail(verificationCode);

    foundUser.save();

    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      auth: {
        user: "devjim.emailservice@gmail.com",
        pass: "vfxdypfebqvgiiyn",
      },
    });

    const info = await transport.sendMail({
      from: "Livestock Management System <livestock.management.system@email.com>",
      to: email,
      subject: "Reset Password",
      html: html,
    });

    res.status(200).json({ id: foundUser._id });
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

const updatePwd = async (req, res) => {
  try {
    const { email, password, password2, otp } = req.body;
    if (!email || !password || !password2 || !otp)
      return res.status(400).json({ message: "All Fields are required" });

    const passwordMatch = password === password2;
    if (!passwordMatch)
      return res.status(409).json({ message: "Passwords do not match." }); // Conflict

    const foundUser = await User.findOne({
      email,
    });
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    if (foundUser.otp !== otp)
      return res.status(400).json({ message: "Incorrect OTP" });

    const hashedPwd = await bcrypt.hash(password, 10);

    foundUser.password = hashedPwd;
    foundUser.save();

    res.sendStatus(200);
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMail, updatePwd };
