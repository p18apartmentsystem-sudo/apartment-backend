const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');
const app = express();

/* routes declaration begin */
const protectedRoutes = require("./src/routes/protectedRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const apartmentRoutes = require("./src/routes/apartmentRoutes");
const flatRoutes = require("./src/routes/flatRoutes");
const flatMemberRoutes = require("./src/routes/flatMemberRoutes");
const parkingSlotRoutes = require("./src/routes/parkingSlotRoutes");
const parkingAssignmentRoutes = require("./src/routes/parkingAssignmentRoutes");
const vehicleRoutes = require("./src/routes/vehicleRoutes");
const rentPaymentRoutes = require("./src/routes/rentPaymentRoutes");
const path = require("path");
const lightBillRoutes = require("./src/routes/lightBillRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const profileRoutes = require("./src/routes/profileRoutes");

/* routes declaration end */


app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://p18-apartment-system.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// middleware begin
app.use(express.json());
// middleware end

/* routes use begin */
app.use("/api/protected", protectedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", adminRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/flat-members", flatMemberRoutes);
app.use("/api/parking", parkingSlotRoutes);
app.use("/api/parking-assign", parkingAssignmentRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/rent-payments", rentPaymentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/light-bills", lightBillRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);



/* routes use end */

// connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// test route
app.get("/", (req, res) => {
    res.send("Apartment Backend Running");
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
