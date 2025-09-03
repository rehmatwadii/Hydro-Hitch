require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // To hash the password before storing
const Vender = require('../models/venderModel'); // Replace with your actual Vendor model path

async function seedSuperAdmin() {
    try {
        const existingAdmin = await Vender.findOne({ type: "super_admin" });
        if (existingAdmin) {
            console.log("Super admin already exists. No need to seed.");
            return;
        }

        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

        const superAdmin = new Vender({
            shopName: process.env.SUPER_ADMIN_SHOP_NAME,
            description: "Hydro Hitch is a premium water brand offering high-quality, purified drinking water, dedicated to providing refreshing hydration to customers in every setting. Whether at home, the office, or on the go, Hydro Hitch brings crisp, clean water directly to you with rigorous purification processes to ensure the best in taste and quality. Like Aquafina, Hydro Hitch prioritizes excellence in water sourcing and filtration, making it an ideal choice for those seeking pure and trusted hydration. With a focus on convenience and customer satisfaction, Hydro Hitch is here to meet all your water needs, delivering a revitalizing experience in every sip.",
            email: process.env.SUPER_ADMIN_EMAIL,
            phone: process.env.SUPER_ADMIN_PHONE,
            password: hashedPassword,
            type: "super_admin",
            status: "approved",
            shopAddress: process.env.SUPER_ADMIN_SHOP_ADDRESS,
        });

        await superAdmin.save();
        console.log("Super admin seeded successfully.");
    } catch (error) {
        console.error("Error seeding super admin:", error);
    }
}

module.exports = { seedSuperAdmin }
