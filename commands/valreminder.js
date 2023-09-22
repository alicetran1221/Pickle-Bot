const momentTimezone = require("moment-timezone")
const { MessageCollector, InteractionCollector, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events} = require('discord.js');
const Guild = require('../models/guild');
const { valChannelId, testChannelId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('valreminder')
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
            content = `Are you sure you want to play at ${hour}:0${minutes} ${timeType}?`
        }
        else {
            content = `Are you sure you want to play at ${hour}:${minutes} ${timeType}?`
        }
        
        const response = await interaction.reply(
        {
            content: content,
            components: [row],
        });
       
        // filter so that only the person who triggered the message will be able to interact
        const collectorFilter = i => i.user.id === interaction.user.id;

        // try catch for if the person doesn't respond to the message
        const existingDates = new Set();
        try {
            const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 30000});
            if (confirmation.customId === 'confirm') {
                // making sure there are no repeats for the scheduled time
                const guilds = await Guild.findAll();
                for (const guild of guilds) {
                   existingDates.add(guild.playDate.getTime());
                }

                const currentTimestamp = laCurrentDate.toDate().getTime();
                if (existingDates.has(currentTimestamp)) {
                    await confirmation.update({content: 'This time has been scheduled already.', components: []});
                    return;
                }
                // message will always be sent to #val channel so hard code the channel id
                // this adds a new row to the database table therefore adding new data to store
                Guild.create({
                    playHour: hour,
                    playMinutes: minutes,
                    playDate: laCurrentDate.toDate(),
                    playChannelId: valChannelId,
                    AMorPM: timeType,
                })
                    .then((savedGuild) => {
                        console.log('Inserted Guild with ID:', savedGuild.id);
                    })
                    .catch((error) => {
                        console.error('Error inserting Guild:', error);
                    });

                if (minutes < 10) {
                    await confirmation.update({content: `Message scheduled at ${hour}:0${minutes} ${timeType}!`, components: []});
                }
                else {
                    await confirmation.update({content: `Message scheduled at ${hour}:${minutes} ${timeType}!`, components: []});
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