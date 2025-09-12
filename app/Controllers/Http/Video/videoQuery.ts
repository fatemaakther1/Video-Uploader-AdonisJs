import Video from "App/Models/Video";

export default class VideoQuery {
  public async create(data: any): Promise<Video> {
    return await Video.create({
      videoId: data.videoId,
      libraryId: data.libraryId,
      title: data.title || "Untitled Video",
      isFinished: data.isFinished || "uploading",
      processingStatus: data.processingStatus || 0,
      playableLink: data.playableLink
    });
  }

  public async findById(id: string): Promise<Video | null> {
    return await Video.query()
    .where("video_id", id)
    .first();
  }

  public async getAll(): Promise<Video[]> {
    return await Video.all();
  }

  public async update(id: string, data: any) {
    return await Video.query()
    .where("video_id", id)
    .update(data);
  }

  public async delete(id: string): Promise<void> {
    await Video.query()
    .where("video_id", id)
    .delete();
  }
}
