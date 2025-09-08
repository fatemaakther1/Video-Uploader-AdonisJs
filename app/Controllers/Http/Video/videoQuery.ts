import Video from "App/Models/Video";

export default class VideoQuery {
  public async createVideo(data: {
    videoId: string;
    libraryId: string;
    title?: string;
    isFinished?: string;
    processingStatus?: number;
    metadata?: any;
  }): Promise<Video> {
    try {
      const video = await Video.create({
        videoId: data.videoId,
        libraryId: data.libraryId,
        title: data.title || "Untitled Video",
        isFinished: data.isFinished || "uploading",
        processingStatus: data.processingStatus || 0,
        metadata: data.metadata || null,
      });

      console.log(`✅ Created video record with ID: ${video.id}`);
      return video;
    } catch (error) {
      console.error("Error creating video in database:", error);
      throw error;
    }
  }

  public async findByVideoId(videoId: string): Promise<Video | null> {
    try {
      const video = await Video.findBy("videoId", videoId);
      return video;
    } catch (error) {
      console.error(`Error finding video by videoId ${videoId}:`, error);
      throw error;
    }
  }

  public async findById(id: number): Promise<Video | null> {
    try {
      const video = await Video.find(id);
      return video;
    } catch (error) {
      console.error(`Error finding video by ID ${id}:`, error);
      throw error;
    }
  }

  public async getAllVideos(): Promise<Video[]> {
    try {
      let query = Video.query();

      const videos = await query;
      console.log(`📊 Retrieved ${videos.length} videos from database`);
      return videos;
    } catch (error) {
      console.error("Error getting all videos from database:", error);
      throw error;
    }
  }

  public async updateByVideoId(
    videoId: string,
    updateData: {
      title?: string;
      isFinished?: string;
      processingStatus?: number;
      metadata?: any;
    }
  ): Promise<Video | null> {
    try {
      const video = await this.findByVideoId(videoId);

      if (!video) {
        console.warn(`⚠️ Video with videoId ${videoId} not found for update`);
        return null;
      }

      // Update fields if provided
      if (updateData.title !== undefined) video.title = updateData.title;
      if (updateData.isFinished !== undefined)
        video.isFinished = updateData.isFinished;
      if (updateData.processingStatus !== undefined)
        video.processingStatus = updateData.processingStatus;
      if (updateData.metadata !== undefined) {
        video.metadata = { ...video.metadata, ...updateData.metadata };
      }

      await video.save();
      console.log(`✅ Updated video ${videoId} in database`);
      return video;
    } catch (error) {
      console.error(`Error updating video ${videoId}:`, error);
      throw error;
    }
  }

  public async updateVideoStatus(
    videoGuid: string,
    status: number,
    additionalData: any = {}
  ): Promise<Video | null> {
    try {
      const video = await this.findByVideoId(videoGuid);

      if (!video) {
        console.warn(`⚠️ Video with GUID ${videoGuid} not found in database`);
        return null;
      }

      video.processingStatus = status;
      video.isFinished =
        status === 3 ? "success" : status === 5 ? "failed" : "processing";

      // Update metadata
      if (additionalData.metadata) {
        video.metadata = { ...video.metadata, ...additionalData.metadata };
      }

      await video.save();

      console.log(
        `✅ Updated video ${videoGuid} status to ${status} - isFinished: ${video.isFinished}`
      );
      return video;
    } catch (error) {
      console.error(`Error updating video status for ${videoGuid}:`, error);
      throw error;
    }
  }

  public async deleteByVideoId(videoId: string): Promise<Video | null> {
    try {
      const video = await this.findByVideoId(videoId);

      if (!video) {
        console.warn(`⚠️ Video with videoId ${videoId} not found for deletion`);
        return null;
      }

      const deletedVideo = { ...video.toJSON() } as Video; // Keep copy before deletion
      await video.delete();

      console.log(`🗑️ Deleted video ${videoId} from database`);
      return deletedVideo;
    } catch (error) {
      console.error(`Error deleting video ${videoId}:`, error);
      throw error;
    }
  }
}
