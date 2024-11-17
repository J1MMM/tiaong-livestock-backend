const dayjs = require("dayjs");
const { BRGY_COOR } = require("../helper/shared");
const Farmer = require("../model/Farmer");

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

    await foundUser.save();
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
