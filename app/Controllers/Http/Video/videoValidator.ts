import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class VideoValidator {


  public async validateCreate(ctx: HttpContextContract) {
    return await ctx.request.validate({
      schema: schema.create({
        url: schema.string([rules.url({ protocols: ["http", "https"], requireTld: true, requireProtocol: true })]),
        title: schema.string.optional([rules.maxLength(255), rules.minLength(1)])
      }),
      messages: {
        "url.required": "Video URL is required",
        "url.url": "Please provide a valid URL",
        "title.maxLength": "Title must not exceed 255 characters",
        "title.minLength": "Title must be at least 1 character"
      }
    });
  }


  
  public async validateUpdate(ctx: HttpContextContract) {
    return await ctx.request.validate({
      data: { ...ctx.request.all(), id: ctx.params.id },
      schema: schema.create({
        id: schema.string({}, [rules.uuid()]),
        title: schema.string.optional({}, [rules.maxLength(255), rules.minLength(1)])
      }),
      messages: {
        "id.required": "Video ID is required",
        "id.uuid": "Invalid video ID format",
        "title.maxLength": "Title must not exceed 255 characters"
      }
    });
  }



  public async validateId(ctx: HttpContextContract) {
    return await ctx.request.validate({
      data: { ...ctx.request.all(), id: ctx.params.id },
      schema: schema.create({
        id: schema.string({}, [rules.uuid()])
      }),
      messages: {
        "id.required": "Video ID is required",
        "id.uuid": "Invalid video ID format"
      }
    });
  }



  public async validateWebhook(ctx: HttpContextContract) {
    return await ctx.request.validate({
      schema: schema.create({
        VideoGuid: schema.string({}, [rules.uuid()]),
        Status: schema.number([rules.unsigned(), rules.range(0, 5)])
      }),
      messages: {
        "VideoGuid.required": "Video GUID is required",
        "VideoGuid.uuid": "Invalid video GUID format",
        "Status.required": "Status is required",
        "Status.range": "Status must be between 0 and 5"
      }
    });
  }
}
