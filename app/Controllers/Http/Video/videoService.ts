import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";
import VideoQuery from "./videoQuery";
import { Exception } from "@adonisjs/core/build/standalone";

export default class VideoService {
  private query: VideoQuery;
  private libraryId: string;
  private baseUrl: string;

  constructor() {
    this.query = new VideoQuery();
    this.libraryId = Env.get("LIBRARY_ID");
    this.baseUrl = Env.get("BUNNY_URL");
  }

  public async create(validatedData: any, headers: any) {
    try {
      const bunnyResponse = await this.uploadToBunny(validatedData, headers);
      const playableLink = `https://iframe.mediadelivery.net/play/${this.libraryId}/${bunnyResponse.id}`;
      
      const data = {
        videoId: bunnyResponse.id,
        libraryId: this.libraryId,
        title: validatedData.title,
        isFinished: bunnyResponse.success ? "uploading" : "failed",
        playableLink
      };

      const video = await this.query.create(data);
      if (!video) throw new Exception("Video creation in database failed", 400, "E_CREATE_FAILED");
      
      return { ...video.toJSON(), bunnyResponse };
    } catch (error) {
      throw new Exception(`Video creation failed: ${error.message}`, 400, "E_CREATE_FAILED");
    }
  }

  public async update(validatedData: any, headers: any) {
    try {
      const { id, ...updateData } = validatedData;
      
      await this.updateInBunny(id, updateData, headers);
      const video = await this.query.findById(id);
      if (!video) throw new Exception("Video not found", 404, "E_NOT_FOUND");
      
      return await this.query.update(id, updateData);
    } catch (error) {
      throw new Exception(`Video update failed: ${error.message}`, 400, "E_UPDATE_FAILED");
    }
  }

  public async delete(id: string, headers: any) {
    try {
      const video = await this.query.findById(id);
      if (!video) throw new Exception("Video not found", 404, "E_NOT_FOUND");
      
      await this.deleteFromBunny(id, headers);
      await this.query.delete(id);
      
      return { 
        success: true      //, message: "Video deleted" 
      };
    } catch (error) {
      throw new Exception(`Video deletion failed: ${error.message}`, 400, "E_DELETE_FAILED");
    }
  }

  public async findById(id: string) {
    const video = await this.query.findById(id);
    if (!video) throw new Exception("Video not found", 404, "E_NOT_FOUND");
    return video;
  }

  public async getAll() {
    return await this.query.getAll();
  }

  public async updateStatus(validatedData: any) {
    const { Status: status, VideoGuid: id } = validatedData;
    if (status < 3 || status > 5) return { message: "processing" };
    
    const data = {
      isFinished: status == 3 || status == 4 ? "success" : "failed",
      processingStatus: status
    };
    
    const video = await this.query.findById(id);
    if (!video) throw new Exception("Video not found", 404, "E_NOT_FOUND");
    
    return await this.query.update(id, data);
  }


  

  private async deleteFromBunny(id: string, headers: any) {
    const response = await axios.delete(`${this.baseUrl}/library/${this.libraryId}/videos/${id}`, { headers });
    return response.data;
  }

  private async createInBunny(data: any, headers: any) {
    const response = await axios.post(`${this.baseUrl}/library/${this.libraryId}/videos`,
       data, 
       { headers }
      );
    return response.data;
  }

  private async uploadToBunny(data: any, headers: any) {
    const created = await this.createInBunny({ title: data.title }, headers);
    const response = await axios.post(
      `${this.baseUrl}/library/${this.libraryId}/videos/${created.guid}/fetch`,
      { url: data.url },
      { headers }
    );
    return { ...response.data, id: created.guid };
  }

  private async updateInBunny(id: string, data: any, headers: any) {
    const response = await axios.post(`${this.baseUrl}/library/${this.libraryId}/videos/${id}`, data, { headers });
    return response.data;
  }
}
