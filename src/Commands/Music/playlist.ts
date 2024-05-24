import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { Playlists as DB } from '@Schemas';
import { embedPages, formatTime } from '@Helpers/messageHelpers.js';
import { Evelyn } from '@Evelyn';

@Discord()
@SlashGroup({
	description: 'A complete playlist system.',
	name: 'playlist',
})
@SlashGroup('playlist')
export class Playlist {
	@Slash({
		name: 'create',
		description: 'Create a new playlist.',
	})
	async create(
		@SlashOption({
			name: 'name',
			description: 'Provide a name for the playlist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			name: string,
			interaction: ChatInputCommandInteraction,
	) {
		const { user } = interaction;
		const userData = await DB.find({
			userID: user.id,
		});

		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (name.length > 12)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | The name of the playlist cannot be more than 12 characters.',
					),
				],
				ephemeral: true,
			});

		if (userData?.length >= 10)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | You can only create 10 playlists at a time.',
					),
				],
				ephemeral: true,
			});

		await DB.create({
			name: user.username,
			userID: user.id,
			playlistName: name,
			created: Math.round(Date.now() / 1000),
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | Your playlist **${name}** has been created.`,
				),
			],
		});
	}

	@Slash({
		name: 'delete',
		description: 'Deletes the provided playlist.',
	})
	async delete(
		@SlashOption({
			name: 'name',
			description: 'Provide a name for the playlist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			name: string,
			interaction: ChatInputCommandInteraction,
	) {
		const { user } = interaction;

		const playlistData = await DB.findOne({
			userID: user.id,
			playlistName: name,
		});

		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (!playlistData)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | There is no playlist with that name or no data regarding that user.',
					),
				],
				ephemeral: true,
			});

		await playlistData.deleteOne();

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | Your playlist **${name}** has been deleted.`,
				),
			],
		});
	}

	@Slash({
		name: 'addcurrent',
		description: 'Adds the currently playing song to the playlist.',
	})
	async addcurrent(
		@SlashOption({
			name: 'name',
			description: 'Provide the name of the playlist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			name: string,
			interaction: ChatInputCommandInteraction,
			client: Evelyn,
	) {
		const { guildId, user } = interaction;
		const player = client.manager.players.get(guildId);
		const track = player.queue.current;

		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (!track)
			return interaction.reply({
				embeds: [embed.setDescription('🔹 | Nothing is playing.')],
				ephemeral: true,
			});

		await DB.updateOne(
			{
				userID: user.id,
				playlistName: name,
			},
			{
				$push: {
					playlistData: {
						title: track.title,
						uri: track.uri,
						author: track.author,
						duration: track.length,
					},
				},
			},
		);

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | **[${track.title}](${track.uri})** has been added to your playlist.`,
				),
			],
		});
	}

	@Slash({
		description: 'Lists the tracks of the provided playlist.',
		name: 'info',
	})
	async info(
		@SlashOption({
			name: 'name',
			description: 'Provide the name of the playlist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			name: string,
			interaction: ChatInputCommandInteraction,
	) {
		const { user } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await interaction.deferReply();

		const pData = await DB.findOne({
			playlistName: name,
			userID: user.id,
		});

		if (!pData)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | There is no playlist with that name or no data regarding that user.',
					),
				],
				ephemeral: true,
			});

		const trackData = pData.playlistData;
		const tracks = [];
		const embeds = [];

		for (const [i, track] of trackData.entries()) {
			const index = i + 1;
			const title = track.title;
			const url = track.uri;
			const length = formatTime(track.duration);

			tracks.push(`${index} • **[${title}](${url})** • [${length}]`);
		}

		for (let i = 0; i < tracks.length; i += 10) {
			embed
				.setTitle(`${pData.playlistName} by ${pData.createdBy}`)
				.setDescription(tracks.slice(i, i + 10).join('\n'));
			embeds.push(embed);
		}

		return embedPages(embeds, interaction);
	}

	@Slash({
		description: 'Lists all your playlists.',
		name: 'list',
	})
	async list(interaction: ChatInputCommandInteraction) {
		const { user } = interaction;
		const pData = await DB.find({ userID: user.id });
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await interaction.deferReply();

		if (!pData)
			return interaction.reply({
				embeds: [embed.setDescription('🔹 | You have no playlists.')],
				ephemeral: true,
			});

		const playlists = [];
		const embeds = [];

		for (const playlist of pData) {
			const name = playlist.playlistName;
			const length = playlist.playlistData?.length ?? 0;

			playlists.push(`**${name}** • ${length} song(s)`);
		}

		for (let i = 0; i < playlists.length; i += 10) {
			embed
				.setTitle(`Playlists curated by ${pData[i].playlistName}`)
				.setDescription(playlists.slice(i, i + 10).join('\n'));
			embeds.push(embed);
		}

		return embedPages(embeds, interaction);
	}

	@Slash({
		description: 'Removes the provided song from your playlist.',
		name: 'removesong',
	})
	async removesong(
		@SlashOption({
			name: 'name',
			description: 'Provide the name of the playlist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		@SlashOption({
			name: 'songid',
			description: 'Provide the number of the song.',
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
			name: string,
			songid: number,
			interaction: ChatInputCommandInteraction,
	) {
		const { user } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
		const pData = await DB.findOne({
			playlistName: name,
			userID: user.id,
		});

		if (!pData?.playlistData)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | There is no playlist with that name or no data regarding that user.',
					),
				],
				ephemeral: true,
			});

		if (songid >= pData?.playlistData.length || songid < 0)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | Track ID is out of range, see your playlist via /playlist list (playlistName)',
					),
				],
				ephemeral: true,
			});

		await DB.updateOne(
			{
				userID: user.id,
				playlistName: name,
			},
			{
				$pull: {
					playlistData: pData.playlistData[songid],
				},
			},
		);

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | **${pData.playlistData[songid].title}** has been removed from your playlist.`,
				),
			],
		});
	}
}
