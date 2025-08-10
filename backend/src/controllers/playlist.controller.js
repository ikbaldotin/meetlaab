import { db } from "../lib/db.js";

export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;
        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })
        res.status[200].json({
            success: true,
            message: "Playlist created successfully",
            playlist

        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "playlist error"
        })

    }
}

export const getAllListDetails = async (req, res) => {
    try {
        const playlist = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            playlist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "playlist error"
        })
    }
}
export const getPlaylistDetails = async (req, res) => {
    const { playlistId } = req.params
    try {
        const playlist = await db.playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })
        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Playlist not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            playlist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "playlist error"
        })
    }
}

export const addProblemToPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { problemId } = req.params;
    try {
        if (
            !Array.isArray(problemId) || problemId.length === 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid problem IDs"
            })
        }
        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemId.map(problemId => ({
                playlistId,
                problemId
            }))
        })
        res.status(200).json({
            success: true,
            message: "Problems added to playlist successfully",
            problemsInPlaylist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error adding problems to playlist"
        })
    }
}
export const deletePlaylist = async (req, res) => {
    const { playlistId } = req.params;
    try {
        const deletedPlaylist = await db.playlist.delete({
            where: {
                id: playlistId
            }
        })
        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            deletedPlaylist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error deleting playlist"
        })
    }
}
export const removeProblemFromPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { problemId } = req.body;
    try {
        const deletedProblem = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemId
                }
            }
        })
        res.status(200).json({
            success: true,
            message: "Problem removed from playlist successfully",
            deletedProblem
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error removing problem from playlist"
        })
    }
}