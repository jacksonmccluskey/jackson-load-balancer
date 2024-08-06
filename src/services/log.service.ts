// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import logger from '../config/logger';
import models from '../models';

/**
 * Write A Log
 * @param {Object} log
 * @returns {Promise<Log>}
 */
export const writeLog = async (log: any) => {
	try {
		await models.Log.create(log);
	} catch {
		await logger.info(JSON.stringify(log));
	}
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
