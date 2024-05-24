import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class RoleDelete {
	@On({ event: 'roleDelete' })
	@Guard(HasLogsEnabled)
	async roleDelete([role]: ArgsOf<'roleDelete'>, client: Evelyn) {
		const audit = await getAuditLog({
			type: AuditLogEvent.RoleDelete,
			guild: role.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: role.guild.name,
				iconURL: role.guild.iconURL(),
			})
			.setTitle('Role Deleted')
			.addFields(
				{
					name: '🔹 | Name',
					value: `> ${role.name}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${role.id}`,
				},
				{
					name: '🔹 | Deleted by',
					value: `> ${audit?.executor}`,
				},
			);

		return await send({
			guild: role.guild.id,
			client,
			embed,
		});
	}
}
