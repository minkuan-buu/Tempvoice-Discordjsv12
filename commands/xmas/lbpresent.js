const Discord = require("discord.js");
var mysql = require("mysql");
//===============database=================
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
//=========================================
const stt = ['01','02','03','04','05','06','07','08','09','10']
module.exports = {
    //name: "lbxmas",
    category: "test",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        // if(message.author.id === `325070483668074498` || message.author.id === `478185295389655050`){ //TEST ONLY
            connection.query(`SELECT * FROM inventory ORDER BY xmaspresent DESC LIMIT 30`,(err,rows) =>{
                if(rows.length < 1){
                    let errembed = new Discord.MessageEmbed()
                    .setTitle(`**Top 10 thành viên | số hộp quà | cao nhất tại server ${message.guild.name}!**`)
                    .setColor(`#eff3c6`)
                    .setDescription(`Chưa có top!`)
                    .setTimestamp()
                    .setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
                    return message.channel.send(errembed)
                } else {
                    let max = 9;
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`**Top 10 thành viên | số hộp quà | cao nhất tại server ${message.guild.name}!**`)
                    .setColor(`#eff3c6`)
                    .setTimestamp()
                    .setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
                    let content = ``;
                    for(i = 0;i<=max;i++){
                        let iduser = rows[i].iduser;
                        let xmaspresent = rows[i].xmaspresent;
                        let check = client.guilds.cache.get(`675752923384381507`).members.cache.find(m => m.id === iduser);
                        content = content + '`#' + stt[i] + '.`' + '🎁`' + xmaspresent + ' hộp quà` <a:arrowright:698616937638264832> **<@' + iduser + `>**\n`
                        
                    }
                    embed.setDescription(content)
                    return message.channel.send(embed)
                }
            })
        // } else { //TEST ONLY
        //     let errembed = new Discord.RichEmbed()
        //     .setTitle(`**Top 10 thành viên | số tin nhắn | cao nhất tại server ${message.guild.name}!**`)
        //     .setColor(`#eff3c6`)
        //     .setDescription(`Bảng xếp hạng đang được bảo trì!`)
        //     .setTimestamp()
        //     .setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
        //     message.channel.send(errembed)
        // }
    }
}