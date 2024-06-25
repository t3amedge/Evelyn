import 'reflect-metadata';
import { type EvelynConfigurationOptions, config } from './config.js';
import { dirname, importx, resolve } from "@discordx/importer";
import { GatewayIntentBits, Partials } from "discord.js";
import { Client, DIService } from "discordx";
import { tsyringeDependencyRegistryEngine } from '@discordx/di';
import { container } from 'tsyringe';
import Logger from '@ptkdev/logger';
import { MikroORM } from '@mikro-orm/mongodb';

import { SourceLinksRegexes } from 'lavalink-client';
import { ExtendedManager } from './utils/extendedManager.js';

export class Evelyn extends Client {
    /** The configuration settings of Evelyn. */
    public config: EvelynConfigurationOptions = config;
    /** The Evelyn logger powered by @ptkdev/logger. */
    public logging: Logger = new Logger({
        language: 'en',
        colors: true,
        debug: true,
        info: true,
        warning: true,
        error: true,
        sponsor: true,
        type: 'log',
        rotate: {
            size: '10M',
            encoding: 'utf8',
        },
    });
;
    /** The ORM. */
    public orm!: MikroORM;
    /** The Lavalink manager. */
    public LLManager: ExtendedManager;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.User,
                Partials.Channel,
                Partials.Message,
            ],
            silent: config.debug?.enableDiscordXDebugLogs ?? false,
            // Reimplement cache options from old code.
            // makeCache:
        });

        // this is defined only for the lavalink manager
        // since "this" provides the options from the LLManager class
        const client = this;

        this.LLManager = new ExtendedManager({
            nodes: this.config.music.nodes,
            sendToShard: async (guildId, payload) => {
                const guild = await client.guilds.fetch(guildId);
                return guild.shard.send(payload);
            },
            client: {
                id: this.user?.id as string,
                username: this.user?.displayName,
            },
            playerOptions: {
                defaultSearchPlatform: config.music.defaultPlatform,
                onDisconnect: {
                    autoReconnect: true,
                    destroyPlayer: false,
                },
            },
            autoSkip: true,
            autoSkipOnResolveError: true,
            queueOptions: {
                maxPreviousTracks: 1,
            },
            linksBlacklist: [SourceLinksRegexes.YoutubeMusicRegex, SourceLinksRegexes.YoutubeRegex],
            advancedOptions: {
                debugOptions: {
                    noAudio: false
                }
            }
        });

        // TODO: Replace these with Sentry.
        process.on('uncaughtException', (err) => console.log(err))
        process.on('unhandledRejection', (err) => console.log(err))
    }

    private async initORM() {
        this.orm = await MikroORM.init({
            entities: ['./src/entities'],
            dbName: 'test',
            debug: true,
            clientUrl: this.config.database,
        });
    }

    /** Loads the Lavalink music events. */
    private async loadMusicEvents() {
        // this whole function may be jank and requires me to make the compiler ignore the errors
        // but this shit works so it's good enough

        const files = await resolve(`${dirname(import.meta.url)}/events/lavalink/**/*.{ts,js}`);
		for (const file of files) {
			const eventModule = await import(file);
			const event = new eventModule.default();

            // @ts-ignore
			const execute = (...args: string[]) => event.execute(...args, this);
 
            // @ts-ignore
			event.isLLManagerEvent ? this.LLManager.nodeManager.on(event.name, execute) : this.LLManager.on(event.name, execute);

            // @ts-ignore
			this.logging.info(`[Lavalink] Loaded ${event.name}.ts`);
		}
    }

    public async launch() {
        if (!this.config.token) {
            console.error('No bot token provided.')
            return process.exit();
        }

        // TODO: Re-add Sentry telemetry.
        await this.initORM();

        DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
        container.registerInstance(Evelyn, this);

        await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
        
        await this.loadMusicEvents();
        await this.login(this.config.token);
    }
}