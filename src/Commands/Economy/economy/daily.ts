import { EcoUtils } from '../../../Modules/Utils/economyUtils';
import { Subcommand } from '../../../interfaces/interfaces';
import { ChatInputCommandInteraction } from 'discord.js';
import { Evelyn } from '../../../structures/Evelyn.js';

const subCommand: Subcommand = {
	subCommand: 'economy.daily',
	execute(interaction: ChatInputCommandInteraction, client: Evelyn) {
		const utils = new EcoUtils(interaction, client);
		return utils.collectDaily();
	},
};

export default subCommand;
