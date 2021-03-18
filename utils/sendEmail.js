const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // name: process.env.SMTP_HOST,
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    service: 'Gmail',
    auth: { user: process.env.USER, pass: process.env.PASS },
  })

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `<h2>Hai, ${options.email}</h2>
        <p>Terima kasih telah mendaftar. Silahkan konfirmasi akunmu dengan mengklik link dibawah ini!</p>
        <a href=${options.confirmEmailUrl}>Konfirmasi Akun Saya</a>
        </div>`,
  }

  const info = await transporter.sendMail(message)

  console.log('Pesan terkirim: %s', info.messageId)
}

module.exports = sendEmail
