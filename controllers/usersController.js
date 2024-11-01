const bcrypt = require("bcrypt");
const User = require("../model/User");
const nodeMailer = require("nodemailer");
const ROLES_LIST = require("../config/roles_list");

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

  const duplicate = await User.findOne({ email: accountDetails.email }).exec();
  if (duplicate)
    return res
      .status(409)
      .json({ message: "This Email Address is Already in use" }); //confilict

  try {
    const hashedPwd = await bcrypt.hash(accountDetails.password, 10);

    const result = await User.create({
      ...accountDetails,
      password: hashedPwd,
    });

    res.status(201).json({
      success: `New user has been created successfully!`,
      result,
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
    if (req?.body?.role)
      user.roles = { [req.body.role]: ROLES_LIST[req.body.role] };

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

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  archiveUser,
  checkEmailDuplication,
};
