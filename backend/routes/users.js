const express = require("express");
const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  getUser,
  logout,
  getAgents,
  initiatePushNotification
} = require("../controllers/users_controller.js");
const { protect } = require("../middleware/auth_middleware");
const router = express.Router();

router.post("/notification", initiatePushNotification)
router.get("/agents",getAgents);
router.post("/auth/signup", addUser);
router.post("/auth/login", loginUser);
router.delete('/auth/logout',protect, logout);
router.get("/user", protect, getUser);
router.get("/:id?",protect,getUsers);
router.route("/:id").put(protect,updateUser).delete(protect,deleteUser);


module.exports = router;
