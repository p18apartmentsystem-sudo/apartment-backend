const RentPayment = require("../models/RentPayment");
const moment = require("moment");

/**
 * ADD RENT PAYMENT (flat_admin)
 */
exports.addRentPayment = async (req, res) => {
  try {
    const { month, year, amount, refno } = req.body;

    const exists = await RentPayment.findOne({
      flatId: req.user.flatId,
      month,
      year,
    });

    if (exists) {
      return res.status(400).json({
        message: "Rent already uploaded for this month"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Payment proof is required"
      });
    }

    const payment = await RentPayment.create({
      apartmentId: req.user.apartmentId,
      flatId: req.user.flatId,
      paidBy: req.user.userId,
      month,
      year,
      amount,
      refno,
      proofFile: req.file.path,
      createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    });

    res.status(201).json({
      message: "Rent payment uploaded",
      payment: {
        id: payment._id,
        month,
        year,
        amount,
        refno,
        status: payment.status,
        proofFile: payment.proofFile,
        createdAt: payment.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET RENT PAYMENTS (flat_admin)
 */
exports.getFlatRentPayments = async (req, res) => {
  try {
    const payments = await RentPayment.aggregate([
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
 * VERIFY / REJECT RENT (apartment_admin)
 */
exports.verifyRent = async (req, res) => {
  try {
    const { status } = req.body; // verified / rejected

    const payment = await RentPayment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verifiedBy: req.user.userId
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: `Rent ${status} successfully`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET RENT PAYMENTS (apartment_admin)
 * View all rent proofs for apartment
 */
exports.getApartmentRentPayments = async (req, res) => {
  try {
    if (req.user.role !== "apartment_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await RentPayment.find({
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
 * GET RENT PAYMENT BY ID (apartment_admin)
 */
exports.getRentPaymentById = async (req, res) => {
  try {
    const payment = await RentPayment.findOne({
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
