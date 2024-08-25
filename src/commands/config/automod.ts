import { Evelyn } from "@Evelyn";
import { ApplicationCommandOptionType, AutoModerationActionOptions, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleKeywordPresetType, AutoModerationRuleTriggerType, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Discord, Guild, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { GuildDataManager } from "src/services/guilds";
import { BaseEmbed, ErrorEmbed } from "src/utils/embeds";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
@SlashGroup({ description: "Tailor AutoMod to your needs.", name: 'automod', defaultMemberPermissions: 'Administrator' })
@SlashGroup({ description: "Configure the anti NSFW invite bots module.", name: 'nsfwbots', root: 'automod' })
@SlashGroup({ description: "Configure the anti invite links submodule.", name: 'invitelinks', root: 'automod' })
@SlashGroup({ description: "Configure the anti profanity submodule.", name: 'profanity', root: 'automod' })
@SlashGroup({ description: "Configure the anti sexual content submodule.", name: 'sexualcontent', root: 'automod' })
@SlashGroup({ description: "Configure the anti spam submodule.", name: 'spam', root: 'automod' })
@SlashGroup({ description: "Configure the anti zalgo submodule.", name: 'zalgo', root: 'automod' })
@SlashGroup({ description: "Configure the anti emoji spam submodule.", name: 'emojispam', root: 'automod' })
@SlashGroup({ description: "Configure the anti keyword submodule.", name: 'customkeyword', root: 'automod' })
// only temporary so cmd updates faster
@Guild('925125324616908850')
export class AutoModConfiguration {
    constructor(
        @inject(Evelyn) private readonly client: Evelyn,
        @inject(GuildDataManager) private readonly guild: GuildDataManager,
    ) {}

    @Slash({
        name: 'alertschannel',
        description: 'Sets the channel where all AutoMod alerts will be sent.',
    })
    @SlashGroup('automod')
    async alertschannel(
        @SlashOption({
            name: 'channel',
            description: 'The channel where alerts will be sent.',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
        })
        channel: TextChannel,
        interaction: ChatInputCommandInteraction
    ) {
        await this.guild.update(interaction.guildId as string, {
            'automod.alertsChannel': channel.id,
        });

        return interaction.reply({ 
            embeds: [BaseEmbed().setDescription(`> Channel set. All AutoMod alerts will be sent in ${channel}.`)],
            ephemeral: true,
        });
    }
 
    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('invitelinks', 'automod')
    async automod_invitelinks(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
 
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Invite Links',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                // hello dear source code reader, don't remove this, this is here to prevent an eslint warning
                // as discord only accepts rust regexes
                // eslint-disable-next-line no-useless-escape
                regexPatterns: ['(?:https?://)?(?:www.|ptb.|canary.)?(?:dsc\.gg|invite\.gg|discord\.link|(?:discord\.(?:gg|io|me|li|id))|disboard\.org|discord(?:app)?\.(?:com|gg)/(?:invite|servers))/[a-z0-9-_]+'],
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                invitelinks: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti invite links submodule.' 
    })
    @SlashGroup('invitelinks', 'automod')
    async automod_disableantiinvitelinks(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.invitelinks.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti-invite links submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.invitelinks.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                invitelinks: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti NSFW invite bots submodule.' 
    })
    @SlashGroup('nsfwbots', 'automod')
    async automod_nsfwinvites(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
 
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block NSFW Invite Link Bots',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                // hello dear source code reader, don't remove this, this is here to prevent an eslint warning
                // as discord only accepts rust regexes
                // eslint-disable-next-line no-useless-escape
                regexPatterns: ['(?i)\b(a[s5]+|t[e3]+en|n[s5]+fw|onlyf[a4]+ns?|n[uü]+d[e3]+s?|s[e3]+xc[a@]+m|n[i1]+tro|g[i1]+rls?|s[e3]+x|[e3]g[i1]+rls?|sn[a@]+p[ch]*at|[s5]+nap|p[o0]+rn|@everyone|@here)\b.*?(?:discord\.gg/|discord\.com/invite/).*?\b'],
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                nsfwinvitelinks: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription('> Rule has been created and enabled.')
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti NSFW invite bots submodule.' 
    })
    @SlashGroup('nsfwbots', 'automod')
    async automod_nsfwinvites_disable(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.invitelinks.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti-invite links submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.nsfwinvitelinks.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                nsfwinvitelinks: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription('> Rule has been disabled.')
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('profanity', 'automod')
    async automod_profanity(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Profanity',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,  
                presets: [AutoModerationRuleKeywordPresetType.Profanity, AutoModerationRuleKeywordPresetType.Slurs],
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                profanity: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti profanity submodule.' 
    })
    @SlashGroup('profanity', 'automod')
    async automod_disableantiprofanity(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.profanity.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti-profanity submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.profanity.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                invitelinks: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('sexualcontent', 'automod')
    async automod_sexualcontent(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Sexual Content',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,  
                presets: [AutoModerationRuleKeywordPresetType.SexualContent],
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                sexualcontent: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti sexual content submodule.' 
    })
    @SlashGroup('sexualcontent', 'automod')
    async automod_disablesexualcontent(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.profanity.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti sexual content submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.sexualcontent.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                sexualcontent: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti spam submodule.' 
    })
    @SlashGroup('spam', 'automod')
    async automod_spam(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Spam',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Spam,
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                spam: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti spam submodule.' 
    })
    @SlashGroup('spam', 'automod')
    async automod_disablespam(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.spam.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti spam submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.spam.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                spam: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti zalgo submodule.' 
    })
    @SlashGroup('zalgo', 'automod')
    async automod_zalgo(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,
        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Zalgo Text',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                regexPatterns: ['\\p{M}{3,}']
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                zalgo: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti zalgo submodule.' 
    })
    @SlashGroup('zalgo', 'automod')
    async automod_disablezalgo(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.zalgo.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti zalgo submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.zalgo.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                zalgo: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti zalgo submodule.' 
    })
    @SlashGroup('emojispam', 'automod')
    async automod_emojispam(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,

        @SlashOption({
            name: 'amount',
            description: 'The amount of emojis needed for the message to get flagged.',
            type: ApplicationCommandOptionType.Number,
            required: true,
        })
        amount: number,

        interaction: ChatInputCommandInteraction,
    ) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block Emoji Spam',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                regexPatterns: [
                    `(?s)((<a?:[a-z_0-9]+:[0-9]+>|\\p{Extended_Pictographic}).*){${
						amount + 1
					},}`
                ]
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                emojispam: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti emoji spam submodule.' 
    })
    @SlashGroup('emojispam', 'automod')
    async automod_disableemojispam(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.emojispam.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti emoji spam submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.emojispam.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                emojispam: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti keyword submodule.' 
    })
    @SlashGroup('customkeyword', 'automod')
    async automod_customword(
        @SlashChoice({ name: 'Block Message', value: 'block_message' })
        @SlashChoice({ name: 'Timeout', value: 'timeout' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken against the user.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        action: string,

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
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        const actions: AutoModerationActionOptions[] = [];
 
        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: await guild?.channels.fetch(data?.automod.alertsChannel) as TextChannel,
                },
            })
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            }
        });
 
        const rule = await guild?.autoModerationRules.create({
            name: 'Block a Keyword',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                keywordFilter: [keyword],
            },
            actions,
            enabled: true,
        });

        await this.guild.update(guild?.id as string, {
            automod: {
                customkeyword: {
                    enabled: true,
                    ruleId: rule?.id,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti emoji spam submodule.' 
    })
    @SlashGroup('customword', 'automod')
    async automod_disablecustomword(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod.customword.enabled) return interaction.reply({
            embeds: [ErrorEmbed().setDescription('The anti emoji spam submodule is not enabled.')],
            ephemeral: true,
        });

        await guild?.autoModerationRules.delete(data.automod.customword.ruleId, 'AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            automod: {
                customword: {
                    enabled: false,
                    ruleId: null,
                },
            },
        });
 
        return interaction.reply({ 
            embeds: [
                BaseEmbed()
                    .setDescription(`> Rule has been created and enabled.`)
            ],
        });
    }

    private actionTaken(action: string) {
        switch (action) {
            case 'block_message':
                return AutoModerationActionType.BlockMessage;
            case 'timeout':
                return AutoModerationActionType.Timeout;
            default:
                return AutoModerationActionType.BlockMessage;
        }
    }
}