import { ApplicationCommandOptionType, BaseGuildTextChannel, ChatInputCommandInteraction } from 'discord.js';
import { Discord, Guard, Slash, SlashOption } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { inject, injectable } from 'tsyringe';
import { BaseEmbed, ErrorEmbed } from 'src/utils/embeds';
import { Kitsu } from 'src/services/kitsu';

@Discord()
@injectable()
export class Anime {
	constructor(@inject(Kitsu) private readonly kitsu: Kitsu) {}

	@Slash({
		name: 'anime',
		description: 'Get info about an anime.',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 10, {
			message: 'This command is currently in cooldown mode, please wait 10 seconds before re-running it.',
			ephemeral: true,
		}),
	)
	async anime(
		@SlashOption({
			name: 'title',
			description: 'The name of the anime.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			title: string,
			interaction: ChatInputCommandInteraction,
	) {
		const anime = await this.kitsu.fetchAnime(title);

		if (!anime) return interaction.reply({
			embeds: [ErrorEmbed().setDescription('No results found.')],
			ephemeral: true,
		});

		if (anime?.nsfw && (interaction.channel as BaseGuildTextChannel)?.nsfw) return interaction.reply({
			embeds: [ErrorEmbed().setDescription('This anime contains NSFW content therefore information about this anime cannot be provided in non-NSFW channels.')],
			ephemeral: true,
		});

		await interaction.deferReply();

		return interaction.editReply({
			embeds: [
				BaseEmbed()
					.setTitle(anime.titles.en_us)
					.setThumbnail(anime.posterImage)
					.setDescription(anime.synopsis)
					.addFields(
							{
								name: 'Genres',
								value: `> ${anime.genres}`,
							},
							{
								name: 'Aired between',
								value: `> <t:${anime.startDate}> to <t:${anime.endDate}>`,
							},
							{
								name: 'Status',
								value: `> ${anime.status}`,
								inline: true,
							},
							{
								name: 'Japanese Title',
								value: `${anime.titles.ja_jp}`,
								inline: true,
							},
							{
								name: 'Average Rating',
								value: `> ${anime.averageRating} / 100`,
								inline: true,
							},
							{
								name: 'Age Rating',
								value: `> ${anime.ageRating} - ${anime.ageRatingGuide}`,
								inline: true,
							},
							{
								name: 'Episodes',
								value: `> ${anime.episodeCount} episode(s)`,
								inline: true,
							},
						)
						.setFooter({
							text: 'Information provided by Kitsu.io'
						}),
			],
		});
	}
}

