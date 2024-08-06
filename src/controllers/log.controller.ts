import services from '../services';
import { Request, Response } from 'express';
import catchAsync from '../utils/catch-async';
import { emojiSelector, Event } from '../utils/emoji-selector';
import pick from '../utils/pick';
import logger from '../config/logger';
import httpStatus from 'http-status';

interface ILog {
	date: Date | string;
	emoji: string;
	status: Event | string;
	title: string;
	message: string;
	data: any;
	url: string;
}

export const constructLog = (requestBody: any): ILog => {
	const date: Date | string = requestBody?.date ?? new Date();
	const status: Event | string = requestBody?.status ?? ('ERROR' as Event);
	const emoji: string = emojiSelector[status] ?? '🔥';

	return {
		date,
		emoji,
		status,
		title: requestBody?.title ?? 'Unknown Log',
		message: requestBody?.message ?? 'Unknown Details',
		data: requestBody?.data,
		url: requestBody?.url,
	};
};

const writeLog = catchAsync(async (req: Request, res: Response) => {
	const log = constructLog(req?.body);

	try {
		const writtenLog = await services.logService.writeLog(log);

		res.status(httpStatus.OK).send(writtenLog);
	} catch {
		logger.error(JSON.stringify(log));

		res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send('Unable To Write Log But Saved On Local Host.');
	}
});

const getLogs = catchAsync(async (req: Request, res: Response) => {
	try {
		const filter = pick(req.query, ['emoji', 'status', 'title', 'message']);
		const options = pick(req.query, ['sortBy', 'limit', 'page']);

		console.log(`filter: ${JSON.stringify(filter)}`);
		console.log(`options: ${JSON.stringify(options)}`);

		if (req.query.title) {
			filter.title = { $regex: req.query.title, $options: 'i' };
			console.log(`title: ${JSON.stringify(filter.title)}`);
		}

		if (req.query.message) {
			filter.message = { $regex: req.query.message, $options: 'i' };
			console.log(`message: ${JSON.stringify(filter.message)}`);
		}

		const apiResponse = await services.logService.queryLogs(filter, options);

		res.status(httpStatus.OK).send(apiResponse.results);
	} catch {
		logger.error('Unable To Get Logs');

		res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Unable To Get Logs');
	}
});

type ILogAnything = Partial<ILog>;

const logAnything = async (logContent: ILogAnything) => {
	const log = constructLog(logContent);

	try {
		await services.logService.writeLog(log);
	} catch {
		logger.error(JSON.stringify(log));
	}
};

export default {
	writeLog,
	getLogs,
	logAnything,
};
