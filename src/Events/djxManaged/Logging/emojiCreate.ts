import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class EmojiCreate {
	@On({ event: 'emojiCreate' })
	@Guard(HasLogsEnabled)
	async emojiCreate([emoji]: ArgsOf<'emojiCreate'>, client: Evelyn) {
		const audit = await getAuditLog({
			type: AuditLogEvent.EmojiCreate,
			guild: emoji.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: emoji.guild.name,
				iconURL: emoji.guild.iconURL(),
			})
			.setTitle('Emoji Created')
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
					name: '🔹 | Added by',
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
