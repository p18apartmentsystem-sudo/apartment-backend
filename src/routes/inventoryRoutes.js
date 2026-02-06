const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");

//PATH::inventory...
router.post("/", auth, inventoryController.addInventory);
router.get("/apartment/:apartmentId", auth, inventoryController.getApartmentInventory);
router.get("/flat/:flatId", auth, inventoryController.getFlatInventory);
router.put("/:id", auth, inventoryController.updateInventory);

module.exports = router;
