import { EmbedBuilder } from "discord.js";

export function BaseEmbed() {
    const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
    return embed;
}

export function ErrorEmbed() {
    const embed = new EmbedBuilder().setColor('Red').setTimestamp();
    return embed;
}