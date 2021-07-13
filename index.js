const Discord=require("discord.js");
const client=new Discord.Client({partials:["MESSAGE","CHANNEL","REACTION"]});
const fs=require("fs");
const http=require("http");
const socketio_client=require("socket.io-client");
require("dotenv");

const prefix="^";

client.once("ready",async()=>{
console.log(`Logged-in as ${client.user.tag}`);
client.user.setActivity(`polls | ${prefix}help`,{type:"WATCHING"});
});

client.on("message",async(message)=>{
if(!message.author.bot&&message.content.startsWith(`<@!${client.user.id}>`)){
var embed=new Discord.MessageEmbed()
.setColor("#00aa33")
.setDescription(`Hello!\r\nI am Opinion, a bot that allows you to create polls and votes!\r\nMy command prefix is \`${prefix}\`.\r\nYou can try typing \`${prefix}help\` to retrieve a list of commands that you can use.`);
message.channel.send(`||${message.author}||`,embed);
}
if(message.content.startsWith(prefix)&&!message.author.bot){
var command=message.content.substring(prefix.length,message.content.length);
var args=command.split(" ");

if(command.toLowerCase().startsWith("help")){
var embed=new Discord.MessageEmbed()
.setColor("#0077dd")
.setTitle("Help/Commands | :passport_control:")
.setFooter("Help/Commands | Opinion")
.setDescription(`Here's a list of commands you can use:\r\nThe < and > means mandatory values\r\nAnd [ and ] means optional values`)
.addFields(
{name:"`help`",value:`Will retrieve you a list of commands.\r\n**Usage**: \`${prefix}help\``,inline:true},
{name:"`thumbs`",value:`Will put a thumbsup :thumbsup: and a thumbsdown :thumbsdown: reactions to the message.\r\n**Usage**: \`${prefix}thumbs <your message>\`\r\n**Example**: \`${prefix}thumbs Do you like the bot?\``,inline:true},
{name:"`thumbsId`",value:`Will put a thumbsup :thumbsup: and a thumbsdown :thumbsdown: reactions to the provided message.\r\n**Usage**: \`${prefix}thumbsId <message id>\`\r\n**Example**: \`${prefix}thumbsId 908754329078563212\`\r\n**Requirements**: Must be the message sender or have the _Manage messages_ permission.`,inline:true},
{name:"`vote`",value:`This will make a new vote so people can upvote or downvote your message. You can create a channel named _votes_, and all votes will be sent there. Othervise, the vote will be sent in the current channel.\r\n**Usage**: \`${prefix}vote <your message>\`\r\n**Example**: \`${prefix}vote Should i add the bot to the server?\`\r\n**Requirements**: Must have the _Vote maker_ role.`,inline:true},
{name:"`poll`",value:`It will make a new poll, with up to 10 options. You can create a channel named _polls_, and all polls will be posted there. Othervise, it will be posted in the current channel.\r\n**Usage**: \`${prefix}poll <"question"> <"option 1"> ["option 2"] ["option 3"]\`\r\n**Example**: \`${prefix}poll "What is your favorite color?" "Red" "Yellow" "Green" "Blue" "Purple"\`\r\n**Example 2**: \`${prefix}poll "What is your favorite color?"Red"Yellow"Green"Blue"Purple"\`\r\n**Requirements**: Must have the _Poll maker_ role.`,inline:true},
{name:"`invite`",value:`The bot will send some invite links\r\n**Usage**: \`${prefix}invite\`\r\n`,inline:true},
{name:"`support`",value:`Will send the support information such as the support server invite link and bot creator's username\r\n**Usage**: \`${prefix}support\`\r\n`,inline:true}
);
message.channel.send(`||${message.author}||`,embed);
}

if(command.toLowerCase().startsWith("thumbs ")){message.react("👍");message.react("👎");}
if(command.toLowerCase().startsWith("thumbsid ")){if(args[1]){
var msg=await message.channel.messages.fetch(args[1]);
if(msg){
if(msg.author==message.author||message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")){msg.react("👍");msg.react("👎");}else{
var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Insufficient permissions | :x:`).setDescription(`You cannot do this to that message. The message must be sent by you or you must have the _Manage messages_ permission.`);
message.channel.send(`||${message.author}||`,embed);}
}else{var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Invalid message ID | :x:`).setDescription(`Please provide a valid message ID (must be in the same channel).`);message.channel.send(`||${message.author}||`,embed);}
}else{var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Invalid usage | :x:`).setDescription(`Please provide a message ID (must be in the same channel) in order to use this command.`);message.channel.send(`||${message.author}||`,embed);
}}

if(command.toLowerCase().startsWith("vote ")){
var pingRole=message.guild.roles.cache.find(role=>role.name==="Vote ping");
var makerRole=message.guild.roles.cache.find(role=>role.name==="Vote maker");
var link;
if(!pingRole||!makerRole){var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Role(s) not found | :x:`).setDescription(`The server should have roles named \`Vote ping\` and \`Vote maker\`.`);message.channel.send(`||${message.author}||`,embed);return;}
if(!message.member.roles.cache.has(makerRole.id)){
var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Insufficient permissions | :x:`).setDescription(`You can't use this command since you don't have \`Vote maker\` (${makerRole}) role.`);message.channel.send(`||${message.author}||`,embed);
return;}
var channel=await message.guild.channels.cache.find(ch=>ch.name==="votes");
var embed=new Discord.MessageEmbed().setColor("#0088ff").setTitle(command.substring(5,command.length)).setFooter(`Vote posted by ${message.author.tag}`);
if(channel){channel.send(`||${pingRole}||`,embed).then(m=>{m.react("👍");m.react("👎");link=`https://discord.com/channels/${m.guild.id}/${m.channel.id}/${m.id}`;var embed2=new Discord.MessageEmbed().setColor("#00aa00").setTitle(`Vote posted | ✅`).setDescription(`:mag_right: [Link](${link})\r\n:mens: Author: ${message.author}`);
if(message.channel.name!=="votes")message.channel.send(`||${message.author}||`,embed2);});}else{message.channel.send(`||${pingRole}||`,embed).then(m=>{m.react("👍");m.react("👎");});}
}

if(command.toLowerCase().startsWith(`:eval `)){
if(message.author.id==748531954391056445){
try{var result=await eval(message.content.substring(prefix.length+6,message.content.length));
var obj=result;
if(typeof result=="object"&&result!=null){
obj=Object.keys(obj).map((key)=>[String(key),obj[key]]);var cache=[];var msg=JSON.stringify(obj,(key,value)=>{if(typeof value=='object'&&value!=null){if(cache.includes(value))return;cache.push(value);}return value;});cache=null;}else{if(typeof obj!="number"&&typeof obj!="string"&&typeof obj!="boolean"){obj=typeof obj}else{obj=obj.toString();}}
await fs.writeFileSync('./res.txt',JSON.stringify(obj));
await fs.writeFileSync('./res.html',`<script>\r\nvar a=${JSON.stringify(obj)};\r\nvar b=Object.fromEntries(a);\r\nconsole.log(b);\r\n</script>`);
var att=new Discord.MessageAttachment('./res.txt','result.txt');
var att2=new Discord.MessageAttachment('./res.html','result.html');
message.reply(`eval result:`,(att));
if(typeof result=='object'&&result!=null){message.reply(`eval result (html):`,(att2));}
}catch(e){message.reply(`eval error: ${e.toString()}`);}
}}

if(command.toLowerCase().startsWith("poll ")){
var pingRole=message.guild.roles.cache.find(role=>role.name==="Poll ping");
var makerRole=message.guild.roles.cache.find(role=>role.name==="Poll maker");
var link;
if(!pingRole||!makerRole){var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Role(s) not found | :x:`).setDescription(`The server should have roles named \`Poll ping\` and \`Poll maker\`.`);message.channel.send(`||${message.author}||`,embed);return;}
if(!message.member.roles.cache.has(makerRole.id)){
var embed=new Discord.MessageEmbed().setColor("#aa0000").setTitle(`Insufficient permissions | :x:`).setDescription(`You can't use this command since you don't have \`Poll maker\` (${makerRole}) role.`);message.channel.send(`||${message.author}||`,embed);
return;}
var channel=await message.guild.channels.cache.find(ch=>ch.name==="polls");

var args2=command.split("\"");args2=args2.filter(el=>{return el!=null&&el!=''&&el!=' ';});args2.shift();
var question=args2[0];
args2.shift();

var embed=new Discord.MessageEmbed().setColor("#0088ff").setTitle(question).setFooter(`Poll posted by ${message.author.tag}`);
var count=0;
var numbers=["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
args2.forEach(option=>{count++;if(count<=10){embed.addField(`${numbers[count-1]} ${option}`,"\u200B",true);}});
if(channel){channel.send(`||${pingRole}||`,embed).then(m=>{for(i=0;i<count;i++){m.react(numbers[i]);}link=`https://discord.com/channels/${m.guild.id}/${m.channel.id}/${m.id}`;var embed2=new Discord.MessageEmbed().setColor("#00aa00").setTitle(`Poll posted | ✅`).setDescription(`:question: Question: ${question}\r\n:mag_right: [Link](${link})\r\n:mens: Author: ${message.author}`);
if(message.channel.name!=="polls")message.channel.send(`||${message.author}||`,embed2);});}else{message.channel.send(`||${pingRole}||`,embed).then(m=>{for(i=0;i<count;i++){m.react(numbers[i]);}});}
}

}});

client.on("messageReactionAdd",async(reaction,user)=>{
if(reaction.partial){try{await reaction.fetch();}catch(error){return;}}
if(reaction.message.author.id==client.user.id){
if(reaction.message.embeds[0].footer.text.startsWith(`Vote posted by `)){
if(reaction._emoji.name=="👍"){reaction.message.reactions.cache.find(r=>r._emoji.name==="👎").users.remove(user.id);}
if(reaction._emoji.name=="👎"){reaction.message.reactions.cache.find(r=>r._emoji.name==="👍").users.remove(user.id);}
var upvotes=reaction.message.reactions.cache.find(r=>r._emoji.name==="👍").count;
var downvotes=reaction.message.reactions.cache.find(r=>r._emoji.name==="👎").count;
var embed=new Discord.MessageEmbed().setTitle(reaction.message.embeds[0].title).setFooter(reaction.message.embeds[0].footer.text);
var edit=true;
if(upvotes==downvotes){embed.setColor("#0088ff");}if(upvotes<downvotes){embed.setColor("#aa0000");}if(upvotes>downvotes){embed.setColor("#00aa00");}
if(reaction.message.embeds[0].color==embed.color){edit=false;}
if(edit){reaction.message.edit(reaction.message.content,embed);}
}
}});

client.on("messageReactionRemove",async(reaction,user)=>{
if(reaction.partial){try{await reaction.fetch();}catch(error){return;}}
if(reaction.message.author.id==client.user.id){
if(reaction.message.embeds[0].footer.text.startsWith(`Vote posted by `)){
var upvotes=reaction.message.reactions.cache.find(r=>r._emoji.name==="👍").count;
var downvotes=reaction.message.reactions.cache.find(r=>r._emoji.name==="👎").count;
var embed=new Discord.MessageEmbed().setTitle(reaction.message.embeds[0].title).setFooter(reaction.message.embeds[0].footer.text);
var edit=true;
if(upvotes==downvotes){embed.setColor("#0088ff");}if(upvotes<downvotes){embed.setColor("#aa0000");}if(upvotes>downvotes){embed.setColor("#00aa00");}
if(reaction.message.embeds[0].color==embed.color){edit=false;}
if(edit){reaction.message.edit(reaction.message.content,embed);}
}
}});

client.login(process.env.token);