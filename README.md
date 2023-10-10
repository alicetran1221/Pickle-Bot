# Pickle-Bot
## Overview
### About
Pickle Bot is a custom Discord bot in which users can easily set game reminders using slash commands which enhanced user experience
and engagement in a personal server with me and my friends. At the moment the slash commands are specifically for creating game reminders,
but I plan to build upon this to create a broader system that is useful for any occassion.
### Project Motivation
The purpose of this project was to build on my programming skills, learn more about project management, as well as provide an added convenience to me and my friends within our Discord server.
Due to how busy our schedules are, it is sometimes hard to find the time to plan and go to our meetups so we found that playing games together was a fun, quick, and easy way
to make time for one another. Pickle Bot's reminder feature was another solution to make planning our time together more seamless. Through this project within a personal server,
I was able to get feedback which helped contributed to the features of the bot. 
## Features
* **Reminder System:** Schedule game reminders with a simple and intuitive slash command. To notify members in the server, the reminder message will consist of a ping. Reminders will be scheduled for the current day but date options will be added soon.
* **Database Management:** Utilizes Sequelize and SQLite3 for efficient and scalable data storage.
* **Heroku Depolyment:** Deployed on Heroku for 24/7 availability
## Using Commands
* Use the command **`/valreminder [hour] [minutes] [amorpm]`** to schedule a game reminder.

  Example:
  `/valreminder [7] [07] [PM]`
  
  The bot will ask to confirm scheduling then send a reminder to the specified channel on the current day at the scheduled time.
* Use the command **`/deletereminder [hour] [minutes] [amorpm]`** to delete an already scheduled game reminder.
  
  Example:
  `/deletereminder [7] [07] [PM]`
  
  The bot will ask to confirm this deletion then will delete the reminder for the specified time.
  
