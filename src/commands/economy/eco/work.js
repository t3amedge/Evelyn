// eslint-disable-next-line no-unused-vars
const { Client, ChatInputCommandInteraction } = require('discord.js');
const ecoEngine = require('../../../modules/Engines/economyEngine.js');

module.exports = {
	subCommand: 'eco.work',
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const EcoEngine = new ecoEngine(interaction, client);
		await interaction.deferReply();

		return EcoEngine.work();
	},
};
