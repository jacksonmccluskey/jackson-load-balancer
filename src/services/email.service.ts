import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
	transport
		.verify()
		.then(() => logger.info('Connected To Email Server'))
		.catch(() =>
			logger.warn(
				'Unable To Connect To Email Server. Make Sure You Configured SMTP Options In .env'
			)
		);
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
export const sendEmail = async (to, subject, text) => {
	const msg = { from: config.email.from, to, subject, text };
	await transport.sendMail(msg);
};

const appURL = process.env.APP_URL ?? 'https://github.com/jacksonmccluskey';

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendResetPasswordEmail = async (to, token) => {
	const subject = 'Reset password';
	// replace this url with the link to the reset password page of your front-end app
	const resetPasswordUrl = `${appURL}/reset-password?token=${token}`;
	const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
	await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendVerificationEmail = async (to, token) => {
	const subject = 'Email Verification';
	const verificationEmailUrl = `${appURL}/verify-email?token=${token}`;
	const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
	await sendEmail(to, subject, text);
};

export default {
	transport,
	sendEmail,
	sendResetPasswordEmail,
	sendVerificationEmail,
};
