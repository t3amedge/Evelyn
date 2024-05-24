import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';

/** Checks the link against two regexes to see if the link is a YT or YTM link. */
export const IsYTLink: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	if (
		interaction instanceof CommandInteraction ||
        interaction instanceof ChatInputCommandInteraction
	) {
		const query = interaction.options.get('query').name;

		const YTRegex =
		/(http(s)?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/[a-zA-Z0-9-_]+/;
		const YTMRegex =
		/(http(s)?:\/\/)?(music\.)?(m\.)?(youtube\.com|youtu\.be)\/[a-zA-Z0-9-_]+/;

		if (YTRegex.test(query) || YTMRegex.test(query))
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setTitle('Unsupported Platform')
						.setDescription(
							'Hiya! **Support for this platform has been dropped as a result of decisions outside of our control. To alleviate this issue, you can try:**\n\n> Providing a direct link from a platform we support (SoundCloud, Spotify, Deezer, Bandcamp etc).\n> Search for it and Evelyn will try to provide the best result she finds.\n\nYou can read the full announcement in our support server linked below.',
						),
				],
			});

		next();
	}
};