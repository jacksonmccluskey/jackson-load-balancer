import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/api-error';
import catchAsync from '../utils/catch-async';
import services from '../services';
import logger from '../config/logger';

export const createUser = catchAsync(async (req, res) => {
	const user = await services.userService.createUser(req.body);
	res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req, res) => {
	const filter = pick(req.query, ['name', 'role']);
	const options = pick(req.query, ['sortBy', 'limit', 'page']);
	const result = await services.userService.queryUsers(filter, options);
	res.send(result);
});

export const getUser = catchAsync(async (req, res) => {
	const user = await services.userService.getUserById(req.params.userId);
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	res.send(user);
});

export const updateUser = catchAsync(async (req, res) => {
	const user = await services.userService.updateUserById(
		req.params.userId,
		req.body
	);
	res.send(user);
});

export const deleteUser = catchAsync(async (req, res) => {
	await services.userService.deleteUserById(req.params.userId);
	res.status(httpStatus.NO_CONTENT).send();
});

export default {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
