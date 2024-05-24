import { GuildMember } from 'discord.js';

/** This function replaces the tags (i.e: ${userID}) used in the welcome and goodbye systems. */
export function replacePlaceholders(string: string, member: GuildMember) {
	const { user, guild } = member;

	return string
		?.replace(/{userName}/g, user.displayName)
		?.replace(/{userID}/g, user.id)
		?.replace(/{userMention}/g, `<@${user.id}>`)
		?.replace(/{guildName}/g, guild.name);
	// ?.replace(/{memberCount}/g, guild.memberCount);
}
