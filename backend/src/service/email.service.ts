import config from '@/config'


const gmail = (email: string, token: string, url: string) => {
}

export function sendVerificationEmail(email: string, token: string) {
    // Logic to send email (e.g., using nodemailer or any email service)
    gmail(email, token, `${config.Server.clientURL}/verify-email?token=${token}`);
    console.log(`Sending verification email to ${email} with token ${token}`);
}

export function sendPasswordResetEmail(email: string, token: string) {
    // Logic to send email (e.g., using nodemailer or any email service)
    gmail(email, token, `${config.Server.clientURL}/reset-password?token=${token}`);
    console.log(`Sending password reset email to ${email} with token ${token}`);
}