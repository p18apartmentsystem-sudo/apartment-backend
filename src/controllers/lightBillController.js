const LightBill = require("../models/LightBill");
const moment = require("moment");

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
      billFile: req.file.path,
      createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
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
    const bills = await LightBill.find({
      flatId: req.user.flatId
    });

    res.json(bills);

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
 * View all rent proofs for apartment
 */
exports.getApartmentLightBillPayments = async (req, res) => {
  try {
    if (req.user.role !== "apartment_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await LightBill.find({
      apartmentId: req.params.apartmentId
    })
      .populate("flatId", "flatNumber")
      .populate("paidBy", "name mobile")
      .populate("verifiedBy", "name")
      .sort({ createdAt: -1 });

    res.json({
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
      .populate("paidBy", "name mobile");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
