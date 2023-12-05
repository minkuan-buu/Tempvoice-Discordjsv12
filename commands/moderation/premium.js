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
let embed = new Discord.MessageEmbed()
.setTitle(`KPVH Premium`)
.setColor(`#FFDAB9`)
.setTimestamp()

module.exports = {
    name: "premium",
    category: "test",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        let server = `675752923384381507`;
        embed.setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
        let checkuser = message.guild.members.cache.find(m => m.id === `${message.author.id}`)
        if(checkuser.hasPermission(`ADMINISTRATOR`) || message.guild.members.cache.get(`325070483668074498`)){
            let array = message.content.split(" ")
            let title = array[1]
            if(title == `add`){
                if(!array[3]){
                    let user = message.mentions.users.first()
                    if(!user/* || !message.guild.member(user.id)*/){
                        embed.setDescription(`Hãy kiểm tra thử bạn đã mentions người chưa? Hay người bạn muốn add có hiện diện trong server Chill House không?`)
                        return message.channel.send(embed)
                    } 
                    connection.query(`SELECT * FROM premium WHERE iduser = '${user.id}'`,(err,rows) =>{
                        if(rows.length > 0) {
                            embed.setDescription(`${user} đã có Premium!`)
                            return message.channel.send(embed)
                        } else {
                            var expire = new Date();
                            expire.setDate(expire.getDate() + 30)
                            connection.query(`INSERT INTO premium VALUES ('${user.id}','${expire}')`)
                            //connection.query(`INSERT INTO premiumstt VALUES ('${user.id}','1')`)
                            embed.setDescription(`Đã nâng cấp Premium cho ${user}!\n+ Ngày Hết hạn: **${expire.getDate()}**/**${expire.getMonth() + 1}**/**${expire.getFullYear()}** (**30** ngày)`)
                            client.users.cache.get(user.id).send(embed)
                            // if(!message.guild.members.cache.get(`${user.id}`).roles.cache.find(r => r.id === `981861759885406240`)){
                            //     message.guild.members.cache.get(`${user.id}`).roles.add('981861759885406240')
                            // }
                            embed.setDescription(`Đã nâng cấp Premium cho ${user}!\n+ Ngày Hết hạn: **${expire.getDate()}**/**${expire.getMonth() + 1}**/**${expire.getFullYear()}**\n\n*Ngày hết hạn có thể chênh lệch vài phút, có khi vài ngày. Nếu gặp bất kì lỗi gì liên hệ [tại đây](https://m.me/phanxicoxavieminhquan)*`)
                            return message.channel.send(embed)
                        }
                    })
                } else {
                    let days = parseInt(array[3]);
                    if(typeof(days) != "number"){
                        embed.setDescription('Số ngày không hợp lệ!')
                        return message.channel.send(embed)
                    }
                    let user = message.mentions.users.first()
                    if(!user/* || !message.guild.member(user.id)*/){
                        embed.setDescription(`Hãy kiểm tra thử bạn đã mentions người chưa? Hay người bạn muốn add có hiện diện trong server Chill House không?`)
                        return message.channel.send(embed)
                    } 
                    connection.query(`SELECT * FROM premium WHERE iduser = '${user.id}'`,(err,rows) =>{
                        if(rows.length > 0) {
                            embed.setDescription(`${user} đã có Premium!`)
                            return message.channel.send(embed)
                        } else {
                            var expire = new Date();
                            expire.setDate(expire.getDate() + days);
                            connection.query(`INSERT INTO premium VALUES ('${user.id}','${expire}')`)
                            //connection.query(`INSERT INTO premiumstt VALUES ('${user.id}','1')`)
                            embed.setDescription(`Đã nâng cấp Premium cho ${user}!\n+ Ngày Hết hạn: **${expire.getDate()}**/**${expire.getMonth() + 1}**/**${expire.getFullYear()}** (**${days}** ngày)`)
                            client.users.cache.get(user.id).send(embed)
                            // if(!message.guild.members.cache.get(`${user.id}`).roles.cache.find(r => r.id === `981861759885406240`)){
                            //     message.guild.members.cache.get(`${user.id}`).roles.add('981861759885406240')
                            // }
                            embed.setDescription(`Đã nâng cấp Premium cho ${user}!\n+ Ngày Hết hạn: **${expire.getDate()}**/**${expire.getMonth() + 1}**/**${expire.getFullYear()}**\n\n*Ngày hết hạn có thể chênh lệch vài phút, có khi vài ngày. Nếu gặp bất kì lỗi gì liên hệ [tại đây](https://m.me/phanxicoxavieminhquan)*`)
                            return message.channel.send(embed)
                        }
                    })
                }
            } else if(title == `remove`) {
                let user = message.mentions.users.first()
                let check = message.guild.members.cache.get(user.id);
                if(!user/* || !check*/){
                    embed.setDescription(`Hãy kiểm tra thử bạn đã mentions người chưa? Hay người bạn muốn add có hiện diện trong server Chill House không`)
                    return message.channel.send(embed)
                }
                connection.query(`SELECT * FROM premium WHERE iduser = '${user.id}'`,(err,rows) =>{
                    if(rows.length < 1) {
                        embed.setDescription(`${user} không có Premium!`)
                        return message.channel.send(embed)
                    } else {
                        connection.query(`DELETE FROM premium WHERE iduser = '${user.id}'`)
                        embed.setDescription(`Đã xóa Premium ${user}!`)
                        if(message.guild.members.cache.get(`${user.id}`).roles.cache.find(r => r.id === `981861759885406240`)){
                            message.guild.members.cache.get(`${user.id}`).roles.remove('981861759885406240')
                        }
                        return message.channel.send(embed)
                    }
                })
            }
            
        } else {
            embed.setDescription(`Bạn không thể sử dụng lệnh này!`)
            return message.channel.send(embed)
        }
    }
}
