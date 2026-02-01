const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/flatMemberController");

router.post("/add", auth, role("flat_admin"), controller.addFlatMember);
router.delete("/remove/:userId", auth, role("flat_admin"), controller.removeFlatMember);

module.exports = router;