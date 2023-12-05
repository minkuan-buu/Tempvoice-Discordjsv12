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

module.exports = {
    name: "tempvoice",
    category: "test",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        let idchannel = args.join(` `)
        let idcategory = client.channels.cache.get(idchannel).parentID;
        connection.query(`INSERT INTO setuptempvoice VALUES ('${idchannel}','${idcategory}')`)
        message.channel.send(`Đã thêm channel mặc định!`)
    }
}