import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/api-error';
import { roleRights } from '../config/roles';
import { Request } from 'express';

const verifyCallback =
	(req: Request, resolve: any, reject: any, requiredRights: any) =>
	async (err: any, user: any, info: any) => {
		if (err || info || !user) {
			return reject(
				new ApiError(httpStatus.UNAUTHORIZED, 'Please Authenticate')
			);
		}
		req.user = user;

		if (requiredRights.length) {
			const userRights = roleRights.get(user.role);

			if (!userRights) {
				return;
			}

			const hasRequiredRights = requiredRights.every((requiredRight: string) =>
				userRights
					.filter((userRight) => typeof userRight == 'string')
					.includes(requiredRight)
			);

			if (!hasRequiredRights && req.params.userId !== user.id) {
				return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
			}
		}

		resolve();
	};

export const auth =
	(...requiredRights) =>
	async (req, res, next) => {
		return new Promise((resolve, reject) => {
			passport.authenticate(
				'jwt',
				{ session: false },
				verifyCallback(req, resolve, reject, requiredRights)
			)(req, res, next);
		})
			.then(() => next())
			.catch((err) => next(err));
	};

export default auth;
