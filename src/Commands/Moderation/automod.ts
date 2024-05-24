// TODO: Migrate to dashboard.

import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	AutoModerationActionType,
	AutoModerationRuleKeywordPresetType,
	TextChannel,
} from 'discord.js';
import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';

const { BlockMessage } = AutoModerationActionType;
const { MessageSend } = AutoModerationRuleEventType;
const { MentionSpam, KeywordPreset, Spam, Keyword } =
	AutoModerationRuleTriggerType;
const { Profanity, Slurs, SexualContent } = AutoModerationRuleKeywordPresetType;

@Discord()
@SlashGroup({
	name: 'automod',
	description: 'A full auto-moderation system.',
	defaultMemberPermissions: 'Administrator',
})
@SlashGroup('automod')
export class AutoMod {
	@Slash({
		name: 'mentionspam',
		description: 'Blocks message with the provided amount of mentions.',
	})
	async mentionspam(
		@SlashOption({
			name: 'amount',
			description:
				'Provide the amount of mentions that a message can contain before it gets blocked.',
			type: ApplicationCommandOptionType.Number,
			required: true,
		})
			amount: number,
			interaction: ChatInputCommandInteraction,
	) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block mention spam via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: MentionSpam,
			triggerMetadata: {
				mentionTotalLimit: amount,
				mentionRaidProtectionEnabled: true,
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Evelyn has blocked this message due to the heavy amount of mentions. Reduce the amount of mentions and try again.',
					},
				},
			],
			reason: 'AutoMod Mention Spam protection was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | Got it, messages with more than ${amount} mention(s) will now be blocked.`,
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'profanity',
		description: 'Blocks messages that contain profanity and slurs.',
	})
	async profanity(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block profanity via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: KeywordPreset,
			triggerMetadata: {
				presets: [Profanity, Slurs],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it contains profanity and/or slurs.',
					},
				},
			],
			reason: 'AutoMod Profanity + Slur protection was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					'🔹 | Got it, messages with profanity and/or slurs will now be blocked.',
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'sexualcontent',
		description: 'Blocks messages that contain sexual content.',
	})
	async sexualcontent(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block sexual content via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: KeywordPreset,
			triggerMetadata: {
				presets: [SexualContent],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it contains sexual content.',
					},
				},
			],
			reason: 'AutoMod Sexual Content protection was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					'🔹 | Got it, messages that contain sexual content will now be blocked.',
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'spam',
		description: 'Blocks messages that contain spam.',
	})
	async spam(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block spam via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: Spam,
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it has been flagged as spam.',
					},
				},
			],
			reason: 'AutoMod Spam protection was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					'🔹 | Got it, messages that contain spam will now be blocked.',
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'customword',
		description: 'Blocks messages that contain the provided word.',
	})
	async customword(
		@SlashOption({
			name: 'keyword',
			description: 'Provide the word(s) you\'d like to block.',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
			keyword: string,
			interaction: ChatInputCommandInteraction,
	) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block a keyword via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: Keyword,
			triggerMetadata: {
				keywordFilter: [keyword],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it contains a blocked keyword.',
					},
				},
			],
			reason: 'AutoMod Keyword Filter was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | Got it, messages that contain **${keyword}** will now be blocked.`,
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'zalgo',
		description: 'Blocks messages that contain zalgo text.',
	})
	async zalgo(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block zalgo text via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: Keyword,
			triggerMetadata: {
				regexPatterns: ['\\p{M}{3,}'],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it contains zalgo text.',
					},
				},
			],
			reason: 'AutoMod Zalgo filter was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					'🔹 | Got it, messages that contain zalgo text will now be blocked.',
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'emojispam',
		description: 'Blocks messages that contain the provided number of emojis.',
	})
	async emojispam(
		@SlashOption({
			name: 'amount',
			description:
				'Provide the amount of mentions that a message can contain before it gets blocked.',
			type: ApplicationCommandOptionType.Number,
			required: true,
		})
			amount: number,
			interaction: ChatInputCommandInteraction,
	) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block emoji spam via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: Keyword,
			triggerMetadata: {
				regexPatterns: [
					`(?s)((<a?:[a-z_0-9]+:[0-9]+>|\\p{Extended_Pictographic}).*){${
						amount + 1
					},}`,
				],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage: `Overwatch has blocked this message because it contains too many emotes. You can only include ${amount} of emotes in a single message.`,
					},
				},
			],
			reason: 'AutoMod Emote Spam filter was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | Got it, messages that contain ${amount} emote(s) will now be blocked.`,
				),
			],
			ephemeral: true,
		});
	}

	@Slash({
		name: 'invitelinks',
		description: 'Blocks messages that contain server invite links.',
	})
	async invitelinks(interaction: ChatInputCommandInteraction) {
		const { guild, channel } = interaction;
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		await guild.autoModerationRules.create({
			name: 'Block invite links via Evelyn',
			enabled: true,
			eventType: MessageSend,
			triggerType: Keyword,
			triggerMetadata: {
				regexPatterns: [
					'(?:(?:https?://)?(?:www)?discord(?:app)?\\.(?:(?:com|gg|me)/invite/[a-z0-9-_]+)|(?:https?://)?(?:www)?discord\\.(?:gg|me)/[a-z0-9-_]+)|(?:https?://)?(?:www)?dsc\\.gg/[a-z0-9-_]+',
				],
			},
			actions: [
				{
					type: BlockMessage,
					metadata: {
						channel: channel as TextChannel,
						customMessage:
							'Overwatch has blocked this message because it contains a Discord invite link.',
					},
				},
			],
			reason: 'AutoMod Invite Link filter was enabled via Evelyn.',
		});

		return interaction.reply({
			embeds: [
				embed.setDescription(
					'🔹 | Got it, messages that contain invite links will now be blocked.',
				),
			],
			ephemeral: true,
		});
	}
}
