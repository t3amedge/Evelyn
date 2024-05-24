import { getAuditLog, send } from '@Helpers/loggerUtils.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { AuditLogEvent } from 'discord.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class EmojiUpdate {
	@On({ event: 'emojiUpdate' })
	@Guard(HasLogsEnabled)
	async emojiUpdate(emojis: ArgsOf<'emojiUpdate'>, client: Evelyn) {
		const oldEmoji = emojis[0];
		const newEmoji = emojis[1];

		const audit = await getAuditLog({
			type: AuditLogEvent.EmojiUpdate,
			guild: oldEmoji.guild,
		});

		const embed = EvieEmbed()
			.setAuthor({
				name: oldEmoji.guild.name,
				iconURL: oldEmoji.guild.iconURL(),
			})
			.setTitle('Emoji Updated')
			.addFields(
				{
					name: '🔹 | Old Name',
					value: `> ${oldEmoji.name}`,
				},
				{
					name: '🔹 | New Name',
					value: `> ${newEmoji.name}`,
				},
				{
					name: '🔹 | Updated by',
					value: `> ${audit.executor}`,
				},
			);

		if (oldEmoji.name !== newEmoji.name)
			return await send({
				guild: oldEmoji.guild.id,
				client,
				embed,
			});
	}
}
