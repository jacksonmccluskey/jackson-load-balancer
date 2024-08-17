import services from '../services';
import { Request, Response } from 'express';
import catchAsync from '../utils/catch-async';
import httpStatus from 'http-status';
import logController from './log.controller';
import { emojiSelector } from '../utils/emoji-selector';
import emailService from '../services/email.service';
import config from '../config/config';

const constructEmail = (requestBody: any) => {
	if (!requestBody) {
		throw new Error('No Request Body');
	}

	const status = requestBody.status ?? 'ERROR';
	const emoji = requestBody.emoji ?? emojiSelector[status];
	const subject = requestBody.title ?? 'From Jackson Load Balancer';
	const text = requestBody.text ?? subject;
	const data = requestBody.data;

	return {
		to: requestBody.to,
		subject: `${emoji} ${subject}`,
		text: `${text}${data ? `\n\n${JSON.stringify(data)}` : ''}`,
	};
};

const sendEmail = catchAsync(async (req: Request, res: Response) => {
	const email = constructEmail(req?.body);

	try {
		if (emailService.sendEmail) {
			const to = email.to ?? config.email.to;
			await services.emailService.sendEmail({
				to,
				subject: email.subject,
				text: email.text,
			});

			res.status(httpStatus.OK).send(`Email sent to ${to}!`);
		} else {
			res
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send('Email Sender Is Unavailable');
		}
	} catch {
		await logController.logAnything({
			status: 'ERROR',
			title: email?.subject ?? 'Sending Email Error',
			message: JSON.stringify(email),
		});

		res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send('Unable To Send Email But Saved On Local Host.');
	}
});

export default {
	sendEmail,
};
