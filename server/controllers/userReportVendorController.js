const UserReportVendor = require('../models/userReportVendorModel');


const createReport = async (req, res) => {
    try {
        const reportData = req.body;
        console.log(reportData)
        const newReport = new UserReportVendor(reportData);
        const savedReport = await newReport.save();

        return res.status(201).json(savedReport)
    } catch (error) {
        throw new Error(`Error creating report: ${error.message}`);
    }
};

/**
 * Get reports based on filters.
 * @param {Object} filters - Filters to apply when fetching reports.
 * @param {String} [filters.userid] - Filter by user ID.
 * @param {String} [filters.venderId] - Filter by vendor ID.
 * @returns {Promise<Array>} - List of reports matching the filters.
 */
const getReports = async (req, res) => {
    try {
        const filters = req.params
        const reports = await UserReportVendor.find(filters)
            .populate('userid', 'name email') // Populate user details (optional)
            .populate('venderId') // Populate vendor details (optional)
            .exec();
        return res.status(201).json(reports)
    } catch (error) {
        throw new Error(`Error fetching reports: ${error.message}`);
    }
};

module.exports = {
    createReport,
    getReports,
};
