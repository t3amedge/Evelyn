import {
	ApplicationCommandType,
	type MessageContextMenuCommandInteraction, 
	type UserContextMenuCommandInteraction,
	type User,
} from "discord.js";
import { BaseEmbed } from "../../utils/embeds.js";
import { ContextMenu, Discord } from "discordx";
import { inject, injectable } from "tsyringe";
import { Evelyn } from "@Evelyn";

@Discord()
@injectable()
export class ContextAvatar {
    constructor(@inject(Evelyn) private readonly client: Evelyn) {}

    @ContextMenu({ name: 'Avatar', type: ApplicationCommandType.User })
    @ContextMenu({ name: 'Avatar', type: ApplicationCommandType.Message })
    async execute(interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
		let user: User;

		if (interaction.isUserContextMenuCommand()) {
			user = await this.client.users.fetch(interaction.targetId);
		} else {
			user = await this.client.users.fetch(interaction.targetMessage.author.id);
		}

		return interaction.reply({
			embeds: [
				BaseEmbed()
					.setAuthor({ name: `${user.username}'s Avatar` })
					.setImage(user.displayAvatarURL({ size: 512 }) ?? null)
			],
			ephemeral: true,
		});
    }
}