import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class GuildBanRemove {
	@On({ event: 'guildBanRemove' })
	@Guard(HasLogsEnabled)
	async guildBanRemove([ban]: ArgsOf<'guildBanRemove'>, client: Evelyn) {
		if (ban.partial) await ban.fetch();

		const audit = await getAuditLog({
			type: AuditLogEvent.MemberBanRemove,
			guild: ban.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: ban.guild.name,
				iconURL: ban.guild.iconURL(),
			})
			.setTitle('Member Unbanned')
			.addFields(
				{
					name: '🔹 | Member Name',
					value: `> ${ban.user.username}`,
				},
				{
					name: '🔹 | Member ID',
					value: `> ${ban.user.id}`,
				},
				{
					name: '🔹 | Unbanned by',
					value: `> ${audit.executor}`,
				},
			);

		return await send({
			guild: ban.guild.id,
			client,
			embed,
		});
	}
}
