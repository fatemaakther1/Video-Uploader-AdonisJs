import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class VideoValidator {


    public async createVideoValidator(ctx: HttpContextContract) {
    return await ctx.request.validate({
      schema: schema.create({
        url: schema.string([
          rules.url({
            protocols: ["http", "https"],
            requireTld: true,
            requireProtocol: true,
          }),
        ]),
        title: schema.string.optional([
          rules.maxLength(2048),
          rules.minLength(1),
        ]),
        collectionId: schema.string.optional([rules.uuid()]),
      }),
      messages: {
        "url.required": "The video URL is required",
        "url.string": "The video URL must be a valid string",
        "url.url": "Please provide a valid HTTP or HTTPS URL",

        "title.string": "The video title must be a valid string",
        "title.minLength": "The video title must be at least 1 character long",
        "title.maxLength": "The video title must not exceed 255 characters",

        "collectionId.string": "Collection ID must be a valid string",
        "collectionId.uuid": "Collection ID must be a valid UUID format",
      },
    });
  }



  public async updateVideoValidator(ctx: HttpContextContract) {
    return await ctx.request.validate({
      data: { ...ctx.request.all(), id: ctx.params.id },

      schema: schema.create({
        id: schema.string({}, [rules.uuid()]),
        title: schema.string.optional({}, [rules.maxLength(255)]),
      }),
      messages: {
        "id.required": "Video ID is required",
        "title.maxLength": "Title must not exceed 255 characters",
      },
    });
  }


  public async videoIdValidator(ctx: HttpContextContract) {
    return await ctx.request.validate({
      data: { ...ctx.request.all(), id: ctx.params.id },

      schema: schema.create({
        id: schema.string({}, [rules.uuid()]),
      }),
      messages: {
        "id.required": "video id is required!",
        "id.string": "video id must be a string",
      },
    });
  }

  public async webhookValidator(ctx: HttpContextContract) {
    return await ctx.request.validate({
      schema: schema.create({
        VideoGuid: schema.string({}, [rules.uuid()]),
        Status: schema.number([rules.unsigned(), rules.range(0, 5)]),
      }),
      messages: {
        "VideoGuid.required": "Video GUID is required for webhook processing",
        "VideoGuid.uuid": "Video GUID must be a valid UUID format",

        "Status.required": "Processing status is required",
        "Status.number": "Processing status must be a valid number",
        "Status.range": "Processing status must be between 0 and 5",
      },
    });
  }
}
