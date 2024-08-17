import fs from 'node:fs/promises';
import path from 'path';
import config from './config';

const directory = config.logFileDirectoryName;
const file = `${new Date()
	.toISOString()
	.slice(0, 10)}-jackson-load-balancer.log`;
const filePath = path.join(directory, file);

const logger = async (log: string) => {
	try {
		await fs.appendFile(filePath, log);
	} catch {}
};

export default logger;
