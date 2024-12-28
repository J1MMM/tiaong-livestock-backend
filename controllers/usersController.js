const bcrypt = require("bcrypt");
const User = require("../model/User");
const nodeMailer = require("nodemailer");
const emailFormat = require("../helper/emailFormat");
const { v4 } = require("uuid");

function generateVerificationCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const getAllUsers = async (req, res) => {
  try {
    const result = await User.find();
    if (!result) return res.status(204).json({ message: "No students found" });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const checkEmailDuplication = async (req, res) => {
  try {
    const result = await User.find({ email: req.body.email });
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const accountDetails = req.body;
  if (!accountDetails)
    return res.status(400).json({ message: "All fields are required" });

  const duplicate = await User.findOne({
    email: accountDetails.email,
    verified: true,
    archive: false,
  }).exec();

  if (duplicate)
    return res
      .status(409)
      .json({ message: "This Email Address is Already in use" }); //confilict
  if (accountDetails.password !== accountDetails.password2)
    return res.status(409).json({ message: "Password do not match" }); //confilict

  try {
    const hashedPwd = await bcrypt.hash(accountDetails.password, 10);

    const verificationCode = generateVerificationCode();

    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      auth: {
        user: "devjim.emailservice@gmail.com",
        pass: "vfxdypfebqvgiiyn",
      },
    });

    const html = emailFormat(verificationCode);

    const info = await transport.sendMail({
      from: "Livestock Management System <livestock.management.system@email.com>",
      to: accountDetails.email,
      subject: verificationCode,
      html: html,
    });

    const foundUser = await User.findOne({ email: accountDetails.email });
    let userID = "";

    if (foundUser) {
      foundUser.otp = verificationCode;
      foundUser.password = hashedPwd;
      userID = foundUser.id;
      await foundUser.save();
    } else {
      const result = await User.create({
        ...accountDetails,
        password: hashedPwd,
        otp: verificationCode,
      });
      userID = result.id;
    }

    res.status(201).json({
      success: `Verification email sent! Please check your inbox (and spam/junk folder) to verify your account.`,
      result: { _id: userID },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  if (!req.body?.id)
    return res.status(400).json({ message: "ID are required" });

  try {
    const user = await User.findOne({ _id: req.body.id }).exec();
    let pwdMatch = false;

    if (req?.body?.password) {
      pwdMatch = await bcrypt.compare(req.body.password, user.password);
    } else {
      pwdMatch = true;
    }

    const duplicate = await User.findOne({ email: req.body.email }).exec();
    if (duplicate && duplicate._id != req.body.id)
      return res.status(409).json({ message: "Email address already in use" });

    if (req?.body?.firstname) user.firstname = req.body.firstname;
    if (req?.body?.lastname) user.lastname = req.body.lastname;
    if (req?.body?.middlename) user.middlename = req.body.middlename;
    if (req?.body?.gender) user.gender = req.body.gender;
    if (req?.body?.address) user.address = req.body.address;
    if (req?.body?.contactNo) user.contactNo = req.body.contactNo;
    if (req?.body?.middlename?.trim() === "") {
      user.middlename = "";
    }
    if (req?.body?.email) user.email = req.body.email;
    if (req?.body?.password)
      user.password = await bcrypt.hash(req.body.password, 10);

    const result = await user.save();
    res.json({ success: "User updated successfully!", result });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { idsToDelete } = req.body;
  if (!idsToDelete) return res.sendStatus(400);

  try {
    await User.deleteMany({ _id: { $in: idsToDelete } });

    const result = await User.find();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const archiveUser = async (req, res) => {
  const { idsToDelete, toAchive } = req.body;
  if (!idsToDelete || !req.id)
    return res.status(400).json({ message: "id's are required" });

  const updateOperation = {
    $set: {
      archive: toAchive ? true : false,
    },
  };

  try {
    await User.updateMany({ _id: { $in: idsToDelete } }, updateOperation);
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.sendStatus(400);

  try {
    const user = await User.findOne({ _id: id });
    if (!user) return res.sendStatus(204);
    res.json(user);
  } catch (err) {
    console.error(err);
  }
};

const verifyCode = async (req, res) => {
  try {
    const { otp, id } = req.body;

    if (!otp || !id) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const foundUser = await User.findOne({ _id: id });

    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (foundUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    foundUser.verified = true;
    await foundUser.save();

    // Additional code for successful verification (if any) would go here
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  archiveUser,
  checkEmailDuplication,
  verifyCode,
};
