// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import Joi from 'joi';

export const sendEmail = {
	body: Joi.object().keys({
		to: Joi.string().email(),
		title: Joi.string().required(),
		message: Joi.string().optional(),
		data: Joi.object().optional(),
		date: Joi.date().optional(),
		emoji: Joi.string().optional(),
		status: Joi.string().required(),
	}),
};

export default {
	sendEmail,
};
