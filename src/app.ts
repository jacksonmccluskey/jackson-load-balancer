import express, { NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import config from './config/config';
import morgan from './config/morgan';
import { jwtStrategy } from './config/passport';
import { authLimiter } from './middlewares/rate-limiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middlewares/error';

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
app.use('/', routes);
app.use(errorConverter);
app.use(errorHandler);

if (config.env === 'PRODUCTION') {
	app.use('/auth', authLimiter);
}

passport.use('jwt', jwtStrategy);

export default app;
