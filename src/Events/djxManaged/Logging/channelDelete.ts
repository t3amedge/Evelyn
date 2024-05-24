import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { AuditLogEvent, GuildChannel } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { Evelyn } from '@Evelyn';

@Discord()
export class channelDelete {
	@On({ event: 'channelDelete' })
	async channelDelete([channel]: ArgsOf<'channelDelete'>, client: Evelyn) {
		const typedChannel = channel as GuildChannel;
		if (typedChannel.partial) await channel.fetch();

		const audit = await getAuditLog({
			type: AuditLogEvent.ChannelDelete,
			guild: typedChannel.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: typedChannel.guild.name,
				iconURL: typedChannel.guild.iconURL(),
			})
			.setTitle('Channel Deleted')
			.addFields(
				{
					name: '🔹 | Channel Name',
					value: `> ${typedChannel.name}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${typedChannel.id}`,
				},
				{
					name: '🔹 | Deleted by',
					value: `> ${audit.executor}`,
				},
			);

		return await send({
			guild: typedChannel.guildId,
			client,
			embed,
		});
	}
}
