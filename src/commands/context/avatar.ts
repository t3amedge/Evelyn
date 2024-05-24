import {
	ApplicationCommandType,
	MessageContextMenuCommandInteraction, 
	UserContextMenuCommandInteraction
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
        const { targetId } = interaction;
        const user = await this.client.users.fetch(targetId);

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