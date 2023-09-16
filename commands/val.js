const {  ActionRowBuilder, SlashCommandBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val')
        .setDescription('Val poll'),
    async execute(interaction) {
        const yesButton = new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('<:sideeye:1109010092499673088>');
        
        const row = new ActionRowBuilder()
            .addComponents(yesButton);
        const response = await interaction.reply({
            content: `Val?`,
            components:[row],
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 30000});
            if (confirmation.customId === 'yes') {
                await confirmation.update({content: `nice`, components: []});
            }

        } catch (e) {
            await interaction.editReply({ content: 'Answer not received within 30 seconds.', components: []});

        }

    },
};