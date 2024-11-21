const Announcement = require("../model/Announcement");

const getAnnouncement = async (req, res) => {
  try {
    const result = await Announcement.find();
    if (!result) return res.status(400).json({ message: `Bad request` });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleAddAnnouncement = async (req, res) => {
  try {
    const { message, title } = req.body;
    if (!message || !title)
      return res.status(400).json({ message: `Bad request` });

    const result = await Announcement.create({
      title: title,
      message: message,
    });

    if (!result) return res.status(400).json({ message: `Bad request` });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleUpdateAnnouncement = async (req, res) => {
  try {
    const { id, title, message } = req.body;

    if (!id) return res.status(400).json({ message: `ID required` });

    const result = await Announcement.findOneAndUpdate(
      {
        _id: id,
      },
      {
        title: title,
        message: message,
      }
    );

    if (!result) return res.status(400).json({ message: `Bad request` });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const handleDeleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: `ID required` });

    const result = await Announcement.findOneAndDelete({
      _id: id,
    });

    if (!result) return res.status(400).json({ message: `Bad request` });
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleAddAnnouncement,
  getAnnouncement,
  handleUpdateAnnouncement,
  handleDeleteAnnouncement,
};
