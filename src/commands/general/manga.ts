import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Discord, Guard, Slash, SlashOption } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { injectable, inject } from 'tsyringe';
import { BaseEmbed, ErrorEmbed } from 'src/utils/embeds';
import { Kitsu } from 'src/services/kitsu';

@Discord()
@injectable()
export class Manga {
	constructor(@inject(Kitsu) private readonly kitsu: Kitsu) {}

	@Slash({
		name: 'manga',
		description: 'Get info about a manga.',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 10, {
			message: 'This command is currently in cooldown mode, please wait 10 seconds before re-running it.',
			ephemeral: true,
		}),
	)
	async manga(
		@SlashOption({
			name: 'title',
			description: 'Provide the name of the manga.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			title: string,
			interaction: ChatInputCommandInteraction,
	) {
		const manga = await this.kitsu.fetchManga(title);

		if (!manga) return interaction.reply({
			embeds: [ErrorEmbed().setDescription('No results found.')],
			ephemeral: true,
		});

		await interaction.deferReply();

		return interaction.editReply({
			embeds: [
				BaseEmbed()
					.setTitle(manga.titles.en_us)
					.setThumbnail(manga.posterImage)
					.setDescription(manga.synopsis)
					.addFields(
						{
							name: 'Genres',
							value: `> ${manga.genres}`,
						},
						{
							name: 'Published between',
							value: `> <t:${manga.startDate}> - <t:${manga.endDate}>`,
						},
						{
							name: 'Status',
							value: `> ${manga.status}`,
							inline: true,
						},
						{
							name: 'Japanese Title',
							value: `> ${manga.titles.ja_jp}`,
							inline: true,
						},
						{
							name: 'Average Rating',
							value: `> ${manga.averageRating} / 100`,
							inline: true,
						},
						{
							name: 'Age Rating',
							value: `> ${manga.ageRating} - ${manga.ageRatingGuide}`,
							inline: true,
						},
						{
							name: 'Chapters',
							value: `> ${manga.chapterCount} chapter(s)`,
							inline: true,
						},
						{
							name: 'Volumes',
							value: `> ${manga.volumeCount} volume(s)`,
							inline: true,
						}
					)
					.setFooter({
						text: 'Information provided by Kitsu.io'
					}),
			],
		});
	}
}

