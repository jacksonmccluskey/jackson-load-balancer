import { RequestMethod } from '../routes/v1/central.route';
import catchAsync from '../utils/catch-async';
import services from '../services';
import { Request, Response } from 'express';

const destructureRequestInfo = (req: Request) => {
	return {
		apiPoolName: req.body.apiPoolName,
		requestBody: req.body,
		originalURL: req.originalUrl,
		requestMethod: req.method,
	};
};

const controller = catchAsync(async (req: Request, res: Response) => {
	const requestInfo = destructureRequestInfo(req);

	const apiResponse = await services.centralService[
		req.method as RequestMethod
	](requestInfo);

	res.send(apiResponse.data);
});

export default controller;
