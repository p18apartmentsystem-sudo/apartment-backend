const Flat = require("../models/Flat");
const RentPayment = require("../models/RentPayment");
const LightBill = require("../models/LightBill");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

// getFlats with Payments
exports.getFlatPayments = async (req, res) => {
    try {

        const { apartmentId, month, year } = req.query;

        const apartmentObjectId = new mongoose.Types.ObjectId(apartmentId);

        // 1️⃣ Get all flats
        const flats = await Flat.find({
            apartmentId: apartmentObjectId
        }).lean();

        // 2️⃣ Get rent payments
        const rents = await RentPayment.find({
            apartmentId: apartmentObjectId,
            month,
            year
        }).lean();

        // 3️⃣ Get light bills
        const lights = await LightBill.find({
            apartmentId: apartmentObjectId,
            month,
            year
        }).lean();

        // Map for fast lookup
        const rentMap = {};
        rents.forEach(r => {
            rentMap[r.flatId.toString()] = r;
        });

        const lightMap = {};
        lights.forEach(l => {
            lightMap[l.flatId.toString()] = l;
        });

        // 4️⃣ Merge data
        const result = flats.map(flat => {

            const rent = rentMap[flat._id.toString()];
            const light = lightMap[flat._id.toString()];

            return {

                flatId: flat._id,
                flatNumber: flat.flatNumber,
                floor: flat.floor,
                rentAmount: flat.rentAmount,

                rentStatus: rent ? rent.status : "unpaid",
                rentAmountPaid: rent ? rent.amount : 0,
                rentPaidAt: rent ? rent.createdAt : null,

                lightBillStatus: light ? light.status : "unpaid",
                lightBillAmount: light ? light.amount : 0,
                lightBillPaidAt: light ? light.createdAt : null

            };

        });

        // Sort flats
        result.sort((a, b) =>
            a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true })
        );

        res.json({
            success: true,
            month,
            year,
            totalFlats: result.length,
            data: result
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server error" });

    }
};

// bulkRentPaid
exports.bulkRentPaid = async (req, res) => {
    try {

        const { apartmentId, flatIds, month, year } = req.body;
        const userId = req.user.id;

        const flats = await Flat.find({
            _id: { $in: flatIds }
        }).lean();

        const operations = flats.map(flat => ({
            updateOne: {
                filter: {
                    apartmentId,
                    flatId: flat._id,
                    month,
                    year
                },
                update: {
                    $set: {
                        apartmentId,
                        flatId: flat._id,
                        paidBy: userId,
                        amount: flat.rentAmount,
                        proofFile: "admin-entry",
                        status: "paid",
                        verifiedBy: userId,
                        add_status: "apartment_admin",
                        createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                    }
                },
                upsert: true
            }
        }));

        await RentPayment.bulkWrite(operations);

        res.json({
            success: true,
            message: "Rent payments updated"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server error" });

    }
};

//bulkLightBillPaid
exports.bulkLightBillPaid = async (req, res) => {

    try {

        const { apartmentId, flatIds, month, year, amount } = req.body;
        const userId = req.user.id;

        const operations = flatIds.map(flatId => ({
            updateOne: {
                filter: {
                    apartmentId,
                    flatId,
                    month,
                    year
                },
                update: {
                    $set: {
                        apartmentId,
                        flatId,
                        uploadedBy: userId,
                        amount,
                        proofFile: "admin-entry",
                        status: "paid",
                        verifiedBy: userId,
                        add_status: "apartment_admin",
                        createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                    }
                },
                upsert: true
            }
        }));

        await LightBill.bulkWrite(operations);

        res.json({
            success: true,
            message: "Light bills updated"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server error" });

    }

};

//single Paid
exports.markPaymentPaid = async (req, res) => {

    try {

        const { apartmentId, flatId, month, year, type } = req.body;
        const userId = req.user.id;

        if (type === "rent") {

            const flat = await Flat.findById(flatId);

            await RentPayment.updateOne(
                { apartmentId, flatId, month, year },
                {
                    $set: {
                        apartmentId,
                        flatId,
                        paidBy: userId,
                        amount: flat.rentAmount,
                        status: "paid",
                        verifiedBy: userId,
                        proofFile: "admin-entry",
                        add_status: "apartment_admin",
                        createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                    }
                },
                { upsert: true }
            );

        }

        if (type === "light") {

            await LightBill.updateOne(
                { apartmentId, flatId, month, year },
                {
                    $set: {
                        apartmentId,
                        flatId,
                        uploadedBy: userId,
                        amount: 0,
                        status: "paid",
                        verifiedBy: userId,
                        proofFile: "admin-entry",
                        add_status: "apartment_admin",
                        createdAt: moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                    }
                },
                { upsert: true }
            );

        }

        res.json({
            success: true,
            message: "Payment updated"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server error" });

    }

};