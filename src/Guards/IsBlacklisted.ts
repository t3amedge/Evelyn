import { UserBlacklists as UB, Guilds as DB } from '@Schemas';
import { GuardFunction, ArgsOf } from 'discordx';

/** Checks to see if the user is blacklisted or not. */
export const IsBlacklisted: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	const { user, guildId } = interaction[0];

	const userBlacklist = await UB.findOne({
		userId: user.id,
	});

	const guildData = await DB.findOne({
		id: guildId,
		blacklist: {
			isBlacklisted: true,
		},
	});

	if (
		userBlacklist?.isBlacklisted === true ||
			guildData?.blacklist?.isBlacklisted === true
	) return;

	next();
};

