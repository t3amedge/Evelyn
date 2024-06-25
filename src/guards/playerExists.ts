import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { ErrorEmbed } from 'src/utils/embeds';
import { Evelyn } from '@Evelyn';

/** Checks to see if the guild's player exists (useful if LL server crashes). */
export const playerExists: GuardFunction<ArgsOf<'interactionCreate'>> = (interaction, _client, next) => {
	if (
		!(interaction instanceof ChatInputCommandInteraction) &&
		!(interaction instanceof ButtonInteraction)
	) return;

	const player = (_client as Evelyn).LLManager.getPlayer(interaction.guildId);

	if (!player) return interaction.reply({
		embeds: [ErrorEmbed().setDescription('No player found, please reconnect the bot to this voice channel.')],
		ephemeral: true,
	});

	next();
};

