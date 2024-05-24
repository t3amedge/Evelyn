import { bakeUnixTimestamp } from '@Helpers/messageHelpers.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { Discord, Slash, Guild } from 'discordx';
import { inject, injectable } from 'tsyringe';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import { cpus, platform } from 'os';
import { config } from '@Config';
import { Evelyn } from '@Evelyn';
import mongoose from 'mongoose';

@Discord()
@injectable()
@Guild(config.debug.devGuild)
export class Status {
	constructor(@inject(Evelyn) private readonly client: Evelyn) {}

	@Slash({
		description: 'Shows the bot\'s status.',
		name: 'status',
	})
	async status(interaction: ChatInputCommandInteraction) {
		const { application, ws, user, guilds, readyAt } = this.client;

		const uptime = Math.floor(readyAt.getTime() / 1000);
		const model = cpus()[0].model;
		const cores = cpus().length;
		const systemPlatform = platform()
			.replace('win32', 'Windows')
			.replace('linux', 'Linux');
		const createdTime = bakeUnixTimestamp(user.createdTimestamp);

		if (application.partial) await application.fetch();

		return interaction.reply({
			embeds: [
				EvieEmbed()
					.setTitle(`${user.username} | Status`)
					.addFields(
						{
							name: '**WebSocket Ping**',
							value: `${ws.ping}ms`,
							inline: true,
						},
						{
							name: '**Uptime**',
							value: `<t:${uptime}:R>`,
							inline: true,
						},
						{
							name: '**Database**',
							value: `${this.switchTo(mongoose.connection.readyState)}`,
							inline: true,
						},
						{
							name: '**Connected to**',
							value: `${guilds.cache.size} servers`,
							inline: true,
						},
						{
							name: '**Active since**',
							value: `<t:${createdTime}:R>`,
							inline: true,
						},
						{
							name: '**Owner**',
							value: `${application.owner ?? 'None'}`,
							inline: true,
						},
						{
							name: '**OS**',
							value: systemPlatform,
							inline: true,
						},
						{
							name: '**CPU**',
							value: `${model} with ${cores} cores`,
							inline: true,
						},
					)
					.setThumbnail(user.avatarURL()),
			],
		});
	}

	/** Determines the value of the current database connection status. */
	private switchTo(val: number) {
		switch (val) {
		case 0:
			return '🟥 Disconnected';
		case 1:
			return '🔷 Connected';
		case 2:
			return '🟨 Connecting';
		case 3:
			return '🟨 Disconnecting';
		default:
			break;
		}
	}
}