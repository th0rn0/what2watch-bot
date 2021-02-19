// Dependencies
require('dotenv').config();
const { Client, MessageAttachment, MessageEmbed } = require('discord.js');
const client = new Client();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// Database
const adapter = new FileSync('database/db.json')
const db = low(adapter)

db.defaults({ movies: [], tv: [], count: 0})
  .write()

// Settings
const voteTime = 30000;
const botToken = process.env.DISCORD_TOKEN;
const apiAddr = process.env.API_ADDR;
const auth0ClientId = process.env.AUTH0_CLIENT_ID;
const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
const auth0Audience = process.env.AUTH0_AUDIENCE;
const auth0BotUserId = process.env.AUTH0_BOT_USER_ID; 

// Commands
const commandId = '.';
const commandInit = commandId + 'watchlist';
const commandGet = commandInit + ' get';
const commandSet = commandInit + ' add';
const commandHelp = commandInit + ' help';
const commandDelete = commandInit + ' delete';
const commandRandom = commandInit + ' random';
const commandTv = ' tv';
const commandMovie = ' movies';

// Responses
const responseNoTv = "No TV on the List!";
const responseNoMovies = "No Movies on the List!";
const responseDivTv = '---TV WATCH LIST---';
const responseDivMovies = '---MOVIE WATCH LIST---';
const responseExists = ' Already exists!';
const responseAdded = ' Added to the list!';
const responseDeleted = ' Deleted from the list!';
const responseUnableToFind = 'Can\'t find ';

// Bot
client.login(botToken);

client.on('ready', () => {
  	console.info(`Logged in as ${client.user.tag}!`);
		client.user.setActivity('Scribin\' n Vibin\'');
});

client.on('message', message => {
	if (message.author.bot) return;

	if (message.content.toLowerCase().startsWith(commandInit)) {

		if (message.content.toLowerCase().indexOf(commandGet) != -1) {
			if (message.content.toLowerCase().indexOf('tv') != -1) {
		        message.channel.send(responseDivTv);
    			message.channel.send(getTv());
			} else if (message.content.toLowerCase().indexOf('movie') != -1) {
		        message.channel.send(responseDivMovies);
		        message.channel.send(getMovies());
			} else {
		        message.channel.send(responseDivTv);
		        message.channel.send(getTv());
		        message.channel.send(responseDivMovies);
		        message.channel.send(getMovies());
			}
	    }

	    // Add to Watch List
	    if (message.content.toLowerCase().indexOf(commandSet) != -1) {
	    	if (message.content.toLowerCase().indexOf(commandSet + commandTv) != -1) {
	    		// Add TV
	    		var item = getItem(message, commandSet + commandTv);
	    		var itemExists = db.get('tv')
				  	.find({ id: sanitizeTitle(item) })
				  	.value();
				if (itemExists) {
			  		message.reply(item + responseExists);
			  	} else {
			    	db.get('tv')
					  	.push({id: sanitizeTitle(item), title: item})
					  	.write();
			  		message.reply(item + responseAdded);
			  	}
	    	} else if (message.content.toLowerCase().indexOf(commandSet + commandMovie) != -1) {
	    		// Add Movie
		    	var item = getItem(message, commandSet + commandMovie);
		    	var itemExists = db.get('movies')
				  	.find({ id: sanitizeTitle(item) })
				  	.value();
			  	if (itemExists) {
			  		message.reply(item + responseExists);
			  	} else {
			    	db.get('movies')
					  	.push({id: sanitizeTitle(item), title: item})
					  	.write();
			  		message.reply(item + responseAdded);
			  	}
			}
	    }

	    // Remove from Watchlist
	    if (message.content.toLowerCase().indexOf(commandDelete) != -1) {
	    	if (message.content.toLowerCase().indexOf(commandDelete + commandTv) != -1) {
	    		// Remove TV
	    		var item = getItem(message, commandDelete + commandTv);
	    		var itemExists = db.get('tv')
				  	.find({ id: sanitizeTitle(item) })
				  	.value();
		  		if (!itemExists) {
			  		message.reply(responseUnableToFind + item);
			  	} else {
			    	db.get('tv')
					  	.remove({id: sanitizeTitle(item)})
					  	.write();
			  		message.reply(item + responseDeleted);
			  	}
	    	} else if (message.content.toLowerCase().indexOf(commandDelete + commandMovie) != -1) {
	    		// Remove Movie
    			var item = getItem(message, commandDelete + commandMovie);
		    	var itemExists = db.get('movies')
				  	.find({ id: sanitizeTitle(item) })
				  	.value();
			  	if (!itemExists) {
			  		message.reply(responseUnableToFind + item);
			  	} else {
			    	db.get('movies')
					  	.remove({id: sanitizeTitle(item)})
					  	.write();
			  		message.reply(item + responseDeleted);
			  	}
	    	}
	    }

	    // Get Random
	    if (message.content.toLowerCase().indexOf(commandRandom) != -1) {
	    	if (message.content.toLowerCase().indexOf('tv') != -1) {
    			message.channel.send(getRandomTv());
			} else if (message.content.toLowerCase().indexOf('movie') != -1) {
	    		message.channel.send(getRandomMovie());
			} else {
				rand = Math.floor(Math.random() * 2);
				if (rand == 0) {
	    			message.channel.send(getRandomTv());
				} else {
					message.channel.send(getRandomMovie());
				}
			}
	    }

	    // Help
	    if (message.content.toLowerCase().indexOf(commandHelp) != -1) {
		    var embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Heyup ' + message.author.username + '!')
				.setDescription('Here are the commands I know')
				.addField(commandGet + ' <tv/movies>', 'Pull the Watch List. If no Arguement is provided all Watch Lists will be Pulled.')
				.addField(commandSet + ' <tv/movies> <item name>', 'Add Item to watch list.')
				.addField(commandDelete + ' <tv/movies> <item name>', 'Remove Item from watch list.')
				.addField(commandRandom + ' <tv/movies>', 'Pull Random Item from Watch list. If no Aruement is provided all Watch Lists will be searched.')
				.addField('\u200B', '\u200B')
				.addField('Created By', 'Th0rn0')
				.setFooter('What2Watch')
			message.channel.send(embed);
	    }
	}

	return;
});

function getRandomMovie() {
	movies = getMovies();
	if (movies.indexOf(responseNoMovies) == -1) {
		movies = movies[Math.floor(Math.random() * movies.length)]
	}
	return movies
}

function getRandomTv() {
	tv = getTv();
	if (tv.indexOf(responseNoTv) == -1) {
		tv = tv[Math.floor(Math.random() * tv.length)]
	}
	return tv;
}

function getMovies() {
	movies = db.get('movies').map('title').value();
	returnMovies = responseNoTv;
	if (movies.length != 0) {
		returnMovies = movies
	}
	return returnMovies;
	return db.get('movies').map('title').value();
}

function getTv() {
	tv = db.get('tv').map('title').value();
	returnTv = responseNoTv;
	if (tv.length != 0) {
		returnTv = tv
	}
	return returnTv;

}

function getItem(message, command) {
	return message.content.split(command + ' ')[1]
}

function sanitizeTitle(title) {
    title = title.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"").replace(/ /g,'');
    return title.trim().toLowerCase();
}