import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { ErrorEmbed } from 'src/utils/embeds';
import { Evelyn } from '@Evelyn';

/** Checks to see if the bot has any songs in the queue. */
export const hasQueue: GuardFunction<ArgsOf<'interactionCreate'>> = (interaction, _client, next) => {
	if (
		!(interaction instanceof ChatInputCommandInteraction) &&
		!(interaction instanceof ButtonInteraction)
	) return;

	const player = (_client as Evelyn).LLManager.getPlayer(interaction.guildId);

	if (player?.queue.tracks.length === 0) return interaction.reply({
		embeds: [ErrorEmbed().setDescription('There is nothing in the queue.')],
		ephemeral: true,
	});

	next();
};
