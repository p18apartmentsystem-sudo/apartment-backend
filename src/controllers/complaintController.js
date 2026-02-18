const Complaint = require("../models/Complaint");
const moment = require("moment-timezone");
const NotificationService = require("../services/notification.service");



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
      createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    });

    // 🔥 Fetch flat details to get flat number
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("flatId", "flatNumber");

    const flatNumber = populatedComplaint.flatId?.flatNumber || "Unknown";

    // 🔔 SEND NOTIFICATION TO APARTMENT ADMIN
    await NotificationService.flatToApartment(
      req.user.apartmentId,
      "🚨 New Complaint Raised",
      `New ${category} complaint from flat ${flatNumber}`,
      "/apartment/updates"
    );

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
      flatId: req.user.flatId,
      isActive: true,
    }).populate("raisedBy", "name mobile")
      .sort({ resolvedAt: -1, createdAt: -1 });

    res.json(complaints);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET COMPLAINTS OF APARTMENT (apartment_admin)
 */
exports.getAllApartmentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      apartmentId: req.user.apartmentId,
      isActive: true,
    }).populate("raisedBy", "name mobile")
      .populate("flatId", "flatNumber floor")
      .sort({ createdAt: -1 });

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
    res.status(500).json({ error: err.message })
      .sort({ resolvedAt: -1, createdAt: -1 });
  }
};


/**
 * UPDATE COMPLAINT STATUS (apartment_admin)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = { status };

    if (status === "resolved") {
      updateData.resolvedBy = req.user.userId;
      updateData.resolvedAt = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🔔 IF RESOLVED → SEND NOTIFICATION BACK TO USER
    if (status === "resolved") {
      await NotificationService.apartmentToFlat(
        complaint.raisedBy,
        "✅ Complaint Resolved",
        "Your complaint has been resolved",
        "/apartment/updates"
      );
    }

    res.json({
      message: `Complaint marked as ${status}`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * BROADCAT To APARTMENT (apartment_admin)
 */
exports.broadcastToApartment = async (req, res) => {
  try {
    const { title, body } = req.body;

    const broadcast = await Complaint.create({
      apartmentId: req.user.apartmentId,
      raisedBy: req.user.userId,
      type: "broadcast",
      title,
      category: title,
      description: body,
      createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    });

    await NotificationService.apartmentToApartment(
      req.user.apartmentId,
      title,
      body,
      "/apartment/updates"
    );

    res.json({
      success: true,
      data: broadcast
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET BROADCAST OF APARTMENT (apartment_admin)
 */
exports.getApartmentBroadCast = async (req, res) => {
  try {
    // 🔥 EXACT 24 hours ago from now
    const last24Hours = moment()
      .subtract(24, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const broadcasts = await Complaint.find({
      apartmentId: req.user.apartmentId,
      type: "broadcast",
      isActive: true,
      createdAt: { $gte: last24Hours }   // 🔥 string comparison
    })
      .populate("raisedBy", "name mobile")
      .sort({ createdAt: -1 });

    res.json({ data: broadcasts });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * DELETE COMPLAINT
 */
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOneAndUpdate(
            {
                _id: req.params.id,
            },
            { isActive: false },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint/Broadcast not found"
            });
        }

        res.json({ message: "Deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};