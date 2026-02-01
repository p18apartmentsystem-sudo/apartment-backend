const FlatMemberMap = require("../models/FlatMemberMap");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const moment = require("moment");

/**
 * ADD FLAT MEMBER (flat_admin)
 */
exports.addFlatMember = async (req, res) => {
    try {
        const { name, mobile, password, apartmentId, flatId, email } = req.body;

        const exists = await User.findOne({ mobile });
        if (exists) {
            return res.status(400).json({ message: "Mobile already exists" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            mobile,
            password: hash,
            role: "resident",
            apartmentId,
            flatId,
            email,
            createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        });

        const map = await FlatMemberMap.create({
            apartmentId,
            flatId,
            userId: user._id,
            joinedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        });

        res.status(201).json({
            message: "Flat member added",
            member: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                joinedAt: map.joinedAt
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * REMOVE FLAT MEMBER (soft remove)
 */
exports.removeFlatMember = async (req, res) => {
    try {
        const map = await FlatMemberMap.findOneAndUpdate(
            { userId: req.params.userId, isActive: true },
            { isActive: false, leftAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") },
            { new: true }
        );

        if (!map) {
            return res.status(404).json({ message: "Member not found" });
        }

        res.json({
            message: "Member removed",
            leftAt: map.leftAt
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};