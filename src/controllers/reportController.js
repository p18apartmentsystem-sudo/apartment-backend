const RentPayment = require("../models/RentPayment");
const Flat = require("../models/Flat");
const LightBill = require("../models/LightBill");
const Vehicle = require("../models/Vehicle");
const Complaint = require("../models/Complaint");
const FlatMemberMap = require("../models/FlatMemberMap");
const ParkingAssignmentMap = require("../models/ParkingAssignmentMap");

/**
 * FLAT REPORT (apartment_admin)
 */
exports.getFlatReport = async (req, res) => {
  try {
    const apartmentId = req.user.apartmentId;

    const flats = await Flat.find({ apartmentId })
      .populate("flatAdminId", "name mobile");

    const report = [];

    for (const flat of flats) {
      // 1️⃣ Flat members count
      const membersCount = await FlatMemberMap.countDocuments({
        flatId: flat._id,
        isActive: true
      });

      // 2️⃣ Vehicles count
      const vehiclesCount = await Vehicle.countDocuments({
        flatId: flat._id,
        isActive: true
      });

      // 3️⃣ Parking slots count (active assignments)
      const parkingCount = await ParkingAssignmentMap.countDocuments({
        flatId: flat._id,
        isActive: true
      });

      report.push({
        flatNumber: flat.flatNumber,
        status: flat.flatAdminId ? "occupied" : "vacant",
        flatAdmin: flat.flatAdminId
          ? {
              name: flat.flatAdminId.name,
              mobile: flat.flatAdminId.mobile
            }
          : null,
        flatMembers: membersCount,
        vehicles: vehiclesCount,
        parkingSlots: parkingCount
      });
    }

    res.json(report);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * RENT REPORT (apartment_admin)
 */
exports.getRentReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const report = await RentPayment.find({
      apartmentId: req.user.apartmentId,
      month,
      year
    }).populate("flatId", "flatNumber");

    res.json(
      report.map(r => ({
        flat: r.flatId.flatNumber,
        amount: r.amount,
        status: r.status
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PENDING PAYMENTS
 */
exports.getPendingPayments = async (req, res) => {
  try {
    const pendingRent = await RentPayment.find({
      apartmentId: req.user.apartmentId,
      status: "uploaded"
    }).populate("flatId", "flatNumber");

    const pendingLight = await LightBill.find({
      apartmentId: req.user.apartmentId,
      status: "uploaded"
    }).populate("flatId", "flatNumber meterNumber");

    res.json({
      rent: pendingRent.map(r => ({
        flat: r.flatId.flatNumber,
        amount: r.amount
      })),
      lightBills: pendingLight.map(b => ({
        flat: b.flatId.flatNumber,
        amount: b.amount
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * VEHICLE REPORT
 */
exports.getVehicleReport = async (req, res) => {
  try {
    const vehicles = await Vehicle.aggregate([
      {
        $match: {
          apartmentId: req.user.apartmentId,
          isActive: true
        }
      },
      {
        $group: {
          _id: "$flatId",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(vehicles);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * COMPLAINT REPORT
 */
exports.getComplaintReport = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      apartmentId: req.user.apartmentId
    };

    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate("flatId", "flatNumber")
      .populate("raisedBy", "name");

    res.json(
      complaints.map(c => ({
        flat: c.flatId.flatNumber,
        category: c.category,
        status: c.status,
        raisedBy: c.raisedBy.name
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DETAILED VEHICLE REPORT (apartment_admin)
 */
exports.getVehicleReportDetailed = async (req, res) => {
  try {
    const apartmentId = req.user.apartmentId;

    const vehicles = await Vehicle.find({
      apartmentId,
      isActive: true
    })
      .populate("flatId", "flatNumber flatAdminId")
      .populate("userId", "name mobile");

    const report = [];

    for (const vehicle of vehicles) {
      // get flat admin
      let flatAdmin = null;
      if (vehicle.flatId?.flatAdminId) {
        flatAdmin = await require("../models/User")
          .findById(vehicle.flatId.flatAdminId)
          .select("name mobile");
      }

      // get parking slot (active)
      const parking = await ParkingAssignmentMap.findOne({
        flatId: vehicle.flatId._id,
        isActive: true
      }).populate("parkingSlotId", "side name slotNumber");

      report.push({
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        flat: vehicle.flatId.flatNumber,
        flatAdmin: flatAdmin
          ? {
              name: flatAdmin.name,
              mobile: flatAdmin.mobile
            }
          : null,
        vehicleOwner: {
          name: vehicle.userId.name,
          mobile: vehicle.userId.mobile
        },
        parkingSlot: parking
          ? {
              side: parking.parkingSlotId.side,
              name: parking.parkingSlotId.name,
              number: parking.parkingSlotId.slotNumber
            }
          : null
      });
    }

    res.json(report);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};