# NumbCuve - AutoPlay
numbcube系统监控及自动推流模块

# 运行原理
本程序没分钟调用一次接口，解析返回的json，如返回有需要播放的影片，则根据对应数据调用ffmpeg推流，根据返回数据觉得是否需要转码，并在等待15秒后，将流同步推送到cdn服务器

# 使用方法
* 确保已安装nodejs
* 确保已安装相应npm模块`npm install https` `npm install moment` `npm install node-schedule` `npm install node-cmd` `npm instal async`
* 本模块需要结合NumbCube系统使用，使用前请先配置好Numbcube主体，确保接口可以正常调用
* 修改本程序内推流地址
* 开始运行
