import { EmbedBuilder, User } from "discord.js";

export function BaseEmbed() {
    const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
    return embed;
}

export function ErrorEmbed() {
    const embed = new EmbedBuilder().setColor('Red').setTimestamp();
    return embed;
}

export function ButtonEmbed(user: User) {
    const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setFooter({
            text: `Action executed by ${user.username}.`,
			iconURL: user.displayAvatarURL(),
        })
        .setTimestamp();
    return embed;
}