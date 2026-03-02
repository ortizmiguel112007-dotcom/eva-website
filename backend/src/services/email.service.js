import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporte = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const enviarCorreo = async (destinatario, codigo) => {
    await transporte.sendMail({
        from: `"EVA" <${process.env.EMAIL_USER}>`,
        to: destinatario,   
        html: `<p>Hola,</p>
               <p>Tu código de verificación es: <strong>${codigo}</strong></p>
               <p>Este codigo expira en 10 minutos.</p>`,
    })
}