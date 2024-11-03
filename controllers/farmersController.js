const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Farmer = require("../model/Farmer");
const nodeMailer = require("nodemailer");

const handleLogin = async (req, res) => {
  console.log("login");
  const { referenceNo, password } = req.body;
  if (!referenceNo || !password) {
    return res
      .status(400)
      .json({ message: "Reference no. and password are required" });
  }

  try {
    console.log(password);
    const foundUser = await Farmer.findOne({
      referenceNo: referenceNo,
      archive: false,
      //   isApprove: true,
    });
    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Incorrect reference no. or password" });
    }

    foundUser.refreshToken = null; // Clear existing refresh token

    const id = foundUser._id;

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: id,
          referenceNo: foundUser.referenceNo,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { referenceNo: foundUser.referenceNo },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Send both tokens back to the client
    console.log("success");
    const { password: userPass, ...farmerData } = foundUser.toObject(); // Convert Mongoose document to plain object and remove password
    return res.json({ ...farmerData, accessToken }); // Send back the data without password
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerFarmer = async (req, res) => {
  const data = req.body;
  if (!data.referenceNo || !data.email || !data.password || !data.password2)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const duplicate = await Farmer.findOne({
      email: data.email,
    }).exec();

    if (duplicate)
      return res
        .status(409)
        .json({ message: "This Email Address is Already in use" }); //confilict

    const passwordMatch = data.password == data.password2;
    if (!passwordMatch)
      return res.status(409).json({ message: "Passwords do not match." }); //confilict

    const hashedPwd = await bcrypt.hash(data.password, 10);

    const result = await Farmer.create({
      ...data,
      password: hashedPwd,
    });

    res.status(201).json({
      success: `New User has been created successfully!`,
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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

const updateFarmer = async (req, res) => {
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
    if (req?.body?.role)
      user.roles = { [req.body.role]: ROLES_LIST[req.body.role] };

    const result = await user.save();
    res.json({ success: "User updated successfully!", result });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteFarmer = async (req, res) => {
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

const archiveFarmer = async (req, res) => {
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

module.exports = { handleLogin, registerFarmer };
