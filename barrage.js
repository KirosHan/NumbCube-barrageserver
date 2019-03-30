var fs = require('fs');
var privateKey  = fs.readFileSync('cert/server.onsigma.com.key', 'utf8');
var certificate = fs.readFileSync('cert/server.onsigma.com.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var app = require('express')(),
    server = require('https').createServer(credentials,app),
    io = require('socket.io').listen(server);
var moment = require('moment');
moment.locale('zh-cn');

var schedule = require("node-schedule");

/*监听端口*/
server.listen(7000);
console.log('开始监听端口:7000');
/*初始化用户对象用了分发消息，*/
var user = {};
io.on('connection', function(socket) {


var rule1     = new schedule.RecurrenceRule();

var times1    = [1,6,11,16,21,26,31,36,41,46,51,56];

rule1.second  = times1;
schedule.scheduleJob(rule1, function(){
  //广播在线人数
		var num=0,uuser=[];
            for (x in user){
               uuser.push(x);
                num++;
            }
            
	var mydata = {
                users: num,
   
            };



socket.broadcast.emit('sum', mydata );});

    /*开始捕捉事件*/
    socket.on('message', function(d) {
      //console.log(d);
      //console.log(typeof(d));

try{

        switch (JSON.parse(d).type) {

        /*用户上线*/
        case 'reg':


            user[JSON.parse(d).content.uid] = socket.id;
            var num=0,uuser=[];
            for (x in user){
               uuser.push(x);
                num++;
            }
            JSON.parse(d).content.num=num;

            //全局事件
            socket.broadcast.emit('addList', JSON.parse(d).content);


            ///发给自己
            var reguser={uuser:uuser,num:num};
            socket.emit('reguser', reguser);
	var formatDate = moment().format('MM-DD HH:mm:ss');
            console.log('['+formatDate +']【上线：'+JSON.parse(d).content.room+'】用户'+JSON.parse(d).content.uname +' (ID:'+ JSON.parse(d).content.uid+' IP:'+JSON.parse(d).content.ip+')' + '| 客户端id=' + socket.id);
            break;

         /*用户发送消息*/
        case 'chatMessage':

            var mydata = {
                username: JSON.parse(d).content.mine.username,
                avatar: JSON.parse(d).content.mine.avatar,
                id: JSON.parse(d).content.mine.id,
                content: JSON.parse(d).content.mine.content,
                type: JSON.parse(d).content.to.type,
                toid: JSON.parse(d).content.to.id
            };

            /*处理单聊事件*/
            if (JSON.parse(d).content.to.type == 'friend') {
                if (user[mydata.toid]) {/*广播消息*/
                    io.sockets.sockets[user[mydata.toid]].emit('chatMessage', mydata);
                    console.log('[' + JSON.parse(d).content.mine.username + ']对[' + JSON.parse(d).content.to.username + ']说:' + JSON.parse(d).content.mine.content)
                } else {
                    socket.emit('noonline', mydata);
                }


               /*处理群聊事件*/
            } else if (JSON.parse(d).content.to.type == 'group') {
                mydata.id = mydata.toid;
                socket.broadcast.emit('chatMessage', mydata)
	 var formatDate = moment().format('MM-DD HH:mm:ss');
                console.log('['+formatDate +']' + JSON.parse(d).content.mine.username + '(ID:'+ JSON.parse(d).content.mine.id+')在群'+mydata.toid+'里说：'+ JSON.parse(d).content.mine.content);
            }
            break;
          default:
            console.log('连接了');
            break;
        }

      }catch(e)
      {
        console.log(e);
      }

        /*注销事件*/
    }).on('disconnect', function() {
        var outid=0,usernum=0;
        for (x in user) {
            usernum++;
            if (user[x] == socket.id) {
                outid=x
               delete user[x]
            }
        }

var formatDate = moment().format('MM-DD HH:mm:ss');
         console.log('['+formatDate +']'+'【下线】用户ID=' + outid + '下线了');
         var out={id:outid,num:usernum-1}
         io.sockets.emit('out',out);
    })
});
