import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";
import VideoQuery from "./videoQuery";
import { Exception } from "@adonisjs/core/build/standalone";

export default class videoService {
  private apiKey: string;
  private libraryId: string;
  private baseUrl: string;
  private videoQuery: VideoQuery;

  // Headers configuration
  private headers = {
    AccessKey: Env.get("APP_KEY"),
    "Content-Type": "application/json",
  };

  constructor() {
    this.apiKey = Env.get("APP_KEY");
    this.libraryId = Env.get("LIBRARY_ID");
    this.baseUrl = Env.get("BUNNY_URL");
    this.videoQuery = new VideoQuery();
  }

  public async createVideo(validatedData: {
    url: string;
    title?: string;
    collectionId?: string;
  }) {
    const response = await this.uploadVideoInBunny(validatedData);

    // Create video playable link
    const videoPlayLinkUrl = `https://iframe.mediadelivery.net/play/${this.libraryId}/${response.id}`;

    const uploadData = {
      videoId: response.id,
      libraryId: this.libraryId,
      title: validatedData.title,
      isFinished: response.success ? "uploading" : "failed",
      playableLink: videoPlayLinkUrl,
    };

    const video = await this.videoQuery.createVideo(uploadData);

    if (!video)
      throw new Exception(
        "Failed When Try To Upload Video In MySQL",
        401,
        "E_INVALID_REQUEST"
      );

    return {
      ...video.toJSON(),
      bunnyResponse: response
    };
  }

  public async updateVideo(validatedData: any) {
    const { id: videoId, ...updateData } = validatedData;

    const response = await this.updateVideoInBunny(videoId, updateData);

    if (response?.data?.success === "false")
      throw new Exception(
        "Failed In Bunny Video Update",
        401,
        "E_INVALID_REQUEST"
      );

    const video = await this.videoQuery.findByVideoId(videoId);

    if (!video)
      throw new Exception("Video Is Not Found!", 401, "E_INVALID_REQUEST");

    return await this.videoQuery.updateVideo(videoId, updateData);
  }

  public async deleteVideo(validatedData: any) {
    const existingVideo = await this.videoQuery.findByVideoId(validatedData.id);

    if (!existingVideo)
      throw new Exception("Video Not Found!", 404, "E_VIDEO_NOT_FOUND");

    const deletedVideo = await this.videoQuery.deleteByVideo(validatedData.id);
    const response = await this.deleteFromBunny(validatedData.id);

    if (response?.data?.success === "false")
      throw new Exception(
        "Failed In Bunny Video Deletion",
        401,
        "E_INVALID_REQUEST"
      );

    return { ...response, deletedVideo };
  }

  public async getSingleVideo(validatedData: { id: string }) {
    const video = await this.videoQuery.findByVideoId(validatedData.id);

    if (!video)
      throw new Exception("Video Not Found!", 404, "E_VIDEO_NOT_FOUND");

    return video;
  }

  public async getAllVideosFromMyDatabase() {
    return await this.videoQuery.getAllVideos();
  }

  public async getAllVideoFromBunnyDatabase() {
    const response = await axios.get(
      `${this.baseUrl}/library/${this.libraryId}/videos`,
      { headers: this.headers }
    );
    return response?.data;
  }

  public async getAllVideo() {
    return await Promise.all([
      this.getAllVideoFromBunnyDatabase(),
      this.getAllVideosFromMyDatabase(),
    ]);
  }

  public async updateVideoStatus(validatedData: any = {}) {
    const { Status: status, VideoGuid: videoGuid } = validatedData;

    if (status < 3 || status > 5) return "processing";

    const isFinished = status == 3 || status == 4 ? "success" : "failed";
    const updateData = { isFinished, processingStatus: status };

    const video = await this.videoQuery.findByVideoId(videoGuid);

    if (!video)
      throw new Exception("Video Not Found!", 404, "E_VIDEO_NOT_FOUND");

    return await this.videoQuery.updateVideo(videoGuid, updateData);
  }

  // Bunny Service Methods
  private async deleteFromBunny(id: string) {
    const response = await axios.delete(
      `${this.baseUrl}/library/${this.libraryId}/videos/${id}`,
      { headers: this.headers }
    );
    return response?.data;
  }

  private async createVideoInBunny(title?: string, collectionId?: string) {
    const requestBody: any = { title };
    
    // Add collectionId to request if provided
    if (collectionId) {
      requestBody.collectionId = collectionId;
    }

    const response = await axios.post(
      `${this.baseUrl}/library/${this.libraryId}/videos`,
      requestBody,
      { headers: this.headers }
    );
    return response?.data;
  }

  private async uploadVideoInBunny(validatedData: {
    url: string;
    title?: string;
    collectionId?: string;
  }) {
    const createVideoResponse = await this.createVideoInBunny(validatedData.title, validatedData.collectionId);
    const { guid: videoId } = createVideoResponse;

    const response = await axios.post(
      `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}/fetch`,
      { url: validatedData.url },
      { headers: this.headers }
    );

    response.data.id = videoId;
    return response.data;
  }

  private async updateVideoInBunny(videoId: string, validatedData: { title?: string }) {
    const response = await axios.post(
      `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`,
      validatedData,
      { headers: this.headers }
    );
    return response?.data;
  }
}
