import 'reflect-metadata';
import { type EvelynConfigurationOptions, config } from './config.js';
import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits } from "discord.js";
import { Client, DIService } from "discordx";
import { tsyringeDependencyRegistryEngine } from '@discordx/di';
import { container } from 'tsyringe';
import Logger from '@ptkdev/logger';
import { MikroORM } from '@mikro-orm/mongodb';

export class Evelyn extends Client {
    /** The configuration settings of Evelyn. */
    public config: EvelynConfigurationOptions;
    /** The Evelyn logger powered by @ptkdev/logger. */
    public logging: Logger;
    /** The ORM. */
    public orm!: MikroORM;

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
            silent: config.debug?.enableDiscordXDebugLogs ?? false,
            // Reimplement cache options from old code.
            // makeCache:
        });

        this.config = config;

        this.logging = new Logger({
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

        // TODO: Reimplement music manager.

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

    public async launch() {
        if (!this.config.token) {
            console.error('No bot token provided.')
            return process.exit();
        }

        await this.initORM();

        DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
        container.registerInstance(Evelyn, this);

        await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
        await this.login(this.config.token);
    }
}