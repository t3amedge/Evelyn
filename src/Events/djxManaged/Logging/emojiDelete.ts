import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class EmojiDelete {
	@On({ event: 'emojiDelete' })
	@Guard(HasLogsEnabled)
	async emojiDelete([emoji]: ArgsOf<'emojiDelete'>, client: Evelyn) {
		const audit = await getAuditLog({
			type: AuditLogEvent.EmojiDelete,
			guild: emoji.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: emoji.guild.name,
				iconURL: emoji.guild.iconURL(),
			})
			.setTitle('Emoji Deleted')
			.addFields(
				{
					name: '🔹 | Emoji Name',
					value: `> ${emoji.name}`,
				},
				{
					name: '🔹 | Emoji ID',
					value: `> ${emoji.id}`,
				},
				{
					name: '🔹 | Removed by',
					value: `> ${audit.executor}`,
				},
			);

		return await send({
			guild: emoji.guild.id,
			client,
			embed,
		});
	}
}
