const User = require("../models/User");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");

/**
 * ✅ CREATE APARTMENT ADMIN
 */
exports.addAdmin = async (req, res) => {
    try {
        const { name, mobile, password } = req.body;

        const existing = await User.findOne({ mobile });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.create({
            name,
            mobile,
            password: hashedPassword,
            role: "apartment_admin",
            createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        });

        res.status(201).json({
            message: "Admin created successfully",
            adminId: admin._id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * 1️⃣ GET ALL ADMINS (DESC)
 * with apartment mapping
 */
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({
            role: "apartment_admin",
        })
            .populate("apartmentId", "name address address_lg") // adjust fields if needed
            .sort({ createdAt: -1 });

        res.json({ data: admins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * 2️⃣ GET ADMIN BY ID
 */
exports.getAdminById = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.params.id,
            role: "apartment_admin",
        }).populate("apartmentId", "name address address_lg");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ data: admin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * 3️⃣ UPDATE ADMIN BY ID
 */
exports.updateAdminById = async (req, res) => {
    try {
        const { name, mobile, email } = req.body;

        const admin = await User.findOne({
            _id: req.params.id,
            role: "apartment_admin",
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        admin.isActive = true;
        if (name) admin.name = name;
        if (mobile) admin.mobile = mobile;
        if(email) admin.email = email;

        admin.updatedAt = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        await admin.save();

        res.json({ message: "Admin updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * 4️⃣ DELETE ADMIN BY ID (SOFT DELETE)
 */
exports.deleteAdminById = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.params.id,
            role: "apartment_admin",
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        admin.isActive = false;
        admin.updatedAt = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        await admin.save();

        res.json({ message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
