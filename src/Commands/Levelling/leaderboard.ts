import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Levels } from '@/Services/Levels';
import { Discord, Slash } from 'discordx';
import { Evelyn } from '@Evelyn';
import { inject, injectable } from 'tsyringe';

@Discord()
@injectable()
export class Leaderboard {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(Levels) private readonly levels: Levels) {}

	@Slash({
		name: 'leaderboard',
		description: 'Lists the top users when it comes to XP.',
	})
	async leaderboard(interaction: ChatInputCommandInteraction, client: Evelyn) {
		const { guild } = interaction;
		const leaderboard = await this.levels.buildLeaderboard(client, guild.id, 10);
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		const mappedLB = leaderboard.map((lb) => {
			return `**#${lb.position}** • **<@${lb.userId}>** • Level: **${lb.level}** • XP: **${lb.xp}**`;
		});

		const description = mappedLB.length > 0 ? mappedLB.join('\n') : 'This leaderboard is empty as there is currently no data to compute the leaderboard.';

		return interaction.reply({
			embeds: [embed.setTitle(`Leaderboard for ${guild.name}`).setDescription(description)],
		});
	}
}
