const ParkingSlot = require("../models/ParkingSlot");
const moment = require("moment");

/**
 * ADD SINGLE PARKING SLOT
 */
exports.addParkingSlot = async (req, res) => {
    try {
        const { apartmentId, side, name, slotNumber } = req.body;

        const slot = await ParkingSlot.create({
            apartmentId,
            side,
            name,
            slotNumber,
            createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        });

        res.status(201).json({
            message: "Parking slot added",
            ParkingSlotId: slot._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * BULK ADD PARKING SLOTS
 */
exports.bulkAddParkingSlots = async (req, res) => {
    try {
        const { apartmentId, side, name, totalNumber } = req.body;

        const slots = [];
        for (let i = 1; i <= totalNumber; i++) {
            slots.push({
                apartmentId,
                side,
                name,
                slotNumber: i,
                createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
            });
        }

        const result = await ParkingSlot.insertMany(slots);

        res.status(201).json({
            message: `${result.length} parking slots added`
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET All Parking slots by Apartment
 */
exports.getParkingSlotsByApartmentId = async (req, res) => {
    try {
        const parkingSlots = await ParkingSlot.find({
            apartmentId: req.params.id,
        });

        res.json(parkingSlots);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};