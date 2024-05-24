import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User } from 'discord.js';
import { Discord, Slash, Guard, SlashOption } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { EvieEmbed } from '@/Utils/EvieEmbed';

@Discord()
export class LMGTFY {
	@Slash({
		name: 'lmgtfy',
		description: 'Let me just google that for you real quick.',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
			ephemeral: true,
		}),
	)
	async lmgtfy(
		@SlashOption({
			name: 'thing',
			description: 'What the person should\'ve searched for.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		@SlashOption({
			name: 'target',
			description: 'The user that wanted an answer to their burning question.',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
			thing: string,
			target: User,
			interaction: ChatInputCommandInteraction,
	) {
		const embed = EvieEmbed()
			.setDescription(`🔹 | Hey, ${target}! ${interaction.user} was so tired of your silly questions that they called upon Evelyn to show you how to get an answer to that specific question. The button below should show you a step-by-step guide on how to get an answer!`)
			.setFooter({ text: 'For the people who prefer bothering you instead of googling it themselves' });

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('See How')
				.setStyle(ButtonStyle.Link)
				.setURL(`https://natoboram.github.io/lmgtfy/search?q=${encodeURIComponent(thing)}&btnK=Google+Search?`),
		);

		return interaction.reply({
			embeds: [embed],
			components: [actionRow],
		});
	}
}
