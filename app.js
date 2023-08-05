const { Client, GatewayIntentBits, MessageMentions } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance with the intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', function () {
    console.log('Bot is logged in as ' + client.user.tag);
    // Register slash commandsPl
    client.guilds.cache.forEach(function (guild) {
        guild.commands.create(
            {
            name: 'hello',
            description: 'Prints hello'
            });
        guild.commands.create(
            {
            name: 'channel',
            description: 'gets the voice channel you currently are in'
            });
        guild.commands.create(
            {
            name: 'test',
            description: 'a test command to see if the user is in a voice channel'
            });
        guild.commands.create(
            {
            name: 'say',
            description: 'prints a test message',
            options: [
                {
                  type: 3,
                  name: 'input',
                  description: 'The text you want to print',
                  required: true, 
                },
              ],
            });
        guild.commands.create(
          {
            name: 'listchannels',
            description: 'lists the voice channel of the server'
          });
        guild.commands.create(
          {
            name: 'move',
            description: 'move people between channels',
            options: [
              {
                type: 3,
                name: 'input',
                description: 'user and voice channel',
                required: true, 
              },
            ],
          });
    });
});

//Funktion to check VoiceChannel
function checkVoiceChannel(interaction) {
    const guild = client.guilds.cache.get(interaction.guild.id);
    const guildMember = guild.members.cache.get(interaction.user?.id);
    const voiceChannel = guildMember?.voice.channel;
    if (voiceChannel) {
        interaction.reply(`You are currently in the voice channel: ${voiceChannel.name}`);
    } else {
        interaction.reply('You are not currently in a voice channel.');
    }
}
client.on('interactionCreate', async function (interaction) {
    if (!interaction.isCommand()) return;
    const commandName = interaction.commandName;
    if (commandName === 'hello') {
        const user = interaction.user;
        console.log(user.username + " used /" + commandName)
        interaction.reply(`Hello my fellow GigaChad ${user} !`);
    }else if(commandName === 'test') {
    interaction.reply(`You tried the test message ${interaction.user}`)
    }else if(commandName === 'channel') {
        checkVoiceChannel(interaction)

    //Start of the /say command:
    }else if(commandName === 'say') {
        
        const input = interaction.options.getString('input');
       
        if (input) {
            //Get the first pinged user:
            const mentionedUserRegex = /<@!?(\d+)>/;
            const match = input.match(mentionedUserRegex);
            const pingedUserID = match ? match[1] : null;
            const pingedUser = interaction.guild.members.cache.get(pingedUserID);

            const pingedUserTag = pingedUser ? pingedUser.user.tag : 'User not found';

            interaction.reply({ content: "You used /say and first user you pinged: " + pingedUserTag, ephemeral: true })
              .catch(error => {
                console.error('Error occurred while sending message:', error);
              });
        
            const content = `${input}`;
            interaction.channel.send(content);
          } else {
            interaction.reply({ 
              content: 'Please provide an input. Usage: `/say <@user> <your_text>`',
              ephemeral: true,
            });
        } 
    }else if(commandName === 'listchannels') {
      
      client.guilds.cache.forEach(guild => {
        // Filter voice channels
        const voiceChannels = guild.channels.cache.filter(channel => channel.type == 2);
        const textChannels = guild.channels.cache.filter(channel => channel.type == 0);
        
        // Get an array of voice channel names
        const voiceChannelNames = voiceChannels.map(channel => channel.name);
        const textChannelNames = textChannels.map(channel => channel.name);
    
        // Send the voice channel names as a message to a text channel
          interaction.reply(`**Voice channels:**\n${voiceChannelNames.join('\n')} \n\n**Text channels:**\n${textChannelNames.join('\n')}`);
      });

 
      //Move Members
    }else if (commandName === 'move') {

      const input = interaction.options.getString('input');

      if(input) {
        const mentionedUserRegex = /<@!?(\d+)>/;
        const match = input.match(mentionedUserRegex);
        const pingedUserID = match ? match[1] : null;

        const memberOption = interaction.guild.members.cache.get(pingedUserID);

        const destinationVoiceChannelName = 'Fall';

        const member = await interaction.guild.members.fetch(memberOption.id);
       /* const voiceChannel = interaction.guild.channels.cache.find(
          channel =>
            channel.name.toLowerCase() === destinationVoiceChannelName.toLowerCase()
        ); */
        const voiceChannels = interaction.guild.channels.cache.filter(
          channel => channel.name.toLowerCase() === destinationVoiceChannelName.toLowerCase()
        );
        const sortedVoiceChannels = Array.from(voiceChannels.values()).sort((a, b) => a.rawPosition - b.rawPosition);
      
        interaction.reply({
          content: `Moving ${member.displayName} to the first channel...`,
          ephemeral: true,
        });
      
        const moveMemberToNextChannel = (index) => {
          if (index >= sortedVoiceChannels.length) {
            return;
          }
          const voiceChannel = sortedVoiceChannels[index];
      
          setTimeout(() => {
            try {
              member.voice.setChannel(voiceChannel);
              interaction.followUp({
                content: `Moved ${member.displayName} to ${voiceChannel.name}.`,
                ephemeral: true,
              });
              moveMemberToNextChannel(index + 1); // Move to the next channel
            } catch (error) { 
              
              console.error('Error occurred while moving the member:', error);
              interaction.followUp('An error occurred while moving the member.');
            } 
          }, 1000); // 1000 milliseconds = 1 second
        }; 
      
        // Start the move sequence by calling the function with index 0
        moveMemberToNextChannel(0);
      } 
    }
});

client.login(token);

 //Move member to first voice channel:
   /*     try {
          member.voice.setChannel(firstVoiceChannel);
          interaction.reply(`Moved ${member.displayName} to ${firstVoiceChannel.name}.`);
        } catch (error) {
          console.error('Error occurred while moving the member:', error);
          interaction.reply('An error occurred while moving the member.');
        } */
 //Move Member to first channel then to the next   
         /*   const firstVoiceChannel = sortedVoiceChannels[0];
        const secondVoiceChannel = sortedVoiceChannels[1];

        try {
          member.voice.setChannel(firstVoiceChannel);
          interaction.reply(`Moved ${member.displayName} to ${firstVoiceChannel.name}.`);
    
          // Move the member to the secondVoiceChannel after one second
          setTimeout(() => {
            member.voice.setChannel(secondVoiceChannel);
            interaction.followUp(`Moved ${member.displayName} to ${secondVoiceChannel.name}.`);
          }, 1000); // 1000 milliseconds = 1 second
        } catch (error) {
          console.error('Error occurred while moving the member:', error);
          interaction.reply('An error occurred while moving the member.');
        } */

