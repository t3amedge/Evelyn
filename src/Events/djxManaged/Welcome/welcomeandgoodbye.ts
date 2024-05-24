import { replacePlaceholders } from '@/Utils/Helpers/replacePlaceholders';
import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { EmbedInterface } from '@/Schemas/guild';
import { inject, injectable } from 'tsyringe';
import { Discord, On } from 'discordx';
import { Guilds } from '@Services';
import { Evelyn } from '@Evelyn';

@Discord()
@injectable()
export class WelcomingAndGoodbying {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(Guilds) private readonly guildsService: Guilds) {}

	private buildEmbed(embedData: EmbedInterface, member: GuildMember) {
		const message = replacePlaceholders(embedData.content, member);
		const embed = new EmbedBuilder();

		if (embedData?.color) {
			if (/^#[0-9A-Fa-f]{6}$/.test(embedData.color)) embed.setColor(embedData.color);
		}

		if (embedData?.title) embed.setTitle(embedData.title);

		if (embedData?.description)
			embed.setDescription(
				replacePlaceholders(embedData.description, member),
			);

		if (embedData?.author)
			embed.setAuthor({
				name: replacePlaceholders(embedData.author.name, member),
				iconURL: embedData.author.icon_url,
			});

		if (embedData?.footer)
			embed.setFooter({
				text: replacePlaceholders(embedData.footer.text, member),
				iconURL: embedData.footer.icon_url,
			});

		if (embedData.image?.url) embed.setImage(embedData.image?.url);
		if (embedData.thumbnail?.url) embed.setThumbnail(embedData.thumbnail?.url);

		return message ? { message, embed } : { embed };
	}

	@On({ event: 'guildMemberAdd' })
	async welcomer([member]: GuildMember[], client: Evelyn) {
		if (member.partial) await member.fetch();
		const { guild } = member;

		const data = await this.guildsService.getFeatureData(guild.id, 'welcome');
		const channel = await client.channels.fetch(data?.welcome?.channel) as TextChannel;

		if (!data?.welcome?.enabled || !channel || !data?.welcome?.embed)
			return;

		const embedData = this.buildEmbed(data.welcome.embed, member);

		return embedData.message
			? channel.send({
				content: embedData.message,
				embeds: [embedData.embed],
			}) : channel.send({
				embeds: [embedData.embed],
			});
	}

	@On({ event: 'guildMemberRemove' })
	async goodbye(member: GuildMember, client: Evelyn) {
		if (member.partial) await member.fetch();
		const { guild } = member;

		const data = await this.guildsService.getFeatureData(guild.id, 'goodbye');
		const channel = await client.channels.fetch(data?.goodbye?.channel) as TextChannel;

		if (!data?.goodbye?.enabled || !channel || !data?.goodbye?.embed)
			return;

		const embedData = this.buildEmbed(data.goodbye.embed, member);

		return embedData.message
			? channel.send({
				content: embedData.message,
				embeds: [embedData.embed],
			}) : channel.send({
				embeds: [embedData.embed],
			});
	}
}
