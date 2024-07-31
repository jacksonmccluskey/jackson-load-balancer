import httpStatus from 'http-status';
import catchAsync from '../utils/catch-async';
import services from '../services';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

export const register = catchAsync(async (req: Request, res: Response) => {
	req.body.password = await bcrypt.hash(req.body.password, 8);
	const user = await services.userService.createUser(req.body);
	const tokens = await services.tokenService.generateAuthTokens(user);
	res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
	const { email, password } = req.body;

	const user = await services.authService.loginUserWithEmailAndPassword(
		email,
		password
	);
	const tokens = await services.tokenService.generateAuthTokens(user);
	res.send({ user, tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
	await services.authService.logout(req.body.refreshToken);
	res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
	const tokens = await services.authService.refreshAuth(req.body.refreshToken);
	res.send({ ...tokens });
});

export const forgotPassword = catchAsync(
	async (req: Request, res: Response) => {
		const resetPasswordToken =
			await services.tokenService.generateResetPasswordToken(req.body.email);
		await services.emailService.sendResetPasswordEmail(
			req.body.email,
			resetPasswordToken
		);
		res.status(httpStatus.NO_CONTENT).send();
	}
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
	if (typeof req.query.token == 'string') {
		await services.authService.resetPassword(
			req.query.token,
			req.body.password
		);
		res.status(httpStatus.NO_CONTENT).send();
	} else {
		res.status(httpStatus.UNAUTHORIZED).send();
	}
});

export const sendVerificationEmail = catchAsync(
	async (req: Request, res: Response) => {
		const verifyEmailToken =
			await services.tokenService.generateVerifyEmailToken(req.user);

		if (req.user && typeof req.user.email == 'string') {
			await services.emailService.sendVerificationEmail(
				req.user.email,
				verifyEmailToken
			);
			res.status(httpStatus.NO_CONTENT).send();
		} else {
			res.status(httpStatus.NOT_FOUND).send();
		}
	}
);

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	if (req.query && typeof req.query.token == 'string') {
		await services.authService.verifyEmail(req.query.token);
	}
	res.status(httpStatus.NO_CONTENT).send();
});

export default {
	register,
	login,
	logout,
	refreshTokens,
	forgotPassword,
	resetPassword,
	sendVerificationEmail,
	verifyEmail,
};
