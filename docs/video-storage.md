## AZURE BLOB STORAGE

- Azure Blob Storage is a service that allows you to store large amounts of unstructured data, such as text or binary data. It is ideal for storing video files due to its scalability, durability, and accessibility.

## Installation

To use Azure Blob Storage in your project, you need to install the Azure Storage SDK. You can do this using pip:

```bash
npm install @azure/storage-blob @azure/identity fluent-ffmpeg
```

## Configuration

Config environment variables

```
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
CONTAINER_NAME=videos
```

1. Initailize the  Azure Blob Storage client in your code:

```javascript
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);
```

2. upload video to Azure Blob Storage

```javascript
async function uploadVideo(filePath, blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadFile(filePath);
  console.log(`Uploaded ${blobName} successfully`);
}
```

3. Transcode video using FFmpeg

```javascript

const ffmpeg = require("fluent-ffmpeg");

function transcodeVideo(inputPath, resolutions) {
  resolutions.forEach(res => {
    ffmpeg(inputPath)
      .output(`${res}.mp4`)
      .videoCodec("libx264")
      .size(res)
      .on("end", () => console.log(`Transcoded to ${res}`))
      .run();
  });
}
```
Typical resolutions could be `[ "360p", "480p", "720p", "1080p" ]`.

4. Upload transcoded output

```javascript
async function uploadTranscoded(resolutions) {
  for (const res of resolutions) {
    const blockBlobClient = containerClient.getBlockBlobClient(`video_${res}.mp4`);
    await blockBlobClient.uploadFile(`${res}.mp4`);
    console.log(`Uploaded transcoded ${res} video`);
  }
}
```

Recomended Architecture:

- Azure Blob Storage -> store raw + transcoded files.
- Azure Storage Queue -> Queue trancoding jobs for scalability.
- Azure Container Instances/Functions -> Run FFmpeg jobs asynchronously.
- Azure CDN -> Serve transcoded videos to end users efficiently.



| Step | Tool/Library Used | Purpose |
| --- | --- | --- |
| Upload raw video | ``@azure/storage-blob`` | Store original file |
| Queue job | Azure Storage Queue | Trigger transcoding |
| Transcode | ``fluent-ffmpeg`` + FFmpeg | Generate multiple resolutions |
| Store outputs | ``@azure/storage-blob`` | Save transcoded files |
| Stream | Azure CDN | Deliver optimized playback |

## Key considerations

- **Cost Management**: Monitor storage and egress costs, especially if serving large volumes of video.
- **Security**: Use SAS tokens or Azure AD for secure access to blobs.
- **Performance**: Consider using Azure CDN to cache and deliver video content closer to users for better performance.
- **Scalability**: Use Azure Functions or Container Instances to handle transcoding jobs in parallel, allowing for better scalability as demand increases.