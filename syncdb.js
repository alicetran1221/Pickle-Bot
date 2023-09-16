const Guild = require('./models/guild');

// updates database after making changes to it
// alter adds new columns in the sqlite file
Guild.sync({alter: true});