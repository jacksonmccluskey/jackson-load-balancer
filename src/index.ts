import * as http from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import models from './models';

let server: http.Server | undefined;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
	logger.info('Connected To MongoDB');

	server = app.listen(config.port, () => {
		logger.info(`Listening On Port ${config.port}`);
	});
});

mongoose.connection.once('open', async () => {
	try {
		const result = await models.APIPool.findOne(
			{ name: config.initialAPIPoolName },
			{ upsert: true, new: true }
		);

		if (!result) {
			const apiPool = new models.APIPool({
				name: config.initialAPIPoolName,
				urls: config.initialAPIPoolURLS.split(',').map((url: string) => {
					return {
						url: url,
						isHealthy: false,
						enoughTime: config.healthCheckEnoughTime,
					};
				}),
				currentURLIndex: 0,
			});

			await apiPool.save();

			console.log('Initial Document Created: ', JSON.stringify(apiPool));
		}
	} catch (error) {
		console.error('Error Creating Initial Document:', error);
	}
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
