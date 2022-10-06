const express = require('express');
const router = express.Router();
const FileInfo = require('../controllers/fileInfo');
const UserInfo = require('../controllers/userInfo');
const multer = require('multer');
const upload = multer();

router.post('/upload', upload.array("file", 10), FileInfo.upload);

router.get('/userdata', FileInfo.userData);
router.get('/folderview', FileInfo.viewFolder);
router.post('/movefiles', FileInfo.moveFilesFromOneFolderToOther);

router.post('/signup', UserInfo.signup);
router.post('/signin', UserInfo.signin);

module.exports = router;