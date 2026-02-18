const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const moment = require("moment-timezone");

/**
 * ADD VEHICLE (flat_admin)
 * vehicle MUST belong to a RESIDENT of SAME FLAT
 */
exports.addVehicle = async (req, res) => {
    try {
        const { userId, vehicleType, vehicleNumber } = req.body;

        // 1️⃣ Validate resident exists
        const resident = await User.findById(userId);

        if (!resident || resident.role !== "resident") {
            return res.status(400).json({
                message: "Invalid resident user"
            });
        }

        // 2️⃣ Ensure resident belongs to SAME flat
        if (
            resident.flatId?.toString() !== req.user.flatId?.toString()
        ) {
            return res.status(403).json({
                message: "Resident does not belong to your flat"
            });
        }

        // 3️⃣ Create vehicle
        const vehicle = await Vehicle.create({
            apartmentId: req.user.apartmentId,
            flatId: req.user.flatId,
            userId: resident._id,
            vehicleType,
            vehicleNumber,
            createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        });

        res.status(201).json({
            message: "Vehicle added successfully",
            vehicle: {
                id: vehicle._id,
                vehicleType: vehicle.vehicleType,
                vehicleNumber: vehicle.vehicleNumber,
                createdAt: vehicle.createdAt
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET ALL VEHICLES OF FLAT (flat_admin)
 */
exports.getFlatVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            flatId: req.user.flatId,
            isActive: true
        }).populate("userId", "name mobile");

        res.json(vehicles);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET MY VEHICLES (resident)
 */
exports.getMyVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            userId: req.user.userId,   // ✅ FIXED
            isActive: true
        });

        res.json(vehicles);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * DEACTIVATE VEHICLE (flat_admin)
 */
exports.deactivateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            {
                _id: req.params.vehicleId,
                flatId: req.user.flatId
            },
            { isActive: false },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found or not in your flat"
            });
        }

        res.json({ message: "Vehicle deactivated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};