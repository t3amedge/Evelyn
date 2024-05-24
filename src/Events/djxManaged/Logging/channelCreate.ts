import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class channelCreate {
    @On({ event: 'channelCreate' })
	@Guard(HasLogsEnabled)
	async channelCreate([channel]: ArgsOf<'channelCreate'>, client: Evelyn) {
		if (channel.partial) await channel.fetch();

		const audit = await getAuditLog({
			type: AuditLogEvent.ChannelCreate,
			guild: channel.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: channel.guild.name,
				iconURL: channel.guild.iconURL(),
			})
			.setTitle('Channel Created')
			.addFields(
				{
					name: '🔹 | Channel Name',
					value: `> ${channel.name}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${channel.id}`,
				},
				{
					name: '🔹 | Created by',
					value: `> ${audit.executor}`,
				},
			);

		return await send({
			guild: channel.guildId,
			client,
			embed,
		});
	}
}
