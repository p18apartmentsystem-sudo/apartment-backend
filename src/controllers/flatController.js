const Flat = require("../models/Flat");
const User = require("../models/User");
const FlatMemberMap = require("../models/FlatMemberMap");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const LightBill = require("../models/LightBill");
const RentPayment = require("../models/RentPayment");

/**
 * ADD Flat
 */
exports.addFlat = async (req, res) => {
    try {
        const { apartmentId, flatNumber, floor, rentAmount } = req.body;
        const flat = await Flat.create({
            apartmentId,
            flatNumber,
            floor,
            rentAmount,
            createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        });
        res.status(201).json({ message: "Flat added", flat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET Flats by Apartment
 */
exports.getFlats = async (req, res) => {
    try {
        const flats = await Flat.find({
            apartmentId: req.params.apartmentId
        }).populate("flatAdminId", "name mobile");
        res.json({ data: flats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET Flats with Residents (Flat Admin)
 */
exports.getFlatsByFlatAdmin = async (req, res) => {
    try {
        // 1️⃣ Get flats assigned to this flat admin
        const flats = await Flat.find({
            flatAdminId: req.user.userId
        })
            .populate("apartmentId", "name address")
            .populate("flatAdminId", "name mobile");

        if (!flats.length) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const flatIds = flats.map(flat => flat._id);

        // 2️⃣ Get active flat-member mappings
        const flatMembers = await FlatMemberMap.find({
            flatId: { $in: flatIds },
            isActive: true
        })
            .populate("userId", "name mobile email role")
            .select("flatId userId joinedAt isActive");

        // 3️⃣ Attach residents to flats (with sorting)
        const response = flats.map(flat => {
            const residents = flatMembers
                .filter(fm => fm.flatId.equals(flat._id))
                .map(fm => ({
                    _id: fm.userId._id,
                    name: fm.userId.name,
                    mobile: fm.userId.mobile,
                    email: fm.userId.email,
                    role: fm.userId.role,
                    joinedAt: fm.joinedAt,
                    isActive: fm.isActive
                }))
                .sort((a, b) => {
                    // 1️⃣ role ASC
                    if (a.role < b.role) return -1;
                    if (a.role > b.role) return 1;

                    // 2️⃣ joinedAt DESC
                    return new Date(b.joinedAt) - new Date(a.joinedAt);
                });

            return {
                ...flat.toObject(),
                residents
            };
        });


        res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/**
 * UPDATE Flat
 */
exports.updateFlat = async (req, res) => {
    try {
        const { flatNumber, floor, rentAmount } = req.body;
        const flat = await Flat.findOne({
            _id: req.params.id,
        });

        if (!flat) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        flat.isActive = true;
        flat.updatedAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        if (flatNumber) flat.flatNumber = flatNumber;
        if (floor) flat.floor = floor;
        if (rentAmount) flat.rentAmount = rentAmount;

        await flat.save();

        res.json({ message: "Flat updated", flat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE Flat
 */
exports.deleteFlat = async (req, res) => {
    try {

        const flat = await Flat.findOne({
            _id: req.params.id,
        });

        if (!flat) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        flat.isActive = false;
        flat.updatedAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        await flat.save();

        res.json({ message: "Flat deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * ADD FLAT ADMIN (apartment_admin)
 */
exports.addFlatAdmin = async (req, res) => {
    try {
        const { name, mobile, password, flatId, apartmentId } = req.body;

        // 1️⃣ Check flat exists
        const flat = await Flat.findById(flatId);
        if (!flat) {
            return res.status(404).json({ message: "Flat not found" });
        }

        // 2️⃣ Check user exists by mobile
        let user = await User.findOne({ mobile });

        if (user) {
            // 3️⃣ Check if user already mapped to another flat (ACTIVE)
            const activeMapping = await FlatMemberMap.findOne({
                userId: user._id,
                isActive: true
            });

            if (activeMapping) {
                return res.status(400).json({
                    message: "User already assigned to another flat"
                });
            }

            // 4️⃣ Update role if needed
            if (user.role !== "flat_admin") {
                user.role = "flat_admin";
                user.apartmentId = apartmentId;
                user.flatId = flatId;
                await user.save();
            }
        } else {
            // 5️⃣ Create new flat admin user
            const hash = await bcrypt.hash(password, 10);

            user = await User.create({
                name,
                mobile,
                password: hash,
                role: "flat_admin",
                apartmentId,
                flatId,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });
        }

        // 6️⃣ Update flat
        flat.flatAdminId = user._id;
        flat.isOccupied = true;
        await flat.save();

        // 7️⃣ Create FlatMemberMap
        const map = await FlatMemberMap.create({
            apartmentId,
            flatId,
            userId: user._id,
            memberRole: "flat_admin",
            isActive: true,
            joinedAt: moment().format("YYYY-MM-DD HH:mm:ss")
        });

        res.status(201).json({
            message: "Flat Admin added and assigned successfully",
            flatAdmin: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                flatId,
                joinedAt: map.joinedAt
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE FLAT ADMIN BY FLAT ID
 * Update name & mobile of current flat admin
 */
exports.updateFlatAdminByFlatId = async (req, res) => {
    try {
        const { flatId } = req.params;
        const { name, mobile, email } = req.body;

        // 1️⃣ Find flat
        const flat = await Flat.findById(flatId);
        if (!flat || !flat.flatAdminId) {
            return res.status(404).json({
                message: "Flat admin not found for this flat"
            });
        }

        // 2️⃣ Find current flat admin
        const user = await User.findById(flat.flatAdminId);
        if (!user) {
            return res.status(404).json({
                message: "Flat admin user not found"
            });
        }

        // 3️⃣ Check mobile uniqueness (exclude self)
        if (mobile && mobile !== user.mobile) {
            const exists = await User.findOne({
                mobile,
                _id: { $ne: user._id }
            });

            if (exists) {
                return res.status(400).json({
                    message: "Mobile number already in use"
                });
            }
        }

        // 4️⃣ Update fields
        if (name) user.name = name;
        if (mobile) user.mobile = mobile;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: "Flat admin updated successfully",
            flatAdmin: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                flatId
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

