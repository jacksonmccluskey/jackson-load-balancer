import { ISendEmail, sendEmail } from '../services/email.service';
import { EventCategory, hasBeenEnoughTime } from './has-been-enough-time';

export const sendEmailForEvent = async (
	event: EventCategory,
	sendEmailArgs: ISendEmail
) => {
	if (hasBeenEnoughTime(event)) {
		await sendEmail(sendEmailArgs);
	}
};
