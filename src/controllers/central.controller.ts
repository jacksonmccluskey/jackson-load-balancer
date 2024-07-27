import httpStatus from 'http-status';
import catchAsync from '../utils/catch-async';
import services from '../services';

export const checkAPIHealth = catchAsync(async (req, res) => {
	const isAPIHealthy = await services.centralService.checkAPIHealth(req.body);
	if (isAPIHealthy) res.status(httpStatus[200]).send(isAPIHealthy);
	else res.status(httpStatus.IM_A_TEAPOT).send(isAPIHealthy);
});

export default {
	checkAPIHealth,
};
