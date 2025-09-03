const vender = require("../models/venderModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vender = require("../models/venderModel");
const { notifyvender } = require("./userControllers");
const sendEmail = require("../Utils/mailSender");
const User = require("../models/userModel");
const CustomerOrder = require("../models/CustomerOrders");

// Custom Functions

const RegisterVender = async (req, res) => {
  const { shopName, email, phone, password, shopAddress, reviews, description, longitude, latitude } = req.body;
  console.log(req.body);
  if (
    shopName.length == 0 ||
    description.length == 0 ||
    phone.length == 0 ||
    email.length == 0 ||
    password.length == 0 ||
    shopAddress.length == 0 ||
    !longitude || !latitude

  ) {
    console.log("fields cannot be left emoty");
    return res.status(204).json({ message: "fields cannot be left emoty" });
  }
  try {
    const VenderExist = await vender.findOne({ email: email })
    if (VenderExist) {
      console.log("Vender already registered");
      return res
        .status(422)
        .json({ message: "Vender already exist with this email" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const Vender = new vender({
      shopName,
      description,
      email,
      phone,
      password: hashedPassword,
      reviews,
      shopAddress,
      longitude, latitude
    });
    await Vender.save();
    res.status(201).json({ message: "Vender regsitered " });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

const LoginVender = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("done")
    if (email.length == 0 || password.length == 0) {
      return res.status(204).json({ message: "fields cannot be left emoty" });
    }
    const userLogin = await vender.findOne({ email: email });

    if (userLogin.status === 'pending' || userLogin.status === 'disabled') {
      return res.status(402).json({ message: `your profile is ${userLogin.status}` });
    }
    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);
      // passMatch = true or false ;
      console.log(`passwordMatch = ${passMatch}`);
      if (passMatch) {
        console.log(`Password Match is  : ${passMatch}`);
        console.log(`Password Match is  : ${passMatch}`);
        const token = await userLogin.generateAuthToken();
        res.cookie("jwtoken", JSON.stringify({ token, userLogin }), {
          httpOnly: true,
        });
        res.status(201).json({ message: `${userLogin.type} Logged In`, isAuthenticated: true, data: userLogin });
      } else {
        return res.status(422).json({ message: "Password Incorrect" });
      }
    } else {
      return res.status(404).json({ message: "Invalid Email" });
    }
  } catch (error) {
    res.status(500).json(`error : ${error}`);
  }
};

const getVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const allVendors = await Vender.find({ type: 'vendor', _id: vendorId });

    return res.json({ allVendors })

  } catch (error) {

  }

}
const updateQualityReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { qualityReport } = req.body;

    if (!qualityReport) {
      return res.status(400).json({ message: "Quality report is required." });
    }

    const updatedVendor = await Vender.findByIdAndUpdate(
      id,
      { qualityReport },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    return res.status(200).json({
      message: "Quality report updated successfully.",
      updatedVendor,
    });
  } catch (error) {
    console.error("Error updating quality report:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getVendorList = async (req, res) => {
  try {
    const allVendors = await Vender.find({ type: 'vendor' });

    return res.json({ allVendors })

  } catch (error) {

  }

}


const toggleVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['approved', 'disabled', 'reject'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Status must be either "approved", "suspend", or "reject"'
      });
    }

    const vendor = await vender.findOne({ _id: id });

    if (!vendor) {
      return res.status(404).json({ message: 'No vendor found' });
    }

    try {
      // Get status-specific email content
      const getStatusSpecificContent = (status) => {
        switch (status) {
          case 'approved':
            return {
              subject: 'Vendor Account Approved',
              title: 'Account Approval Notification',
              message: 'Congratulations! Your vendor account has been approved.',
              description: 'You can now start selling your products on our platform.'
            };
          case 'disabled':
            return {
              subject: 'Vendor Account Suspended',
              title: 'Account Suspension Notice',
              message: 'Your vendor account has been temporarily suspended.',
              description: 'Please contact support for more information about your account status.'
            };
          case 'reject':
            return {
              subject: 'Vendor Account Rejected',
              title: 'Account Rejection Notice',
              message: 'Your vendor account application has been rejected.',
              description: 'If you believe this is an error, please contact our support team.'
            };
        }
      };

      const emailContent = getStatusSpecificContent(status);

      await sendEmail({
        VenderEmail: vendor.email,
        subject: emailContent.subject,
        htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${emailContent.title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: ${status === 'approved' ? '#4CAF50' :
            status === 'suspend' ? '#FFA500' : '#FF0000'};
                    color: white;
                    text-align: center;
                    padding: 20px 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    margin: 0 0 10px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 4px;
                    background-color: ${status === 'approved' ? '#e8f5e9' :
            status === 'suspend' ? '#fff3e0' : '#ffebee'};
                    color: ${status === 'approved' ? '#2e7d32' :
            status === 'suspend' ? '#ef6c00' : '#c62828'};
                    margin: 10px 0;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    background: #f1f1f1;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${emailContent.title}</h1>
                </div>
                <div class="content">
                    <h2>${emailContent.message}</h2>
                    <div class="status-badge">
                        Status: ${status.toUpperCase()}
                    </div>
                    <p>${emailContent.description}</p>
                   
                </div>
                <div class="footer">
                    <p>Hydrohitch | Vendor Management System</p>
                    <p>&copy; ${new Date().getFullYear()} Hydrohitch. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
      });
    } catch (error) {
      console.error('Error sending vendor status notification email:', error);
      // Continue with status update even if email fails
    }

    // Update vendor status
    vendor.status = status;
    await vendor.save();

    res.status(200).json({
      message: `Vendor status successfully updated to ${status}`,
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({
      message: 'Failed to update vendor status',
      error: error.message
    });
  }
};
const getDashboard = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Fetch the current vendor details
    const currentVendor = await Vender.findById(vendorId);

    if (!currentVendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found',
      });
    }

    // Check vendor type and fetch data accordingly
    let allVendors;
    if (currentVendor.type === 'super_admin') {
      allVendors = await Vender.find({ type: 'vendor' }); // Fetch all vendors if super_admin
    } else {
      allVendors = [currentVendor]; // Only fetch current vendor data if not super_admin
    }

    // Fetch additional data
    const allUsers = await User.find();
    const allOrders = await CustomerOrder.find(
      currentVendor.type === 'super_admin' ? {} : { venderId: vendorId } // Filter orders by vendorId if not super_admin
    );

    // Calculate statistics
    const vendorCount = allVendors.length;
    const userCount = allUsers.length;
    const orderCount = allOrders.length;
    const totalSales = allOrders.reduce((sum, order) => sum + (order.Price || 0), 0);

    // Return response
    return res.json({
      status: 'success',
      data: {
        vendorCount,
        userCount,
        orderCount,
        totalSales,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
    });
  }
};

module.exports = { LoginVender, RegisterVender, getVendorList, toggleVendorStatus, getVendor, updateQualityReport, getDashboard };
