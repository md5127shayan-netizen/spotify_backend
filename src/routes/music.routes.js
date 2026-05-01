const express = require('express');
const musicController = require('../controllers/music.controller');
const multer = require('multer');
const { authArtist, authUser } = require('../middlewares/auth.Middleware');

const upload = multer({
    storage: multer.memoryStorage()
});

const router = express.Router();

// Upload music (artist only)
router.post(
    '/upload',
    authArtist,
    upload.single('music'),
    musicController.createMusic
);

// Create album (artist only)
router.post(
    '/album',
    authArtist,
    musicController.createAlbum
);

// Get all music (logged in users)
router.get(
    '/',
    authUser,
    musicController.getAllMusics
);

router.get("/albums",authUser, musicController.getAllAlbums);
router.get("/albums/:albumId",authUser, musicController.getAlbumById);

module.exports = router;