import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import VideoService from "./videoService";
import VideoValidator from "./videoValidator";
import Env from "@ioc:Adonis/Core/Env";

interface BunnyHeaders {
  AccessKey: string;
  "Content-Type": string;
}

export default class VideoController {
  private service: VideoService;
  private validator: VideoValidator;
  private headers: BunnyHeaders;

  constructor() {
    this.service = new VideoService();
    this.validator = new VideoValidator();
    this.headers = {
      AccessKey: Env.get("APP_KEY"),
      "Content-Type": "application/json"
    };
  }

  public async list() {
    return await this.service.getAll();
  }

  public async show(ctx: HttpContextContract) {
    const validatedData = await this.validator.validateId(ctx);
    const result = await this.service.findById(validatedData.id);
    return ctx.response.status(200).json(result);
  }

  public async store(ctx: HttpContextContract) {
    const validatedData = await this.validator.validateCreate(ctx);
    console.log(validatedData);
    const result = await this.service.create(validatedData, this.headers);
    return ctx.response.status(201).json(result);
  }

  public async update(ctx: HttpContextContract) {
    const validatedData = await this.validator.validateUpdate(ctx);
    const result = await this.service.update(validatedData, this.headers);
    return ctx.response.status(200).json({ success: result });
  }

  public async destroy(ctx: HttpContextContract) {
    const validatedData = await this.validator.validateId(ctx);
    const result = await this.service.delete(validatedData.id, this.headers);
    return ctx.response.status(200).json(result);
  }

  public async webhook(ctx: HttpContextContract) {
    const validatedData = await this.validator.validateWebhook(ctx);
    const result = await this.service.updateStatus(validatedData);
    return ctx.response.status(200).json(result);
  }
}