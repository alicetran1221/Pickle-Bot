const Guild = require('./models/guild');

// updates database after making changes to it
// alter adds new columns in the sqlite file 
Guild.sync({alter: true});

//code below is to recreate the table entirely  
// Guild.sync({force: true})
//     .then(() => {
//         console.log('recreate success');
//     })
//     .catch((error) => {
//         console.error('error recreating', error);
//     });