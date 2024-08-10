import winston from 'winston';
import config from './config';

const defaultLogFunction = async (_args: any) => {
	return;
};

let logger: any = {
	info: defaultLogFunction,
	warn: defaultLogFunction,
	error: defaultLogFunction,
	debug: defaultLogFunction,
};

const initializeLogger = async () => {
	try {
		const enumerateErrorFormat = winston.format((info) => {
			if (info instanceof Error) {
				Object.assign(info, { message: info.stack });
			}
			return info;
		});

		logger = winston.createLogger({
			level: config.env === 'DEVELOPMENT' ? 'debug' : 'info',
			format: winston.format.combine(
				enumerateErrorFormat(),
				winston.format.uncolorize(),
				winston.format.splat(),
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.printf(({ level, message }) => `${level}: ${message}`)
			),
			transports: [
				config.env === 'DEVELOPMENT'
					? new winston.transports.Console({
							stderrLevels: ['error'],
					  })
					: undefined,
				new winston.transports.File({
					dirname: config.logFileDirectoryName,
					filename: `${new Date()
						.toISOString()
						.slice(0, 10)}-jackson-load-balancer.log`,
				}),
			],
		});
	} catch {}
};

initializeLogger();

export default logger;
