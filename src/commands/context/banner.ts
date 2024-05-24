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
export class ContextBanner {
    constructor(@inject(Evelyn) private readonly client: Evelyn) {}

    @ContextMenu({ name: 'Banner', type: ApplicationCommandType.User })
    @ContextMenu({ name: 'Banner', type: ApplicationCommandType.Message })
    async execute(interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
        const { targetId } = interaction;
        const user = await this.client.users.fetch(targetId);

		return interaction.reply({
			embeds: [
				BaseEmbed()
					.setAuthor({ name: `${user.username}'s Banner` })
					.setImage(user.bannerURL({ size: 512 }) ?? null)
			],
			ephemeral: true,
		});
    }
}