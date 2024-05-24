import { model, Schema } from 'mongoose';

export interface LevelsData {
	/** The guild's ID. */
	guildId: string;
	/** The user's ID. */
	userId: string;
	/** The user's XP. */
	totalXP: number;
	/** The user's level. */
	level: number;
}

export const LevelsDB = model(
	'Levels',
	new Schema<LevelsData>({
		guildId: String,
		userId: String,
		totalXP: Number,
		level: Number,
	}),
);
