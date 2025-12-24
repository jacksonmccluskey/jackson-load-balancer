import config from '../config/config';
import { emojiSelector } from './emoji-selector';
import { EventCategory, hasBeenEnoughTime } from './has-been-enough-time';
import services from '../services';
import { ISendEmail } from '../services/email.service';

export const sendEmailForEvent = async (
	event: EventCategory,
	sendEmailArgs: ISendEmail
) => {
	try {
		const shouldNotify = await hasBeenEnoughTime(event);

		if (shouldNotify) {
			await services.emailService.sendEmail({
				to: config.email.to,
				subject: `${emojiSelector[event]} ${sendEmailArgs.subject} [${config.serverName}]`,
				text: sendEmailArgs.text,
			});
		}
	} catch {}
};
