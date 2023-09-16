const momentTimezone = require("moment-timezone")
const { MessageCollector, InteractionCollector } = require('discord.js')
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const Guild = require('../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Sends a reminder to play Valorant')
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('The hour to play at.')
                .setRequired(true)
                .setMaxValue(12)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('The minutes of what hour to play at.')
                .setRequired(true)
                .setMaxValue(59)
                .setMinValue(0))
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('amorpm')
                .setDescription('Choose AM or PM.')
                .setRequired(true)
                .addChoices(
                    {name: 'AM', value: 'AM'},
                    {name: 'PM', value: 'PM'},
                )),
            
   
    async execute(interaction) {
        const hour = interaction.options.getInteger('hour');
        const minutes = interaction.options.getInteger('minutes');
        const timeType = interaction.options.getString('amorpm');

        // buttons 
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Primary);
        
        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);
        
        const response = await interaction.reply({
            content: `Are you sure you want to play at ${hour}:${minutes} ${timeType}?`,
            components: [row],
        });

        const [guild] = await Guild.findOrCreate({where: {id: interaction.guild.id}})

        // message will always be sent to #val channel so hard code the channel id
        await guild.update({playChannelId: '1150870969670434836'});
        await guild.update({playHour: hour});
        await guild.update({playMinutes: minutes});
        await guild.update({AMorPM: timeType});

        // filter so that only the person who triggered the message will be able to interact
        const collectorFilter = i => i.user.id === interaction.user.id;

        // try catch for if the person doesn't respond to the message
        try {
            const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 30000});
            if (confirmation.customId === 'confirm') {
                await confirmation.update({content: `Message scheduled at ${hour}:${minutes} ${timeType}!`, components: []});
            }
            else if (confirmation.customId === 'cancel') {
                await confirmation.update({content: 'Cancelled.', components: []});
            }

        } catch (e) {
            await interaction.editReply({ content: 'Confirmation not received within 30 seconds, cancelling.', components: []});

        }

    }

    
}