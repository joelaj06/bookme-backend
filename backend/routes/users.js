const express = require("express");
const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  getUser,
  logout,
} = require("../controllers/users_controller.js");
const { protect } = require("../middleware/auth_middleware");
const router = express.Router();

router.post("/", addUser);
router.post("/login", loginUser);
router.post('/logout',protect, logout);
router.get("/user", protect, getUser);
router.get("/:id?",protect,getUsers);
router.route("/:id").put(protect,updateUser).delete(protect,deleteUser);


module.exports = router;
