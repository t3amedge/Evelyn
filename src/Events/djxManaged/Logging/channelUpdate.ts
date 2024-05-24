import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { GuildChannel, AuditLogEvent } from 'discord.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class ChannelUpdate {
	@On({ event: 'channelUpdate' })
	@Guard(HasLogsEnabled)
	async channelUpdate(channels: ArgsOf<'channelUpdate'>, client: Evelyn) {
		const oldChannel = channels[0] as GuildChannel;
		const newChannel = channels[1] as GuildChannel;

		const embed = EvieEmbed()
			.setAuthor({
				name: oldChannel.guild.name,
				iconURL: oldChannel.guild.iconURL(),
			});

		const audit = await getAuditLog({
			type: AuditLogEvent.ChannelUpdate,
			guild: oldChannel.guild,
		});

		if (oldChannel.name !== newChannel.name)
			return await send({
				guild: oldChannel.guildId,
				client,
				embed: embed
					.setTitle('Channel Name Updated')
					.addFields(
						{
							name: '🔹 | Old Channel Name',
							value: `> ${oldChannel.name}`,
						},
						{
							name: '🔹 | New Channel Name',
							value: `> ${newChannel.name}`,
						},
						{
							name: '🔹 | Updated by',
							value: `> ${audit.executor}`,
						},
					),
			});

		if (oldChannel.type !== newChannel.type)
			return await send({
				guild: oldChannel.guildId,
				client,
				embed: embed
					.setTitle('Channel Type Changed')
					.addFields(
						{
							name: '🔹 | Channel',
							value: `> ${oldChannel}`,
						},
						{
							name: '🔹 | Old Channel Type',
							value: `> ${oldChannel.type}`,
						},
						{
							name: '🔹 | New Channel Type',
							value: `> ${newChannel.type}`,
						},
						{
							name: '🔹 | Updated by',
							value: `> ${audit.executor}`,
						},
					),
			});
	}
}
