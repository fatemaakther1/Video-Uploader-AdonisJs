import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import videoService from './videoService'

export default class videoController {
    private service:videoService;
    constructor(){
        this.service=new videoService();
    }
    //get all video
    public async index({response}:HttpContextContract) {
        try {
            // Get videos from both Bunny.net and our database
            const [bunnyVideos, databaseVideos] = await Promise.all([
                //this.service.getAllVideo(),
                //this.service.getAllVideosFromDatabase()
                this.service.getAllVideoFromBunnyDatabase(),
                this.service.getAllVideosFromMyDatabase()

               
            ]);

            return response.status(200).json({
                message:"All videos fetched successfully!",
                data: {
                    bunnyVideos,
                    databaseVideos,
                    totalInDatabase: databaseVideos.length
                }
            });
        } catch (error) {
            console.error('Error fetching videos:', error);
            return response.status(500).json({
                message: "Error fetching videos",
                error: error.message
            });
        }
    }
    //get single video
    public async show({params,response}:HttpContextContract) {


        const getResult=await this.service.getSingleVideo(params.id);

        return response.status(200).json({
            message:"video fetched successfully!",
            data:getResult
        })
    }
    //upload video
    public async store({ request, response }: HttpContextContract){

        const body=request.all();

        const uploadResult= await this.service.createVideo(body);

        return response.status(200).json({
            message:"Video uploaded successfully",
            data:uploadResult
        })
    }
    //update video
    public async update({params,request,response}:HttpContextContract){
        const body=request.all();
        const updateResult=await this.service.updateVideo(params.id,body);

        return response.status(200).json({
            updateResult
        })
    }
    //delete video
    public async destroy({params,response}:HttpContextContract){
        const deleteResult=await this.service.deleteVideo(params.id);

        return response.status(200).json({
           deleteResult
        })
    }

    public async webhook({request,response}:HttpContextContract){
        try {
            console.log('\n' + '🔔 WEBHOOK RECEIVED FROM BUNNY.NET');
            const webhookData = request.all();
            console.log('📄 Raw webhook data:', JSON.stringify(webhookData, null, 2));

            // Extract webhook data (Bunny.net sends different field names)
            const { 
                VideoLibraryId, 
                VideoGuid, 
                Status,
                // Alternative field names that Bunny.net might use
                libraryId,
                videoId,
                status,
                guid
            } = webhookData;
            
            // Get the actual values (Bunny.net might use different field names)
            const actualVideoGuid = VideoGuid || videoId || guid;
            const actualStatus = Status !== undefined ? Status : status;
            const actualLibraryId = VideoLibraryId || libraryId;
            
            console.log('🔍 Extracted values:');
            console.log(`   Video GUID: ${actualVideoGuid}`);
            console.log(`   Status: ${actualStatus}`);
            console.log(`   Library ID: ${actualLibraryId}`);

            if (actualVideoGuid && actualStatus !== undefined) {
                // Update video status using the enhanced service method
                const updatedVideo = await this.service.updateVideoStatus(
                    actualVideoGuid, 
                    actualStatus, 
                    { 
                        libraryId: actualLibraryId,
                        originalWebhookData: webhookData,
                        timestamp: new Date().toISOString()
                    }
                );

                if (updatedVideo) {
                    console.log('✅ Webhook processed successfully!');
                    return response.status(200).json({
                        message: 'Webhook processed successfully',
                        videoId: actualVideoGuid,
                        status: actualStatus,
                        updated: true
                    });
                } else {
                    console.log('⚠️ Video not found in database, but webhook acknowledged');
                    return response.status(200).json({
                        message: 'Webhook received but video not found in database',
                        videoId: actualVideoGuid,
                        status: actualStatus,
                        updated: false
                    });
                }
            } else {
                console.warn('⚠️ Missing required webhook data (VideoGuid or Status)');
                return response.status(200).json({
                    message: 'Webhook received but missing required data',
                    received: webhookData
                });
            }

        } catch (error) {
            console.error('❌ Error processing webhook:', error);
            // Still respond 200 OK to prevent Bunny.net from retrying
            return response.status(200).json({
                message: 'Webhook received but processing failed',
                error: error.message
            });
        }
    }
}

