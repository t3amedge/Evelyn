/* eslint-disable no-mixed-spaces-and-tabs */
import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class RoleUpdate {
	@On({ event: 'roleUpdate' })
	@Guard(HasLogsEnabled)
	async roleUpdate(role: ArgsOf<'roleUpdate'>, client: Evelyn) {
		const oldRole = role[0];
		const newRole = role[1];

		const audit = await getAuditLog({
			type: AuditLogEvent.RoleUpdate,
			guild: newRole.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: newRole.guild.name,
				iconURL: newRole.guild.iconURL(),
			})
			.setTitle('Role Updated');

		if (newRole.color !== oldRole.color)
			return await send({
				guild: newRole.guild.id,
				client,
				embed:
                    embed.addFields(
                    	{
                    		name: '🔹 | Old Color',
                    		value: `> ${oldRole.hexColor}`,
                    	},
                    	{
                    		name: '🔹 | New Color',
                    		value: `> ${newRole.hexColor}`,
                    	},
                    	{
                    		name: '🔹 | Role ID',
                    		value: `> ${newRole.id}`,
                    	},
                    	{
                    		name: '🔹 | Role updated by',
                    		value: `> ${audit.executor}`,
                    	},
                    ),
			});

		if (newRole.name !== oldRole.name)
			return await send({
				guild: newRole.guild.id,
				client,
				embed:
                    embed.addFields(
                    	{
                    		name: '🔹 | Old Name',
                    		value: `> ${oldRole.name}`,
                    	},
                    	{
                    		name: '🔹 | New Name',
                    		value: `> ${newRole.name}`,
                    	},
                    	{
                    		name: '🔹 | Role ID',
                    		value: `> ${newRole.id}`,
                    	},
                    	{
                    		name: '🔹 | Role updated by',
                    		value: `> ${audit.executor}`,
                    	},
                    ),
			});

		if (newRole.position !== oldRole.position)
			return await send({
				guild: newRole.guild.id,
				client,
				embed:
                    embed.addFields(
                    	{
                    		name: '🔹 | Old Position',
                    		value: `> ${oldRole.position}`,
                    	},
                    	{
                    		name: '🔹 | New Position',
                    		value: `> ${newRole.position}`,
                    	},
                    	{
                    		name: '🔹 | Role ID',
                    		value: `> ${newRole.id}`,
                    	},
                    	{
                    		name: '🔹 | Role updated by',
                    		value: `> ${audit.executor}`,
                    	},
                    ),
			});
	}
}
