import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import { GuardFunction, ArgsOf } from 'discordx';
import { ErrorEmbed } from 'src/utils/embeds';

/** Checks to see if the user is in a VC or if the bot is in the same VC as the user. */
export const isInsideVoiceChannel: GuardFunction<ArgsOf<'interactionCreate'>> = async (interaction, _client, next) => {
	if (
		!(interaction instanceof ChatInputCommandInteraction) &&
		!(interaction instanceof ButtonInteraction)
	) return;

	const { guild, member } = interaction; 
	const memberVC = (await guild.members.fetch(member.user.id)).voice.channelId;
	const botVC = guild.members.me?.voice.channelId;

	if (!memberVC)
		return interaction.reply({
			embeds: [ErrorEmbed().setDescription('You need to be in a voice channel to use this command.')],
			ephemeral: true,
		});

	if (botVC && memberVC !== botVC)
		return interaction.reply({
			embeds: [ErrorEmbed().setDescription(`Sorry but I'm already playing music in <#${botVC}>.`)],
			ephemeral: true,
		});

	next();
};