var http = require("https");
var moment = require('moment');
var schedule = require("node-schedule");
var cmd=require('node-cmd');
var async = require('async');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function get(){

http.get('https://www.numbcube.com/auto', function (res) {
    //console.log("statusCode: ", res.statusCode);
    //console.log("headers: ", res.headers);
    var json = '';
var time = gettime();
    res.on('data', function (d) {
        json += d;
    });
    res.on('end',function(){
        //获取到的数据
        json = JSON.parse(json);
	
if(json && Array.isArray(json) && json.length > 0)
{
		json.forEach((v, i) => {
			if(json[i].needconvert == 0){
				cmd.run('start ffmpeg -re -i '+json[i].movie_path+' -c copy -f flv rtmp://127.0.0.1/numblive/'+json[i].stream);
				console.log('['+time+']Scene['+json[i].scene_id+']begin to play--'+json[i].movie_path+'--'+json[i].stream);
				(async() => {
				await delay(15000);
				//15秒后转发流到cdn服务器
				//cmd.run('start ffmpeg -re -i rtmp://127.0.0.1/numblive/'+json[i].stream+' -map 0 -c copy -f flv rtmp://push.numbcube.com/live/'+json[i].stream);
				
				//console.log('['+time+']Scene['+json[i].scene_id+']begin to sent to cdn --'+json[i].stream);
				setplay(json[i].scene_id);	
				})();

				
			}
			else{//非h.264+aac编码文件需要转码后推流
				cmd.run('start ffmpeg -re -i '+json[i].movie_path+' -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://127.0.0.1/numblive/'+json[i].stream);
				console.log('['+time+']Scene['+json[i].scene_id+']begin to play--'+json[i].movie_path+'--'+json[i].stream);
				(async() => {
				await delay(15000);
				//15秒后转发流到cdn服务器
				//cmd.run('start ffmpeg -i rtmp://127.0.0.1/numblive/'+json[i].stream+' -c copy -f flv rtmp://push.numbcube.com/live/'+json[i].stream);
				//console.log('['+time+']Scene['+json[i].scene_id+']begin to sent to cdn --'+json[i].stream);
				setplay(json[i].scene_id);
				})();	
			}
		});
	}
	else
	{
		console.log('无数据');
	}
	

    });
}).on('error', function (e) {
    console.error(e);
});

}

var rule1     = new schedule.RecurrenceRule();

var times1    = [1];

rule1.second  = times1;
var cal = 0;
schedule.scheduleJob(rule1, function(){
	cal = cal + 1;
	get();
	
	if(cal >= 5){
		var time = gettime();
		console.log('['+time+']heartbeat')
		cal = 0;
	}


});


function gettime(){

	return moment().format('MM-DD HH:mm:ss');
}





function setplay(sceneid){
var url = 'https://www.numbcube.com/setplay/'+sceneid;

http.get(url, function (res) {
    //console.log("statusCode: ", res.statusCode);
    //console.log("headers: ", res.headers);
var time = gettime();
    var json = '';
    res.on('data', function (d) {
        json += d;
    });
    res.on('end',function(){
        //获取到的数据
        json = JSON.parse(json);
	
if(json && Array.isArray(json) && json.length > 0)
{
		
		console.log('['+time+']Scene:['+sceneid+']status is reset to _playing:'+json[0].status);
	
		
	}
	else
	{
		console.log('无返回数据');
	}
	

    });
}).on('error', function (e) {
    console.error(e);
});

}
