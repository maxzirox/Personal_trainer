// =============================================================================
// utils/email.js - Utilidades para email (opcional)
// =============================================================================

const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.nombre;
    this.url = url;
    this.from = `Personal Trainer <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Usar servicio de email real en producción
      return nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Usar mailtrap para desarrollo
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      text: template.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const template = `
      <h1>¡Bienvenido ${this.firstName}!</h1>
      <p>Nos alegra tenerte en nuestra plataforma de entrenamiento personal.</p>
      <p>Comienza tu viaje fitness explorando tus rutinas asignadas.</p>
      <a href="${this.url}">Acceder a tu cuenta</a>
    `;
    
    await this.send(template, 'Bienvenido a Personal Trainer');
  }

  async sendPasswordReset() {
    const template = `
      <h1>Solicitud de cambio de contraseña</h1>
      <p>Hola ${this.firstName},</p>
      <p>¿Olvidaste tu contraseña? Haz clic en el siguiente enlace para crear una nueva:</p>
      <a href="${this.url}">Cambiar contraseña</a>
      <p>Si no solicitaste este cambio, ignora este email.</p>
      <p>Este enlace expira en 10 minutos.</p>
    `;
    
    await this.send(template, 'Cambio de contraseña (válido por 10 min)');
  }
}

module.exports = Email;
