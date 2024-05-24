import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed';

/** Checks to see if the user is in a VC or if the bot is in the same VC as the user. */
export const IsInsideVC: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	if (
		interaction instanceof CommandInteraction ||
        interaction instanceof ChatInputCommandInteraction ||
        interaction instanceof ButtonInteraction
	) {
		const memberVC = await interaction.guild.members.fetch(interaction.member.user.id);
		const botVC = interaction.guild.members.me.voice.channelId;

		if (!memberVC.voice.channelId)
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setDescription(
							'🔹 | You need to be in a voice channel to use this command.',
						),
				],
				ephemeral: true,
			});

		if (botVC && memberVC.voice.channelId !== botVC)
			return interaction.reply({
				embeds: [
					EvieEmbed()
						.setDescription(
							`🔹 | Sorry but I'm already playing music in <#${botVC}>.`,
						),
				],
				ephemeral: true,
			});

		next();
	}
};