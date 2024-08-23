import { Evelyn } from "@Evelyn";
import { ApplicationCommandOptionType, AutoModerationActionOptions, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Discord, Guild, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { GuildDataManager } from "src/services/guilds";
import { BaseEmbed, ErrorEmbed } from "src/utils/embeds";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
@SlashGroup({ description: "Tailor AutoMod to your needs.", name: 'automod', defaultMemberPermissions: 'Administrator' })
@SlashGroup({ description: "Configure the anti NSFW invite bots module.", name: 'nsfwbots', root: 'automod' })
@SlashGroup({ description: "Configure the Anti Invite Links module.", name: 'invitelinks', root: 'automod' })
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
        console.log(interaction.guildId);

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

    actionTaken(action: string) {
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