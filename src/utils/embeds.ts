import { EmbedBuilder } from "discord.js";

export function BaseEmbed() {
    const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
    return embed;
}