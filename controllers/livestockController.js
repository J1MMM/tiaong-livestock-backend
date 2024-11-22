const Farmer = require("../model/Farmer");

function getWeight(value, total) {
  if (total === 0) return 0.01; // Avoid division by zero, return minimum weight
  const percentage = value / total; // Calculate percentage
  return Math.max(0.01, Math.min(1, percentage)); // Clamp value between 0.1 and 1
}

const getLivestockAnalytics = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: true,
      archive: false,
      emailVerified: true,
    });
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const _result = result.reduce((acc, data) => {
      // Check if the barangay already exists in the accumulator
      const existing = acc.find((v) => v.barangay === data.barangay);

      if (existing) {
        // Update existing barangay's livestock and mortality
        existing.livestock = {
          cow: existing.livestock.cow + data.livestock.cow,
          goat: existing.livestock.goat + data.livestock.goat,
          chicken: existing.livestock.chicken + data.livestock.chicken,
          duck: existing.livestock.duck + data.livestock.duck,
          carabao: existing.livestock.carabao + data.livestock.carabao,
          pig: existing.livestock.pig + data.livestock.pig,
          horse: existing.livestock.horse + data.livestock.horse,
        };

        existing.mortality = {
          cow: existing.mortality.cow + data.mortality.cow,
          goat: existing.mortality.goat + data.mortality.goat,
          chicken: existing.mortality.chicken + data.mortality.chicken,
          duck: existing.mortality.duck + data.mortality.duck,
          carabao: existing.mortality.carabao + data.mortality.carabao,
          pig: existing.mortality.pig + data.mortality.pig,
          horse: existing.mortality.horse + data.mortality.horse,
        };
      } else {
        // Add new barangay to the accumulator
        acc.push({
          barangay: data.barangay,
          livestock: { ...data.livestock },
          mortality: { ...data.mortality },
        });
      }

      return acc;
    }, []);

    let totalLCow = 0;
    let totalLGoat = 0;
    let totalLChicken = 0;
    let totalLDuck = 0;
    let totalLCarabao = 0;
    let totalLPig = 0;
    let totalLHorse = 0;
    let totalMCow = 0;
    let totalMGoat = 0;
    let totalMChicken = 0;
    let totalMDuck = 0;
    let totalMCarabao = 0;
    let totalMPig = 0;
    let totalMHorse = 0;

    _result.map((obj) => {
      totalLCow += obj.livestock.cow;
      totalLGoat += obj.livestock.goat;
      totalLChicken += obj.livestock.chicken;
      totalLDuck += obj.livestock.duck;
      totalLCarabao += obj.livestock.carabao;
      totalLPig += obj.livestock.pig;
      totalLHorse += obj.livestock.horse;
      totalMCow += obj.mortality.cow;
      totalMGoat += obj.mortality.goat;
      totalMChicken += obj.mortality.chicken;
      totalMDuck += obj.mortality.duck;
      totalMCarabao += obj.mortality.carabao;
      totalMPig += obj.mortality.pig;
      totalMHorse += obj.mortality.horse;
    });

    return res.status(200).json({
      livestock: {
        cow: totalLCow,
        goat: totalLGoat,
        chicken: totalLChicken,
        duck: totalLDuck,
        carabao: totalLCarabao,
        pig: totalLPig,
        horse: totalLHorse,
      },

      mortality: {
        cow: totalMCow,
        goat: totalMGoat,
        chicken: totalMChicken,
        duck: totalMDuck,
        carabao: totalMCarabao,
        pig: totalMPig,
        horse: totalMHorse,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLivestockData = async (req, res) => {
  try {
    const result = await Farmer.find({
      isApprove: true,
      archive: false,
      emailVerified: true,
    });
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const _result = result.reduce((acc, data) => {
      // Check if the barangay already exists in the accumulator
      const existing = acc.find((v) => v.barangay === data.barangay);

      if (existing) {
        // Update existing barangay's livestock and mortality
        existing.livestock = {
          cow: existing.livestock.cow + data.livestock.cow,
          goat: existing.livestock.goat + data.livestock.goat,
          chicken: existing.livestock.chicken + data.livestock.chicken,
          duck: existing.livestock.duck + data.livestock.duck,
          carabao: existing.livestock.carabao + data.livestock.carabao,
          pig: existing.livestock.pig + data.livestock.pig,
          horse: existing.livestock.horse + data.livestock.horse,
        };

        existing.mortality = {
          cow: existing.mortality.cow + data.mortality.cow,
          goat: existing.mortality.goat + data.mortality.goat,
          chicken: existing.mortality.chicken + data.mortality.chicken,
          duck: existing.mortality.duck + data.mortality.duck,
          carabao: existing.mortality.carabao + data.mortality.carabao,
          pig: existing.mortality.pig + data.mortality.pig,
          horse: existing.mortality.horse + data.mortality.horse,
        };
      } else {
        // Add new barangay to the accumulator
        acc.push({
          barangay: data.barangay,
          livestock: { ...data.livestock },
          mortality: { ...data.mortality },
        });
      }

      return acc;
    }, []);

    let totalLCow = 0;
    let totalLGoat = 0;
    let totalLChicken = 0;
    let totalLDuck = 0;
    let totalLCarabao = 0;
    let totalLPig = 0;
    let totalLHorse = 0;
    let totalMCow = 0;
    let totalMGoat = 0;
    let totalMChicken = 0;
    let totalMDuck = 0;
    let totalMCarabao = 0;
    let totalMPig = 0;
    let totalMHorse = 0;

    _result.map((obj) => {
      totalLCow += obj.livestock.cow;
      totalLGoat += obj.livestock.goat;
      totalLChicken += obj.livestock.chicken;
      totalLDuck += obj.livestock.duck;
      totalLCarabao += obj.livestock.carabao;
      totalLPig += obj.livestock.pig;
      totalLHorse += obj.livestock.horse;
      totalMCow += obj.mortality.cow;
      totalMGoat += obj.mortality.goat;
      totalMChicken += obj.mortality.chicken;
      totalMDuck += obj.mortality.duck;
      totalMCarabao += obj.mortality.carabao;
      totalMPig += obj.mortality.pig;
      totalMHorse += obj.mortality.horse;
    });

    const final_result = _result.map((obj) => ({
      ...obj,
      livestock: {
        cow: getWeight(obj.livestock.cow, totalLCow),
        goat: getWeight(obj.livestock.goat, totalLGoat),
        chicken: getWeight(obj.livestock.chicken, totalLChicken),
        duck: getWeight(obj.livestock.duck, totalLDuck),
        carabao: getWeight(obj.livestock.carabao, totalLCarabao),
        pig: getWeight(obj.livestock.pig, totalLPig),
        horse: getWeight(obj.livestock.horse, totalLHorse),
      },

      mortality: {
        cow: getWeight(obj.mortality.cow, totalMCow),
        goat: getWeight(obj.mortality.goat, totalMGoat),
        chicken: getWeight(obj.mortality.chicken, totalMChicken),
        duck: getWeight(obj.mortality.duck, totalMDuck),
        carabao: getWeight(obj.mortality.carabao, totalMCarabao),
        pig: getWeight(obj.mortality.pig, totalMPig),
        horse: getWeight(obj.mortality.horse, totalMHorse),
      },
    }));

    console.log(final_result);

    return res.status(200).json(final_result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleUpdateLivestock = async (req, res) => {
  try {
    const { id, category, livestock, count } = req.body;
    console.log(req.body);

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
      foundUser.livestock[livestock.toLowerCase()] += parseInt(count);
      foundUser.totalLivestock += parseInt(count);
    } else {
      foundUser.mortality[livestock.toLowerCase()] += parseInt(count);
      foundUser.totalMortality += parseInt(count);
    }
    foundUser.totalFarmPopulation += parseInt(count);

    await foundUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getLivestockData,
  handleUpdateLivestock,
  getLivestockAnalytics,
};
