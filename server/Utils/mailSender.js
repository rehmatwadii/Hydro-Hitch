const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
    console.log(process.env.SMPT_SERVICE, process.env.SMPT_MAIL, process.env.SMPT_PASSWORD)
    const transporter = nodeMailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: true,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: 'hydrohitchofficial@gmail.com',
            pass: 'scii pmon dfhj ipsb',
        },
    })

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.VenderEmail,
        subject: options.subject,
        text: options.message,
        html: options.htmlContent || null,
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;