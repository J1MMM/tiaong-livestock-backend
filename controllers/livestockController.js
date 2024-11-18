const Farmer = require("../model/Farmer");

const handleUpdateLivestock = async (req, res) => {
  try {
    const { id, category, livestock, count } = req.body;
    if (!id || !category || !livestock || !count)
      return res.status(400).json({ message: `Bad request` });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: false,
      emailVerified: true,
      isApprove: true,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });

    if (category == "Add Livestock") {
      foundUser.livestock[livestock] = foundUser.livestock[livestock] + count;
    } else {
      foundUser.livestock[livestock] = foundUser.livestock[livestock] - count;
    }

    await foundUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  handleUpdateLivestock,
};
