// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../config/logger';
import models from '../models';
import {
	enoughTimeByEvent,
	EventCategory,
} from '../utils/has-been-enough-time';
import { sendEmailForEvent } from '../utils/send-email-for-event';
import { ISendEmail } from './email.service';

/**
 * Write A Log
 * @param {Object} log
 * @returns {Promise<Log>}
 */
export const writeLog = async (log: any, shouldBeUnique?: boolean) => {
	try {
		if (mongoose.connection.readyState == 1) {
			if (shouldBeUnique) {
				await models.Log.findOneAndUpdate(
					{
						status: log.status,
						url: log.url,
						message: log.message,
						data: log.data,
					},
					{ $setOnInsert: log },
					{ upsert: true, new: true }
				);
			} else {
				await models.Log.create(log);
			}

			if (
				!log?.status ||
				!Object.keys(enoughTimeByEvent)
					.map((key) => key)
					.includes(log.status)
			)
				return;

			const eventCategory = log.status as EventCategory;

			const emailArgs: ISendEmail = {
				to: config.email.to,
				subject: `${eventCategory}`,
				text: `${log.date}${log.message ? '\n' + log.message : ''}${
					log.data ? '\n' + JSON.stringify(log.data) : ''
				}`,
			};

			await sendEmailForEvent(eventCategory, emailArgs);

			return;
		}
	} catch {}

	await logger(JSON.stringify(log));
};

/**
 * Query For Logs
 * @param {Object} filter - Mongo Filter
 * @param {Object} options - Query Options
 * @param {string} [options.sortBy] - sortField: 'desc' | 'asc'
 * @param {number} [options.limit] - Maximum # Of Results (default = 10)
 * @param {number} [options.page] - Current Page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryLogs = async (filter: any, options: any) => {
	try {
		const logs = await models.Log.paginate(filter, options);

		return logs;
	} catch {
		return [];
	}
};

export default {
	writeLog,
	queryLogs,
};
