import { TextChannel, Message } from 'discord.js';
import { GuildDB as DB } from '../../../Schemas/guild.js';
import { Evelyn } from '../../../Evelyn.js';
import { Discord, On } from 'discordx';
import { Levels } from '@/Services/Levels.js';
import { inject, injectable } from 'tsyringe';

@Discord()
@injectable()
export class LevelUp {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(Levels) private readonly levels: Levels) {}

	@On({ event: 'messageCreate' })
	async levelUp([message]: [Message], client: Evelyn) {
		const { guild, channelId, author } = message;
		if (!guild || author.bot) return;

		const data = await DB.findOne({ guildId: guild.id });
		const fetchedAuthor = await guild.members.fetch(author.id);

		const isRoleRestricted = fetchedAuthor.roles.cache.filter(async (r) => await this.levels.isRoleRestricted(guild.id, r.id));

		if (!data?.levels.enabled || await this.levels.isChannelRestricted(guild.id, channelId) || isRoleRestricted) return;

		// const levelData = await RoleRewardsDB.findOne({ guildId: guild.id });
		const levellingChannel = client.channels.cache.get(
			data?.levels?.channel,
		) as TextChannel;
		if (!levellingChannel) return;

		const rndXP = Number(Math.floor(Math.random() * 25));
		if (rndXP === 0) return;
		// console.log(`Generated XP amount! The XP amount is ${rndXP}`);

		const levelledUp = await this.levels.addXP(author.id, guild.id, rndXP);
		// if (!levelledUp) return console.log('User didn\'t level up!');
		if (!levelledUp) return;

		const user = await this.levels.getUser(author.id, guild.id);

		const lvlMessage = data.levels?.message
			?.replace(/{userName}/g, `${author.displayName}`)
			.replace(/{userMention}/g, `<@${author.id}>`)
			.replace(/{userLevel}/g, `${user.level}`);

		return levellingChannel.send({ content: `${lvlMessage}` });
	}
}

// Test implementation for role rewards. Currently unused till dashboard implementation is done.
/**
 * const mappedLevels = levelData.rewards.map((reward) => reward.level);
		const mappedRoles = levelData.rewards.map((reward) => reward.roleId);

		if (mappedLevels.includes(user.level)) {
			mappedRoles.forEach((role) => {
				if (!member.roles.cache.has(role)) member.roles.add(role);
			});

			const lvlMessage = data.levels?.message
				?.replace(/{userName}/g, `${author.username}`)
				.replace(/{userMention}/g, `<@${author.id}>`)
				.replace(/{userLevel}/g, `${user.level}`);

			console.log(`Awarded role (with ID: ${mappedRoles[0]}) for reaching level ${user.level}`)
			return levellingChannel.send({ content: `${lvlMessage}` });
		}
 */
