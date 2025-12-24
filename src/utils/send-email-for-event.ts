import config from '../config/config';
import { ISendEmail, sendEmail } from '../services/email.service';
import { emojiSelector } from './emoji-selector';
import { EventCategory, hasBeenEnoughTime } from './has-been-enough-time';

export const sendEmailForEvent = async (
	event: EventCategory,
	sendEmailArgs: ISendEmail
) => {
	try {
		const shouldNotify = await hasBeenEnoughTime(event);

		if (shouldNotify) {
			await sendEmail({
				...sendEmailArgs,
				subject: `${emojiSelector[event]} ${sendEmailArgs.subject} [${config.serverName}]`,
			});
		}
	} catch {}
};
