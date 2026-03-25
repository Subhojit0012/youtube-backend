import { router, procedure } from "../utility/context.utility.js"
import z from "zod"
import { Playlist } from "../db/models/playlist.model.js"

const playListRouter = router({
    createPlaylist: procedure.input(z.object({
        name: z.string().min(2),
    })).mutation(async ({input, ctx})=>{
        const {name} = input;

        // Extract the user ID from the decoded JWT payload
        const userId = typeof ctx.payload === 'object' && ctx.payload !== null 
            ? (ctx.payload as any).id 
            : undefined;

        if (!userId) {
            throw new Error("UNAUTHORIZED");
        }

        // Create and save the playlist document in the database
        const playlist = await Playlist.create({
            name,
            owner: userId
        });

        return playlist;
    }),

    addVideoToPlayList: procedure.input(z.object({
        playListId: z.string(),
        videoId: z.string()
    })).mutation(async ({input, ctx})=>{
        const {playListId, videoId} = input;

        const userId = typeof ctx.payload === 'object' && ctx.payload !== null ? (ctx.payload as any).id : undefined;

        if(!userId){
            throw new Error("UNAUTHORIZED");
        }

        const playlist = await Playlist.findById(playListId);

        if(!playlist){
            throw new Error("PLAYLIST NOT FOUND");
        }

        if(playlist.owner?.toString() !== userId){
            throw new Error("UNAUTHORIZED");
        }

        playlist.contents.push({videoId});
        await playlist.save();

        return playlist;

    })
})

export default playListRouter


