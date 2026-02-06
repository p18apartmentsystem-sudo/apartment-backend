const Inventory = require("../models/Inventory");
const moment = require("moment");

//ADD
exports.addInventory = async (req, res) => {
    try {
        const {
            apartmentId,
            flatId,
            itemName,
            quantity,
            description
        } = req.body;

        if (!apartmentId && !flatId) {
            return res.status(400).json({
                message: "Either apartmentId or flatId is required"
            });
        }

        const inventory = await Inventory.create({
            apartmentId: apartmentId || null,
            flatId: flatId || null,
            itemName,
            quantity,
            description,
            addedBy: req.user.userId,
            addedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        });

        res.status(201).json({
            message: "Inventory added successfully",
            data: inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET BY APARTMENT
exports.getApartmentInventory = async (req, res) => {
    try {
        const { apartmentId } = req.params;

        const inventory = await Inventory.find({ apartmentId })
            .populate("addedBy", "name mobile")
            .populate("flatId", "flatNumber floor rentAmount meterNumber isOccupied");

        res.json({ data: inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET BY FLAT
exports.getFlatInventory = async (req, res) => {
    try {
        const { flatId } = req.params;

        const inventory = await Inventory.find({ flatId })
            .populate("addedBy", "name mobile")
            .populate("flatId", "flatNumber floor rentAmount meterNumber isOccupied");

        res.json({ data: inventory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//UPDATE 
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { flatId, itemName, quantity, description } = req.body;

        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        if (flatId !== undefined) inventory.flatId = flatId;
        if (itemName !== undefined) inventory.itemName = itemName;
        if (quantity !== undefined) inventory.quantity = quantity;
        if (description !== undefined) inventory.description = description;

        await inventory.save();

        res.json({
            message: "Inventory updated successfully",
            data: inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

