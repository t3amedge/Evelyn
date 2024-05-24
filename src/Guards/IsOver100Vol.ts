import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { Evelyn } from '@Evelyn';

export const IsOver100Vol: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	if (
		interaction instanceof CommandInteraction ||
        interaction instanceof ChatInputCommandInteraction ||
        interaction instanceof ButtonInteraction
	) {
		const player = (_client as Evelyn).manager.players.get(interaction.guildId);
		const volume = player.volume + 10;

		if (volume > 100)
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setDescription('🔹| You can only set the volume from 0 to 100.'),
				],
				ephemeral: true,
			});

		next();
	}
};

