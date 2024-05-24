import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class MessageDelete {
	@On({ event: 'messageDelete' })
	@Guard(HasLogsEnabled)
	async messageDelete([message]: ArgsOf<'messageDelete'>, client: Evelyn) {
		if (message.partial) await message.fetch();

		const { author, content, embeds, id } = message;
		const systemStatus = message.system === true || message.system === null;

		if (author?.bot || embeds?.length > 0 || systemStatus || content === null)
			return;

		const audit = await getAuditLog({
			type: AuditLogEvent.MessageDelete,
			guild: message.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: message.guild.name,
				iconURL: message.guild.iconURL(),
			})
			.setTitle('Message Deleted')
			.addFields(
				{
					name: '🔹 | Content',
					value: `> ${content}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${id}`,
				},
				{
					name: '🔹 | Sent by',
					value: `> ${author}`,
				},
				{
					name: '🔹 | Deleted by',
					value: `> ${audit.executor}>`,
				},
			);

		return await send({
			guild: message.guildId,
			client,
			embed,
		});
	}
}
