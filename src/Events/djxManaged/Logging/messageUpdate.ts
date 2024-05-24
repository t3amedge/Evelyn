import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { send } from '@Helpers/loggerUtils.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class MessageUpdate {
	@On({ event: 'messageUpdate' })
	@Guard(HasLogsEnabled)
	async messageUpdate(message: ArgsOf<'messageUpdate'>, client: Evelyn) {
		const oldMessage = message[0];
		const newMessage = message[1];

		if (oldMessage.author?.bot) return;

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('Jump to Message')
				.setStyle(ButtonStyle.Link)
				.setURL(oldMessage?.url),
		);

		const embed = EvieEmbed()
			.setAuthor({
				name: oldMessage.guild.name,
				iconURL: oldMessage.guild.iconURL(),
			})
			.setTitle('Message Updated')
			.addFields(
				{
					name: '🔹 | Old Content',
					value: `> ${oldMessage.content}`,
				},
				{
					name: '🔹 | New Content',
					value: `> ${newMessage.content}`,
				},
				{
					name: '🔹 | ID',
					value: `> ${oldMessage.id}`,
				},
				{
					name: '🔹 | Updated by',
					value: `> ${newMessage.author}>`,
				},
			);

		if (oldMessage.content !== newMessage.content)
			return await send({
				guild: oldMessage.guildId,
				client,
				embed,
				components: actionRow,
			});
	}
}
