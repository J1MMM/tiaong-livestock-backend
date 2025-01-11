const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Farmer = require("../model/Farmer");
const nodeMailer = require("nodemailer");
const { v4 } = require("uuid");
const emailFormat = require("../helper/emailFormat");
const dayjs = require("dayjs");
const resetPassEmail = require("../helper/resetPass");

function generateVerificationCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const getFarmersData = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: true,
      archive: false,
      emailVerified: true,
    })
      .sort({ registeredAt: -1 })
      .lean();

    if (!result || result.length === 0)
      return res.status(204).json({ message: "No Pending Farmers Data found" });

    const _result = result.map((obj) => {
      const base64IDImage = obj?.idImage.toString("base64");
      const base64UserImage = obj?.userImage.toString("base64");
      const idImage = `data:image/png;base64,${base64IDImage}`;
      const userImage = `data:image/png;base64,${base64UserImage}`;
      const fullname = `${obj.firstname} ${obj.middlename} ${obj.surname} ${obj.extensionName}`;
      const birthDate = dayjs(obj.birthDate).format("MM/DD/YYYY");
      const id = obj._id;

      return {
        ...obj,
        idImage,
        userImage,
        fullname,
        birthDate,
        id,
      };
    });

    res.json(_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFarmersArchivedData = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: true,
      archive: true,
      emailVerified: true,
    }).lean();

    if (!result || result.length === 0)
      return res.status(204).json({ message: "No Pending Farmers Data found" });

    const _result = result.map((obj) => {
      const base64IDImage = obj?.idImage.toString("base64");
      const base64UserImage = obj?.userImage.toString("base64");
      const idImage = `data:image/png;base64,${base64IDImage}`;
      const userImage = `data:image/png;base64,${base64UserImage}`;
      const fullname = `${obj.firstname} ${obj.middlename} ${obj.surname} ${obj.extensionName}`;
      const birthDate = dayjs(obj.birthDate).format("MM/DD/YYYY");
      const id = obj._id;
      return { ...obj, idImage, userImage, fullname, birthDate, id };
    });

    res.json(_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleFarmersArchive = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: `Bad request` });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: false,
      emailVerified: true,
      isApprove: true,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });
    const datenow = Date.now();

    foundUser.archive = true;
    foundUser.archivedAt = datenow;

    await foundUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleFarmersRestore = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: `Bad request` });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: true,
      emailVerified: true,
      isApprove: true,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });

    foundUser.archive = false;

    await foundUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleLogin = async (req, res) => {
  console.log("login");
  const { referenceNo, password } = req.body;
  if (!referenceNo || !password) {
    return res
      .status(400)
      .json({ message: "Reference no. and password are required" });
  }

  try {
    let foundUser;

    foundUser = await Farmer.findOne({
      referenceNo: referenceNo,
      archive: false,
      emailVerified: true,
    });

    if (!foundUser) {
      foundUser = await Farmer.findOne({
        email: referenceNo,
        emailVerified: true,
      });
    }
    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    if (!foundUser.emailVerified) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Incorrect reference no. or password" });
    }

    foundUser.refreshToken = null; // Clear existing refresh token

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: foundUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Send both tokens back to the client
    console.log("success");
    const { password: userPass, ...farmerData } = foundUser.toObject(); // Convert Mongoose document to plain object and remove password
    const userImageBuffer = foundUser.userImage.toString("base64");
    const userImage = `data:image/png;base64,${userImageBuffer}`;
    const fullname = `${foundUser.firstname} ${foundUser.middlename} ${foundUser.surname} ${foundUser.extensionName}`;

    return res.json({
      ...farmerData,
      fullname,
      accessToken,
      refreshToken,
      id: foundUser._id,
      userImage,
    }); // Send back the data without password
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerFarmer = async (req, res) => {
  const data = req.body;
  const MIN_PASSWORD_LENGTH = 8; // Set minimum password length
  const MAX_PASSWORD_LENGTH = 20; // Set maximum password length

  if (!data.email || !data.password || !data.password2)
    return res.status(400).json({ message: "All fields are required" });

  // Check if password meets length requirements
  if (
    data.password.length < MIN_PASSWORD_LENGTH ||
    data.password.length > MAX_PASSWORD_LENGTH
  ) {
    return res.status(400).json({
      message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    });
  }

  try {
    const duplicate = await Farmer.findOne({
      email: data.email,
      emailVerified: true,
      archive: false,
    }).exec();

    if (duplicate)
      return res
        .status(409)
        .json({ message: "This Email Address is Already in use" }); // Conflict

    const passwordMatch = data.password === data.password2;
    if (!passwordMatch)
      return res.status(409).json({ message: "Passwords do not match." }); // Conflict

    const hashedPwd = await bcrypt.hash(data.password, 10);

    const verificationCode = generateVerificationCode();

    const foundUser = await Farmer.findOne({ email: data.email });
    let userID = "";

    if (foundUser) {
      foundUser.verificationCode = verificationCode;
      foundUser.password = hashedPwd;
      userID = foundUser.id;
      await foundUser.save();
    } else {
      const result = await Farmer.create({
        ...data,
        password: hashedPwd,
        verificationCode,
      });
      userID = result.id;
    }

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
      to: data.email,
      subject: verificationCode,
      html: html,
    });

    res.status(201).json(userID);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendVerification = async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) return res.status(400).json({ message: "Bad Request" });

  const foundUser = await Farmer.findOne({
    _id: id,
  });

  if (!foundUser)
    return res.status(401).json({ message: "Unauthorized: User not found" });
  const verificationCode = generateVerificationCode();

  foundUser.verificationCode = verificationCode;

  try {
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
      to: email,
      subject: verificationCode,
      html: html,
    });

    await foundUser.save();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyCode = async (req, res) => {
  console.log("ok");

  try {
    const { verificationCode, id } = req.body;

    if (!verificationCode || !id) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const foundUser = await Farmer.findOne({ _id: id });

    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    console.log(foundUser.verificationCode);
    console.log(verificationCode);

    if (foundUser.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Additional code for successful verification (if any) would go here
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const savePendingAccount = async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).json({ message: "Bad Request" });
    // Find and update the document with the provided data
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: req.body.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: req.body.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const idImageBuffer = Buffer.from(req.body.idImage.data, "base64");
    const userImageBuffer = Buffer.from(req.body.userImage.data, "base64");

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.body.id, // ID of the document to update
      {
        surname: req.body.surname,
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        extensionName: req.body.extensionName,
        sex: req.body.sex,
        houseNo: req.body.houseNo,
        street: req.body.street,
        barangay: req.body.barangay,
        contactNo: req.body.contactNo,
        birthDate: req.body.birthDate,
        birthPlace: req.body.birthPlace,
        religion: req.body.religion,
        specifyReligion: req.body.specifyReligion,
        civilStatus: req.body.civilStatus,
        spouseName: req.body.spouseName,
        motherMaidenName: req.body.motherMaidenName,
        householdHead: req.body.householdHead,
        householdRelationship: req.body.householdRelationship,
        nameOfHouseholdHead: req.body.nameOfHouseholdHead,
        numberOfLivingHead: req.body.numberOfLivingHead,
        noMale: req.body.noMale,
        noFemale: req.body.noFemale,
        education: req.body.education,
        PWD: req.body.PWD,
        _4ps: req.body._4ps,
        memberIndigenousGroup: req.body.memberIndigenousGroup,
        specifyIndigenousGroup: req.body.specifyIndigenousGroup,
        withGovernmentID: req.body.withGovernmentID,
        specifyGovernmentID: req.body.specifyGovernmentID,
        idNumber: req.body.idNumber,
        memberAssociationOrCooperative: req.body.memberAssociationOrCooperative,
        specifyAssociationOrCooperative:
          req.body.specifyAssociationOrCooperative,
        personToNotifyInCaseEmergency: req.body.personToNotifyInCaseEmergency,
        contactPersonToNotifyInCaseEmergency:
          req.body.contactPersonToNotifyInCaseEmergency,
        livelihood: req.body.livelihood,
        livestockChecked: req.body.livestockChecked,
        livestockSpecify: req.body.livestockSpecify,
        poultryChecked: req.body.poultryChecked,
        poultrySpecify: req.body.poultrySpecify,
        landPreparationChecked: req.body.landPreparationChecked,
        harvestingChecked: req.body.harvestingChecked,
        kindOfWorkOther: req.body.kindOfWorkOther,
        kindOfWorkSpecify: req.body.kindOfWorkSpecify,
        grossAnnualIncome: req.body.grossAnnualIncome,
        specifyGrossAnnualIncome: req.body.specifyGrossAnnualIncome,
        idImage: idImageBuffer,
        userImage: userImageBuffer,
        emailVerified: true,
        refreshToken: refreshToken,
        archive: false,
        registeredAt: Date.now(),
      },
      { new: true } // Return the updated document
    );

    // Check if document was found and updated
    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Send a response confirming successful update
    res.status(200).json({
      accessToken,
      refreshToken,
      message: "Farmer Save to Pending successfully",
    });
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.query;
  if (!refreshToken) return res.status(401).json({ message: "Bad request" });

  const foundUser = await Farmer.findOne({
    refreshToken,
    archive: false,
  });
  if (!foundUser) return res.status(403).json({ message: "Invalid Token" });

  const id = foundUser._id;
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || decoded.id !== foundUser.id) return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const userImageBuffer = foundUser.userImage.toString("base64");
    const userImage = `data:image/png;base64,${userImageBuffer}`;
    const fullname = `${foundUser.firstname} ${foundUser.middlename} ${foundUser.surname} ${foundUser.extensionName}`;

    res.json({
      ...foundUser._doc,
      userImage,
      fullname,
      accessToken,
      isApprove: foundUser.isApprove,
      id: foundUser._id,
    });
  });
};

const resetPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.sendStatus(400);

    const foundUser = await Farmer.findOne({
      email,
      archive: false,
      emailVerified: true,
      isApprove: true,
    });
    if (!foundUser) return res.sendStatus(400);
    const verificationCode = generateVerificationCode();
    foundUser.verificationCode = verificationCode;
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

const handleChangePass = async (req, res) => {
  try {
    const { id, password, password2 } = req.body;
    if (!id || !password || !password2) return res.sendStatus(400);

    const passwordMatch = password === password2;
    if (!passwordMatch)
      return res.status(409).json({ message: "Passwords do not match." }); // Conflict

    const foundUser = await Farmer.findOne({
      _id: id,
    });
    if (!foundUser) return res.sendStatus(400);

    const hashedPwd = await bcrypt.hash(password, 10);

    foundUser.password = hashedPwd;
    foundUser.save();

    res.sendStatus(200);
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getFarmersData,
  getFarmersArchivedData,
  handleFarmersArchive,
  handleLogin,
  registerFarmer,
  resendVerification,
  verifyCode,
  savePendingAccount,
  handleRefreshToken,
  resetPass,
  handleChangePass,
  handleFarmersRestore,
};
