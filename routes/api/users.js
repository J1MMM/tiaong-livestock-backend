const express = require("express");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser,
  getUser,
  archiveUser,
  checkEmailDuplication,
  verifyCode,
} = require("../../controllers/usersController");
const router = express.Router();

router.route("/").post(createUser);
router.route("/verify").post(verifyCode);
// .get(getAllUsers)
// .put(updateUser)
// .delete(deleteUser)
// .patch(archiveUser);

// router
//   .route("/email")
//   .post(verifyRoles(ROLES_LIST.SuperAdmin), checkEmailDuplication);

// router.route("/:id").get(getUser);

module.exports = router;
