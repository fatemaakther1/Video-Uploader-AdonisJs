import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/create", "videoController.store");
  Route.get("/get-all-video", "videoController.list");
  Route.get("/get-single-video/:id", "videoController.show");
  Route.post("/update/:id", "videoController.update");
  Route.post("/delete/:id", "videoController.destroy");

  // Webhook endpoint for external services (like Bunny.net)
  Route.post('/bunny-webhook', "videoController.webhook");

})
  .prefix("api/v1")
  .namespace("App/Controllers/Http/Video");