import { Evelyn } from '@Evelyn';

import { GuardFunction, ArgsOf } from 'discordx';
import { Blacklist } from 'src/entities/blacklist.entity';

import type {
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    CommandInteraction,
    ContextMenuCommandInteraction,
    MentionableSelectMenuInteraction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from 'discord.js';
import { ErrorEmbed } from 'src/utils/embeds';
import { Guilds } from 'src/entities/guild.entity';

/** Checks to see if the user is blacklisted or not. */
export const isBlacklisted: GuardFunction<ArgsOf<"interactionCreate">> = async (interaction, _client, next) => {
    const int = interaction[0] as
        | ButtonInteraction
        | ChannelSelectMenuInteraction
        | CommandInteraction
        | ContextMenuCommandInteraction
        | MentionableSelectMenuInteraction
        | ModalSubmitInteraction
        | RoleSelectMenuInteraction
        | StringSelectMenuInteraction
        | UserSelectMenuInteraction;

    const client = _client as Evelyn;

    if (int.user.partial) await int.user.fetch();

    const orm = client.orm.em.fork();
    const [userData, guildData] = await Promise.all([
        await orm.findOne(Blacklist, { userId: int.user.id }),
        await orm.findOne(Guilds, {
            guildId: int.guildId,
            blacklist: {
                isBlacklisted: true,
            }
        }),
    ])

    if (userData) return int.reply({
        embeds: [
            ErrorEmbed()
                .setTitle('Request Blocked')
                .setDescription('Your account is blacklisted indefinitely. You can see the reason and time this has occured below this message.')
                .addFields(
                    {
                        name: 'Reason',
                        value: `> ${userData?.reason}`,
                        inline: true,
                    },
                    {
                        name: 'Time',
                        value: `> <t:${userData?.time}:R>`,
                        inline: true,
                    },
                )
        ],
        ephemeral: true,
    });

    if (guildData) return int.reply({
        embeds: [
            ErrorEmbed()
                .setTitle('Request Blocked')
                .setDescription('This guild is blacklisted indefinitely. You can see the reason and time this has occured below this message.')
                .addFields(
                    {
                        name: 'Reason',
                        value: `> ${guildData?.blacklist.reason}`,
                        inline: true,
                    },
                    {
                        name: 'Time',
                        value: `> <t:${guildData?.blacklist.time}:R>`,
                        inline: true,
                    },
                )
        ],
        ephemeral: true,
    });

    next();
};

