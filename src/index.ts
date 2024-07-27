import * as http from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';

let server: http.Server | undefined;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
	logger.info('Connected To MongoDB');
	server = app.listen(config.port, () => {
		logger.info(`Listening On Port ${config.port}`);
	});
});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			logger.info('Server Closed');
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (error: any) => {
	logger.error(error);
	exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
	logger.info('SIGTERM Received');
	if (server) {
		server.close();
	}
});
