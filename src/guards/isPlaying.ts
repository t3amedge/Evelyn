import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { ErrorEmbed } from 'src/utils/embeds';
import { Evelyn } from '@Evelyn';

/** Checks to see if the bot is playing anything. */
export const isPlaying: GuardFunction<ArgsOf<'interactionCreate'>> = (interaction, _client, next) => {
	if (
		!(interaction instanceof ChatInputCommandInteraction) &&
		!(interaction instanceof ButtonInteraction)
	) return;

	const player = (_client as Evelyn).LLManager.getPlayer(interaction.guildId);

	if (!player?.playing) return interaction.reply({
		embeds: [ErrorEmbed().setDescription('I\'m not playing anything.')],
		ephemeral: true,
	});

	next();
};

