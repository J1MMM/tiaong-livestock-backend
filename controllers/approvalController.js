const dayjs = require("dayjs");
const { BRGY_COOR } = require("../helper/shared");
const Farmer = require("../model/Farmer");
const rejectionEmailFormat = require("../helper/rejectionEmailFormat");
const nodeMailer = require("nodemailer");
const emailFormat = require("../helper/emailFormat");
const approvalEmail = require("../helper/approvalEmail");

const getApprovalData = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: false,
      archive: false,
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
      return { ...obj, idImage, userImage, id, fullname, birthDate };
    });

    res.json(_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getRejectedData = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: false,
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

const handleReject = async (req, res) => {
  try {
    const { id, rejectionReason } = req.body;
    if (!id || !rejectionReason)
      return res.status(400).json({ message: `Bad request` });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: false,
      emailVerified: true,
      isApprove: false,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });
    const datenow = Date.now();
    foundUser.archive = true;
    foundUser.rejectionReason = rejectionReason;
    foundUser.rejectedAt = datenow;

    const rejectionList = [];

    if (rejectionReason.incomplete) {
      rejectionList.push("<li>Incomplete Application</li>");
    }
    if (rejectionReason.invalidID) {
      rejectionList.push("<li>Invalid or Missing ID</li>");
    }
    if (rejectionReason.notEligible) {
      rejectionList.push("<li>Not Eligible (non-farmer)</li>");
    }
    if (rejectionReason.duplicate) {
      rejectionList.push("<li>Duplicate Application</li>");
    }
    if (rejectionReason.falseInfo) {
      rejectionList.push("<li>False Information</li>");
    }
    if (rejectionReason.missingDoc) {
      rejectionList.push("<li>Missing Documents</li>");
    }
    if (rejectionReason.others) {
      rejectionList.push(
        "<li>Other, Specify: " + rejectionReason.specify + "</li>"
      );
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

    const html = rejectionEmailFormat(foundUser.firstname, rejectionList);
    console.log(rejectionList);
    const info = await transport.sendMail({
      from: "Livestock Management System <livestock.management.system@email.com>",
      to: foundUser.email,
      subject: "Notification of Rejected Application and Next Steps",
      html: html,
    });

    await foundUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleApproval = async (req, res) => {
  try {
    const { id, typeofFarm, rsbsaRegistered, referenceNo, bioSecLvl } =
      req.body;
    if (!id || !typeofFarm || !rsbsaRegistered || !referenceNo || !bioSecLvl)
      return res.status(400).json({ message: `Bad request` });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: false,
      emailVerified: true,
      isApprove: false,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });

    foundUser.isApprove = true;
    foundUser.typeofFarm = typeofFarm;
    foundUser.rsbsaRegistered = rsbsaRegistered;
    foundUser.referenceNo = referenceNo;
    foundUser.bioSecLvl = bioSecLvl;
    foundUser.longitude = BRGY_COOR[foundUser.barangay].lng;
    foundUser.latitude = BRGY_COOR[foundUser.barangay].lat;
    foundUser.registeredAt = Date.now();

    await foundUser.save();

    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      auth: {
        user: "devjim.emailservice@gmail.com",
        pass: "vfxdypfebqvgiiyn",
      },
    });
    const html = approvalEmail(referenceNo, foundUser.firstname);

    const info = await transport.sendMail({
      from: "Livestock Management System <livestock.management.system@email.com>",
      to: foundUser.email,
      subject: "ANI AT KITA RSBSA Approval Notification",
      html: html,
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getApprovalData,
  handleReject,
  getRejectedData,
  handleApproval,
};
