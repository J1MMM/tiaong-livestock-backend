const { default: mongoose } = require("mongoose");
const Farmer = require("../model/Farmer");
const Livestock = require("../model/Livestock");

function getWeight(value, total) {
  if (total === 0) return 0.001; // Avoid division by zero, return minimum weight
  const percentage = value / total; // Calculate percentage
  const clamped = Math.max(0.001, Math.min(1, percentage)); // Clamp value between 0.001 and 1
  return parseFloat(clamped.toFixed(3)); // Limit to 3 decimal places
}

const getTotalPopulation = async () => {
  try {
    const totals = await Livestock.aggregate([
      {
        $group: {
          _id: null, // Group everything together
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $project: {
          _id: 0, // Remove _id
          livestock: {
            pig: "$totalPigL",
            cow: "$totalCowL",
            goat: "$totalGoatL",
            chicken: "$totalChickenL",
            duck: "$totalDuckL",
            carabao: "$totalCarabaoL",
            horse: "$totalHorseL",
          },
          mortality: {
            pig: "$totalPigM",
            cow: "$totalCowM",
            goat: "$totalGoatM",
            chicken: "$totalChickenM",
            duck: "$totalDuckM",
            carabao: "$totalCarabaoM",
            horse: "$totalHorseM",
          },
        },
      },
    ]);

    return totals[0];
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalCountLivestock = async (req, res) => {
  try {
    const result = await getTotalPopulation();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const total = await getTotalPopulation();

    const result = await Livestock.aggregate([
      {
        $group: {
          _id: "$barangay",
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $project: {
          _id: 0,
          barangay: "$_id",
          livestock: {
            cow: { $divide: ["$totalCowL", total.livestock.cow] },
            goat: { $divide: ["$totalGoatL", total.livestock.goat] },
            chicken: { $divide: ["$totalChickenL", total.livestock.chicken] },
            duck: { $divide: ["$totalDuckL", total.livestock.duck] },
            carabao: { $divide: ["$totalCarabaoL", total.livestock.carabao] },
            pig: { $divide: ["$totalPigL", total.livestock.pig] },
            horse: { $divide: ["$totalHorseL", total.livestock.horse] },
          },
          mortality: {
            cow: { $divide: ["$totalCowM", total.mortality.cow] },
            goat: { $divide: ["$totalGoatM", total.mortality.goat] },
            chicken: { $divide: ["$totalChickenM", total.mortality.chicken] },
            duck: { $divide: ["$totalDuckM", total.mortality.duck] },
            carabao: { $divide: ["$totalCarabaoM", total.mortality.carabao] },
            pig: { $divide: ["$totalPigM", total.mortality.pig] },
            horse: { $divide: ["$totalHorseM", total.mortality.horse] },
          },
        },
      },
    ]);

    const adjustedResult = result.map((item) => ({
      barangay: item.barangay,
      livestock: {
        cow: Number(Math.max(0.01, Math.min(item.livestock.cow, 1)).toFixed(3)),
        goat: Number(
          Math.max(0.01, Math.min(item.livestock.goat, 1)).toFixed(3)
        ),
        chicken: Number(
          Math.max(0.01, Math.min(item.livestock.chicken, 1)).toFixed(3)
        ),
        duck: Number(
          Math.max(0.01, Math.min(item.livestock.duck, 1)).toFixed(3)
        ),
        carabao: Number(
          Math.max(0.01, Math.min(item.livestock.carabao, 1)).toFixed(3)
        ),
        pig: Number(Math.max(0.01, Math.min(item.livestock.pig, 1)).toFixed(3)),
        horse: Number(
          Math.max(0.01, Math.min(item.livestock.horse, 1)).toFixed(3)
        ),
      },
      mortality: {
        cow: Number(Math.max(0.01, Math.min(item.mortality.cow, 1)).toFixed(3)),
        goat: Number(
          Math.max(0.01, Math.min(item.mortality.goat, 1)).toFixed(3)
        ),
        chicken: Number(
          Math.max(0.01, Math.min(item.mortality.chicken, 1)).toFixed(3)
        ),
        duck: Number(
          Math.max(0.01, Math.min(item.mortality.duck, 1)).toFixed(3)
        ),
        carabao: Number(
          Math.max(0.01, Math.min(item.mortality.carabao, 1)).toFixed(3)
        ),
        pig: Number(Math.max(0.01, Math.min(item.mortality.pig, 1)).toFixed(3)),
        horse: Number(
          Math.max(0.01, Math.min(item.mortality.horse, 1)).toFixed(3)
        ),
      },
    }));

    return res.status(200).json(adjustedResult);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleUpdateLivestock = async (req, res) => {
  try {
    const { id, category, livestock, count } = req.body;
    if (!id || !category || !livestock || !count)
      return res.status(400).json({ message: `Bad request` });

    if (isNaN(count) || count <= 0)
      return res
        .status(400)
        .json({ message: "Count must be a valid positive number" });

    const foundUser = await Farmer.findOne({
      _id: id,
      archive: false,
      emailVerified: true,
      isApprove: true,
    });

    if (!foundUser)
      return res.status(404).json({ message: `User with ${id} ID not found` });

    const field = category === "Add Livestock" ? "livestock" : "mortality";

    const recordData = {
      farmerID: foundUser._id,
      barangay: foundUser.barangay,
      createdAt: new Date(),
      [field]: {
        [livestock?.toLowerCase()]: parseInt(count),
      },
    };
    // update farmers total livestock and mortality
    const field2 =
      category === "Add Livestock" ? "totalLivestock" : "totalMortality";

    foundUser[field2] += parseInt(count);
    foundUser.totalFarmPopulation += parseInt(count);
    await foundUser.save();

    await Livestock.create(recordData);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getYearlyRecordData = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) return res.sendStatus(400);

    const result = await Livestock.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`), // Start of the year
            $lt: new Date(`${year + 1}-01-01`), // Start of next year
          },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract month from the createdAt date
          livestock: 1,
          mortality: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Initialize arrays with null for 12 months
    const livestockData = new Array(12).fill(null);
    const mortalityData = new Array(12).fill(null);
    const xLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Loop through the result to populate the monthly data
    result.forEach((item) => {
      const monthIndex = item._id - 1; // MongoDB months are 1-based, so subtract 1 to align with the 0-based index
      livestockData[monthIndex] =
        item.totalCowL +
        item.totalGoatL +
        item.totalChickenL +
        item.totalDuckL +
        item.totalCarabaoL +
        item.totalPigL +
        item.totalHorseL;
      mortalityData[monthIndex] =
        item.totalCowM +
        item.totalGoatM +
        item.totalChickenM +
        item.totalDuckM +
        item.totalCarabaoM +
        item.totalPigM +
        item.totalHorseM;
    });

    // Prepare the response with the filled data
    const response = {
      livestockData,
      mortalityData,
      xLabels,
    };

    res.json(response); // Send the response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFarmerYearlyLivestocks = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.sendStatus(400);

    const date = new Date();
    const year = date.getFullYear();
    const farmerObjectId = new mongoose.Types.ObjectId(id);
    const result = await Livestock.aggregate([
      {
        $match: {
          farmerID: farmerObjectId,
          createdAt: {
            $gte: new Date(`${year}-01-01`), // Start of the year
            $lt: new Date(`${year + 1}-01-01`), // Start of next year
          },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract month from the createdAt date
          livestock: 1,
          mortality: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Initialize arrays with null for 12 months
    const livestockData = new Array(12).fill(0);
    const mortalityData = new Array(12).fill(0);

    // Loop through the result to populate the monthly data
    result.forEach((item) => {
      const monthIndex = item._id - 1; // MongoDB months are 1-based, so subtract 1 to align with the 0-based index
      livestockData[monthIndex] =
        item.totalCowL +
        item.totalGoatL +
        item.totalChickenL +
        item.totalDuckL +
        item.totalCarabaoL +
        item.totalPigL +
        item.totalHorseL;
      mortalityData[monthIndex] =
        item.totalCowM +
        item.totalGoatM +
        item.totalChickenM +
        item.totalDuckM +
        item.totalCarabaoM +
        item.totalPigM +
        item.totalHorseM;
    });

    res.json(livestockData); // Send the response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFarmerYearlyMoratlity = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.sendStatus(400);

    const date = new Date();
    const year = date.getFullYear();
    const farmerObjectId = new mongoose.Types.ObjectId(id);
    const result = await Livestock.aggregate([
      {
        $match: {
          farmerID: farmerObjectId,
          createdAt: {
            $gte: new Date(`${year}-01-01`), // Start of the year
            $lt: new Date(`${year + 1}-01-01`), // Start of next year
          },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract month from the createdAt date
          livestock: 1,
          mortality: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Initialize arrays with null for 12 months
    const livestockData = new Array(12).fill(0);
    const mortalityData = new Array(12).fill(0);

    // Loop through the result to populate the monthly data
    result.forEach((item) => {
      const monthIndex = item._id - 1; // MongoDB months are 1-based, so subtract 1 to align with the 0-based index
      livestockData[monthIndex] =
        item.totalCowL +
        item.totalGoatL +
        item.totalChickenL +
        item.totalDuckL +
        item.totalCarabaoL +
        item.totalPigL +
        item.totalHorseL;
      mortalityData[monthIndex] =
        item.totalCowM +
        item.totalGoatM +
        item.totalChickenM +
        item.totalDuckM +
        item.totalCarabaoM +
        item.totalPigM +
        item.totalHorseM;
    });

    res.json(mortalityData); // Send the response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBrangayRecords = async (req, res) => {
  try {
    const result = await Livestock.aggregate([
      {
        $group: {
          _id: "$barangay", // Group by barangay
          totalLivestock: {
            $sum: {
              $add: [
                "$livestock.carabao",
                "$livestock.chicken",
                "$livestock.cow",
                "$livestock.duck",
                "$livestock.goat",
                "$livestock.horse",
                "$livestock.pig",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default MongoDB ID
          barangay: "$_id", // Rename _id to barangay for clarity
          totalLivestock: 1, // Include the totalLivestock field
        },
      },
      {
        $sort: { barangay: 1 }, // Sort by barangay in ascending order (alphabetically)
      },
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalLivestockMortality = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) return res.sendStatus(400);
    const farmerObjectId = new mongoose.Types.ObjectId(id);
    const totals = await Livestock.aggregate([
      {
        $match: { farmerID: farmerObjectId }, // Filters by farmerID
      },
      {
        $group: {
          _id: null, // Combine all documents for the farmer into a single group
          totalCowL: { $sum: "$livestock.cow" },
          totalGoatL: { $sum: "$livestock.goat" },
          totalChickenL: { $sum: "$livestock.chicken" },
          totalDuckL: { $sum: "$livestock.duck" },
          totalCarabaoL: { $sum: "$livestock.carabao" },
          totalPigL: { $sum: "$livestock.pig" },
          totalHorseL: { $sum: "$livestock.horse" },
          totalCowM: { $sum: "$mortality.cow" },
          totalGoatM: { $sum: "$mortality.goat" },
          totalChickenM: { $sum: "$mortality.chicken" },
          totalDuckM: { $sum: "$mortality.duck" },
          totalCarabaoM: { $sum: "$mortality.carabao" },
          totalPigM: { $sum: "$mortality.pig" },
          totalHorseM: { $sum: "$mortality.horse" },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the `_id` field from the output
          livestock: {
            $add: [
              "$totalCowL",
              "$totalGoatL",
              "$totalChickenL",
              "$totalDuckL",
              "$totalCarabaoL",
              "$totalPigL",
              "$totalHorseL",
            ],
          },
          mortality: {
            $add: [
              "$totalCowM",
              "$totalGoatM",
              "$totalChickenM",
              "$totalDuckM",
              "$totalCarabaoM",
              "$totalPigM",
              "$totalHorseM",
            ],
          },
        },
      },
    ]);

    const data = [
      {
        name: "Livestocks",
        population: totals[0].livestock,
        color: "#A8DFE1",
        legendFontColor: "#A8DFE1",
        legendFontSize: 15,
      },
      {
        name: "Mortality",
        population: totals[0].mortality,
        color: "#FFB1C1",
        legendFontColor: "#FFB1C1",
        legendFontSize: 15,
      },
    ];

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLivesstockMobileDashboard = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.sendStatus(400);

    const farmerObjectId = new mongoose.Types.ObjectId(id);

    const totals = await Livestock.aggregate([
      {
        $match: { farmerID: farmerObjectId }, // Filters by farmerID
      },
      {
        $group: {
          _id: null, // Combine all documents for the farmer into a single group
          totalCow: { $sum: "$livestock.cow" },
          totalGoat: { $sum: "$livestock.goat" },
          totalChicken: { $sum: "$livestock.chicken" },
          totalDuck: { $sum: "$livestock.duck" },
          totalCarabao: { $sum: "$livestock.carabao" },
          totalPig: { $sum: "$livestock.pig" },
          totalHorse: { $sum: "$livestock.horse" },
        },
      },
    ]);

    if (!totals.length) {
      return res
        .status(404)
        .json({ message: "No livestock data found for this farmer" });
    }

    // Format the output for the chart
    const data = [
      totals[0].totalCow || 0,
      totals[0].totalGoat || 0,
      totals[0].totalChicken || 0,
      totals[0].totalDuck || 0,
      totals[0].totalCarabao || 0,
      totals[0].totalPig || 0,
      totals[0].totalHorse || 0,
    ];

    return res.status(200).json(data || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getHeatmapData,
  getTotalCountLivestock,
  handleUpdateLivestock,
  getYearlyRecordData,
  getBrangayRecords,
  getTotalLivestockMortality,
  getLivesstockMobileDashboard,
  getFarmerYearlyLivestocks,
  getFarmerYearlyMoratlity,
};
