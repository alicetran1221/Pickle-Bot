const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
const Guild = require('../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-welcome-channel')
    .setDescription('Set the welcome channel for this guild where a welcome message will be sent when a new member joins.')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Channel to sent welcome message to.') 
        .addChannelTypes(ChannelType.GuildText)   
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const { options, member} = interaction;

        if (interaction.guild.ownerId !== member.id) return interaction.reply('Only the server owner can use this command!');

        const channel = await options.getChannel('channel');

        const [guild, created] = await Guild.findOrCreate({where: {id: interaction.guild.id}})

        if(!channel) {
            await guild.update({welcomeChannelId: null});
        }
        else {
            await guild.update({welcomeChannelId: channel.id});
        }

        interaction.editReply(`Set the channel for welcome messages to ${channel}`)
    }
}