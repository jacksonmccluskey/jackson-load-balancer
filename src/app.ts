import express, { Request, Response } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
import { jwtStrategy } from './config/passport';
import { authLimiter } from './middlewares/rate-limiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/api-error';

const app = express();

if (config.env !== 'test') {
	app.use((req, res, callback) => morgan.successHandler(req, res, callback));
	app.use((req, res, callback) => morgan.errorHandler(req, res, callback));
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.use(passport.initialize());
app.use('/v1', routes);
app.use((_req: Request, _res: Response, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Not Found'));
});
app.use(errorConverter);
app.use(errorHandler);

if (config.env === 'PRODUCTION') {
	app.use('/v1/auth', authLimiter);
}

passport.use('jwt', jwtStrategy);

export default app;
