const Apartment = require("../models/Apartment");
const User = require("../models/User");
const moment = require("moment");

/**
 * CREATE Apartment
 * apartment_admin
 */
exports.createApartment = async (req, res) => {
    try {
        const { name, address, address_lg } = req.body;

        // 1️⃣ Create apartment
        const apartment = await Apartment.create({
            name,
            address,
            address_lg,
            createdBy: req.user.userId,
            createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        });

        // 2️⃣ ASSIGN apartment to apartment_admin (IMPORTANT)
        await User.findByIdAndUpdate(req.user.userId, {
            apartmentId: apartment._id
        });

        res.status(201).json({
            message: "Apartment created successfully",
            apartment
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/**
 * GET All Apartments (created by this admin)
 */
exports.getApartments = async (req, res) => {
    try {
        const apartments = await Apartment.find({
            createdBy: req.user.userId
        });

        res.json({ data: apartments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET Single Apartment
 */
exports.getApartmentById = async (req, res) => {
    try {
        const apartment = await Apartment.findOne({
            _id: req.params.id,
            createdBy: req.user.userId
        });

        if (!apartment) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        res.json(apartment);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE Apartment
 */
exports.updateApartment = async (req, res) => {
    try {

        const { name, address, address_lg } = req.body;

        const apartment = await Apartment.findOne({
            _id: req.params.id,
            createdBy: req.user.userId
        });

        if (!apartment) {
            return res.status(404).json({ message: "Apartment not found" });
        }
        apartment.isActive = true;
        if (name) apartment.name = name;
        if (address) apartment.address = address;
        if (address_lg) apartment.address_lg = address_lg;

        apartment.updatedAt = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        await apartment.save();

        res.json({ message: "Apartment updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * SOFT DELETE Apartment
 */
exports.deleteApartment = async (req, res) => {
    try {
        const apartment = await Apartment.findOne({
            _id: req.params.id,
            createdBy: req.user.userId,
        });

        if (!apartment) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        apartment.isActive = false;
        apartment.updatedAt = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        await apartment.save();

        res.json({ message: "Apartment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

