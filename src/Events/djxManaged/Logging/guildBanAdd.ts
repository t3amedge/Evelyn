import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class GuildBanAdd {
	@On({ event: 'guildBanAdd' })
	@Guard(HasLogsEnabled)
	async guildBanAdd([ban]: ArgsOf<'guildBanAdd'>, client: Evelyn) {
		if (ban.partial) await ban.fetch();

		const audit = await getAuditLog({
			type: AuditLogEvent.MemberBanAdd,
			guild: ban.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: ban.guild.name,
				iconURL: ban.guild.iconURL(),
			})
			.setTitle('Member Banned')
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
					name: '🔹 | Banned by',
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
