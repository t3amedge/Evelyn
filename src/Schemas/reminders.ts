import { model, Schema } from 'mongoose';

interface Reminder {
	/** The ID of the user that needs to be reminded. */
	userId: string;
	/** The task the user needs to be reminded of. */
	task: string;
	/** The time when the reminder needs to be delivered. */
	scheduledTime: number;
}

export const ReminderDB = model(
	'Reminders',
	new Schema<Reminder>({
		userId: String,
		task: String,
		scheduledTime: Number,
	}),
);
