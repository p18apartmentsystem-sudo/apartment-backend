const ParkingAssignmentMap = require("../models/ParkingAssignmentMap");
const moment = require("moment");

/**
 * ASSIGN PARKING TO FLAT
 */
exports.assignParking = async (req, res) => {
    try {
        const { parkingSlotId, flatId, apartmentId } = req.body;

        // deactivate old assignment
        await ParkingAssignmentMap.updateMany(
            { parkingSlotId, isActive: true },
            { isActive: false, unassignedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") }
        );

        const assign = await ParkingAssignmentMap.create({
            apartmentId,
            parkingSlotId,
            flatId,
            assignedBy: req.user.userId,
            assignedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        });

        res.json({
            message: "Parking assigned",
            slotId: assign._id,
            assignedAt: assign.assignedAt
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PARKING USAGE HISTORY
 */
exports.getParkingHistory = async (req, res) => {
    try {
        const history = await ParkingAssignmentMap.find({
            parkingSlotId: req.params.slotId
        }).populate("flatId", "flatNumber");

        res.json(
            history.map(h => ({
                flat: h.flatId.flatNumber,
                assignedAt: h.assignedAt,
                unassignedAt: h.unassignedAt
                    ? h.unassignedAt
                    : null
            }))
        );

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};