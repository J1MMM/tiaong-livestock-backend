const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Farmer = require("../model/Farmer");
const nodeMailer = require("nodemailer");
const { v4 } = require("uuid");

function generateVerificationCode() {
  return v4().replace(/-/g, "").slice(0, 8); // Adjust slice length as needed
}

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
      $or: [{ email: referenceNo }, { referenceNo: referenceNo }],
      archive: false,
      emailVerified: true,
      // isApprove: true, // Uncomment if needed
    });
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
    return res.json({ ...farmerData, accessToken, refreshToken }); // Send back the data without password
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
                        <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 550px; margin: auto; box-sizing: border-box">
                            <h1 style="margin: 0; text-align: start;  font-size: x-large">Tiaong Livestock Management System</h1>
                            <br />
                            <h1 style="margin: 0; text-align: start; font-weight: bold; font-size: x-large">Hello,</h1>
                            <p style="text-align: start;">Thank you for joining us. We're glad to have you on board.</p>
                            <p style="text-align: start;">You're receiving this e-mail because you have registered in our Livestock Management System. You now have a verification code. This verification code is only valid for the next 15 minutes.</p>
                            <h1 style="margin: 0; text-align: start;  font-size: xx-large">${verificationCode}</h1>
                            <br />
                            <h1 style="margin: 0; text-align: start; font-size: x-large">Thanks,</h1>
                            <h1 style="margin: 0; text-align: start; font-size: x-large">Admin</h1>
                            <br />
                            <hr />
                            <p style="text-align: start;">© 2024 Livestock Management System. All Rights Reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
        `;

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
                        <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 550px; margin: auto; box-sizing: border-box">
                            <h1 style="margin: 0; text-align: start;  font-size: x-large">Tiaong Livestock Management System</h1>
                            <br />
                            <h1 style="margin: 0; text-align: start; font-weight: bold; font-size: x-large">Hello,</h1>
                            <p style="text-align: start;">Thank you for joining us. We're glad to have you on board.</p>
                            <p style="text-align: start;">You're receiving this e-mail because you have registered in our Livestock Management System. You now have a verification code. This verification code is only valid for the next 15 minutes.</p>
                            <h1 style="margin: 0; text-align: start;  font-size: xx-large">${verificationCode}</h1>
                            <br />
                            <h1 style="margin: 0; text-align: start; font-size: x-large">Thanks,</h1>
                            <h1 style="margin: 0; text-align: start; font-size: x-large">Admin</h1>
                            <br />
                            <hr />
                            <p style="text-align: start;">© 2024 Livestock Management System. All Rights Reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
        `;

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
  try {
    const { verificationCode, id } = req.body;
    if (!verificationCode || !id) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const foundUser = await Farmer.findOne({ _id: id });
    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (foundUser.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Additional code for successful verification (if any) would go here
    return res.status(200).json({ message: "Verification successful" });
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

const savePendingAccount = async (req, res) => {
  // console.log(req.body);

  try {
    if (!req.body.id) return res.status(400).json({ message: "Bad Request" });
    // Find and update the document with the provided data
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
        idImage: req.body.idImage,
        userImage: req.body.userImage,
        emailVerified: true,
      },
      { new: true } // Return the updated document
    );

    // Check if document was found and updated
    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Send a response confirming successful update
    res.status(200).json({ message: "Farmer Save to Pending successfully" });
  } catch (error) {
    console.log({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.query;
  console.log(refreshToken);
  if (!refreshToken) return res.status(401).json({ message: "Bad request" });

  const foundUser = await Farmer.findOne({
    refreshToken,
  }).exec();
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

    res.json({ accessToken, isApprove: foundUser.isApprove });
  });
};

module.exports = {
  handleLogin,
  registerFarmer,
  resendVerification,
  verifyCode,
  savePendingAccount,
  handleRefreshToken,
};
