require("dotenv").config(); 
const Discord = require('discord.js');
var mysql = require("mysql");
const client = new Discord.Client({disableEveryone: true});

//=============load files===============
  // Collections
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  // Run the command loader
  ["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
  });
//=============================================

var mysql_config = {
    host: '45.79.49.141',
    user:'chillstore',
    password:'chillstore',
    database:'kpvhnew'
};

var connection;
connection = mysql.createConnection(mysql_config);
function handleDisconnect(myconnection) {
myconnection.on('error', function(err) {
    console.log(err)
    console.log('Re-connecting lost connection');
    connection.destroy();
    connection = mysql.createConnection(mysql_config);
    handleDisconnect(connection);
    connection.connect();
});
}

handleDisconnect(connection);
//====================
client.on('ready', () => {
console.log(`Bot Started!`)
});
//==================================
function count(){
setInterval(function(){
    connection.query(`SELECT * FROM tempvoice WHERE stt = '1' AND time != '0'`,(err,rows) =>{
    if(rows.length < 1) return;
    let channel = rows[0].id
    connection.query(`UPDATE tempvoice SET stt = 0 WHERE id = '${channel}'`)
    var x = setInterval(function(){
        connection.query(`SELECT * FROM tempvoice WHERE id = '${channel}'`,(err,rows) =>{
        if(rows.length < 1) return clearInterval(x);
        let time = rows[0].time;
        if(time <= 0) {
            connection.query(`UPDATE tempvoice SET stt = 1 WHERE id = '${channel}'`)
            return clearInterval(x);
        }
        connection.query(`UPDATE tempvoice SET time = time - 1000 WHERE id = '${channel}'`)
        })
    },1000)
    })
},500)
}
//====================
function autoclean(){
    setInterval(function(){
        connection.query(`SELECT * FROM tempvoice WHERE joinvoice <= 0 AND host = 0`,(err,rows) =>{
            if(rows.length < 1) return;
            let total = rows.length - 1;
            for(i = 0; i <= total;i++){
                let idtemp = rows[i].id;
                let check = client.channels.cache.find(c => c.id == idtemp)
                if (check == null){
                    console.log(`Channel này không tồn tại, id: ${idtemp}`)
                    connection.query(`SELECT * FROM tempvoice WHERE id = '${idtemp}'`,(err,rows) =>{
                        if(rows.length < 1) return
                        return connection.query(`DELETE FROM tempvoice WHERE id = '${idtemp}'`)
                    })
                } else {
                    check.delete()
                    console.log(`Đã xóa channel: ` + idtemp)
                    connection.query(`DELETE FROM tempvoice WHERE id = '${idtemp}'`)
                }
            }
        })
    },10000)
}
//=====================
function checkclone(){
setInterval(function(){
    connection.query(`SELECT * FROM tempvoice`,(err,rows) =>{
    if(rows.length < 1) return;
    if(err) return console.log(err)
    let i = 0;
    let max = rows.length - 1;
    console.log(`Số channel cần check: ${rows.length}`)
    let x = setInterval(function(){
        if(i <= max){
        let channel = rows[i].id;
        let guild = rows[i].guild;
        console.log(`Đang check channel: ${channel}`)
        let dem = 0
        client.guilds.cache.get(`${guild}`).members.cache.filter(m => !m.user.bot && m.voice.channelID != null).forEach((member) =>{
            if(member.voice.channelID == channel){
            dem++;
            } else return;
        })
        if(dem != 0){
            connection.query(`UPDATE tempvoice SET joinvoice = '${dem}' WHERE id = '${channel}'`)
        } else {
            connection.query(`UPDATE tempvoice SET joinvoice = '0', host = '0' WHERE id = '${channel}'`)
            //-----------------------------------
            let notiembed = new Discord.MessageEmbed()
            .setTitle(`Chill Tempvoice`)
            .setDescription('Đã tìm thấy channel tempvoice chưa được xóa: `' + channel + '`')
            // client.channels.get(`678523340683608090`).send(notiembed)
            //-----------------------------------
        }
        i++;
        } else {
            console.log(`Đã check toàn bộ channel chưa được xóa`)
            //-----------------------------------
            let notiembed = new Discord.MessageEmbed()
            .setTitle(`Chill Tempvoice`)
            .setDescription('Channel đã check:`' + rows.length + '`')
            // client.channels.get(`678523340683608090`).send(notiembed)
            //-----------------------------------
            clearInterval(x)
        }
    },3000)
    })
},180000)
}
//=======================================
function resethost(){
    setInterval(function(){
        connection.query(`SELECT * FROM tempvoice WHERE time = '0' AND stt = '1'`,(err,rows) =>{
            if(rows.length < 1) return;
            connection.query(`UPDATE tempvoice SET host = 0 WHERE time = '0' AND stt = '1'`)
        })
    },2000)
}
//=====================================
function checkPremium(){
    setInterval(function(){
        connection.query(`SELECT * FROM premium`,(err,rows) =>{
            if(rows.length < 1) return;
            for (let index = 0; index < rows.length; index++) {
                let user = rows[index].iduser;
                let now = new Date();
                let expired = new Date(rows[index].expired);
                if(expired - now <= 0){
                    connection.query(`DELETE FROM premium WHERE iduser = '${user}'`);
                }
            }
        })
    },3000)
}
//=====================================
client.on ("ready", async () => {
    console.log(`Đã khởi động ${client.user.username}`)
//================================================
    autoclean()
    resethost()
    count()
    checkclone();
    checkPremium();
})
//=======================================
client.on('message', async (message) =>{
    if(message.content.startsWith(`ccheckvoice`)){
    connection.query(`SELECT * FROM tempvoice WHERE joinvoice <= 0 AND host = 0`,(err,rows) =>{
        if(rows.length < 1) return message.channel.send(`Không có channel voice có joinvoice <= 0 (server mặc định: Chill House)`)
        for(i = 0;i <= rows.length - 1;i++){
        let id = rows[i].id;
        let check = client.channels.cache.find(c => c.id == id)
        if(check == null){
            message.channel.send(`Channel ${id} không tồn tại!`)
        } else return
        }
    })
    }
    if(message.author.bot) return;
    //=========run file code==========
    const prefix = ">";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    // If message.member is uncached, cache it.
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    // Get the command
    let command = client.commands.get(cmd);
    // If none is found, try to find it by alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) 
    command.run(client, message, args);
    //================================
})
//=======================================
client.on('voiceStateUpdate', async (oldMember, newMember) => {
    let newUserChannel = newMember.channel
    let oldUserChannel = oldMember.channel
    if(newMember.member.user.bot || oldMember.member.user.bot) return console.log(`Bot`);
    if (!oldUserChannel && newUserChannel) {
    let channel = newMember.channel;
    connection.query(`SELECT * FROM setuptempvoice WHERE idchannel = '${channel.id}'`,(err,rows) =>{
        if(rows.length < 1) {
        connection.query(`SELECT * FROM tempvoice WHERE id = '${channel.id}'`,(err,rows) =>{
            if(rows.length < 1) return;
            connection.query(`UPDATE tempvoice SET joinvoice = joinvoice + 1 WHERE id = ${channel.id}`)
        })
        } else {
        //-----------------------------------
        let notiembed = new Discord.MessageEmbed()
        .setTitle(`Chill Tempvoice`)
        .setDescription('<@' + newMember.id + '> đã tạo tempvoice')
        // client.channels.get(`678523340683608090`).send(notiembed)
        //-----------------------------------
        let cateid = rows[0].idcategory
        let category = newMember.guild.channels.cache.find(c => c.id == cateid && c.type == "category");
        let setbitrate = channel.bitrate;
        let setlimit = channel.userLimit;
        let setper = channel.permissionOverwrites.array();
        newMember.guild.channels.create(`🌙${newMember.member.user.username}`, {
            type: 'voice',
            parent: category.id,
            bitrate: setbitrate,
            userLimit: setlimit,
            permissionOverwrites: setper
        }).then(newchannel =>{
            //-----------------------------------
            let notiembed = new Discord.MessageEmbed()
            .setTitle(`Chill Tempvoice`)
            .setDescription('<@' + newMember.id + '> đã tạo tempvoice: `' + newchannel.id + '`')
            // client.channels.get(`678523340683608090`).send(notiembed)
            //-----------------------------------
            connection.query(`INSERT INTO tempvoice VALUES ('${newchannel.id}','0','${newMember.id}','0','7200000','0','1','${newchannel.guild.id}')`)
            var x = setInterval(function(){
            connection.query(`SELECT * FROM tempvoice WHERE id = '${newchannel.id}'`,(err,rows) =>{
                if(rows.length < 1) return clearInterval(x);
                let time = rows[0].time;
                if(time <= 0) {
                connection.query(`UPDATE tempvoice SET stt = 1 WHERE id = '${newchannel.id}'`)
                return clearInterval(x);
                }
                connection.query(`UPDATE tempvoice SET time = time - 1000 WHERE id = '${newchannel.id}'`)
            })
            },1000)
            newMember.setChannel(newchannel)
        })
        }
    })
    } else if (!newUserChannel) {
    if(newMember.member.user.bot || oldMember.member.user.bot) return;
    let channel = oldMember.channel;
    connection.query(`SELECT * FROM tempvoice WHERE id = '${channel.id}'`,(err,rows) =>{
        if(rows.length < 1) return;
        let host = rows[0].host;
        if(oldMember.id == host){
        connection.query(`UPDATE tempvoice SET host = 0, joinvoice = joinvoice - 1 WHERE id = '${channel.id}'`)
        // setTimeout(function(){
        //   connection.query(`SELECT * FROM tempvoice WHERE id = '${channel.id}'`,(err,rows) =>{
        //     if(rows.length < 1) return;
        //     let join = rows[0].joinvoice;
        //     if(join == 0){
        //       connection.query(`DELETE FROM tempvoice WHERE id = '${channel.id}'`)
        //       client.channels.get(`${channel.id}`).delete()
        //     }
        //   })
        // },10000)
        } else {
        connection.query(`UPDATE tempvoice SET joinvoice = joinvoice - 1 WHERE id = ${channel.id}`)
        // setTimeout(function(){
        //   connection.query(`SELECT * FROM tempvoice WHERE id = ${channel.id}`,(err,rows) =>{
        //     if(rows.length < 1) return;
        //     let join = rows[0].joinvoice;
        //     if(join == 0){
        //       connection.query(`DELETE FROM tempvoice WHERE id = ${channel.id}`)
        //       client.channels.get(`${channel.id}`).delete()
        //     }
        //   })
        // },10000)
        }
        //-----------------------------------
        let notiembed = new Discord.MessageEmbed()
        .setTitle(`Chill Tempvoice`)
        .setDescription('<@' + newMember.id + '> đã rời channel: `' + channel.id + '`')
        // client.channels.get(`678523340683608090`).send(notiembed)
        //-----------------------------------
    })
    //oldUserChannel && newUserChannel && oldUserChannel.id != newUserChannel.id
    } else if(oldUserChannel && newUserChannel && oldUserChannel != newUserChannel){
    if(newMember.member.user.bot || oldMember.member.user.bot) return;
    //client.channels.get(`679795841170407477`).send(`${oldMember} đã chuyển sang ${newUserChannel.name}`)
    let channel = newMember.channel;
    connection.query(`SELECT * FROM setuptempvoice WHERE idchannel = '${channel.id}'`,(err,rows) =>{
        if(rows.length > 0) {
        let cateid = rows[0].idcategory;
        let setbitrate = channel.bitrate;
        let setlimit = channel.userLimit;
        let setper = channel.permissionOverwrites.array();
        let category = newMember.guild.channels.cache.find(c => c.id == cateid && c.type == "category");
        newMember.guild.channels.create(`☕${newMember.member.user.username}`, {
            type: 'voice',
            parent: category.id,
            bitrate: setbitrate,
            userLimit: setlimit,
            permissionOverwrites: setper
        }).then(newchannel =>{
            //-----------------------------------
            let notiembed = new Discord.MessageEmbed()
            .setTitle(`Chill Tempvoice`)
            .setDescription('<@' + newMember.id + '> đã tạo tempvoice: `' + newchannel.id + '`')
            // client.channels.get(`678523340683608090`).send(notiembed)
            //-----------------------------------
            connection.query(`INSERT INTO tempvoice VALUES ('${newchannel.id}','0','${newMember.id}','0','7200000','0','1','${newchannel.guild.id}')`)
            var x = setInterval(function(){
            connection.query(`SELECT * FROM tempvoice WHERE id = '${newchannel.id}'`,(err,rows) =>{
                if(rows.length < 1) return clearInterval(x);
                let time = rows[0].time;
                if(time <= 0) {
                connection.query(`UPDATE tempvoice SET stt = 1 WHERE id = '${newchannel.id}'`)
                return clearInterval(x);
                }
                connection.query(`UPDATE tempvoice SET time = time - 1000 WHERE id = '${newchannel.id}'`)
            })
            },1000)
            oldMember.setChannel(newchannel)
        })
        connection.query(`SELECT * FROM tempvoice WHERE id = '${oldUserChannel.id}'`,(err,rows) =>{
            if(rows.length < 1) return;
            connection.query(`SELECT * FROM tempvoice WHERE id = ${oldUserChannel.id}`,(err,rows) =>{
            if(rows.length < 1) return;
            let host = rows[0].host;
            if(oldMember.id == host){
                connection.query(`UPDATE tempvoice SET host = 0, joinvoice = joinvoice - 1 WHERE id = ${oldUserChannel.id}`)
                // setTimeout(function(){
                //   connection.query(`SELECT * FROM tempvoice WHERE id = ${oldUserChannel.id}`,(err,rows) =>{
                //     if(rows.length < 1) return;
                //     let join = rows[0].joinvoice;
                //     if(join == 0){
                //       connection.query(`DELETE FROM tempvoice WHERE id = ${oldUserChannel.id}`)
                //       client.channels.get(`${oldUserChannel.id}`).delete()
                //     }
                //   })
                // },10000)
            } else {
                connection.query(`UPDATE tempvoice SET joinvoice = joinvoice - 1 WHERE id = ${oldUserChannel.id}`)
                // setTimeout(function(){
                //   connection.query(`SELECT * FROM tempvoice WHERE id = ${oldUserChannel.id}`,(err,rows) =>{
                //     if(rows.length < 1) return;
                //     let join = rows[0].joinvoice;
                //     if(join == 0){
                //       connection.query(`DELETE FROM tempvoice WHERE id = ${oldUserChannel.id}`)
                //       client.channels.get(`${oldUserChannel.id}`).delete()
                //     }
                //   })
                // },10000)
            }
            })
        })
        } else {
        connection.query(`SELECT * FROM tempvoice WHERE id = '${oldUserChannel.id}'`,(err,rows) =>{
            if(rows.length < 1){
            connection.query(`SELECT * FROM tempvoice WHERE id = '${newUserChannel.id}'`,(err,rows) =>{
                if(rows.length < 1) return;
                connection.query(`UPDATE tempvoice SET joinvoice = joinvoice + 1 WHERE id = ${newUserChannel.id}`)
            })
            return;
            };
            let host = rows[0].host;
            if(oldMember.id == host){
            connection.query(`UPDATE tempvoice SET host = 0, joinvoice = joinvoice - 1 WHERE id = ${oldUserChannel.id}`)
            connection.query(`UPDATE tempvoice SET joinvoice = joinvoice + 1 WHERE id = ${newUserChannel.id}`)
            // setTimeout(function(){
            //   connection.query(`SELECT * FROM tempvoice WHERE id = ${oldUserChannel.id}`,(err,rows) =>{
            //     if(rows.length < 1) return;
            //     let join = rows[0].joinvoice;
            //     if(join == 0){
            //       connection.query(`DELETE FROM tempvoice WHERE id = ${oldUserChannel.id}`)
            //       client.channels.get(`${oldUserChannel.id}`).delete()
            //     }
            //   })
            // },10000)
            } else {
            connection.query(`UPDATE tempvoice SET joinvoice = joinvoice - 1 WHERE id = ${oldUserChannel.id}`)
            connection.query(`UPDATE tempvoice SET joinvoice = joinvoice + 1 WHERE id = ${newUserChannel.id}`)
            // setTimeout(function(){
            //   connection.query(`SELECT * FROM tempvoice WHERE id = ${oldUserChannel.id}`,(err,rows) =>{
            //     if(rows.length < 1) return;
            //     let join = rows[0].joinvoice;
            //     if(join == 0){
            //       connection.query(`DELETE FROM tempvoice WHERE id = ${oldUserChannel.id}`)
            //       client.channels.get(`${oldUserChannel.id}`).delete()
            //     }
            //   })
            // },10000)
            }
        })
        } 
    })
    }
})
client.login(process.env.TOKEN)