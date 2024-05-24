import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { send } from '@Helpers/loggerUtils.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class GuildMemberUpdate {
	@On({ event: 'guildMemberUpdate' })
	@Guard(HasLogsEnabled)
	async guildMemberUpdate(members: ArgsOf<'guildMemberUpdate'>, client: Evelyn) {
		const oldMember = members[0];
		const newMember = members[1];

		const embed = EvieEmbed()
			.setAuthor({
				name: oldMember.user.displayName,
				iconURL: oldMember.user.avatarURL(),
			});

		if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			const oldRoles = oldMember.roles.cache.map((r) => r.id);
			const newRoles = newMember.roles.cache.map((r) => r.id);

			const uniqueRoles = this.unique(oldRoles, newRoles);
			const role = oldMember.guild.roles.cache.get(uniqueRoles[0].toString());

			return await send({
				guild: oldMember.guild.id,
				client,
				embed:
					embed
						.setTitle('Member Roles Updated')
						.addFields(
							{
								name: '🔹 | Member',
								value: `> ${oldMember.user}`,
							},
							{
								name: '🔹 | ID',
								value: `> ${oldMember.user.id}`,
							},
							{
								name: '🔹 | Removed Role',
								value: `> <@&${role.id}>`,
							},
						),
			});
		}

		if (oldMember.roles.cache.size < newMember.roles.cache.size) {
			const oldRoles = oldMember.roles.cache.map((r) => r.id);
			const newRoles = newMember.roles.cache.map((r) => r.id);

			const uniqueRoles = this.unique(oldRoles, newRoles);
			const role = newMember.guild.roles.cache.get(uniqueRoles[0].toString());

			return await send({
				guild: newMember.guild.id,
				client,
				embed:
					embed
						.setTitle('Member Roles Updated')
						.addFields(
							{
								name: '🔹 | Member',
								value: `> ${oldMember.user}`,
							},
							{
								name: '🔹 | ID',
								value: `> ${oldMember.user.id}`,
							},
							{
								name: '🔹 | Added Role',
								value: `> ${role}`,
							},
						),
			});
		}

		if (
			!oldMember.isCommunicationDisabled() &&
			newMember.isCommunicationDisabled()
		)
			return await send({
				guild: newMember.guild.id,
				client,
				embed:
					embed
						.setTitle('Member Timed Out')
						.addFields(
							{
								name: '🔹 | Member',
								value: `> ${newMember.user}`,
							},
							{
								name: '🔹 | ID',
								value: `> ${newMember.user.id}`,
							},
							{
								name: '🔹 | Timeout expires',
								value: `> <t:${Math.floor(
									newMember.communicationDisabledUntilTimestamp / 1000,
								)}:R>`,
							},
						),
			});

		if (
			oldMember.isCommunicationDisabled() &&
			!newMember.isCommunicationDisabled()
		)
			return await send({
				guild: newMember,
				client,
				embed:
					embed
						.setTitle('Member Untimed Out')
						.addFields(
							{
								name: '🔹 | Member',
								value: `> ${oldMember}`,
							},
							{
								name: '🔹 | ID',
								value: `> ${oldMember.user.id}`,
							},
						),
			});

		if (oldMember.nickname !== newMember.nickname)
			return await send({
				guild: newMember.guild.id,
				client,
				embed:
					embed
						.setTitle('Member Nickname Updated')
						.addFields(
							{
								name: '🔹 | Member',
								value: `> ${newMember.user}`,
							},
							{
								name: '🔹 | ID',
								value: `> ${newMember.user.id}`,
							},
							{
								name: '🔹 | Old Nickname',
								value: `> ${oldMember.nickname}`,
							},
							{
								name: '🔹 | New Nickname',
								value: `> ${newMember.nickname}`,
							},
						),
			});
	}

	/**
 	* Extracts the unique role by filtering the arrays. Used to detect the role that has been removed.
 	* @param guild The guild object.
 	* @returns {string[]} An array of strings.
 	*/
	private unique(arr1: string[], arr2: string[]): string[] {
		const unique1 = arr1.filter((z) => arr2.indexOf(z) === -1);
		const unique2 = arr2.filter((z) => arr1.indexOf(z) === -1);

		return unique1.concat(unique2);
	}
}
