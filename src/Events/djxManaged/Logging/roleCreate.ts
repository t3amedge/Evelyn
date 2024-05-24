import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class RoleCreate {
	@On({ event: 'roleCreate' })
	@Guard(HasLogsEnabled)
	async roleCreate([role]: ArgsOf<'roleCreate'>, client: Evelyn) {
		const audit = await getAuditLog({
			type: AuditLogEvent.RoleCreate,
			guild: role.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: role.guild.name,
				iconURL: role.guild.iconURL(),
			})
			.setTitle('Role Created')
			.addFields(
				{
					name: '🔹 | Name',
					value: `> ${role.name}`,
				},
				{
					name: '🔹 | Color',
					value: `> ${role.hexColor}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${role.id}`,
				},
				{
					name: '🔹 | Created by',
					value: `> ${audit.executor}`,
				},
			);

		return await send({
			guild: role.guild.id,
			client,
			embed,
		});
	}
}
