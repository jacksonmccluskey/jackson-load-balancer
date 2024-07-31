import mongoose from 'mongoose';
import validator from 'validator';
import plugins from './plugins';

export const urlSchema = new mongoose.Schema({
	url: {
		type: String,
		required: true,
		trim: true,
		validate(value: string) {
			if (!validator.isURL(value)) {
				throw new Error('Invalid URL');
			}
		},
	},
	isHealthy: { type: Boolean, required: true, default: false },
	enoughTime: { type: Number, required: false, default: 60000 },
	lastTime: { type: Date, required: false },
	weight: { type: Number, required: false },
});

export const apiPoolSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	urls: [urlSchema],
	currentURLIndex: {
		type: Number,
		required: true,
		unique: true,
		default: 0,
	},
});

apiPoolSchema.plugin(plugins.toJSON);
apiPoolSchema.plugin(plugins.paginate);

/**
 * Check If API Pool Name Exists
 * @param {string} name - API Pool Name
 * @returns {Promise<boolean>}
 */
apiPoolSchema.statics.isAPIPoolNameTaken = async function (
	name: string
): Promise<boolean> {
	const apiPool = await this.findOne({ name });

	return !!apiPool;
};

/**
 * @typedef APIPool
 */
export const APIPool = mongoose.model(
	'APIPool',
	apiPoolSchema
) as mongoose.Model<any, any, any> & {
	isAPIPoolNameTaken: (name: string) => Promise<boolean>;
};

export default APIPool;
