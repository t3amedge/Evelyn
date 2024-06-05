import {
	ApplicationCommandType,
	type MessageContextMenuCommandInteraction, 
	type UserContextMenuCommandInteraction,
	type User,
} from "discord.js";
import { makeTimestamp } from "src/utils/makeTimestamp.js";
import { BaseEmbed } from "../../utils/embeds.js";
import { ContextMenu, Discord } from "discordx";
import { inject, injectable } from "tsyringe";
import { Evelyn } from "@Evelyn";

@Discord()
@injectable()
export class ContextUserInformation {
    constructor(@inject(Evelyn) private readonly client: Evelyn) {}

    @ContextMenu({ name: 'User Information', type: ApplicationCommandType.User })
    @ContextMenu({ name: 'User Information', type: ApplicationCommandType.Message })
    async execute(interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
		let user: User;
        const { guild } = interaction;

		if (interaction.isUserContextMenuCommand()) {
			user = await this.client.users.fetch(interaction.targetId);
		} else {
			user = await this.client.users.fetch(interaction.targetMessage.author.id);
		}

		const guildUser = await guild?.members.fetch(user.id);

		return interaction.reply({
			embeds: [
				BaseEmbed()
					.setAuthor({
						name: `${user.username}`,
						iconURL: `${user.avatarURL()}`,
					})
					.setThumbnail(user.avatarURL())
					.setImage(user.bannerURL({ size: 512 }) ?? null)
					.addFields(
						{
                            name: 'General',
                            value: `
                                > **Name** ${user.username}
                                > **ID** ${user.id}
                                > **Discord member since** <t:${makeTimestamp(user.createdTimestamp)}:R>
                                > **Server member since** <t:${makeTimestamp(guildUser?.joinedTimestamp as number)}:R>
                            `
                        },
						{
							name: `Roles (${guildUser?.roles.cache.size})`,
							value: `> ${guildUser?.roles.cache
								.map((r) => r)
								.join(' ')
								.replace('@everyone', '')}`,
						},
					),
			],
			ephemeral: true,
		});
    }
}