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
	description: 'Blacklist a user or server from using the bot.',
	name: 'blacklist',
})
@SlashGroup('blacklist')
export class Blacklist {
	private embed: EmbedBuilder;

	constructor() {
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
	}

	@Slash({
		description: 'Blacklist a server.',
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
		@SlashOption({
			name: 'blacklist_reason',
			description: 'Provide the reason for the blacklist.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
			serverid: string,
			blacklist_reason: string,
			interaction: ChatInputCommandInteraction,
	) {
		const data = await DB.findOne({ id: serverid });

		if (data?.blacklist?.isBlacklisted === true)
			return interaction.reply({
				embeds: [
					this.embed.setDescription('🔹 | This guild is already blacklisted.'),
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
						isBlacklisted: true,
						reason: blacklist_reason,
						time: Date.now(),
					},
				},
			},
		);

		return interaction.reply({
			embeds: [
				this.embed.setDescription(
					`🔹 | This guild has been successfully blacklisted for ${blacklist_reason}`,
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		description: 'Blacklist a user.',
		name: 'user',
	})
	async user(
		@SlashOption({
			name: 'userid',
			description: 'Provide the ID of the user you would like to blacklist.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		@SlashOption({
			name: 'blacklist_reason',
			description: 'Provide the reason for the blacklist.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
			userid: string,
			blacklist_reason: string,
			interaction: ChatInputCommandInteraction,
	) {
		const data = await UB.findOne({ userId: userid });

		if (data)
			return interaction.reply({
				embeds: [
					this.embed.setDescription('🔹 | This user is already blacklisted.'),
				],
				ephemeral: true,
			});

		await UB.create({
			isBlacklisted: true,
			userId: userid,
			reason: blacklist_reason,
			time: Date.now(),
		});

		return interaction.reply({
			embeds: [
				this.embed.setDescription(
					`🔹 | This guild has been successfully blacklisted for ${blacklist_reason}`,
				),
			],
			ephemeral: true,
		});
	}
}
