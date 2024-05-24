import { ChatInputCommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashOption, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { inject, injectable } from 'tsyringe';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { TMDb } from '@Services';

@Discord()
@injectable()
export class Movie {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(TMDb) private readonly tmdb: TMDb) {}

	@Slash({
		description: 'Search for a movie using TMDB.',
		name: 'movie',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
			ephemeral: true,
		}),
	)
	async movie(
		@SlashOption({
			name: 'title',
			description: 'Provide the name of the movie.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			title: string,
			interaction: ChatInputCommandInteraction,
	) {
		await this.tmdb.fetchMovie(title).then((movie) => {
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setTitle(movie.title)
						.setThumbnail(movie.poster)
						.setDescription(movie.overview)
						.addFields(
							{
								name: 'Genres',
								value: `> ${movie.genres}`,
							},
							{
								name: 'Production Companies',
								value: `> ${movie.productionCompanies}`,
							},
							{
								name: 'Released on',
								value: `> <t:${movie.releaseDateUnix}>`,
								inline: true,
							},
							{
								name: 'Status',
								value: `> ${movie.status}`,
								inline: true,
							},
							{
								name: 'Rating',
								value: `> ${movie.popularity}/100`,
								inline: true,
							},
							{
								name: 'Streaming on',
								value: `> ${movie.streamingServices}`,
							},
						)
						.setFooter({
							text: 'Powered by TMDB & JustWatch',
						}),
				],
			});
		}).catch(() => {
			return interaction.reply({
				embeds: [
					EvieEmbed().setDescription(
						'🔹 | There was an error while fetching the information from the API.',
					),
				],
			});
		});
	}
}
