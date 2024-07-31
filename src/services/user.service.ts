import httpStatus from 'http-status';
import models from '../models';
import ApiError from '../utils/api-error';

const isEmailTaken = async (
	email?: string,
	userId?: string
): Promise<boolean> => {
	if (email)
		return !!(await models.User.findOne({ email, _id: { $ne: userId } }));
	return false;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
export const createUser = async (userBody: any) => {
	if (await isEmailTaken(userBody.email)) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
	}
	return models.User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter: any, options: any) => {
	const users = await models.User.paginate(filter, options);
	return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
export const getUserById = async (id) => {
	return models.User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
export const getUserByEmail = async (email): Promise<typeof models.User> => {
	return models.User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
export const updateUserById = async (userId, updateBody) => {
	const user = await getUserById(userId);
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
	}
	if (updateBody.email && (await isEmailTaken(updateBody.email, user._id))) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
	}
	Object.assign(user, updateBody);
	await user.save();
	return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
export const deleteUserById = async (userId) => {
	const user = await getUserById(userId);
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
	}
	await user.remove();
	return user;
};

export default {
	createUser,
	queryUsers,
	getUserById,
	getUserByEmail,
	updateUserById,
	deleteUserById,
};
