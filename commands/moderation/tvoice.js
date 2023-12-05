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
.setColor(`#FFDAB9`)
.setTimestamp()

module.exports = {
    name: "voice",
    category: "test",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        embed.setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
        .setTitle(`Temp Voice`)
        let array = message.content.split(` `)
        let check = array[1]
        if(check == `limit` || check == `lm`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let strcount = 1 + check.length; 
            let setlimit = parseInt(args.join(` `).slice(strcount));
            if(setlimit < 1 || setlimit > 99){
                embed.setDescription(`Vui lòng nhập đúng định dạng là số! (1-99)`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                if(host == 0 || host != message.author.id){
                    embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                    return message.channel.send(embed)
                } else if (!setlimit){
                    checkin.channel.edit({userLimit: null});
                    embed.setDescription(`Đã tắt limit của Voice Channel!`)
                    message.channel.send(embed)
                } else {
                    checkin.channel.edit({userLimit: setlimit});
                    embed.setDescription(`Đã cập nhật limit của Voice Channel thành: **${setlimit}**`)
                    message.channel.send(embed)
                }
            })
        } else if(check == `lock` || check == `l`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            checkin.guild.members.cache.filter(m => m.voice.channelID === `${checkin.channelID}`).forEach(members => {
                                checkin.channel.createOverwrite(members.id, {
                                    CONNECT: true
                                })
                            });
                            checkin.channel.createOverwrite(message.guild.id, {
                                CONNECT: false,
                                VIEW_CHANNEL: true,
                            })
                            connection.query(`UPDATE tempvoice SET lockstt = 1 WHERE id = '${checkin.channelID}'`)
                            embed.setDescription(`Đã lock voice channel!`)
                            message.channel.send(embed)
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            })
        } else if(check == `unlock` || check == `ul` || check == `unl`) {
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            checkin.channel.createOverwrite(/*message.guild.roles.cache.find(r => r.id === `734953097427812413`)*/message.guild.id, {
                                CONNECT: true
                            })
                            connection.query(`UPDATE tempvoice SET lockstt = 0 WHERE id = '${checkin.channelID}'`)
                            embed.setDescription(`Đã unlock voice channel!`)
                            message.channel.send(embed)
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            });
        } else if(check == `name` || check == `n` || check == `cn`) {
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let strcount = 1 + check.length; 
            let setname = args.join(` `).slice(strcount)
            if(!setname){
                embed.setDescription(`Vui lòng nhập tên để thay đổi tên Voice Channel!`)
                return message.channel.send(embed)
            }
            console.log(checkin.channelID)
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                if(host == 0 || host != message.author.id){
                    embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                    return message.channel.send(embed)
                }
                checkin.channel.edit({name: setname});
                embed.setDescription(`Đã cập nhật tên của Voice Channel thành: **${setname}**`)
                message.channel.send(embed)
            })
        } else if(check == `claim` || check == `c`) {
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                if(host == 0){
                    let time = rows[0].time;
                    if(time == 0){
                        connection.query(`UPDATE tempvoice SET host = '${message.author.id}',time = 7200000 WHERE id = '${checkin.channelID}'`)
                        embed.setDescription(`Bạn đã trở thành host Voice Channel: **${checkin.channel.name}**`)
                    } else {
                        connection.query(`UPDATE tempvoice SET host = '${message.author.id}' WHERE id = '${checkin.channelID}'`)
                        embed.setDescription(`Bạn đã trở thành host Voice Channel: **${checkin.channel.name}**`)
                    }
                    return message.channel.send(embed)
                } else if (host == message.author.id) {
                    embed.setDescription(`Bạn đã là host cúa Voice Channel này!`)
                    return message.channel.send(embed)
                } else {
                    embed.setDescription(`Voice Channel này đã có host!`)
                    return message.channel.send(embed)
                }
            })
        } else if(check == `info` || check == `i`) {
            let iembed = new Discord.MessageEmbed()
            .setTitle(`Temp Voice`)
            .setColor(`#FFDAB9`)
            .setTimestamp()
            .setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                iembed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(iembed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                let name = checkin.channel.name;
                let bitrate = checkin.channel.bitrate;
                let lock = rows[0].lockstt;
                let limit = checkin.channel.userLimit;
                let time = rows[0].time;
                let show = rows[0].showvoice;
                let join = rows[0].joinvoice;
                let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((time % (1000 * 60)) / 1000);
                iembed.setDescription(`<a:ch_music:681337915749433518> | Tên channel: **${name}**`)
                if(host != 0){
                    iembed.addField(`Host`,`<@${host}>`)
                    .addField(`Bitrate`,`${parseInt(bitrate)/1000}kbps`,true)
                    .addField(`Limit`,`${limit}`,true)
                    .addField(`Đang tham gia`,`${join}`,true)
                    if(lock == 1){
                        if(show == 1){
                            iembed.addField(`Lock`,`Có`,true)
                            .addField(`Tình trạng`,`Hiển thị`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        } else if(show == 0) {
                            iembed.addField(`Lock`,`Có`,true)
                            .addField(`Tình trạng`,`Ẩn`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        }
                    } else if(lock == 0) {
                        if(show == 1){
                            iembed.addField(`Lock`,`Không`,true)
                            .addField(`Tình trạng`,`Hiển thị`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        } else if(show == 0) {
                            iembed.addField(`Lock`,`Không`,true)
                            .addField(`Tình trạng`,`Ẩn`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        }
                    }
                } else {
                    iembed.addField(`Host`,`Không`)
                    .addField(`Bitrate`,`${parseInt(bitrate)/1000}kbps`,true)
                    .addField(`Limit`,`${limit}`,true)
                    .addField(`Đang tham gia`,`${join}`,true)
                    if(lock == 1){
                        if(show == 1){
                            iembed.addField(`Lock`,`Có`,true)
                            .addField(`Tình trạng`,`Hiển thị`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        } else if(show == 0) {
                            iembed.addField(`Lock`,`Có`,true)
                            .addField(`Tình trạng`,`Ẩn`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        }
                    } else if(lock == 0) {
                        if(show == 1){
                            iembed.addField(`Lock`,`Không`,true)
                            .addField(`Tình trạng`,`Hiển thị`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        } else if(show == 0) {
                            iembed.addField(`Lock`,`Không`,true)
                            .addField(`Tình trạng`,`Ẩn`,true)
                            .addField(`Thời gian đặt lại host`,`${hours}:${minutes}:${seconds}`,true)
                            message.channel.send(iembed)
                        }
                    }
                }
            })
        } else if(check == `transfer`|| check == `trans` || check == `tf`) {
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let members = message.mentions.users.first();
            if(!members){
                embed.setDescription(`Bạn phải mentions người được nhận host!`)
                return message.channel.send(embed)
            }
            let check = message.guild.members.cache.get(members.id).voice;
            if(check == null || checkin.channelID != check.channelID){
                embed.setDescription(`Người nhận host phải trong Voice Channel này!`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == message.author.id){
                            connection.query(`UPDATE tempvoice SET host = '${members.id}' WHERE id = '${checkin.channelID}'`)
                            embed.setDescription(`Đã chuyển quyền host cho <@${members.id}>`)
                            return message.channel.send(embed)
                        } else {
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            });
        } else if(check == `hide` || check == `h`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);
                let host = rows[0].host;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            connection.query(`UPDATE tempvoice SET showvoice = '0' WHERE id = '${checkin.channelID}'`)
                            checkin.guild.members.cache.filter(m => m.voice.channelID === `${checkin.channelID}`).forEach(members => {
                                checkin.channel.createOverwrite(members.id, {
                                    VIEW_CHANNEL: true
                                })
                            });
                            checkin.channel.createOverwrite(message.guild.id, {
                                VIEW_CHANNEL: false,
                            })
                            embed.setDescription(`Đã ẩn Voice Channel!`)
                            message.channel.send(embed)
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            })
        } else if(check == `show` || check == `sh`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            connection.query(`UPDATE tempvoice SET showvoice = '1' WHERE id = '${checkin.channelID}'`)
                            checkin.channel.createOverwrite(message.guild.id, {
                                VIEW_CHANNEL: true,
                            })
                            embed.setDescription(`Đã hiện Voice Channel!`)
                            message.channel.send(embed)
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            })
        } else if(check == `allow` || check == `a`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let members = message.mentions.users.first();
            if(!members){
                embed.setDescription(`Bạn phải mentions người được cho phép tham gia!`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                let lock = rows[0].lockstt;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            if(lock == 0){
                                embed.setDescription(`Bạn phải lock Voice Channel trước khi sử dụng lệnh này!`)
                                return message.channel.send(embed)
                            } else {
                                checkin.channel.createOverwrite(members.id, {
                                    VIEW_CHANNEL: true,
                                    CONNECT: true,
                                })
                                embed.setDescription(`Đã cho phép <@${members.id}> tham gia Voice Channel: **${checkin.channel.name}**`)
                                message.channel.send(embed)
                            }
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            })
        } else if(check == `deny` || check == `d`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let members = message.mentions.users.first();
            if(!members){
                embed.setDescription(`Bạn phải mentions người được cho phép tham gia!`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                let lock = rows[0].lockstt;
                connection.query(`SELECT * FROM premium WHERE iduser = '${message.author.id}'`,(err,rows) =>{
                    if(rows.length > 0){
                        if(host == 0 || host != message.author.id){
                            embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                            return message.channel.send(embed)
                        } else {
                            if(lock == 0){
                                embed.setDescription(`Bạn phải lock Voice Channel trước khi sử dụng lệnh này!`)
                                return message.channel.send(embed)
                            } else {
                                checkin.channel.createOverwrite(members.id, {
                                    VIEW_CHANNEL: null,
                                    CONNECT: false,
                                })
                                embed.setDescription(`Đã chặn <@${members.id}> tham gia Voice Channel: **${checkin.channel.name}**`)
                                message.channel.send(embed)
                            }
                        }
                    } else {
                        embed.setDescription(`Bạn phải có **Premium** để sử dụng lệnh này!`)
                        return message.channel.send(embed)
                    }
                })
            })
        } else if(check == `mute` || check == `m`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let members = message.mentions.users.first();
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                if(host == message.author.id){
                    if(!members){
                        checkin.guild.members.cache.filter(m => m.voice.channelID === `${checkin.channelID}`).forEach(members => {
                            checkin.guild.members.cache.find(m => m.id === members.id).setMute(true)
                        });
                        checkin.guild.members.cache.find(m => m.id === host).voice.setMute(false)
                        embed.setDescription(`Đã mute tất cả`)
                        return message.channel.send(embed)
                    } else {
                        let check = message.guild.members.cache.get(members.id).voice;
                        if(check == null || checkin.channelID != check.channelID){
                            embed.setDescription(`Người bị mute phải trong Voice Channel này!`)
                            return message.channel.send(embed)
                        }
                        checkin.guild.members.cache.find(m => m.id === members.id).voice.setMute(true)
                        embed.setDescription(`Đã mute <@${members.id}>`)
                        return message.channel.send(embed)
                    }
                } else {
                    embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                    return message.channel.send(embed)
                }
            });
        } else if(check == `unmute` || check == `um`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let members = message.mentions.users.first();
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                if(host == message.author.id){
                    if(!members){
                        checkin.guild.members.cache.filter(m => m.voice.channelID === `${checkin.channelID}`).forEach(members => {
                            checkin.guild.members.cache.find(m => m.id === members.id).voice.setMute(false)
                        });
                        embed.setDescription(`Đã unmute tất cả`)
                        return message.channel.send(embed)
                    } else {
                        let check = message.guild.members.cache.get(members.id).voice;
                        if(check == null || checkin.channelID != check.channelID){
                            embed.setDescription(`Người được unmute phải trong Voice Channel này!`)
                            return message.channel.send(embed)
                        }
                        checkin.guild.members.cache.find(m => m.id === members.id).voice.setMute(false)
                        embed.setDescription(`Đã unmute <@${members.id}>`)
                        return message.channel.send(embed)
                    }
                } else {
                    embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                    return message.channel.send(embed)
                }
            });
        } else if(check == `random` || check == `r`){
            let checkin = message.guild.members.cache.get(message.author.id).voice;
            if(checkin == null){
                embed.setDescription(`Bạn phải ở trong voice trước khi dùng lệnh này`)
                return message.channel.send(embed)
            }
            let strcount = 1 + check.length; 
            let content = args.join(` `).slice(strcount);
            if(!content){
                embed.setDescription(`Nhập thiếu nội dung random!`)
                .setTitle(`RANDOM`)
                return message.channel.send(embed)
            }
            connection.query(`SELECT * FROM tempvoice WHERE id = '${checkin.channelID}'`,(err,rows) =>{
                if(rows.length < 1) return message.channel.send(`Có lỗi xảy ra! Vui lòng liên hệ Admin/Dev`);;
                let host = rows[0].host;
                if(host == message.author.id){
                    let array = []
                    checkin.guild.members.cache.filter(m => m.voice.channelID === `${checkin.channelID}`).forEach(members => {
                        array.push(members.id)
                    });
                    let timeleft = 5;
                    let embedr = new Discord.MessageEmbed()
                    .setTitle(`${content}`)
                    .setDescription(`Kết quả sẽ có trong: **${timeleft}s**`)
                    .setColor(`#FFDAB9`)
                    .setTimestamp()
                    .setFooter(`Powered by ${client.user.username}`,`https://media.discordapp.net/attachments/678523277362331658/694499794541871104/gifch2.gif`)
                    message.channel.send(embedr).then(mess =>{
                        let x = setInterval(function(){
                            timeleft = timeleft - 1;
                            embedr.setDescription(`Kết quả sẽ có trong: **${timeleft}s**`)
                            mess.edit(embedr)
                            if(timeleft == 0){
                                let total = array.length;
                                let rannum = Math.floor(Math.random()*total);
                                embedr.setDescription(`Người được chọn là <@${array[rannum]}>`)
                                clearInterval(x)
                                return mess.edit(embedr)
                            }
                        },1000)
                    })
                } else {
                    embed.setDescription(`Bạn phải có quyền host trong channel này để sử dụng lệnh này!`)
                    return message.channel.send(embed)
                }
            });
        } else if(check == `ping` || check == `p`){
            if(message.author.id == `325070483668074498`){
                let ping = Math.floor(client.ping)
                let pingEmbed = new Discord.MessageEmbed()
                .setTitle('Pong!')
                .setDescription(ping + `ms`)
                .setColor("RANDOM")
                return message.channel.send(pingEmbed)
            }
        }
    }
}