import Video from "App/Models/Video";

export default class VideoQuery {
  public async createVideo(validatedData: {
    videoId: string;
    libraryId: string;
    title?: string;
    isFinished?: string;
    processingStatus?: number;
    playableLink?: string;
  }): Promise<Video> {
    return await Video.create({
      videoId: validatedData.videoId,
      libraryId: validatedData.libraryId,
      title: validatedData.title || "Untitled Video",
      isFinished: validatedData.isFinished || "uploading",
      processingStatus: validatedData.processingStatus || 0,
      playableLink: validatedData.playableLink,
    });
  }

  public async findByVideoId(videoId: string): Promise<Video | null> {
    return await Video.query()
      .where("video_id", videoId)
      .first();
  }

  public async findById(id: number): Promise<Video | null> {
    return await Video.query().where("id", id).first();
  }

  public async getAllVideos(): Promise<Video[]> {
    return await Video.all();
  }

  public async updateVideo(videoId: string, updateData: {
    title?: string;
    isFinished?: string;
    processingStatus?: number;
  }) {
    return await Video.query()
      .where("video_id", videoId)
      .update(updateData);
  }

  public async deleteByVideo(videoId: string): Promise<Boolean> {
    await Video.query().where("video_id", videoId).delete();
    return true;
  }
}
