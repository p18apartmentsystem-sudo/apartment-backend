const LightBill = require("../models/LightBill");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

/**
 * UPLOAD LIGHT BILL (flat_admin)
 */
exports.uploadLightBill = async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    // prevent duplicate bill
    const exists = await LightBill.findOne({
      flatId: req.user.flatId,
      month,
      year
    });

    if (exists) {
      return res.status(400).json({
        message: "Light bill already uploaded for this month"
      });
    }

    const bill = await LightBill.create({
      apartmentId: req.user.apartmentId,
      flatId: req.user.flatId,
      uploadedBy: req.user.userId,
      month,
      year,
      amount,
      proofFile: req.file.path,
      createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    });

    res.status(201).json({
      message: "Light bill uploaded",
      bill: {
        id: bill._id,
        month,
        year,
        amount,
        status: bill.status,
        createdAt: bill.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET LIGHT BILLS OF FLAT (flat_admin)
 */
exports.getFlatLightBills = async (req, res) => {
  try {
    const payments = await LightBill.aggregate([
      {
        $match: {
          flatId: req.user.flatId
        }
      },
      {
        $addFields: {
          monthOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$month", "Jan"] }, then: 1 },
                { case: { $eq: ["$month", "Feb"] }, then: 2 },
                { case: { $eq: ["$month", "Mar"] }, then: 3 },
                { case: { $eq: ["$month", "Apr"] }, then: 4 },
                { case: { $eq: ["$month", "May"] }, then: 5 },
                { case: { $eq: ["$month", "Jun"] }, then: 6 },
                { case: { $eq: ["$month", "Jul"] }, then: 7 },
                { case: { $eq: ["$month", "Aug"] }, then: 8 },
                { case: { $eq: ["$month", "Sep"] }, then: 9 },
                { case: { $eq: ["$month", "Oct"] }, then: 10 },
                { case: { $eq: ["$month", "Nov"] }, then: 11 },
                { case: { $eq: ["$month", "Dec"] }, then: 12 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $sort: {
          year: -1,
          monthOrder: -1
        }
      },
      {
        $project: {
          monthOrder: 0
        }
      }
    ]);

    res.json({ data: payments });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * VERIFY / REJECT LIGHT BILL (apartment_admin)
 */
exports.verifyLightBill = async (req, res) => {
  try {
    const { status } = req.body; // verified / rejected

    const bill = await LightBill.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verifiedBy: req.user.userId
      },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: "Light bill not found" });
    }

    res.json({
      message: `Light bill ${status} successfully`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * GET LIGHT BILL PAYMENTS (apartment_admin)
 * View all proofs for apartment
 */
exports.getApartmentLightBillPayments = async (req, res) => {
  try {
    if (req.user.role !== "apartment_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Status filter (default = uploaded)
    const { status } = req.query;
    const billStatus = status || "uploaded";

    // ✅ Validate allowed statuses
    const allowedStatus = ["uploaded", "paid", "rejected"];
    if (!allowedStatus.includes(billStatus)) {
      return res.status(400).json({
        message: "Invalid rent status"
      });
    }

    // 🔍 Query object
    const query = {
      apartmentId: req.params.apartmentId,
      status: billStatus
    };

    const payments = await LightBill.find(query)
      .populate("flatId", "flatNumber")
      .populate("uploadedBy", "name mobile")
      .populate("verifiedBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      status: "success",
      count: payments.length,
      data: payments
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET LIGHT BILL PAYMENT BY ID (apartment_admin)
 */
exports.getLightBillPaymentById = async (req, res) => {
  try {
    const payment = await LightBill.findOne({
      _id: req.params.id,
    })
      .populate("flatId", "flatNumber")
      .populate("uploadedBy", "name mobile");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * ADD LIGHT-BILL PAYMENT ("apartment_admin")
 */
exports.addLightBillPaymentByA_Admin = async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    let { apartmentId, flatId } = req.body;
    // 🧼 Remove accidental quotes
    if (typeof apartmentId === 'string') {
      apartmentId = apartmentId.replace(/"/g, '');
    }
    if (typeof flatId === 'string') {
      flatId = flatId.replace(/"/g, '');
    }
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(flatId)) {
      return res.status(400).json({
        message: 'Invalid flatId'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
      return res.status(400).json({
        message: 'Invalid apartmentId'
      });
    }

    const exists = await LightBill.findOne({
      flatId,
      month,
      year,
    });

    if (exists) {
      return res.status(400).json({
        message: "Light Bill already uploaded for this month"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Payment proof is required"
      });
    }

    const payment = await LightBill.create({
      apartmentId,
      flatId,
      uploadedBy: req.user.userId,
      month,
      year,
      amount,
      proofFile: req.file.path,
      add_status: "apartment_admin",
      status: "paid",
      verifiedBy: req.user.userId,
      createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    });

    res.status(201).json({
      message: "Ligh Bill payment uploaded",
      payment: {
        id: payment._id,
        month,
        year,
        amount,
        status: payment.status,
        proofFile: payment.proofFile,
        createdAt: payment.createdAt,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET LIGHT BILL PAYMENTS ADDED BY = "apartment_admin" (apartment_admin)
 * View all LIGHT Bill proofs for apartment
 */
exports.getLightBillPaymentAddedByA_ADMIN = async (req, res) => {
  try {
    if (req.user.role !== "apartment_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await LightBill.find({
      apartmentId: req.params.apartmentId,
      add_status: "apartment_admin"
    })
      .populate("flatId", "flatNumber")
      .populate("uploadedBy", "name mobile")
      .sort({ createdAt: -1 });

    res.json({
      data: payments
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};