import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { reminderCheck } from '@Helpers/reminderUtils.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { Reminders } from '@Schemas';
import { Evelyn } from '@Evelyn';
import ms from 'ms';

@Discord()
export class Remind {
	@Slash({
		name: 'remind',
		description: 'Sets a reminder for you.',
	})
	async remind(
		@SlashOption({
			name: 'task',
			description: 'What should I remind you of?',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		@SlashOption({
			name: 'time',
			description: 'When should I remind you?',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			task: string,
			time: string,
			interaction: ChatInputCommandInteraction,
			client: Evelyn,
	) {
		const convertedTime = ms(time);
		const unixTime = Math.floor(Date.now() / 1000) + convertedTime / 1000;

		if (isNaN(convertedTime))
			return interaction.reply({
				embeds: [EvieEmbed().setDescription('🔹 | An invalid time has been provided.')],
				ephemeral: true,
			});

		await interaction
			.reply({ embeds: [EvieEmbed().setDescription(`🔹 | Your reminder has been set. You will be reminded <t:${unixTime}:R>.`)] });
		await Reminders.create({
			userId: interaction.user.id,
			scheduledTime: parseInt(String(Date.now() + convertedTime / 1000)),
			task: task,
		}).then(() => {
			setTimeout(async () => {
				await reminderCheck(client);
			}, convertedTime);
		});
	}
}
