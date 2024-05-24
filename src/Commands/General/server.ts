import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, Guild, Role } from 'discord.js';
import { bakeUnixTimestamp } from '@Helpers/messageHelpers.js';
import { Discord, Slash, SlashGroup } from 'discordx';

@Discord()
@SlashGroup({
	name: 'server',
	description: 'Shows information about the current server.',
})
@SlashGroup('server')
export class ServerInfo {
	@Slash({
		name: 'info',
		description: 'Shows information about the current server.',
	})
	info(interaction: ChatInputCommandInteraction) {
		const { guild } = interaction;

		const {
			name,
			description,
			id,
			createdTimestamp,
			ownerId,
			members,
			channels,
			emojis,
			stickers,
			vanityURLCode,
			memberCount,
			premiumTier,
			premiumSubscriptionCount,
			iconURL,
		} = guild;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		const botCount = members.cache.filter((member) => member.user.bot).size;
		const getChannelTypeSize = (type: ChannelType[]) =>
			channels.cache.filter((channel) => type.includes(channel.type)).size;
		const createdTime = bakeUnixTimestamp(createdTimestamp);

		return interaction.reply({
			embeds: [
				embed
					.setTitle(`Information about ${name}`)
					.addFields(
						{
							name: 'Description',
							value: `> ${description ?? 'None.'}`,
						},
						{
							name: 'General',
							value: [
								`> **Name** ${name}`,
								`> **ID** ${id}`,
								`> **Created** <t:${createdTime}:R>`,
								`> **Owner** <@${ownerId}>`,
								`> **Vanity URL** ${vanityURLCode ?? 'None'}`,
							].join('\n'),
						},
						{
							name: 'Users',
							value: [
								`> **Members** ${memberCount - botCount}`,
								`> **Bots** ${botCount}`,
							].join('\n'),
						},
						{
							name: 'Roles',
							value: '> You can see all the roles by using /server roles.',
						},
						{
							name: 'Channels',
							value: [
								`> **Text** ${getChannelTypeSize([
									ChannelType.GuildText,
									ChannelType.GuildForum,
								])}`,
								`> **Voice** ${getChannelTypeSize([
									ChannelType.GuildVoice,
									ChannelType.GuildStageVoice,
								])}`,
							].join('\n'),
						},
						{
							name: 'Emojis and Stickers',
							value: [
								`> **Animated** ${emojis.cache.filter((e) => e.animated).size}`,
								`> **Static** ${emojis.cache.filter((e) => !e.animated).size}`,
								`> **Stickers** ${stickers.cache.size}`,
							].join('\n'),
						},
						{
							name: 'Nitro Stats',
							value: [
								`> **Tier** ${premiumTier ?? 'None'}`,
								`> **Boosts** ${premiumSubscriptionCount}`,
								`> **Boosters** ${
									members.cache.filter(
										(member) => member.roles.premiumSubscriberRole,
									).size
								}`,
								`> **Total Boosters** ${
									members.cache.filter((member) => member.premiumSince).size
								}`,
							].join('\n'),
						},
					)
					.setThumbnail(iconURL({ size: 1024 })),
			],
		});
	}

	@Slash({
		name: 'roles',
		description: 'Shows the roles that are currently available in this server.',
	})
	roles(interaction: ChatInputCommandInteraction) {
		const { guild } = interaction;
		const definedGuild = guild as Guild;
		const { name, roles } = definedGuild;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		const sortedRoles = roles.cache
			.map((role) => role)
			.slice(1, roles.cache.size)
			.sort((a, b) => b.position - a.position);
		const userRoles = sortedRoles.filter((role) => !role.managed);
		const managedRoles = sortedRoles.filter((role) => role.managed);

		// eslint-disable-next-line no-shadow
		const maxDisplayRoles = (roles: Role[], maxFieldLength = 1024) => {
			let totalLength = 0;
			const result = [];

			for (const role of roles) {
				const roleString = `<@&${role.id}>`;

				if (roleString.length + totalLength > maxFieldLength) break;

				totalLength += roleString.length + 1;
				result.push(roleString);
			}

			return result.length;
		};

		return interaction.reply({
			embeds: [
				embed
					.setTitle(`Roles | ${name}`)
					.addFields(
						{
							name: 'User Roles',
							value: `> ${
								userRoles.slice(0, maxDisplayRoles(userRoles)).join(' ') ??
								'None'
							}`,
						},
						{
							name: 'Managed Roles',
							value: `> ${
								managedRoles
									.slice(0, maxDisplayRoles(managedRoles))
									.join(' ') ?? 'None'
							}`,
						},
					)
					.setThumbnail(guild.iconURL({ size: 1024 })),
			],
		});
	}
}
