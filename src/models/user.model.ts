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
					throw new Error(
						'Password must contain at least one letter and one number'
					);
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
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (
	email: string,
	excludeUserId?: ObjectId
): Promise<boolean> {
	const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
	return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async (
	password: string
): Promise<boolean> => {
	const user: any = this;
	if (user.password) {
		return bcrypt.compare(password, user.password);
	}

	return false;
};

userSchema.pre('save', async (next) => {
	const user: any = this;
	if (typeof user == 'object' && user.password && user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

/**
 * @typedef User
 */
export const User = mongoose.model('User', userSchema) as mongoose.Model<
	any,
	any,
	any
> & {
	isEmailTaken: (email: string, excludeUserId?: ObjectId) => Promise<boolean>;
	paginate: (filter: any, options: any) => Promise<any>;
	isPasswordMatch: (password: string) => Promise<boolean>;
	id: string;
};

export default User;
