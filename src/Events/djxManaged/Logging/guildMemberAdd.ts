import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { send } from '@Helpers/loggerUtils.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class GuildMemberAdd {
	@On({ event: 'guildMemberAdd' })
	@Guard(HasLogsEnabled)
	async guildMemberAdd([member]: ArgsOf<'guildMemberAdd'>, client: Evelyn) {
		if (member.partial) await member.fetch();

		const embed = EvieEmbed()
			.setAuthor({
				name: member.guild.name,
				iconURL: member.guild.iconURL(),
			})
			.setTitle('Member Joined')
			.addFields(
				{
					name: '🔹 | Member Name',
					value: `> ${member.displayName}`,
				},
				{
					name: '🔹 | Member ID',
					value: `> ${member.id}`,
				},
				{
					name: '🔹 | Account Age',
					value: `> <t:${parseInt(
						(member.user.createdTimestamp / 1000).toString(),
					)}:R>`,
				},
			);

		return await send({
			guild: member.guild.id,
			client,
			embed,
		});
	}
}
