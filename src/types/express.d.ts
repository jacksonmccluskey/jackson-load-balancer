import * as express from 'express';

declare global {
	namespace Express {
		interface User {
			email: string;
			role: string;
			id: any;
			password: string;
		}
		interface Request {
			user?: User;
		}
	}
}
