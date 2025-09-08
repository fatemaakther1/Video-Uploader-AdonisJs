import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";
import Video from "App/Models/Video";
import VideoQuery from "./videoQuery";
import { Exception } from "@adonisjs/core/build/standalone";

export default class videoService {
  private apiKey: string;
  private libraryId: string;
  private baseUrl: string;
  private videoQuery: VideoQuery;

  constructor() {
    this.apiKey = Env.get("APP_KEY");
    this.libraryId = Env.get("LIBRARY_ID");
    this.baseUrl = Env.get("BUNNY_URL");
    this.videoQuery = new VideoQuery();
  }

  public async createVideo(body: any) {
    try {
      // Upload video to Bunny.net
      const response = await axios.post(
        `${this.baseUrl}/library/${this.libraryId}/videos/fetch`,
        body,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const bunnyResponse = response?.data;

      // Save video info to database using query layer
      if (bunnyResponse) {
        const video = await this.videoQuery.createVideo({
          videoId: bunnyResponse?.id,
          libraryId: this.libraryId,
          title: body.title,
          isFinished: "uploading",
          processingStatus: 0, // 0 = queued/uploading
          metadata: bunnyResponse,
        });

        return {
          ...bunnyResponse,
          databaseId: video.id,
          savedToDatabase: true,
        };
      }

      return bunnyResponse;
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  }

  public async updateVideo(id: string, body: any) {
    try {
      // Update video in Bunny.net
      const response = await axios.post(
        `${this.baseUrl}/library/${this.libraryId}/videos/${id}`,
        body,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const bunnyResponse = response?.data;

      // Also update video in our MySQL database using query layer
      const video = await this.videoQuery.updateByVideoId(id, {
        title: body.title,
        metadata: { ...bunnyResponse },
      });

      if (video) {
        console.log(
          `✅ Updated video ${id} in both Bunny.net and MySQL database`
        );

        return {
          ...bunnyResponse,
          databaseUpdated: true,
          databaseId: video.id,
        };
      } else {
        console.warn(
          `⚠️ Video ${id} updated in Bunny.net but not found in local database`
        );
        return {
          ...bunnyResponse,
          databaseUpdated: false,
          warning: "Video not found in local database",
        };
      }
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  }

  public async deleteVideo(id: string) {
    
      // First check if video exists in our database using query layer
      const existingVideo = await this.videoQuery.findByVideoId(id);

      //  globally error handling korar jonno ota use oibo
      if(!existingVideo)
        throw new Exception('Video not found!',400,'E_INVALID_REQUEST')




      // Delete video from Bunny.net
      const response = await axios.delete(
        `${this.baseUrl}/library/${this.libraryId}/videos/${id}`,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const bunnyResponse = response?.data;

      // Also delete video from our MySQL database using query layer
      const deletedVideo = await this.videoQuery.deleteByVideoId(id);
      
      if (deletedVideo) {
        console.log(
          `✅ Deleted video ${id} from both Bunny.net and MySQL database`
        );

        return {
          ...bunnyResponse,
          databaseDeleted: true,
          deletedDatabaseId: existingVideo?.id,
          deletedTitle: existingVideo?.title,
        };
      } else {
        console.warn(
          `⚠️ Video ${id} deleted from Bunny.net but was not found in local database`
        );
        return {
          ...bunnyResponse,
          databaseDeleted: false,
          warning: "Video was not found in local database",
        };
      }
    
  }

  public async getSingleVideo(id: string) {
    const response = await axios.get(
      `${this.baseUrl}/library/${this.libraryId}/videos/${id}`,
      {
        headers: {
          AccessKey: this.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response?.data;
  }
  public async getAllVideoFromBunnyDatabase() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/library/${this.libraryId}/videos`,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return response?.data;
    } catch (error) {
      console.error("Error getting all videos from database:", error);
      throw error;
    }
  }

  // Webhook handling methods
  public async updateVideoStatus(
    videoGuid: string,
    status: number,
    additionalData: any = {}
  ) {
    try {
      // Use query layer to update video status
      const video = await this.videoQuery.updateVideoStatus(
        videoGuid,
        status,
        additionalData
      );

      if (video) {
        console.log(
          `Updated video ${videoGuid} status to ${status} - isFinished: ${video.isFinished}`
        );
        return video;
      } else {
        console.warn(`Video with GUID ${videoGuid} not found in database`);
        return null;
      }
    } catch (error) {
      console.error("Error updating video status:", error);
      throw error;
    }
  }

  public async getAllVideosFromMyDatabase() {
    try {
      return await this.videoQuery.getAllVideos();
    } catch (error) {
      console.error("Error getting all videos from database:", error);
      throw error;
    }
  }
}
