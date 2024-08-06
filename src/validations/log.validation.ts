// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import Joi from 'joi';

export const writeLog = {
	body: Joi.object().keys({
		date: Joi.date().optional(),
		emoji: Joi.string().optional(),
		status: Joi.string().required(),
		title: Joi.string().required(),
		message: Joi.string().optional(),
		data: Joi.object().optional(),
		url: Joi.string().optional(),
	}),
};

export const getLogs = {
	query: Joi.object({
		emoji: Joi.string().optional(),
		title: Joi.string().optional(),
		message: Joi.string().optional(),
		status: Joi.string().optional(),
		url: Joi.object().optional(),
		sortBy: Joi.string().optional(),
		limit: Joi.number().integer().min(1).optional(),
		page: Joi.number().integer().min(1).optional(),
	}),
};

export default {
	writeLog,
	getLogs,
};
