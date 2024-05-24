import { Role, TextChannel, ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';

@Discord()
export class Announce {
	@Slash({
		name: 'announce',
		description: 'Send an announcement via the bot.',
		defaultMemberPermissions: 'ManageGuild',
	})
	announce(
		@SlashOption({
			name: 'message',
			description:
				'Provide the message you would like to send in the announcement.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		@SlashOption({
			name: 'channel',
			description: 'Provide the channel where the announcement will be sent.',
			type: ApplicationCommandOptionType.Channel,
			required: true,
		})
		@SlashOption({
			name: 'role',
			description: 'Mention a role alongside the announcement.',
			type: ApplicationCommandOptionType.Role,
			required: false,
		})
			message: string,
			channel: TextChannel,
			role: Role,
			interaction: ChatInputCommandInteraction,
	) {
		interaction.reply({
			embeds: [EvieEmbed().setDescription('🔹 | Announcement sent.')],
			ephemeral: true,
		});

		if (role)
			return channel.send({
				content: `<@${role.id}>`,
				embeds: [EvieEmbed().setDescription(message)],
			});
		return channel.send({ embeds: [EvieEmbed().setDescription(message)] });
	}
}
