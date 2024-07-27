import { Request, Response } from 'express';

import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/api-error';

export const errorConverter = (
	err: any,
	_req: Request,
	_res: Response,
	next: any
) => {
	let error = err;
	if (!(error instanceof ApiError)) {
		const statusCode =
			error.statusCode || error instanceof mongoose.Error
				? httpStatus.BAD_REQUEST
				: httpStatus.INTERNAL_SERVER_ERROR;
		const message = error.message || httpStatus[statusCode];
		error = new ApiError(statusCode, message, false, err.stack);
	}
	next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	next: Function
) => {
	let { statusCode, message } = err;
	if (config.env === 'PRODUCTION' && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	}

	res.locals.errorMessage = err.message;

	const response = {
		code: statusCode,
		message,
		...(config.env === 'DEVELOPMENT' && { stack: err.stack }),
	};

	if (config.env === 'DEVELOPMENT') {
		logger.error(err);
	}

	res.status(statusCode).send(response);
};

module.exports = {
	errorConverter,
	errorHandler,
};
