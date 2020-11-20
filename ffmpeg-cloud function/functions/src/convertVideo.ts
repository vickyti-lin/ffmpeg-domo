import { video } from './../video.interface';
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_Static = require('ffmpeg-static');
const ffmpegOnProgress = require('ffmpeg-on-progress')

// progress bar
const durationEstimate = 30000;
const logProgress = (progress: any, event: any) => {
    console.log('Progress:', (progress * 100).toFixed() + '%');
};

module.exports.onConvertVideo = function (inputVideoPath: video['path'] , outputVideoPath: video['path'] ){
    return new Promise((resolve, reject) => {
        ffmpeg(inputVideoPath)
        .videoCodec('libx264') // 視頻編解碼器方式(编码格式)
        .setFfmpegPath(ffmpeg_Static)
        .fps(29.97) // 设置输出帧数
        .videoBitrate('600k') // 视频比特率
        .size('?x240') // 设置输出帧大小
        .save(outputVideoPath)
        .on('start', function(commandLine: video['command']) {
            console.log('Start: ' + commandLine);
        })
        .on('progress', ffmpegOnProgress(logProgress, durationEstimate))
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message)
            reject(err);
        })
        .on('end', function() {
            console.log('finished convert!');
            resolve(outputVideoPath);
        })
    });
}

module.exports.onRemoveTemp = function (path: video['path']) {
    return new Promise((resolve,reject)=>{
        fs.unlinkSync(path,(err: any)=>{
            if(err){
                console.log(err)
                reject(err);
            }
            console.log('删除文件成功');
            resolve(path);
        });
    });
}