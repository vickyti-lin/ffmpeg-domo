var ffmpeg = require('fluent-ffmpeg');

ffmpeg('./path/water.mp4')  
    .videoCodec('libx264') // 視頻編解碼器方式(编码格式)
    .fps(50) // 设置输出帧数
    .videoBitrate('500k') // 视频比特率
    .size('720x480') // 设置输出帧大小
    .on('start', function(commandLine) {
        console.log('Start: ' + commandLine);
    })
    .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
        console.log('Processing finished !');
    })
    .save('./path/water_480p_50fps.mp4')
    
