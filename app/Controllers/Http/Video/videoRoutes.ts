import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/create", "videoController.createVideo");
  Route.get("/get-all-video", "videoController.getAllVideo");
  Route.get("/get-single-video/:id", "videoController.getSingleVideo");
  Route.post("/update/:id", "videoController.updateVideo");
  Route.post("/delete/:id", "videoController.deleteVideo");

  // Webhook endpoint for external services (like Bunny.net)
  Route.post('/bunny-webhook', "videoController.bunnyWebhook");

})
  .prefix("api/v1")
  .namespace("App/Controllers/Http/Video");