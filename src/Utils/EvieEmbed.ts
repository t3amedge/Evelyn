import { EmbedBuilder } from 'discord.js';

/** A simple function that simplifies embed creation. */
export function EvieEmbed() {
	const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
	return embed;
}