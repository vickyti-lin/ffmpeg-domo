const functions = require('firebase-functions');
const UUID = require("uuid-v4");
const path = require('path');
const os = require('os');
const fs = require('fs');
const mkdirp = require('mkdirp');
const ffmpeg = require('ffmpeg');
const spawn = require('child-process-promise').spawn;
const admin = require('firebase-admin');
const serviceAccount = require("../pwa-firebase-pk.json");
const video = require('./convertVideo');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://iamstar-functions-test.firebaseio.com',
    });
const storage = admin.storage();
const MP4_EXTENSION = '.mp4';
// set memory
const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '2GB',
};

exports.compressedVideo_demo = functions
    .runWith(runtimeOpts)
    .region('asia-northeast1')
    .storage
    .object()
    .onFinalize(async (object: any) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metadata = object.metadata;
    const uuid = UUID();

    const bucket = storage.bucket(fileBucket);
    const baseFileName = path.basename(filePath, path.extname(filePath)); 
    const fileDir = path.dirname(filePath); 
    const MP4FilePath = path.normalize(path.format({dir: fileDir, name: baseFileName + '_convert', ext: MP4_EXTENSION})); 
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile); 
    const tempLocalMP4File = path.join(os.tmpdir(), MP4FilePath);  

    if (metadata.complete) {
        console.log('這個檔案已經處理完成');
        return false;
    } else {
        await mkdirp(tempLocalDir);
        const tempLocalFilePath = await bucket.file(filePath).download({destination: tempLocalFile});
        console.log('Video downloaded locally to', tempLocalFilePath);
        const convertedVideoPath = await video.onConvertVideo(tempLocalFile, tempLocalMP4File);
        console.log('Convert video finish!', convertedVideoPath);
        const uploadedVideo = await bucket.upload(convertedVideoPath, 
            {
                destination: MP4FilePath,
                metadata: {
                    contentType: contentType,
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });
        console.log('Already upload!', uploadedVideo);
        // 刪除本地文件以釋放磁盤空間
        const removeTempLocalFile =  await video.onRemoveTemp(tempLocalFilePath)
        const removeTempLocalMP4File = await video.onRemoveTemp(convertedVideoPath)
        console.log(removeTempLocalFile, removeTempLocalMP4File ,'Temporary files removed.');
        return uploadedVideo;
    }
});
