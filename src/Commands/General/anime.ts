import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Discord, Guard, Slash, SlashOption } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { inject, injectable } from 'tsyringe';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { Kitsu } from '@Services';

@Discord()
@injectable()
export class Anime {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(Kitsu) private readonly kitsu: Kitsu) {}

	@Slash({
		description: 'Get info about an anime using Kitsu.io.',
		name: 'anime',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
			ephemeral: true,
		}),
	)
	async anime(
		@SlashOption({
			name: 'title',
			description: 'Provide the name of the anime.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			title: string,
			interaction: ChatInputCommandInteraction,
	) {
		await this.kitsu.fetchAnime(title).then((anime) => {
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setTitle(anime.titles.en_us)
						.setThumbnail(anime.posterImage.original)
						.setDescription(anime.synopsis)
						.addFields(
							{
								name: 'Genres',
								value: `> ${anime.genres}`,
							},
							{
								name: 'Aired between',
								value: `> <t:${anime.startDateUnix}> - <t:${anime.endDateUnix}>`,
							},
							{
								name: 'Japanese Title',
								value: `> ${anime.titles.ja_JP}`,
								inline: true,
							},
							{
								name: 'Status',
								value: `> ${anime.status}`,
								inline: true,
							},
							{
								name: 'Average Rating',
								value: `> ${anime.averageRating} / 100`,
								inline: true,
							},
							{
								name: 'Episodes',
								value: `> ${anime.episodeCount}`,
								inline: true,
							},
						),
				],
			});
		}).catch(() => {
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setDescription(
							'🔹 | There was an error while fetching the information from the API.',
						),
				],
			});
		});
	}
}
