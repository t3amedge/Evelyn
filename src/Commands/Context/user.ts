import { Discord, ContextMenu, ButtonComponent } from 'discordx';
import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ApplicationCommandType,
	UserContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	ButtonInteraction,
} from 'discord.js';
import { bakeUnixTimestamp } from '@Helpers/messageHelpers.js';

const { User, Message } = ApplicationCommandType;

@Discord()
export class UserInformation {
	@ContextMenu({ name: 'User Information', type: User })
	@ContextMenu({ name: 'User Information', type: Message })
	async userInfo(
		interaction:
			| UserContextMenuCommandInteraction
			| MessageContextMenuCommandInteraction,
	) {
		const { guild, targetId } = interaction;
		const target = await guild.members.fetch(targetId);
		const { user, joinedTimestamp } = target;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await Promise.all([
			user.fetch(),
			user.avatarURL(),
			user.bannerURL({ size: 512 }),
		]);

		const createdTime = bakeUnixTimestamp(user.createdTimestamp);
		const joinedTime = bakeUnixTimestamp(joinedTimestamp);

		const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId('avatar')
				.setLabel('Avatar')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('banner')
				.setLabel('Banner')
				.setStyle(ButtonStyle.Primary),
		);

		return interaction.reply({
			embeds: [
				embed
					.setAuthor({
						name: `${user.username}`,
						iconURL: `${user.avatarURL()}`,
					})
					.setThumbnail(user.avatarURL())
					.setImage(user.bannerURL({ size: 512 }) ?? null)
					.addFields(
						{
							name: 'General',
							value: [
								`> **Name** ${user.username}`,
								`> **ID** ${user.id}`,
								`> **Discriminator** #${user.discriminator}`,
								`> **Discord member since** <t:${createdTime}:R>`,
								`> **Server member since** <t:${joinedTime}:R>`,
							].join('\n'),
						},
						{
							name: 'Roles',
							value: `> ${target.roles.cache
								.map((r) => r)
								.join(' ')
								.replace('@everyone', '')}`,
						},
					),
			],
			components: [actionRow],
			ephemeral: true,
		});
	}

	@ButtonComponent({ id: 'avatar' })
	@ButtonComponent({ id: 'banner' })
	async buttonHandler(interaction: ButtonInteraction) {
		const { user, customId } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await user.fetch();

		return interaction.reply({
			embeds: [
				embed
					.setTitle(
						`${user.username}'s ${customId === 'avatar' ? 'Avatar' : 'Banner'}`,
					)
					.setImage(
						user[customId === 'avatar' ? 'avatarURL' : 'bannerURL']({
							size: 4096,
						}),
					)
					.setURL(
						user[customId === 'avatar' ? 'avatarURL' : 'bannerURL']({
							size: 4096,
						}),
					),
			],
			ephemeral: true,
		});
	}
}
