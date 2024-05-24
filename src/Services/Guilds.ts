import { GuildDB as DB } from '@/Schemas/guild';
import { singleton } from 'tsyringe';

type Feature =
    'antiphishing' |
    'confessions' |
    'logs' |
    'levels' |
    'tickets' |
    'verification' |
    'starboard' |
    'goodbye' |
    'welcome';

@singleton()
export class Guilds {
	public async createData(guildId: string) {
		return await DB.create({ guildId });
	}

	public async wipeGuild(guildId: string) {
		return DB.findOneAndDelete({ guildId });
	}

	public async getFeatureData(guildId: string, feature: Feature) {
		return await DB.findOne({ guildId }).select(feature).lean();
	}

	public updateFeature() {}
}