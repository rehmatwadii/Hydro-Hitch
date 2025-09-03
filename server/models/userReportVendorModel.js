const mongoose = require('mongoose');

const UserReportVendorSchema = new mongoose.Schema({

    title: {
        type: String
    },
    description: {
        type: String
    },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vender', required: true },
})

const UserReportVendor = mongoose.model('UserReportVendor', UserReportVendorSchema)
module.exports = UserReportVendor;