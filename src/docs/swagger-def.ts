import packageJSON from '../../package.json';
import config from '../config/config';

export const swaggerDef = {
	openapi: '3.0.0',
	info: {
		title: 'jackson-load-balancer Documentation',
		version: packageJSON.version,
		license: {
			name: 'MIT',
			url: 'https://github.com/jacksonmccluskey/jackson-load-balancer',
		},
	},
	servers: [
		{
			url: `http://localhost:${config.port}/v1`,
		},
	],
};

export default swaggerDef;
