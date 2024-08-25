import { ApplicationCommandOptionType, AutoModerationActionOptions, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleKeywordPresetType, AutoModerationRuleTriggerType, AutoModerationTriggerMetadataOptions, ChannelType, ChatInputCommandInteraction, Role, TextChannel } from "discord.js";
import { Discord, Guild, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { BaseEmbed, ErrorEmbed } from "src/utils/embeds";
import { GuildDataManager } from "src/services/guilds";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
@SlashGroup({ description: "Tailor AutoMod to your needs.", name: 'automod', defaultMemberPermissions: 'Administrator' })
@SlashGroup({ description: "Manage an AutoMod rule.", name: "manage", root: "automod" })
@SlashGroup({ description: "Configure the anti NSFW invite bots submodule.", name: 'nsfwbots', root: 'automod' })
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
    constructor(@inject(GuildDataManager) private readonly guild: GuildDataManager) {}

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

        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription(`> Channel set. All AutoMod alerts will be sent in ${channel}.`)],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'exemptchannel',
        description: 'Add/remove a channel exempt from the specified AutoMod rule.',
    })
    @SlashGroup('manage', 'automod')
    async automod_exemptchannel(
        @SlashChoice({ name: 'Add', value: 'add' })
        @SlashChoice({ name: 'Remove', value: 'remove' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken.',
            type: ApplicationCommandOptionType.String,
            required: true
        })
        action: string,

        @SlashChoice({ name: 'Anti NSFW Bots', value: 'nsfwinvitelinks' })
        @SlashChoice({ name: 'Anti Invite Links', value: 'invitelinks' })
        @SlashChoice({ name: 'Anti Profanity', value: 'profanity' })
        @SlashChoice({ name: 'Anti Sexual Content', value: 'sexualcontent' })
        @SlashChoice({ name: 'Anti Spam', value: 'spam' })
        @SlashChoice({ name: 'Anti Zalgo', value: 'zalgo' })
        @SlashChoice({ name: 'Anti Emoji Spam', value: 'emojispam' })
        @SlashChoice({ name: 'Anti Keyword (Custom)', value: 'customkeyword' })
        @SlashOption({
            name: 'submodule',
            description: 'The submodule you\'d like to manage.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        submodule: AutoModSubmodules,

        @SlashOption({
            name: 'channel',
            description: 'The channel exempt from the selected AutoMod rule.',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
        })
        channel: TextChannel,

        interaction: ChatInputCommandInteraction
    ) {
        const data = await this.guild.getFeature(interaction.guildId as string, 'automod');
        const autoModerationRules = await interaction.guild?.autoModerationRules.fetch();
        const rule = autoModerationRules?.map((rule) => rule).filter((rule) => rule.id === data?.automod[submodule].ruleId)[0];

        switch (action) {
            case 'add': {
                if (rule?.exemptChannels.has(channel.id)) return interaction.reply({
                    embeds: [ErrorEmbed().setDescription('> This channel is already exempt from this rule.')],
                    ephemeral: true,
                });
        
                rule?.edit({
                    exemptChannels: [channel, ...rule.exemptChannels.map((ch) => ch.id)],
                    reason: 'A channel has been exempted from this rule via /automod manage exemptchannel add.'
                });
        
                return interaction.reply({ 
                    embeds: [BaseEmbed().setDescription('> The selected channel is no longer exempt from the AutoMod rule.')],
                    ephemeral: true,
                });
            }

            case 'remove': {
                if (!rule?.exemptChannels.has(channel.id)) return interaction.reply({
                    embeds: [ErrorEmbed().setDescription('> This channel isn\'t exempted from this rule.')],
                    ephemeral: true,
                });

                rule?.edit({
                    exemptChannels: rule.exemptChannels.filter((exChannel) => exChannel.id !== channel.id),
                    reason: 'A channel has been removed from the exemptions of this rule via /automod manage exemptchannel remove.'
                });
        
                return interaction.reply({ 
                    embeds: [BaseEmbed().setDescription('> The selected channel is now exempt from the AutoMod rule.')],
                    ephemeral: true,
                });
            }
        }
    }

    @Slash({
        name: 'exemptrole',
        description: 'Add/remove a role exempt from the specified AutoMod rule.',
    })
    @SlashGroup('manage', 'automod')
    async automod_roleexempt(
        @SlashChoice({ name: 'Add', value: 'add' })
        @SlashChoice({ name: 'Remove', value: 'remove' })
        @SlashOption({
            name: 'action',
            description: 'The action that will be taken.',
            type: ApplicationCommandOptionType.String,
            required: true
        })
        action: string,

        @SlashChoice({ name: 'Anti NSFW Bots', value: 'nsfwinvitelinks' })
        @SlashChoice({ name: 'Anti Invite Links', value: 'invitelinks' })
        @SlashChoice({ name: 'Anti Profanity', value: 'profanity' })
        @SlashChoice({ name: 'Anti Sexual Content', value: 'sexualcontent' })
        @SlashChoice({ name: 'Anti Spam', value: 'spam' })
        @SlashChoice({ name: 'Anti Zalgo', value: 'zalgo' })
        @SlashChoice({ name: 'Anti Emoji Spam', value: 'emojispam' })
        @SlashChoice({ name: 'Anti Keyword (Custom)', value: 'customkeyword' })
        @SlashOption({
            name: 'submodule',
            description: 'The submodule you\'d like to manage.',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        submodule: AutoModSubmodules,

        @SlashOption({
            name: 'role',
            description: 'The role exempt from the selected AutoMod rule.',
            type: ApplicationCommandOptionType.Role,
            required: true,
        })
        role: Role,

        interaction: ChatInputCommandInteraction
    ) {
        const data = await this.guild.getFeature(interaction.guildId as string, 'automod');
        const autoModerationRules = await interaction.guild?.autoModerationRules.fetch();
        const rule = autoModerationRules?.map((rule) => rule).filter((rule) => rule.id === data?.automod[submodule].ruleId)[0];

        switch (action) {
            case 'add': {
                if (rule?.exemptRoles.has(role.id)) return interaction.reply({
                    embeds: [ErrorEmbed().setDescription('> This role is already exempt from this rule.')],
                    ephemeral: true,
                });
        
                rule?.edit({
                    exemptRoles: [role, ...rule.exemptRoles.map((rl) => rl.id)],
                    reason: 'A role has been exempted from this rule via /automod manage exemptrole add.'
                });
        
                return interaction.reply({ 
                    embeds: [BaseEmbed().setDescription('> The selected role is now exempt from the AutoMod rule.')],
                    ephemeral: true,
                });
            }

            case 'remove': {
                if (!rule?.exemptRoles.has(role.id)) return interaction.reply({
                    embeds: [ErrorEmbed().setDescription('> This role isn\'t exempted from this rule.')],
                    ephemeral: true,
                });

                rule?.edit({
                    exemptRoles: rule.exemptRoles.filter((exRole) => exRole.id !== role.id),
                    reason: 'A role has been removed from the exemptions of this rule via /automod manage exemptrole remove.'
                });
        
                return interaction.reply({ 
                    embeds: [BaseEmbed().setDescription('> The selected role has been removed from the AutoMod rule exemptions.')],
                    ephemeral: true,
                });
            }
        }
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('invitelinks', 'automod')
    async automod_antiinvitelinks_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Invite Links',
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                // hello dear source code reader, don't remove this, this is here to prevent an eslint warning
                // as discord only accepts rust regexes
                // eslint-disable-next-line no-useless-escape
                regexPatterns: ['(?:https?://)?(?:www.|ptb.|canary.)?(?:dsc\.gg|invite\.gg|discord\.link|(?:discord\.(?:gg|io|me|li|id))|disboard\.org|discord(?:app)?\.(?:com|gg)/(?:invite|servers))/[a-z0-9-_]+'],
            },
            action,
            submodule: 'invitelinks',
        });
 
        if (!interaction.replied)  return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti invite links submodule.' 
    })
    @SlashGroup('invitelinks', 'automod')
    async automod_antiinvitelinks_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'invitelinks' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti NSFW invite bots submodule.' 
    })
    @SlashGroup('nsfwbots', 'automod')
    async automod_antinsfwinvites_enable(
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
        await this.createRule({
            interaction,
            name: 'Block NSFW Invite Link Bots',
            triggerType: AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                // hello dear source code reader, don't remove this, this is here to prevent an eslint warning
                // as discord only accepts rust regexes
                // eslint-disable-next-line no-useless-escape
                regexPatterns: ['(?i)\b(a[s5]+|t[e3]+en|n[s5]+fw|onlyf[a4]+ns?|n[uü]+d[e3]+s?|s[e3]+xc[a@]+m|n[i1]+tro|g[i1]+rls?|s[e3]+x|[e3]g[i1]+rls?|sn[a@]+p[ch]*at|[s5]+nap|p[o0]+rn|@everyone|@here)\b.*?(?:discord\.gg/|discord\.com/invite/).*?\b'],
            },
            action,
            submodule: 'nsfwinvitelinks',
        });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti NSFW invite bots submodule.' 
    })
    @SlashGroup('nsfwbots', 'automod')
    async automod_antinsfwinvites_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'nsfwinvitelinks' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('profanity', 'automod')
    async automod_antiprofanity_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Profanity',
            triggerType: AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                presets: [AutoModerationRuleKeywordPresetType.Profanity, AutoModerationRuleKeywordPresetType.Slurs],
            },
            action,
            submodule: 'profanity',
        });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti profanity submodule.' 
    })
    @SlashGroup('profanity', 'automod')
    async automod_antiprofanity_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'profanity' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti invite links submodule.' 
    })
    @SlashGroup('sexualcontent', 'automod')
    async automod_antisexualcontent_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Sexual Content',
            triggerType: AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                presets: [AutoModerationRuleKeywordPresetType.SexualContent],
            },
            action,
            submodule: 'sexualcontent',
        });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti sexual content submodule.' 
    })
    @SlashGroup('sexualcontent', 'automod')
    async automod_antisexualcontent_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'sexualcontent' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti spam submodule.' 
    })
    @SlashGroup('spam', 'automod')
    async automod_antispam_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Spam',
            triggerType: AutoModerationRuleTriggerType.Spam,
            action,
            submodule: 'spam',
        });

        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti spam submodule.' 
    })
    @SlashGroup('spam', 'automod')
    async automod_antispam_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'spam' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti zalgo submodule.' 
    })
    @SlashGroup('zalgo', 'automod')
    async automod_zalgo_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Zalgo Text',
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                regexPatterns: ['\\p{M}{3,}'],
            },
            action,
            submodule: 'zalgo',
        });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti zalgo submodule.' 
    })
    @SlashGroup('zalgo', 'automod')
    async automod_zalgo_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'zalgo' });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti emoji spam submodule.' 
    })
    @SlashGroup('emojispam', 'automod')
    async automod_emojispam_enable(
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
        await this.createRule({
            interaction,
            name: 'Block Emoji Spam',
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                regexPatterns: [`(?s)((<a?:[a-z_0-9]+:[0-9]+>|\\p{Extended_Pictographic}).*){${amount},}`],
            },
            action,
            submodule: 'emojispam',
        });

        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti emoji spam submodule.' 
    })
    @SlashGroup('emojispam', 'automod')
    async automod_emojispam_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'emojispam' });

        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'enable',
        description: 'Enables the anti keyword submodule.' 
    })
    @SlashGroup('customkeyword', 'automod')
    async automod_anticustomkeyword_enable(
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
        await this.createRule({
            interaction,
            name: 'Block a Keyword',
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                keywordFilter: [keyword],
            },
            action,
            submodule: 'customkeyword',
        });
 
        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully created and activated.')],
            ephemeral: true,
        });
    }

    @Slash({
        name: 'disable',
        description: 'Disables the anti emoji spam submodule.' 
    })
    @SlashGroup('customkeyword', 'automod')
    async automod_anticustomkeyword_disable(interaction: ChatInputCommandInteraction) {
        await this.deleteRule({ interaction, submodule: 'customkeyword' });

        if (!interaction.replied) return interaction.reply({ 
            embeds: [BaseEmbed().setDescription('> Rule successfully disabled and removed.')],
            ephemeral: true,
        });
    }

    private async createRule({
        interaction,
        name,
        triggerMetadata,
        triggerType,
        action,
        submodule,
    }: {
        interaction: ChatInputCommandInteraction,
        name: string,
        triggerType: AutoModerationRuleTriggerType,
        triggerMetadata?: AutoModerationTriggerMetadataOptions | undefined,
        action: string,
        submodule: AutoModSubmodules,
    }) {
        const { guild, channel } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (data?.automod?.[submodule]?.enabled) {
            return interaction.reply({
                embeds: [ErrorEmbed().setDescription('> This rule is already enabled.')],
                ephemeral: true,
            });
        }
            
        const actions: AutoModerationActionOptions[] = [];

        if (data?.automod.alertsChannel) {
            actions.push({
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: data.automod.alertsChannel,
                },
            });
        };
 
        actions.push({
            type: this.actionTaken(action),
             
            metadata: {
                channel: channel as TextChannel,
            },
        });
 
        const rule = await guild?.autoModerationRules.create({
            name,
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType,
            triggerMetadata,
            actions,
            enabled: true,
        });

        return await this.guild.update(guild?.id as string, {
            [`automod.${submodule}`]: {
                enabled: true,
                ruleId: rule?.id,
            },
        });
    }

    private async deleteRule({
        interaction,
        submodule,
    }: {
        interaction: ChatInputCommandInteraction,
        submodule: AutoModSubmodules,
    }) {
        const { guild } = interaction;
        const data = await this.guild.getFeature(guild?.id as string, 'automod');

        if (!data?.automod?.[submodule]?.enabled) {
            return interaction.reply({
                embeds: [ErrorEmbed().setDescription('> This rule is already disabled.')],
                ephemeral: true,
            });
        }
 
        await guild?.autoModerationRules.delete(data.automod[submodule].ruleId, 'This AutoMod rule has been disabled.')

        await this.guild.update(guild?.id as string, {
            [`automod.${submodule}`]: {
                enabled: false,
                ruleId: null,
            },
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

type AutoModSubmodules = 
    'invitelinks' |
    'nsfwinvitelinks' |
    'profanity' |
    'sexualcontent' |
    'spam' |
    'zalgo' |
    'emojispam' |
    'customkeyword';
