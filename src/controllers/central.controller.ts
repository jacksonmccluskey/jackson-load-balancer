// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import { RequestMethod } from '../routes/v1/central.route';
import catchAsync from '../utils/catch-async';
import services from '../services';
import { Request, Response } from 'express';
import { IRequestToCurrentAPI } from '../services/central.service';
import httpStatus from 'http-status';

const destructureRequestInfo = (req: Request): IRequestToCurrentAPI => {
	const getRequestMethod = () => {
		if (['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
			return req.method as RequestMethod;
		}

		throw new Error('The Given Request Method Is Not Supported');
	};

	return {
		requestBody: req.body,
		originalURL: req.originalUrl,
		requestMethod: getRequestMethod(),
	};
};

const controller = catchAsync(async (req: Request, res: Response) => {
	try {
		const requestInfo = destructureRequestInfo(req);

		if (requestInfo.originalURL.includes('jackson-health-check')) {
			res.status(200).send('Jackson Is Very Healthy 🍎');

			return;
		}

		const apiResponse = await services.centralService(requestInfo);

		const status = apiResponse?.status || httpStatus.INTERNAL_SERVER_ERROR;
		const headers = apiResponse?.headers || {};
		const data = apiResponse?.data;

		res.status(status).set(headers).send(data);

		return;
	} catch (error) {
		res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(error?.message ? error.message : 'Load Balancer Failure');
	}
});

export default controller;
