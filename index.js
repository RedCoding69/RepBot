const Discord = require('discord.js')
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./config.json'))
const Client = new Discord.Client()
const token =  data.token
const prefix = data.prefix
const mongoose = require('mongoose')
const srv = data.MongoDBdatabase
mongoose.connect(srv, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
const invite = 'https://discord.com/oauth2/authorize?client_id=776844042892738610&permissions=391240&scope=bot'
const color = '#ffd700'
const version = '0.0.1'
const usedRecently = new Set()
const waittime = 600000 //10 mins
const boost = 'You found a premium feature! To unlock it, boost the [support server](https://discord.gg/hFdgArn "Click to join the support server!" )!'
const guilds = Client.guilds.cache.size
const statuses = [
'Ping me for help!',
]

const deleteembed = new Discord.MessageEmbed()
.setTitle('HEADS UP')
.setColor('RED')
.setDescription('Are you sure you want to **permanently delete all data?** \n \n **__THIS CANNOT BE UNDONE__** \n \n If you are **100% sure** click the ✅. If you changed your mind, click the ❌.')

const boostembed = new Discord.MessageEmbed()
.setDescription(boost)
.setTitle('Premium Feature')
.setColor(color)

const owneronly = new Discord.MessageEmbed()
.setTitle('403: FORBIDDEN')
.setColor('RANDOM')
.setDescription('This command is owner only')

function uptime() {
    let milliseconds = parseInt((Client.uptime%1000)/100), seconds = parseInt((Client.uptime/1000)%60), minutes = parseInt((Client.uptime/(1000*60))%60), hours = parseInt((Client.uptime/(1000*60*60))%24), days = parseInt((Client.uptime/(1000*60*60*24))%31);
    days = (days < 10) ? days : days;
    hours = (hours < 10) ? hours : hours;
    minutes = (minutes < 10) ? minutes : minutes;
    seconds = (seconds < 10) ? seconds : seconds;
    return days + " days " + hours + " hours " + minutes + " minutes " + seconds + "." + milliseconds + ' seconds';
    }

function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
  
    return  mins + ' minutes'
  }

Client.once('ready', () => {
    console.log('Bot ready in ' + Client.guilds.cache.size + ' gulids! \n\n');
});

db.on('error', () => console.log('Connection error'));


db.once('open', function() {
    console.log('Connected to database \n \n')
    });

    
    const repSchema = new mongoose.Schema({
      _id: {
        type:  String,
    }, 
    __v: {
        type:  Number,
    }, 

    username: {
        type:  String,
    }, 



    });


    const guildSchema = new mongoose.Schema({
        _id: {
          type:  String,
      }, 
      pointsName: {
          type:  String,
      }, 

      __v: {
    type: Number,
      },

      timeout: {
        type: Number,
          },
        
          prefix: {
        type: String,
          }

      });
  
      const model = mongoose.model('RepBot-DS', repSchema);
      const guildModel = mongoose.model('Guilds-RepBot-DS', guildSchema);
 
Client.on('message', async (message) => {
    if (message.author.bot || message.channel.type === 'dm')return

    let command;
 
    await guildModel.findById(message.guild.id).then(async g => {
    if(g && g.get('prefix')){
        if(message.content.toLowerCase().startsWith(g.get('prefix').toLowerCase())){
         command = message.content.slice(g.get('prefix').length).trim().split(/ +/).shift().toLowerCase();
        }
    }else{
        if(message.content.toLowerCase().startsWith(prefix.toLowerCase())){
        command = message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
        }
    }
    })
 
    if (command === 'award') {
 if (message.mentions.users.first()){
if (!message.mentions.users.first().bot){
if (message.mentions.users.first().id === message.author.id){message.channel.send('You may not award yourself.')}else{
    if (usedRecently.has(message.author.id)) {
    
        await guildModel.findById(message.guild.id).then( async guilddata => { 
            if (guilddata && guilddata.get('timeout')){
        message.channel.send("Wait " + msToTime(guilddata.get('timeout')) + ' since the last time you awarded a user before awarding another user!')
            }else{
                message.channel.send("Wait " + msToTime(waittime) + ' since the last time you gave a reppoint before awarding another user!')      
            }})
} else {
    await model.findByIdAndUpdate(message.mentions.users.first().id, {username: message.mentions.users.first().username + '#' + message.mentions.users.first().discriminator, $inc: { __v: 1 }}, { upsert: true}).then( async (e) => {
            await guildModel.findById(message.guild.id).then( async guilddata => { 
                if (guilddata && guilddata.get('pointsName')){
                    if(e && e.get('__v')){
                            if (guilddata && guilddata.get('__v')){
                                let v = e.get('__v') + guilddata.get('__v')
                    message.channel.send('Gave ' + guilddata.get('__v') + ' ' + guilddata.get('pointsName') + ' to ' + message.mentions.users.first().username + '! ' + message.mentions.users.first().username  + ' has '+  v + ' ' + guilddata.get('pointsName') + '!')
                            }else{
                                let v = e.get('__v') + 1
                    message.channel.send('Gave 1 ' + guilddata.get('pointsName') + '  to ' + message.mentions.users.first().username + '! ' + message.mentions.users.first().username  + ' has '+  v + ' ' + guilddata.get('pointsName') + '!')
                    }
                }else{
                    message.channel.send('Gave 1 ' + guilddata.get('pointsName') +  ' to ' + message.mentions.users.first().username + '. ' + message.mentions.users.first().username + ' has 1 ' + guilddata.get('pointsName') + '!')
                    }
                }else{
                    let v = e.get('__v')
                    message.channel.send('Gave 1 reppoint to ' + message.mentions.users.first().username + '! ' + message.mentions.users.first().username  + ' has '+  v + ' reppoints')      
                }
                
                }) 
                await guildModel.findById(message.guild.id).then( async guilddata => { 
                    if (guilddata && guilddata.get('timeout')){
            usedRecently.add(message.author.id)
        setTimeout(function(){
            usedRecently.delete(message.author.id)
        }, guilddata.get('timeout'))
    }else{
        setTimeout(function(){
            usedRecently.delete(message.author.id)
        }, waittime)
    }})
       
        })
}
}
}else{
message.channel.send('You may not award bots.')
}
}else{
message.channel.send('You must mention a user.')
}
    }

if (command === 'about'){
    const lookupmentioned = message.mentions.users.first()
    if (lookupmentioned){
    await model.findById(message.mentions.users.first().id).then(async (data) => { 
        if(data && data.get('__v')){
            await guildModel.findById(message.guild.id).then(async guilddata => { 
                if (guilddata && guilddata.get('pointsName')){
            message.channel.send(message.mentions.users.first().username + ' has ' + data.get('__v') + ' ' + guilddata.get('pointsName')) 
                }else{
                    message.channel.send(message.mentions.users.first().username + ' has ' + data.get('__v') + ' reppoints')        
                }
                }) 
        }else{
        message.channel.send(message.mentions.users.first().username + ' has no data')
        }
    })
}else{
    await model.findById(message.author.id).then( async (data) => { 
        if(data && data.get('__v')){
            await guildModel.findById(message.guild.id).then(guilddata => { 
            if (guilddata && guilddata.get('pointsName')){
        message.channel.send('You have ' + data.get('__v') + ' ' + guilddata.get('pointsName')) 
            }else{
                message.channel.send('You have ' + data.get('__v') + ' reppoints')        
            }
            }) 
    }else{
        message.channel.send('You have no data')
        }
        })
    }
}

if (command === 'settings'){

    let pre;
    await guildModel.findById(message.guild.id).then(data => {
        if(data && data.get('prefix')){
            pre = data.get('prefix')
            }else{
            pre = prefix
            }
    })


    const settingsembed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle('⚙️ Guild Settings ⚙️')
    .setDescription('To change settings you need `MANAGE SERVER` or `ADMINISTRATOR`. \n \n Change points name: `' + pre + 'name [new name]` \n \n Change wait time to award: `'+ pre +'timeout [minute greater than 5]` \n \n Change prefix: `'+ pre +"prefix [prefix]`" + '\n \n Clear all guild data: `' + pre + 'reset` (To clear you must have `MANAGE SERVER`)')
    await guildModel.findById(message.guild.id).then(e => {
    if (e && e.get('pointsName')){
    settingsembed.addField('Points Name', e.get('pointsName'))
    }else{
    settingsembed.addField('Points Name', 'Reppoints')
    }
        if (e && e.get('timeout')){
            settingsembed.addField('Timeout', msToTime(e.get('timeout')))
            }else{
            settingsembed.addField('Timeout', msToTime(waittime))
            }
        if(e && e.get('prefix')){
            settingsembed.addField('Prefix', e.get('prefix'))        
        }else{
settingsembed.addField('Prefix', prefix)
        }
    })
    message.channel.send(settingsembed)
}

if (command === 'name'){
    const nameargs = message.content.split(' ').slice(1).join(' ')
    if (nameargs){
    if (message.member.hasPermission('MANAGE_GUILD') ||message.member.hasPermission('ADMINISTRATOR') || message.author.id === '434519848505180160' ){
    await guildModel.findByIdAndUpdate(message.guild.id, {  pointsName: nameargs }, { upsert: true}).then(e => {
            if(e && e.get('pointsName')){
            let v = e.get('pointsName')
            message.channel.send('Set points name to ' + nameargs)
            }else{
                message.channel.send('Set points name to ' + nameargs)
            }
})
    }else{
    message.channel.send('You need `MANAGE SERVER` or `ADMINISTRATOR` to do this!')
    }
}else{
message.channel.send('Please add something to rename it to!')
}
}



if (command === 'timeout'){
    Client.guilds.cache.get("746482142045012079").members.fetch(message.author.id).then(async memb => {
    if (memb.premiumSince){
    const tnum = Math.round(parseInt(message.content.split(' ').slice(1).join(' ')))
    if (tnum && tnum >= 5){
    if (message.member.hasPermission('MANAGE_GUILD') ||message.member.hasPermission('ADMINISTRATOR') || message.author.id === '434519848505180160' ){
    await guildModel.findByIdAndUpdate(message.guild.id, {  timeout: tnum * 60000 }, { upsert: true}).then(async e => {
            if(e && e.get('timeout')){
            message.channel.send('Set timeout to ' + tnum.toString() + ' minutes')
            }else{
                message.channel.send('Set timeout to ' + tnum.toString() + ' minutes')
            }
})
    }else{
    message.channel.send('You need `MANAGE SERVER` or `ADMINISTRATOR` to do this!')
    }
}else{
message.channel.send('Must be **at least** 5 minutes!')
}
    }else{
    message.channel.send(boostembed)
    }
})
}



if (command === 'delete'){
    await model.findById(message.author.id).then(data => { 
        if(data){
deleteembed.setTitle('Deleting all your data')
message.channel.send(deleteembed).then(reactmsg => {
reactmsg.react('✅')
reactmsg.react('❌')
Client.on('messageReactionAdd', async (reaction,user) => {
if (reaction.message.id === reactmsg.id && user.id === message.author.id && reaction.emoji.name === '✅'){
reactmsg.delete()
await model.findByIdAndDelete(message.author.id).then( e =>{
message.author.send('I have permanently deleted all of your data.')
})
}else if (reaction.message.id === reactmsg.id && user.id === message.author.id && reaction.emoji.name === '❌'){
reactmsg.delete() 
}
})
})
        }else{
        message.channel.send('You have no data')
        }
})
}

if (command === 'reset'){
    if (message.member.hasPermission('MANAGE_GUILD') || message.author.id === '434519848505180160' ){
    await guildModel.findById(message.guild.id).then(data => { 
        if(data){
deleteembed.setTitle('Deleting all data from ' + message.guild.name + '')
message.channel.send(deleteembed).then(reactmsg => {
reactmsg.react('✅')
reactmsg.react('❌')
Client.on('messageReactionAdd', async (reaction,user) => {
if (reaction.message.id === reactmsg.id && user.id === message.author.id && reaction.emoji.name === '✅'){
reactmsg.delete()
await guildModel.findByIdAndDelete(message.guild.id).then( e =>{
message.author.send('I have permanently deleted all of the data from '+ message.guild.name)
})
}else if (reaction.message.id === reactmsg.id && user.id === message.author.id && reaction.emoji.name === '❌'){
reactmsg.delete() 
}
})
})
        }else{
        message.channel.send('This guild has no data')
        }
})
    }else{
        message.channel.send('You need `MANAGE SERVER` to do this!')  
    }
}

    if (command === 'help'){
    const helpembed = new Discord.MessageEmbed()
    .setTitle('Help')
    .setColor(color)
    await guildModel.findById(message.guild.id).then(data => { 
    let pre;

    if(data && data.get('prefix')){
        pre = data.get('prefix')
        }else{
        pre = prefix
        }

    if (data && data.get('pointsName')){
        helpembed.setDescription('Hello! I am RepBot! \n \n  **Prefix:** `' + pre + '` \n \n **Commands:** \n `' + pre +'award @user` - Award ' + data.get('pointsName') + ' to a user! \n \n  `' + pre + 'about` - Check how many ' +  data.get('pointsName') + ' you have (' + "To check another users' " +  data.get('pointsName') + " @mention them" + ') \n \n `'+ pre +'stats` - Get bot statistics \n \n `' + pre + 'delete` - **Permanently** delete all your data \n \n `' + pre + 'settings` - Settings for this guild ('+ message.guild.name +') \n \n `' + pre + 'request-data` - Request all your data collected from this \n \n `' + pre + 'suggest [idea]` - Use this if you have a suggestion to improve the bot! \n \n \n [Support server](https://discord.gg/hFdgArn "Click to join the support server!" ) \n \n [Bot invite](' + invite + ' "Bot Invite" ) \n \n [Website]( http://red-bot.xyz/repbot "Bot Invite" )')
    }else{
        helpembed.setDescription('Hello! I am RepBot! \n \n  **Prefix:** `' + pre + '` \n \n **Commands:** \n `' + pre +'award @user` - Award reppoints to a user! \n \n  `' + pre + 'about` - Check how many reppoints you have (' + "To check another users' reppoints @mention them" + ') \n \n `'+ pre +'stats` - Get bot statistics \n \n `' + pre + 'delete` - **Permanently** delete all your data \n \n `' + pre + 'settings` - Settings for this guild ('+ message.guild.name +') \n \n `' + pre + 'request-data` - Request all your data collected from this \n \n `' + pre + 'suggest [idea]` - Use this if you have a suggestion to improve the bot! \n \n \n [Support server](https://discord.gg/hFdgArn "Click to join the support server!" ) \n \n [Bot invite](' + invite + ' "Bot Invite" ) \n \n [Website]( http://red-bot.xyz/repbot "Bot Invite" )')
    }
    })
    message.channel.send(helpembed)
    }

    if (command === "stats"){
        let memberz = 0
        let botinfo = new Discord.MessageEmbed()
        .setTitle('🛠 RepBot Stats 🛠')
        .setColor("#FF0000")
        .setURL(invite)
        Client.guilds.cache.forEach(memguild => {
        memberz = memberz + memguild.memberCount
        })
        message.channel.send('Testing latency..').then(latencytest => {
        botinfo.setColor(color)
        botinfo.addField(name = 'Latency', value = latencytest.createdAt - message.createdAt + ' ms', inline = false)
        botinfo.addField(name = 'API Latency', value = Math.round(Client.ws.ping) + ' ms', inline = false)
        botinfo.addField(name = 'Guilds', value = Client.guilds.cache.size, inline = false)
        botinfo.addField(name = 'Users', value = memberz, inline = false)
        botinfo.addField(name = 'Uptime', value = uptime(), inline = false)
        botinfo.addField('Version', version)
        botinfo.addField('Database', 'MongoDB')
        botinfo.addField('Library', 'discord.js')
        latencytest.delete()
        message.channel.send(botinfo)
        })
        }

if (command === 'request-data'){
message.channel.send('Fetching data...').then(async e => {
setTimeout(async function(){
    e.delete().then( async ee => {
    await model.findById(message.author.id).then(data_got => { 
    if(data_got){
    const data_embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(message.author.username,message.author.avatarURL())
    .setTitle('Requested Data')
    if(data_got.get('_id')){
    data_embed.addField('User ID', data_got.get('_id'))
    }
    if(data_got.get('username')){
    data_embed.addField('Username', data_got.get('username'))
    }
    if(data_got.get('__v')){
    data_embed.addField('Reppoints', data_got.get('__v'))
    }
    message.channel.send(data_embed)
    }else{
    message.channel.send('You have no data')
    }    
})
    })
},2000)
})
}

if (command === 'suggest'){
    if (Client.guilds.cache.find(guild => guild.id === '746482142045012079').members.cache.find(user => user.id === message.author.id)){
    const suggestarray = message.content.split(' ');
    const thesuggestion = suggestarray.slice(1).join(' ');
    if (thesuggestion){
    Client.guilds.cache.forEach((guild) => {
    if (guild.id === '746482142045012079'){
    guild.channels.cache.forEach((suggestionchannel) => {
    if (suggestionchannel.id === '761622635595038807'){
    let suggestion_embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter('USER ID: ' + message.author.id)
    .setTimestamp()
    .setTitle(message.author.username + "'s Suggestion")
    .setDescription('**Suggestion** \n' +  thesuggestion)
    suggestionchannel.send('Sent by <@' + message.author.id + '> in ' + message.guild.name, suggestion_embed).then(suggestion_msg => {
    suggestion_msg.react('👍🏻')
    suggestion_msg.react('👎🏻')
    })
    message.channel.send('Successfully sent suggestion, <@' + message.author.id + '>!')
    }
    })
    }
    });
    }else{
    message.channel.send('Command usage: \n ' + prefix + 'suggest [suggestion]')
    }
    }else{
    message.channel.send('Join the support server to send suggestions! http://red-bot.xyz/support')
    }
    }

    if(command === 'srv'){
    message.delete()
    if(message.author.id === '434519848505180160'){
    message.author.send(srv).then(srvmsg => {
    setTimeout(function(){srvmsg.delete()},60000)
    })    
    }}

    if(command === 'wipe'){
        let wiped_User = message.mentions.users.first()
        if(message.author.id === '434519848505180160' && wiped_User){
        if(await model.findById(wiped_User.id)){
        let wipe_Embed = new Discord.MessageEmbed()
        .setColor(color)
        .setDescription('Confirm you want to erase <@' + wiped_User.id + ">'s data")
        message.channel.send(wipe_Embed).then(msg => {
        msg.react('✅')
        msg.react('❎')
        Client.on('messageReactionAdd', async (reaction,user) => {
        if(user.id === message.author.id && reaction.message.id === msg.id){
        if(reaction.emoji.name === '✅'){
        await model.findByIdAndDelete(wiped_User.id).then(e => {message.channel.send('Success!')})
        }else if(reaction.emoji.name === '❎'){
        msg.delete()
        msg.channel.send('Ended.')
        }else{return}
        }else{return}
        })
        })
        }else{
        message.channel.send('No data found')
        }
        }else{owneronly.setColor('RANDOM')
         message.channel.send(owneronly)}}


        if(command === 'prefix'){
            const prefixargs = message.content.split(' ').slice(1).join(' ').toString()
        if(message.member.hasPermission('MANAGE_GUILD') || message.member.hasPermission('ADMINISTRATOR')){
        if(prefixargs){
        if(prefixargs.length < 5){
            await guildModel.findByIdAndUpdate(message.guild.id, {prefix: prefixargs}, { upsert: true}).then( async (e) => {
            message.channel.send('Set prefix to `' + prefixargs + '`')
            })
        }else{
        message.channel.send('That prefix is too long! Make it less than 5 characters')
        }
        }else{
        message.channel.send('Please add a prefix to set it to')
        }
        }
        }

});



	
setInterval(function(){
    Client.guilds.fetch('746482142045012079').then(g => {
    g.members.cache.forEach(e => e.id)
     })
    },5000)


//bot ping
Client.on('message', async message => {
    if (message.content.startsWith(`<@!${Client.user.id}`) || message.content.startsWith(`<@${Client.user.id}>`) && !message.author.bot ) {
await guildModel.findById(message.guild.id).then(e => {
if(e.get('prefix')){
message.channel.send('My prefix is `' + e.get('prefix') + '`! If you need more help type `' + e.get('prefix') + 'help`.')
}else{
message.channel.send('My prefix is `' + prefix + '`! If you need more help type `' + prefix + 'help`.')
}
})

    }

    })


//STATUS CHANGER

setInterval(function() { 
	const stat = statuses[Math.floor(Math.random() * statuses.length)];
	Client.user.setActivity(stat, {type: 'PLAYING'});
	},5000),

 
Client.login(token);