const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
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
