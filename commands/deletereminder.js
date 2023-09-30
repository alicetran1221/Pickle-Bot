const momentTimezone = require("moment-timezone")
const { MessageCollector, InteractionCollector, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events} = require('discord.js');
const Guild = require('../models/guild');
const Sequelize = require('sequelize');
//const { valChannelId, testChannelId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletereminder')
        .setDescription('Allows user to delete a reminder.')
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('The hour of the scheduled time to delete.')
                .setRequired(true)
                .setMaxValue(12)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('The minutes of the scheduled time to delete.')
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

        let userHour;
        if (timeType === 'PM' && hour !== 12) {
            userHour = 12 + hour;
        }
        else if (timeType === 'AM' && hour === 12) {
            userHour = 0;
        }
        else {
            userHour = hour;
        }

        let laCurrentDate = momentTimezone().tz('America/Los_Angeles');
        laCurrentDate.set({hour: userHour, minute: minutes, second: 0, millisecond: 0}); 

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

        let content;
        if (minutes < 10) {
            content = `Are you sure you want to delete the reminder at ${hour}:0${minutes} ${timeType}?`
        }
        else {
            content = `Are you sure you want to delete the reminder at ${hour}:${minutes} ${timeType}?`
        }
        
        const response = await interaction.reply(
        {
            content: content,
            components: [row],
        });
       
        // filter so that only the person who triggered the message will be able to interact
        const collectorFilter = i => i.user.id === interaction.user.id;

        // try catch for if the person doesn't respond to the message
        try {
            const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 30000});
            if (confirmation.customId === 'confirm') {

                try {
                    const deletedReminder = await Guild.findOne({
                        where: {
                            playDate: {
                                [Sequelize.Op.eq]: laCurrentDate.toDate(),
                            },
                        },
                    });
                    
                    if (deletedReminder) {
                        await deletedReminder.destroy();
                    }
                    else {
                        await confirmation.update({content: `No reminder at this time was found.`, components: []});
                        return;
                    }
                } catch (error) {
                    console.error('Error deleting expired records: ', error);
                    return;
                }

                
                if (minutes < 10) {
                    await confirmation.update({content: `Reminder at ${hour}:0${minutes} ${timeType} deleted.`, components: []});
                }
                else {
                    await confirmation.update({content: `Reminder at ${hour}:${minutes} ${timeType} deleted.`, components: []});
                }
            }
            else if (confirmation.customId === 'cancel') {
                //TODO: do something here if user chooses to cancel such as not add to database
                await confirmation.update({content: 'Cancelled.', components: []});
            }

        } catch (e) {
            await interaction.editReply({ content: 'Confirmation not received within 30 seconds, cancelling.', components: []});

        }

    }

    
}