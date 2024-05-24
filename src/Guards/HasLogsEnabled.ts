import { GuardFunction } from 'discordx';
import { Guilds as DB } from '@Schemas';

/** Checks to see if the guild has logs enabled. */
export const HasLogsEnabled: GuardFunction = async (arg, _client, next) => {
	const data = await DB.findOne({
		guildId: arg[0].guild.id,
	});

	if (!data?.logs?.enabled && !data?.logs?.webhook) return false;
	next();
};
