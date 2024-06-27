import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { ErrorEmbed } from 'src/utils/embeds';
import { Evelyn } from '@Evelyn';

export const volumeControl: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	if (!(interaction instanceof ChatInputCommandInteraction) && !(interaction instanceof ButtonInteraction)) return;
	const player = (_client as Evelyn).LLManager.getPlayer(interaction.guildId);

	if (player.volume + 10 > 100 || player.volume - 10 < 0)
		return interaction.reply({
			embeds: [
				ErrorEmbed().setDescription('You can only set the volume from 0 to 100.'),
			],
			ephemeral: true,
		});

	next();
};

