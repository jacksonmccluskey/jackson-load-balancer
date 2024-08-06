// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import mongoose from 'mongoose';
import plugins from './plugins';

const logSchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		emoji: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			required: true,
			trim: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: false,
			trim: true,
		},
		data: {
			type: Object,
			required: false,
		},
		url: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

logSchema.plugin(plugins.toJSON);
logSchema.plugin(plugins.paginate);

/**
 * @typedef Log
 */
export const Log = mongoose.model('Log', logSchema) as mongoose.Model<
	any,
	any,
	any
> & {
	id: string;
	paginate: (filter: any, options: any) => Promise<any>;
};

export default Log;
