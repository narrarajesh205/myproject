const express = require('express');
const router = express.Router();
const FileInfo = require('../controllers/fileInfo');
const UserInfo = require('../controllers/userInfo');
const multer = require('multer');
const upload = multer();

const { validateToken } = require('../middlewares/authJwt');

router.post('/upload', validateToken, upload.array("file", 10), FileInfo.upload);
router.get('/userdata', validateToken, FileInfo.userData);
router.get('/folderview', validateToken, FileInfo.viewFolder);
router.post('/foldercreate', validateToken, FileInfo.createFolder);
router.post('/movefiles', validateToken, FileInfo.moveFilesFromOneFolderToOther);

router.post('/signup', UserInfo.signup);
router.post('/signin', UserInfo.signin);

module.exports = router;