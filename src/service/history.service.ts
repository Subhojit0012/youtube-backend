import { History } from "../db/models/history.model.js";


async function historyService(userId: string, videoId: string) {
  // first check if the video is already included in history if yes then update the timestamps
  // if not then add it to the history

  const history = await History.findOne({ userId });

  const video = history?.videoId.find((item) => item.toString() === videoId);

  if (video) {
    // update the timestamps
  } else {
    history?.videoId.push(videoId);
    await history?.save();
  }
};

export default historyService;
