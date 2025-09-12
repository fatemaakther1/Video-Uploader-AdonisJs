import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import videoService from "./videoService";
import VideoValidator from "./videoValidator";

export default class VideoController {
  private service: videoService;
  private validator: VideoValidator;
  
  constructor() {
    this.service = new videoService();
    this.validator = new VideoValidator();
  }

  //get all video
  public async getAllVideo() {
    return await this.service.getAllVideo();
  }

  //get single video
  public async getSingleVideo(ctx: HttpContextContract) {
    const validatedData = await this.validator.videoIdValidator(ctx);
    const getResult = await this.service.getSingleVideo(validatedData);
    return ctx.response.status(200).json({ getResult });
  }

  //upload video
  public async createVideo(ctx: HttpContextContract) {
    const validatedData = await this.validator.createVideoValidator(ctx);
    const uploadResult = await this.service.createVideo(validatedData);
    return ctx.response.status(201).json(uploadResult);
  }

  //update video
  public async updateVideo(ctx: HttpContextContract) {
    const validatedData = await this.validator.updateVideoValidator(ctx);
    const updateResult = await this.service.updateVideo(validatedData);
    return ctx.response.status(200).json({ success: updateResult });
  }

  //delete video
  public async deleteVideo(ctx: HttpContextContract) {
    const validatedData = await this.validator.videoIdValidator(ctx);
    const deleteResult = await this.service.deleteVideo(validatedData);
    return ctx.response.status(200).json(deleteResult);
  }

  //webhook for checking the status of the video
  public async bunnyWebhook(ctx: HttpContextContract) {
    console.log(ctx.request.all());
    const validatedData = await this.validator.webhookValidator(ctx);
    const response = await this.service.updateVideoStatus(validatedData);
    return ctx.response.status(200).json({ response });
  }
}