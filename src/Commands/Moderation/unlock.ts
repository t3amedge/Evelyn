import {
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	EmbedBuilder,
	TextChannel,
} from 'discord.js';
import { Discord, Slash } from 'discordx';
import { Lockdowns as DB } from '@Schemas';

@Discord()
export class Unlock {
	@Slash({
		name: 'unlock',
		description: 'Unlocks a channel.',
		defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
	})
	async unlock(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const lockedChannel = channel as TextChannel;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (channel.permissionsFor(guild.id).has(PermissionFlagsBits.SendMessages))
			return interaction.reply({
				embeds: [embed.setDescription('🔹 | This channel isn\'t locked.')],
				ephemeral: true,
			});

		lockedChannel.permissionOverwrites.edit(guild.id, {
			SendMessages: null,
		});

		await DB.deleteOne({ ChannelID: channel.id });

		interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | The lockdown on <#${channel.id}> has been lifted.`,
				),
			],
		});
	}
}
