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
      return { ...obj, idImage, userImage };
    });

    res.json(_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getApprovalData };
