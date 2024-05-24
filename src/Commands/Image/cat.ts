import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { Discord, Slash, Guard } from 'discordx';
import superagent from 'superagent';
import { Evelyn } from '@Evelyn';

@Discord()
export class Catto {
	@Slash({
		description: 'Shows you a random cat picture.',
		name: 'cat',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
			ephemeral: true,
		}),
	)
	async cat(interaction: ChatInputCommandInteraction, client: Evelyn) {
		const { body } = await superagent
			.get('https://api.thecatapi.com/v1/images/search')
			.set('x-api-key', client.config.APIs.cattoKey);

		const embed = new EmbedBuilder()
			.setColor('Blurple')
			.setImage(body[0].url)
			.setFooter({ text: 'Powered by TheCatAPI' })
			.setTimestamp();

		return interaction.reply({
			embeds: [embed],
		});
	}
}
