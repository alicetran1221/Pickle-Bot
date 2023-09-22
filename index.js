const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
//const { token } = require('./config.json');
const momentTimezone = require('moment-timezone');
const Guild = require('./models/guild');
const Sequelize = require('sequelize');

// create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

async function sendReminder() {
	const currentTime = momentTimezone();

	const guilds = await Guild.findAll();
	for (const guild of guilds) {
		const {playHour, playMinutes, AMorPM, playChannelId, playDate} = guild;

		if (playDate &&
			currentTime.isSame(playDate, 'hour') &&
			currentTime.isSame(playDate, 'minute')) {
				const channel = client.channels.cache.get(playChannelId);
				if (channel) {
					const messageContent = " @everyone It's time to play Valorant!";
					await channel.send(messageContent);
				}
			}
	}

}

async function deleteExpiredReminders() {
	const currentTime = new Date();
	try {
		const expiredReminders = await Guild.findAll({
			where: {
				playDate: {
					[Sequelize.Op.lt]: currentTime,
				},
			},
		});

		for (const reminder of expiredReminders) {
			await reminder.destroy();
			console.log('Deleted expired record:', reminder.id);
		}
	} catch (error) {
		console.error('Error deleting expired records:', error);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
    

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		// if (interaction.replied || interaction.deferred) {
		// 	await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		// } else {
		// 	await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		// }
	}
});

// when the client is ready, run this code (only once)
// we use 'c' for the event parameter to keep it separate from the already defined client
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
	setInterval(sendReminder, 60000); // checks every minute
	setInterval(deleteExpiredReminders, 60000);
});

// log in to Discord with your client's token
// client.login(token);
client.login(process.env.DJS_TOKEN);