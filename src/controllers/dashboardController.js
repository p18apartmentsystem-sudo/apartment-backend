// ===== REQUIRED MODELS =====
const Apartment = require("../models/Apartment");
const User = require("../models/User");
const Flat = require("../models/Flat");
const FlatMemberMap = require("../models/FlatMemberMap");
const Vehicle = require("../models/Vehicle");
const RentPayment = require("../models/RentPayment");
const LightBill = require("../models/LightBill");
const Complaint = require("../models/Complaint");
const ParkingSlot = require("../models/ParkingSlot");




/**
 * =========================================================
 * FLAT DASHBOARD
 * role: flat_admin / resident
 * =========================================================
 */

exports.getFlatDashboard = async (req, res) => {
  try {
    const flatId = req.user.flatId;

    if (!flatId) {
      return res.status(400).json({
        code: "FLAT_NOT_ASSIGNED",
        message: "User is not assigned to any flat",
      });
    }


    // 1️⃣ Flat info
    const flat = await Flat.findById(flatId).select("flatNumber");

    // 2️⃣ Members count
    const membersCount = await FlatMemberMap.countDocuments({
      flatId,
      isActive: true,
    });

    // 3️⃣ Vehicles count
    const vehiclesCount = await Vehicle.countDocuments({
      flatId,
      isActive: true,
    });

    // 4️⃣ Latest rent
    const latestRent = await RentPayment.findOne({ flatId })
      .sort({ year: -1, month: -1 })
      .select("month year status");

    // 5️⃣ Latest light bill
    const latestLightBill = await LightBill.findOne({ flatId })
      .sort({ year: -1, month: -1 })
      .select("month year status");

    // 6️⃣ Open complaints
    const openComplaints = await Complaint.countDocuments({
      flatId,
      status: { $ne: "resolved" },
    });

    res.status(200).json({
      flatNumber: flat?.flatNumber || null,
      members: membersCount,
      vehicles: vehiclesCount,
      rent: latestRent || null,
      lightBill: latestLightBill || null,
      openComplaints,
    });
  } catch (err) {
    console.error("FLAT DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * =========================================================
 * APARTMENT DASHBOARD
 * role: apartment_admin
 * =========================================================
 */
exports.getApartmentDashboard = async (req, res) => {
  try {
    const apartmentId = req.user.apartmentId;

    if (!apartmentId) {
      return res.status(400).json({
        code: "APARTMENT_NOT_ASSIGNED",
        message: "Apartment not assigned to this user",
      });
    }


    // 1️⃣ Total flats
    const totalFlats = await Flat.countDocuments({ apartmentId });

    // 2️⃣ Occupied flats
    const occupiedFlats = await Flat.countDocuments({
      apartmentId,
      flatAdminId: { $ne: null },
    });

    // 3️⃣ Vacant flats
    const vacantFlats = totalFlats - occupiedFlats;

    // 4️⃣ Active vehicles
    const vehicles = await Vehicle.countDocuments({
      apartmentId,
      isActive: true,
    });

    // 5️⃣ Pending rent verification
    const pendingRent = await RentPayment.countDocuments({
      apartmentId,
      status: "paid",
    });

    // 6️⃣ Pending light bill verification
    const pendingLightBills = await LightBill.countDocuments({
      apartmentId,
      status: "uploaded",
    });

    // 7️⃣ Open complaints
    const openComplaints = await Complaint.countDocuments({
      apartmentId,
      status: { $ne: "resolved" },
    });

    res.status(200).json({
      totalFlats,
      occupiedFlats,
      vacantFlats,
      vehicles,
      pendingRent,
      pendingLightBills,
      openComplaints,
    });
  } catch (err) {
    console.error("APARTMENT DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * =========================================================
 * SUPER ADMIN DASHBOARD HELPERS
 * =========================================================
 */

// 1️⃣ Summary
async function getSummary() {
  const [
    totalApartments,
    totalFlats,
    totalUsers,
    totalApartmentAdmins,
    monthlyRevenueAgg,
    pendingComplaints,
  ] = await Promise.all([
    Apartment.countDocuments(),
    Flat.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ role: "apartment_admin" }),
    RentPayment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]),
    Complaint.countDocuments({ status: { $ne: "resolved" } }),
  ]);

  return {
    totalApartments,
    totalFlats,
    totalUsers,
    totalApartmentAdmins,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    pendingComplaints,
  };
}

// 2️⃣ System stats
async function getSystemStats() {
  const [
    activeApartments,
    inactiveApartments,
    parkingSlotsTotal,
    parkingSlotsUsed,
  ] = await Promise.all([
    Apartment.countDocuments({ status: "active" }),
    Apartment.countDocuments({ status: "inactive" }),
    ParkingSlot.countDocuments(),
    ParkingSlot.countDocuments({ isAssigned: true }),
  ]);

  return {
    activeApartments,
    inactiveApartments,
    parkingSlotsTotal,
    parkingSlotsUsed,
  };
}

// 3️⃣ Recent complaints
async function getRecentComplaints() {
  return Complaint.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("apartmentId", "name")
    .select("category status createdAt apartmentId");
}

// 4️⃣ Recent payments
async function getRecentPayments() {
  return RentPayment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("apartmentId", "name")
    .select("amount paymentMode createdAt apartmentId");
}

// 5️⃣ Recent apartments
async function getRecentApartments() {
  return Apartment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name city createdAt");
}

/**
 * =========================================================
 * SUPER ADMIN DASHBOARD
 * role: super_admin
 * =========================================================
 */
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const [
      summary,
      systemStats,
      recentComplaints,
      recentPayments,
      recentApartments,
    ] = await Promise.all([
      getSummary(),
      getSystemStats(),
      getRecentComplaints(),
      getRecentPayments(),
      getRecentApartments(),
    ]);

    res.status(200).json({
      summary,
      systemStats,
      recentComplaints,
      recentPayments,
      recentApartments,
    });
  } catch (error) {
    console.error("SUPER ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Dashboard fetch failed",
      error: error.message,
    });
  }
};
