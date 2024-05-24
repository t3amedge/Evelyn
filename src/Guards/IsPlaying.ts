import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { Evelyn } from '@Evelyn';

/** Checks to see if the bot is playing anything. */
export const IsPlaying: GuardFunction<ArgsOf<'interactionCreate'>> = (interaction, _client, next) => {
	if (
		interaction instanceof CommandInteraction ||
        interaction instanceof ChatInputCommandInteraction ||
		interaction instanceof ButtonInteraction
	) {
		const player = (_client as Evelyn).manager.players.get(interaction.guildId);

		if (!player?.isPlaying) return interaction.reply({
			embeds: [EvieEmbed().setDescription('🔹 | I\'m not playing anything.')],
			ephemeral: true,
		});

		next();
	}
};

