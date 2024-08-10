import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid('PRODUCTION', 'DEVELOPMENT', 'TESTING')
			.required(),
		PORT: Joi.number().default(5555),
		MONGODB_URL: Joi.string().required().description('MongoDB URL'),
		JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
		JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
			.default(30)
			.description('Minute Access Token Expiration'),
		JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
			.default(36525)
			.description('Day Refresh Token Expiration'),
		JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('Minute Refresh Password Token Expiration'),
		JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('Minute Verify Email Token Expiration'),
		SMTP_HOST: Joi.string().description('Email Server For Sending'),
		SMTP_PORT: Joi.number().description('Port Of Email Server'),
		SMTP_USERNAME: Joi.string().description('Email Server Username'),
		SMTP_PASSWORD: Joi.string().description('Email Server Password'),
		EMAIL_FROM: Joi.string().description('Email Sender Name'),
		EMAIL_TO: Joi.string().description(
			'Destination For Sending Notification Emails'
		),
		INITIAL_API_POOL_URLS: Joi.string()
			.description('Comma Separated List Of Initial URLs For Initial API Pool')
			.default(''),
		HEALTH_CHECK_ENOUGH_TIME: Joi.number()
			.description('Minimum Time Interval Between Health Checks')
			.default(0),
		INITIAL_API_HEALTH_CHECK_ROUTE: Joi.string().description(
			'Route For Conducting Health Checks On API With GET Request'
		),
		CLOUDWATCH_LOGS_LOG_GROUP_NAME: Joi.string().description(
			'Cloudwatch Logs Log Group'
		),
		CLOUDWATCH_LOGS_LOG_STREAM_NAME: Joi.string().description(
			'Cloudwatch Logs Log Stream'
		),
		CLOUDWATCH_LOGS_AWS_REGION: Joi.string().description(
			'Region Of Cloudwatch Logs'
		),
		LOG_FILE_DIRECTORY_NAME: Joi.string().description(
			'Location Of Backup Log Files'
		),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: 'key' } })
	.validate(process.env);

if (error) {
	throw new Error(`Config Validation Error: ${error.message}`);
}

export default {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	mongoose: {
		url:
			envVars.MONGODB_URL + (envVars.NODE_ENV === 'TESTING' ? '-testing' : ''),
		options: {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
	},
	jwt: {
		secret: envVars.JWT_SECRET,
		accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
		resetPasswordExpirationMinutes:
			envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
		verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
	},
	email: {
		smtp: {
			host: envVars.SMTP_HOST,
			port: envVars.SMTP_PORT,
			auth: {
				user: envVars.SMTP_USERNAME,
				pass: envVars.SMTP_PASSWORD,
			},
		},
		from: envVars.EMAIL_FROM,
		to: envVars.EMAIL_TO,
	},
	initialAPIPoolURLS: envVars.INITIAL_API_POOL_URLS,
	healthCheckEnoughTime: envVars.HEALTH_CHECK_ENOUGH_TIME,
	initialAPIHealthCheckRoute: envVars.INITIAL_API_HEALTH_CHECK_ROUTE,
	cloudwatchLogsLogGroupName: envVars.CLOUDWATCH_LOGS_LOG_GROUP_NAME,
	cloudwatchLogsAWSRegion: envVars.CLOUDWATCH_LOGS_AWS_REGION,
	logFileDirectoryName: envVars.LOG_FILE_DIRECTORY_NAME,
};
