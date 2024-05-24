/**
 * The utilities used for the moderation logs system of Evelyn.
 * This code is here to reduce clutter.
 */

import { SecureStorage } from './secureStorage.js';
import { Guilds as DB } from '@Schemas';
import {
	ActionRowBuilder,
	AuditLogEvent,
	ButtonBuilder,
	EmbedBuilder,
	Guild,
	WebhookClient,
} from 'discord.js';
import { Evelyn } from '@Evelyn';

/**
 * Searches the guild's audit log to retrieve information about who did what.
 * @param type The type of event.
 * @param guild The guild.
 * @returns The latest audit log entry regarding the specified event.
 */
export async function getAuditLog({ type, guild }: { type: AuditLogEvent, guild: Guild }) {
	const fetchLogs = await guild.fetchAuditLogs({
		type,
		limit: 1,
	});

	return fetchLogs.entries.first();
}

/**
 * Delivers mod logs via Discord Webhooks.
 * @param guild The guild's ID.
 * @param client The Evelyn object.
 * @param embed The embed object.
 * @param components The components object used for Buttons and stuff.
 * @returns The message that was sent via the webhook.
 */
export async function send({
	guild,
	client,
	embed,
	components,
}: {
	guild: string,
	client: Evelyn,
	embed: EmbedBuilder,
	components?: ActionRowBuilder<ButtonBuilder>
}) {
	const data = await DB.findOne({
		guildId: guild,
	}).select('logs.webhook').lean();

	if (!data?.logs?.webhook.token) return;
	const secureStorage = new SecureStorage();

	const decryptedToken = secureStorage.decrypt(
		data?.logs?.webhook.token,
		client,
	);

	const logsDropOff = new WebhookClient({
		id: data?.logs?.webhook?.id,
		token: decryptedToken,
	});

	if (components?.components[0]?.data?.label === 'Jump to Message')
		return logsDropOff.send({
			embeds: [embed],
			components: [components],
		});
	else
		return logsDropOff.send({
			embeds: [embed],
		});
}
