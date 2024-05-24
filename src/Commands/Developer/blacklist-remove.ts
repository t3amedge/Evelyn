import {
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption, SlashGroup, Guild } from 'discordx';
import { UserBlacklists as UB, Guilds as DB } from '@Schemas';
import { config } from '@Config';

@Discord()
@Guild(config.debug.devGuild)
@SlashGroup({
	description: 'Remove a user or server from the blacklist.',
	name: 'blacklist-remove',
})
@SlashGroup('blacklist-remove')
export class BlacklistRemove {
	private embed: EmbedBuilder;

	constructor() {
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
	}

	@Slash({
		description: 'Remove a server from the blacklist.',
		name: 'server',
	})
	@Guild(config.debug.devGuild)
	async server(
		@SlashOption({
			name: 'serverid',
			description: 'Provide the ID of the server you would like to blacklist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			serverid: string,
			interaction: ChatInputCommandInteraction,
	) {
		const data = await DB.findOne({ id: serverid });

		if (!data)
			return interaction.reply({
				embeds: [
					this.embed.setDescription('🔹 | This guild isn\'t blacklisted.'),
				],
				ephemeral: true,
			});

		await DB.findOneAndUpdate(
			{
				id: serverid,
			},
			{
				$set: {
					blacklist: {
						isBlacklisted: false,
					},
				},
			},
		);

		return interaction.reply({
			embeds: [
				this.embed.setDescription(
					'🔹 | This guild has been removed from the blacklist.',
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		description: 'Remove a user from the blacklist.',
		name: 'user',
	})
	@Guild(config.debug.devGuild)
	async user(
		@SlashOption({
			name: 'userid',
			description: 'Provide the ID of the user you would like to blacklist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			userid: string,
			interaction: ChatInputCommandInteraction,
	) {
		const data = await UB.findOne({ userId: userid });

		if (!data)
			return interaction.reply({
				embeds: [this.embed.setDescription('This user isn\'t blacklisted.')],
				ephemeral: true,
			});

		await data.deleteOne({ userId: userid });

		return interaction.reply({
			embeds: [
				this.embed.setDescription(
					'🔹 | This user has been removed from the blacklist.',
				),
			],
		});
	}
}
