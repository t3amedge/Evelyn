import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { bakeUnixTimestamp } from '@Helpers/messageHelpers.js';
import { Discord, Slash, SlashOption } from 'discordx';

@Discord()
export class UserInfo {
	@Slash({
		name: 'userinfo',
		description: 'Shows information about a user.',
	})
	userinfo(
		@SlashOption({
			name: 'target',
			description: 'Provide a target.',
			type: ApplicationCommandOptionType.User,
			required: false,
		})
			target: GuildMember,
			interaction: ChatInputCommandInteraction,
	) {
		const typedMember = target || interaction.member;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		const { joinedTimestamp, user, roles } = typedMember as GuildMember;

		const createdTime = bakeUnixTimestamp(user.createdTimestamp);
		const joinedTime = bakeUnixTimestamp(joinedTimestamp);

		return interaction.reply({
			embeds: [
				embed
					.setAuthor({
						name: `${user.tag}`,
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
							value: `> ${roles.cache
								.map((r) => r)
								.join(' ')
								.replace('@everyone', '')}`,
						},
					),
			],
		});
	}
}
