import { model, Schema } from 'mongoose';

interface UBInterface {
	/** Indicates if the user is blacklisted or not. */
	isBlacklisted: boolean;
	/** The ID of the user. */
	userId: string;
	/** The reason the user is blacklisted for. */
	reason: string;
	/** The time when the user was blacklisted. */
	time: number;
}

export const UserBlacklistDB = model<UBInterface>(
	'UBlacklist',
	new Schema({
		isBlacklisted: Boolean,
		userId: String,
		reason: String,
		time: Number,
	}),
);
