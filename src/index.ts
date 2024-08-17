// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import * as http from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logController from './controllers/log.controller';
import { sendEmail } from './services/email.service';
import { sendEmailForEvent } from './utils/send-email-for-event';

let server: http.Server | undefined;

const connectToMongoAndRunServer = async () => {
	try {
		await mongoose
			.connect(config.mongoose.url, config.mongoose.options)
			.then(async () => {
				await logController.logAnything({
					status: 'SUCCESS',
					title: 'Database Connected',
					message: 'Connected To MongoDB',
				});

				server = app.listen(config.port, async () => {
					await logController.logAnything({
						status: 'SUCCESS',
						title: 'App Listening',
						message: `Listening On Port ${config.port}`,
					});
				});
			});
	} catch (error: any) {
		await logController.logAnything({
			status: 'ERROR',
			title: 'Connection Error',
			message: 'Unable To Connect To MongoDB',
		});

		server = app.listen(config.port, async () => {
			await sendEmailForEvent('MONGO_DISCONNECTED', {
				to: config.email.to,
				subject: 'MongoDB Disconnected',
				text: `Unable To Connect To MongoDB. Listening On Port ${config.port} Without MongoDB`,
			});
		});
	}
};

connectToMongoAndRunServer();

const exitHandler = () => {
	if (server) {
		server.close(async (error: any) => {
			await logController.logAnything({
				status: 'TERMINATED',
				title: 'Server Closing...',
				message: error ? JSON.stringify(error) : 'Unknown Error',
			});

			await sendEmail({
				to: config.email.to,
				subject: `${config.host} Server Closing...`,
				text: error ? JSON.stringify(error) : 'Unknown Error',
			});

			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = () => {
	exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', async () => {
	await logController.logAnything({
		status: 'TERMINATED',
		title: 'SIGTERM Received',
		message: 'Service Shutting Down...',
	});
	if (server) {
		server.close();
	}
});
