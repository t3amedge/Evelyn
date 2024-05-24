import { Reminders as DB } from '@Schemas';
import { EmbedBuilder } from 'discord.js';
import { Evelyn } from '@/Evelyn';

/**
 * Yields two main functionalities:
 * - On startup, it'll check to see if there are any reminders that haven't been sent out.
 * - After running /remind, it'll run after the timeout is up and send the reminder to the user.
 * @param client The Evelyn client.
 * @returns {Promise<void>}
 */
export async function reminderCheck(client: Evelyn): Promise<void> {
	const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

	const data = await DB.find();
	if (!data) return;

	for (const reminder of data) {
		if (reminder.scheduledTime > Date.now()) return;

		const user = await client.users.fetch(reminder.userId);
		user
			.send({
				embeds: [
					embed
						.setTitle('Reminder')
						.setDescription(`Hiya! I'm here to remind to \`${reminder.task}\`.`),
				],
			}).catch(() => {
				// This'll catch any errors if the user has DMs disabled.
			});

		// Removes the reminder from the DB as it's no longer needed after the user has been reminded.
		await reminder.deleteOne();
		return;
	}
}