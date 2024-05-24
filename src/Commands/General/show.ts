import { EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashOption, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { inject, injectable } from 'tsyringe';
import { TMDb } from '@Services';

@Discord()
@injectable()
export class Show {
	private embed: EmbedBuilder;

	// eslint-disable-next-line no-empty-function
	constructor(@inject(TMDb) private readonly tmdb: TMDb) {}

	@Slash({
		description: 'Search for a show using TMDB.',
		name: 'show',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
			ephemeral: true,
		}),
	)
	async show(
		@SlashOption({
			name: 'title',
			description: 'Provide the name of the show.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			title: string,
			interaction: ChatInputCommandInteraction,
	) {
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await this.tmdb.fetchTVSeries(title).then((show) => {
			return interaction.reply({
				embeds: [
					this.embed
						.setTitle(show.title)
						.setThumbnail(show.poster)
						.setDescription(show.overview)
						.addFields(
							{
								name: 'Created by',
								value: `> ${show.createdBy}`,
							},
							{
								name: 'Genres',
								value: `> ${show.genres}`,
							},
							{
								name: 'Production Companies',
								value: `> ${show.productionCompanies}`,
							},
							{
								name: 'Aired between',
								value: `> <t:${show.firstAiredUnixed}> - <t:${show.lastAiredUnixed}>`,
							},
							{
								name: 'Status',
								value: `> ${show.status}`,
								inline: true,
							},
							{
								name: 'Seasons',
								value: `> ${show.seasons} season(s)`,
								inline: true,
							},
							{
								name: 'Rating',
								value: `> ${show.popularity}`,
								inline: true,
							},
							{
								name: 'Streaming on',
								value: `> ${show.streamingServices}`,
							},
						)
						.setFooter({
							text: 'Information provided by TMDB & JustWatch',
						}),
				],
			});
		}).catch(() => {
			return interaction.reply({
				embeds: [this.embed.setDescription('🔹 | No result found.')],
			});
		});
	}
}