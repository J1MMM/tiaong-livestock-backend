const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const farmerSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  referenceNo: {
    type: String,
    required: false,
  },
  refreshToken: String,
  isApprove: {
    type: Boolean,
    require: true,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    require: true,
    default: false,
  },
  archive: {
    type: Boolean,
    require: true,
    default: false,
  },

  verificationCode: {
    type: String,
    required: false,
  },

  surname: { type: String, trim: true },
  firstname: { type: String, trim: true },
  middlename: { type: String, trim: true },
  extensionName: { type: String, trim: true },
  sex: { type: String, enum: ["Male", "Female", "Other"] },
  houseNo: { type: String, trim: true },
  street: { type: String, trim: true },
  barangay: { type: String, trim: true },

  contactNo: { type: String, trim: true },
  birthDate: { type: Date },
  birthPlace: { type: String, trim: true },
  religion: { type: String, trim: true },
  specifyReligion: { type: String, trim: true },
  civilStatus: {
    type: String,
    enum: ["Single", "Married", "Widowed", "Separated"],
  },
  spouseName: { type: String, trim: true },
  motherMaidenName: { type: String, trim: true },
  householdHead: { type: String, trim: true },
  nameOfHouseholdHead: { type: String, trim: true },
  householdRelationship: { type: String, trim: true },
  numberOfLivingHead: { type: Number, min: 0 },
  noMale: { type: Number, min: 0 },
  noFemale: { type: Number, min: 0 },

  education: { type: String, trim: true },
  PWD: { type: String },
  _4ps: { type: String },
  memberIndigenousGroup: { type: String },
  specifyIndigenousGroup: { type: String, trim: true },
  withGovernmentID: { type: String },
  specifyGovernmentID: { type: String, trim: true },
  idNumber: { type: String, trim: true },
  memberAssociationOrCooperative: { type: String },
  specifyAssociationOrCooperative: { type: String, trim: true },
  personToNotifyInCaseEmergency: { type: String, trim: true },
  contactPersonToNotifyInCaseEmergency: { type: String, trim: true },

  livelihood: { type: String, trim: true },
  livestockChecked: { type: Boolean, default: false },
  livestockSpecify: {
    cow: {
      type: Boolean,
      default: false,
    },
    goat: {
      type: Boolean,
      default: false,
    },
    chicken: {
      type: Boolean,
      default: false,
    },
    duck: {
      type: Boolean,
      default: false,
    },
    carabao: {
      type: Boolean,
      default: false,
    },
    pig: {
      type: Boolean,
      default: false,
    },
    horse: {
      type: Boolean,
      default: false,
    },
  },
  poultryChecked: { type: Boolean, default: false },
  poultrySpecify: {
    chicken: {
      type: Boolean,
      default: false,
    },
    duck: {
      type: Boolean,
      default: false,
    },
  },

  landPreparationChecked: { type: Boolean, default: false },
  harvestingChecked: { type: Boolean, default: false },
  kindOfWorkOther: { type: Boolean, default: false },
  kindOfWorkSpecify: { type: String, trim: true },

  grossAnnualIncome: { type: String, trim: true },
  specifyGrossAnnualIncome: { type: String, trim: true },

  idImage: { type: Buffer },
  userImage: { type: Buffer },
  registeredAt: { type: Date, default: Date.now },
  archivedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: {
    incomplete: {
      type: Boolean,
    },
    invalidID: {
      type: Boolean,
    },
    notEligible: {
      type: Boolean,
    },
    duplicate: {
      type: Boolean,
    },
    falseInfo: {
      type: Boolean,
    },
    missingDoc: {
      type: Boolean,
    },
    others: {
      type: Boolean,
    },
    specify: {
      type: String,
    },
  },
  typeofFarm: { type: String },
  rsbsaRegistered: { type: String },
  bioSecLvl: { type: String },
  longitude: { type: String },
  latitude: { type: String },
  livestock: {
    cow: { required: true, type: Number, default: 0 },
    goat: { required: true, type: Number, default: 0 },
    chicken: { required: true, type: Number, default: 0 },
    duck: { required: true, type: Number, default: 0 },
    carabao: { required: true, type: Number, default: 0 },
    pig: { required: true, type: Number, default: 0 },
    horse: { required: true, type: Number, default: 0 },
  },
  mortality: {
    cow: { required: true, type: Number, default: 0 },
    goat: { required: true, type: Number, default: 0 },
    chicken: { required: true, type: Number, default: 0 },
    duck: { required: true, type: Number, default: 0 },
    carabao: { required: true, type: Number, default: 0 },
    pig: { required: true, type: Number, default: 0 },
    horse: { required: true, type: Number, default: 0 },
  },

  totalLivestock: { required: true, type: Number, default: 0 },
  totalMortality: { required: true, type: Number, default: 0 },
  totalFarmPopulation: { required: true, type: Number, default: 0 },
});

module.exports = mongoose.model("Farmer", farmerSchema);
