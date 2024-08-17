import nodemailer from 'nodemailer';
import config from '../config/config';
import logController from '../controllers/log.controller';

let transport: any;

try {
	transport = nodemailer.createTransport(config.email.smtp);
	/* istanbul ignore next */
	if (config.env !== 'test') {
		transport
			.verify()
			.then(
				async () =>
					await logController.logAnything({
						status: 'SUCCESS',
						title: 'Email Server Connected',
						message: `Connected To Email Server: ${config.email.smtp.host}`,
					})
			)
			.catch(
				async () =>
					await logController.logAnything({
						status: 'WARNING',
						title: 'Email Server Connection Failed',
						message:
							'Unable To Connect To Email Server. Make Sure You Configured SMTP Options In .env',
					})
			);
	}
} catch {}

export interface ISendEmail {
	to: string;
	subject: string;
	text: string;
}
/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
export const sendEmail = async ({ to, subject, text }: ISendEmail) => {
	try {
		const msg = { from: config.email.from, to, subject, text };
		await transport.sendMail(msg);
	} catch {
		await logController.logAnything({
			status: 'ERROR',
			title: 'Email Error',
			message: `For ${to}\n\n${subject}\n\n${text}`,
		});
	}
};

const appURL = process.env.APP_URL ?? 'https://github.com/jacksonmccluskey';

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendResetPasswordEmail = async (to, token) => {
	try {
		const subject = 'Reset password';
		const resetPasswordUrl = `${appURL}/reset-password?token=${token}`;
		const text = `Dear ${to ? to.substring(0, to.indexOf('@')) : 'user'},
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
		await sendEmail({ to, subject, text });
	} catch {
		await logController.logAnything({
			status: 'ERROR',
			title: 'Email Error',
			message: `Error Sending Reset Password Email To ${to}`,
		});
	}
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendVerificationEmail = async (to, token) => {
	try {
		const subject = 'Email Verification';
		const verificationEmailUrl = `${appURL}/verify-email?token=${token}`;
		const text = `Dear ${to ? to.substring(0, to.indexOf('@')) : 'user'},
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
		await sendEmail({ to, subject, text });
	} catch {
		await logController.logAnything({
			status: 'ERROR',
			title: 'Email Error',
			message: `Error Sending Email Verification Email To ${to}`,
		});
	}
};

export default {
	transport,
	sendEmail,
	sendResetPasswordEmail,
	sendVerificationEmail,
};
