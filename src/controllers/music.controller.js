const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const { uploadFile } = require('../services/storage.service');


// ================= CREATE MUSIC =================
async function createMusic(req, res) {
    try {
        const { title } = req.body;
        const File = req.file;

        const decoded = req.user;

        if (!File) {
            return res.status(400).json({
                message: 'Music file is required'
            });
        }

        const result = await uploadFile(
            File.buffer.toString('base64')
        );

        const music = await musicModel.create({
            uri: result.url,
            title,
            artist: decoded.id
        });

        return res.status(201).json({
            message: 'Music created successfully',
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}



// ================= CREATE ALBUM =================
async function createAlbum(req, res) {
    try {
        const { title, musics } = req.body;

        const decoded = req.user;

        if (!title || !musics || !Array.isArray(musics)) {
            return res.status(400).json({
                message: 'Title and music IDs array are required'
            });
        }

        // Check all music IDs exist
        const existingMusics = await musicModel.find({
            _id: { $in: musics }
        });

        if (existingMusics.length !== musics.length) {
            return res.status(400).json({
                message: 'Some music IDs are invalid'
            });
        }

        const album = await albumModel.create({
            title,
            artist: decoded.id,
            musics
        });

        return res.status(201).json({
            message: 'Album created successfully',
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}


async function getAllMusics(req, res) {
    try {
        const musics = await musicModel
            .find()
            .skip(2)
            .limit(2)
            .populate('artist', 'username');

        return res.status(200).json({
            message: 'Musics retrieved successfully',
            musics: musics
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

async function getAllAlbums(req, res) {
    try {
        const albums = await albumModel.find()
            .populate('artist', 'username')
            .populate('musics');

        return res.status(200).json({
            message: 'Albums retrieved successfully',
            albums
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

async function getAlbumById(req, res) {
    try {
        const album = await albumModel.findById(req.params.albumId)
            .populate('artist', 'username')
            .populate('musics');

        if (!album) {
            return res.status(404).json({
                message: 'Album not found'
            });
        }

        return res.status(200).json({
            message: 'Album retrieved successfully',
            album
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}



module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById
};  

