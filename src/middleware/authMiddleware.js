const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Fetch full user from DB
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User is inactive" });
    }

    // 4️⃣ Attach COMPLETE user context
    req.user = {
      userId: user._id,
      role: user.role,
      apartmentId: user.apartmentId || null,
      flatId: user.flatId || null,
      mobile: user.mobile
    };

    next(); // ✅ allow request

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};