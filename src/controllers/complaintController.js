const Complaint = require("../models/Complaint");
const moment = require("moment");

/**
 * RAISE COMPLAINT (resident / flat_admin)
 */
exports.raiseComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;

    const complaint = await Complaint.create({
      apartmentId: req.user.apartmentId,
      flatId: req.user.flatId,
      raisedBy: req.user.userId,
      category,
      description,
      createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    });

    res.status(201).json({
      message: "Complaint raised successfully",
      complaint: {
        id: complaint._id,
        category,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET COMPLAINTS OF FLAT (flat_admin)
 */
exports.getFlatComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      flatId: req.user.flatId
    }).populate("raisedBy", "name mobile");

    res.json(complaints);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET MY COMPLAINTS (resident)
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      raisedBy: req.user.userId
    });

    res.json(complaints);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE COMPLAINT STATUS (apartment_admin)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body; // in_progress / resolved

    const updateData = {
      status
    };

    if (status === "resolved") {
      updateData.resolvedBy = req.user.userId;
      updateData.resolvedAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: `Complaint marked as ${status}`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};