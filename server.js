const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/merge', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
  const videoPath = req.files.video[0].path;
  const audioPath = req.files.audio[0].path;
  const outputDir = 'outputs';
  const outputFile = `${outputDir}/merged_${Date.now()}.mp4`;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -y ${outputFile}`;

  exec(command, (err) => {
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);

    if (err) {
      console.error(err);
      return res.status(500).send('Failed to merge video and audio');
    }

    res.download(outputFile, () => fs.unlinkSync(outputFile));
  });
});

app.get('/', (_, res) => {
  res.send('🟢 FFmpeg Merge Server is Live');
});

app.listen(3000, () => console.log('✅ Server listening on port 3000'));
