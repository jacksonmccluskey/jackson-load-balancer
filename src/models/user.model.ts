import mongoose, { ObjectId } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import plugins from './plugins';
import { roles } from '../config/roles';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value: string) {
				if (!validator.isEmail(value)) {
					throw new Error('Invalid email');
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 8,
			validate(value: string) {
				if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
					throw new Error('Password Must Contain At Least 1 Number & 1 Letter');
				}
			},
			private: true,
		},
		role: {
			type: String,
			enum: roles,
			default: 'user',
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.plugin(plugins.toJSON);
userSchema.plugin(plugins.paginate);

/**
 * @typedef User
 */
export const User = mongoose.model('User', userSchema) as mongoose.Model<
	any,
	any,
	any
> & {
	id: string;
	paginate: (filter: any, options: any) => Promise<any>;
};

export default User;
