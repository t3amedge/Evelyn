import type {
	ExtendedChatInteraction,
} from '../../Interfaces/Interfaces.js';
import { ActionRowBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import {
	Discord,
	Slash,
	SlashGroup,
    ModalComponent,
} from 'discordx';
import { Evelyn } from '../../Evelyn.js';
import { webhookDelivery } from '../../Utils/Utils/webhookDelivery.js';
import { isTimeStringValid } from 'discord-giveaways-super';

@Discord()
@SlashGroup({
    name: 'giveaway',
	description: 'A complete giveaway system.',
})
@SlashGroup('giveaway')
export class Giveaway {
	@Slash({
		name: 'start',
		description: 'Starts a giveaway.',
	})
	async start(interaction: ExtendedChatInteraction) {
        const timeRow = new ActionRowBuilder<TextInputBuilder>()
        .addComponents(
            new TextInputBuilder()
            .setCustomId('time')
            .setLabel('How long should the giveaway last?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1),
        )

        const winnerRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('winnersCount')
                .setLabel('How many winners should it have?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
            )

        const prizeRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('prize')
                .setLabel('What\'s the prize of the giveaway?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
            )

        const modal = new ModalBuilder()
            .setCustomId('giveawayModal')
            .setTitle('Start a Giveaway')
            .setComponents(timeRow, winnerRow, prizeRow);

        await interaction.showModal(modal);
	}

    @ModalComponent()
	async giveawayModal(interaction: ModalSubmitInteraction, client: Evelyn) {
		const { fields, channel, guildId, user } = interaction;
		const time = fields.getTextInputValue('time');
        const prize = fields.getTextInputValue('prize');
        const winnersCount = Number(fields.getTextInputValue('winnersCount'));
        const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

        if (channel.type !== ChannelType.GuildText) return interaction.reply({
            embeds: [embed.setDescription('🔹 | The giveaway channel must be a text channel.')],
            ephemeral: true,
        });

        if (!isTimeStringValid(time)) return interaction.reply({
            embeds: [embed.setDescription('🔹 | The specified time is not valid.')],
            ephemeral: true,
        });

        await client.giveaways.start({
            channelID: channel.id,
            guildID: guildId,
            hostMemberID: user.id,
            prize,
            time,
            winnersCount,
            defineEmbedStrings(giveaway, giveawayHost) {
                return {
                    joinGiveawayMessage: {
                        color: 'Blurple',
                        description: '🔹 | Entry registered, you have successfully entered the giveaway!',
                        timestamp: Date.now(),
                    },
    
                    leaveGiveawayMessage: {
                        color: 'Blurple',
                        description: '🔹 | Entry revoked, you have successfully left the giveaway!',
                        timestamp: Date.now(),
                    },
    
                    start: {
                        messageContent: '🎉 **A wild giveaway has appeared!** 🎉',
                        title: giveaway.prize,
                        description: `**Hosted by:** ${giveawayHost}\n**Ends in:** <t:${giveaway.endTimestamp}> (<t:${giveaway.endTimestamp}}:R>)\nWinners: ${giveaway.winnersCount} winner(s)`,
                    },
    
                    // defining all messages that are related
                    // to giveaway finish
                    finish(mentionsString, winnersCount) {
                        return {
                            endMessage: {
                                color: 'Blurple',
                                description: `🔹 | Congratulations ${mentionsString} on winning!`,
                                timestamp: Date.now(),
                            },
    
                            newGiveawayMessage: {
                                messageContent: '🎉 **The giveaway has disappeared.** 🎉',
    
                                title: giveaway.prize,
                                description: `**Hosted by:** ${giveawayHost}\n**Ends in:** <t:${giveaway.endTimestamp}> (<t:${giveaway.endTimestamp}}:R>)\nEntries: **${giveaway.entriesCount}**\n` +
                                    `${giveaway.winnersCount == 1 ? 'Winner' : `Winners **(${winnersCount})**`}: ${mentionsString} `,
    
                                footer: 'Ended at:',
                                timestamp: giveaway.endedTimestamp
                            },
    
                            noWinnersNewGiveawayMessage: {
                                messageContent: '🎉 **The giveaway has disappeared.** 🎉',
    
                                title: giveaway.prize,
                                description: `🔹 | Unfortunately, no one has won. ☹️`,
    
                                footer: 'Ended at:',
                                timestamp: giveaway.endedTimestamp,
                            },
    
                            // the new separated message that the giveaway message in giveaway channel
                            // will be changed to after the giveaway is finished with no winners (embeds may also be used here)
                            noWinnersEndMessage: {
                                messageContent: `Unfortunetly, there are no winners in the **${giveaway.prize}** giveaway.`
                                // ... (other properties)
                            }
                        }
                    },
    
                    // defining all messages that are related
                    // to rerolling the giveaway winners
                    reroll(mentionsString, winnersCount) {
                        return {
                            // this ephemeral reply will be sent when they're not a host
                            // of the giveaway and trying to reroll the winners (embeds may also be used here)
                            onlyHostCanReroll: {
                                messageContent: ':x: | Only host of this giveaway can reroll the winners.'
                                // ... (other properties)
                            },
    
                            // the new message that the giveaway message in giveaway channel will be changed to
                            // after the reroll
                            newGiveawayMessage: {
                                messageContent: ':tada: **GIVEAWAY FINISHED!** :tada:',
    
                                title: `Giveaway (ID: ${giveaway.id})`,
                                description: `There was no winners in "**${giveaway.prize}**" giveaway!`,
    
                                footer: `Ended at:`,
                                timestamp: giveaway.endedTimestamp,
                                // ... (other properties)
                            },
    
                            // this message will be sent separately in the giveaway channel after the reroll
                            // used to mention the new giveaway winners (embeds may also be used here)
                            rerollMessage: {
                                messageContent: `${giveaway.winnersCount == 1 ? 'New winner is' : 'New winners are'} ` +
                                    `${mentionsString}, congratulations!`
                                // ... (other properties)
                            },
    
                            // this ephemeral reply will be sent after the successful reroll (embeds may also be used here)
                            successMessage: {
                                messageContent: ':white_check_mark: | Successfully rerolled the winners!'
                                // ... (other properties)
                            }
                        }
                    }
                }
            },
            buttons: {
                // the "join giveaway" button to attach on the initial giveaway message
                joinGiveawayButton: {
                    text: 'Join the giveaway',
                    emoji: '🎉', // either an emoji or custom emoji ID is acceptable
                    style: ButtonStyle.Primary
                },

                // the "reroll" button to attach on the separated giveaway end message
                rerollButton: {
                    text: 'Reroll Winners',
                    emoji: '🔁', // either an emoji or custom emoji ID is acceptable
                    style: ButtonStyle.Primary
                },

                // the "go to nessage" link button to attach on the separated giveaway end message
                // that will bring to the initial giveaway message
                goToMessageButton: {
                    text: 'Go to Message',
                    emoji: '↗️' // either an emoji or custom emoji ID is acceptable
                }
            }
        })

		return await interaction.deferUpdate();
	}
}
