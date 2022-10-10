const FileModel = require("../models/File/FileModel");
const FolderModel = require("../models/Folder/FolderModel");
const UserModel = require("../models/User/UserModel");

class fileInfo{

    async upload(req, res){
      try{
        let { tid, uid, folderid, foldername } = req.headers;

        let currentFolderID = 0;
        if(!req.files){
            res.json( { message: "File Not Exist in the Request" } );
            return;
        }

        if((folderid || foldername) && req.files.length > 1){
            res.json( { message: "One folder must contain only one file max" } );
            return;
        }

        if(!uid){
            res.json( { message: "User ID missing in the request"} );
            return;
        }

        if(!tid){
            res.json( { message: "Tenant ID missing in the request"} );
            return;
        }

        if(folderid){
            let filesInFolder = await FileModel.getFilesCountInFolder(tid, uid, folderid);
            if(filesInFolder >= 1){
                res.json( { message: "One folder must contain only one file max" } );
                return;
            }
            currentFolderID = folderid;
        }

        let userInfo = await UserModel.getUserDetails(uid);
        let ownerInfo = {};
        ownerInfo.UID = uid;
        ownerInfo.FName = userInfo.FName;
        ownerInfo.LName = userInfo.LName;
        let responseObj = {
            Folders: [],
            Files: []
        };

        if(foldername) {
            let folderExist = await FolderModel.checkFolderExistOrNot(foldername, uid);
            if(folderExist){
                res.json( { message: "Folder already exist"} );
                return;
            }
            let folderObject = {
                Name: foldername,
                TID: tid,
                Owner: ownerInfo,
                Status: 'A'
            };

            let createFolder = await FolderModel.insertFolderRecord(folderObject);
            currentFolderID = createFolder.FldrID;
            responseObj.Folders.push(createFolder.Name)
        }

        let fileNames = [];
        if(req.files && req.files.length){
          let fNames = await req.files.filter((file) => {
            fileNames.push(file.originalname);
          });
        }
       
        
        if(fileNames.length == 1){
            //Check already this file exist in DB or not
            let fileExist = await FileModel.checkFileExistOrNot(fileNames, currentFolderID, uid);
            if(fileExist){
                res.json( { message: "File already exist" } );
                return;
            }
        }

        for(let eachFile of req.files){
            let fileContent = eachFile.buffer.toString('utf8');
            let fileObject = {
                Name: eachFile.originalname,
                Content: fileContent,
                TID: tid,
                Owner: ownerInfo,
                FldrID: currentFolderID,
                Status: 'A'
            };
            let insertFile = await FileModel.insertFileRecord(fileObject);
            responseObj.Files.push(insertFile.Name)
        }
        res.json(responseObj);
      }catch(err){
        res.status(500).json({ error: err.stack });
      }
    }

    async userData(req, res){
        let { uid, tid } = req.headers;
        try{
            if(!uid){
                res.json( { message: "User ID missing in the request"} );
                return;
            }
    
            if(!tid){
                res.json( { message: "Tenant ID missing in the request"} );
                return;
            }

            let userData = {};
            let userFiles = await FileModel.getUserFiles(tid, uid);
            userData.Files = userFiles;
            let userFolders = await FolderModel.getUserFolders(tid, uid);
            userData.Folders = userFolders;
            res.json(userData);
        }catch(err){
            res.json(err.stack);
        }

    }

    async viewFolder(req, res){
        let { uid, tid } = req.headers;
        let folderID = req.body.fldrID;
        try{
            if(!uid){
                res.json( { message: "User ID missing in the request"} );
                return;
            }
    
            if(!tid){
                res.json( { message: "Tenant ID missing in the request"} );
                return;
            }

            if(!folderID){
                res.json( { message: "Folder ID missing in the request"} );
                return;
            }
            let folderData = {};
            let filesInFolder = await FileModel.getAllFilesInsideFolder(tid, uid, folderID);
            folderData.Files = filesInFolder;
            res.json(folderData);
        }catch(err){
            res.json(err.stack);
        }

    }

    async moveFilesFromOneFolderToOther(req, res){
        try{
            let { tid, uid } = req.headers;
            let filesToMove = req.body.fileIDs;
            let destinationFolderID = req.body.destinationFolderID;
    
            if(!uid){
                res.json( { message: "User ID missing in the request"} );
                return;
            }
    
            if(!tid){
                res.json( { message: "Tenant ID missing in the request" } );
                return;
            }
    
            if(filesToMove.length == 0){
                res.json( { message: "File IDs to be move missing in the request" } );
                return;
            }
    
            if(!destinationFolderID){
                res.json( { message: "Destination Folder ID missing in the request"} );
                return;
            }
    
            if(destinationFolderID){
                let filesInFolder = await FileModel.getFilesCountInFolder(tid, uid, destinationFolderID);
                if(filesInFolder >= 1){
                    res.json( { message: "One folder must contain only one file max" } );
                    return;
                }
            }

            let filesMoved = [];
            for( let eachFileID of filesToMove){
                let fileMove = await FileModel.moveFiles(tid, uid, eachFileID, destinationFolderID);
                if(fileMove){
                    filesMoved.push(fileMove.Name) 
                }
            }
            res.json(filesMoved);
        }catch(err){
            res.json(err.stack)
        }
    }

    async createFolder(req, res){
        try{
          let { tid, uid, foldername } = req.headers;
  
          if(!uid){
              res.json( { message: "User ID missing in the request"} );
              return;
          }
  
          if(!tid){
              res.json( { message: "Tenant ID missing in the request"} );
              return;
          }

          if(!foldername){
            res.json( { message: "Folder name missing in the request" } );
            return;
         }
  
          let userInfo = await UserModel.getUserDetails(uid);
          let ownerInfo = {};
          ownerInfo.UID = uid;
          ownerInfo.FName = userInfo.FName;
          ownerInfo.LName = userInfo.LName;
          let responseObj = {
              Folders: [],
              Files: []
          };
  
          if(foldername) {
              let folderExist = await FolderModel.checkFolderExistOrNot(foldername, uid);
              if(folderExist){
                  res.json( { message: "Folder already exist" } );
                  return;
              }
              let folderObject = {
                  Name: foldername,
                  TID: tid,
                  Owner: ownerInfo,
                  Status: 'A'
              };
  
              let createFolder = await FolderModel.insertFolderRecord(folderObject);
              responseObj.Folders.push(createFolder.Name)
          }
          res.json(responseObj);
        }catch(err){
          res.status(500).json({ error: err.stack });
        }
      }
}

const FileInfo = new fileInfo();

module.exports = {
    upload: FileInfo.upload.bind(FileInfo),
    userData: FileInfo.userData.bind(FileInfo),
    viewFolder: FileInfo.viewFolder.bind(FileInfo),
    moveFilesFromOneFolderToOther: FileInfo.moveFilesFromOneFolderToOther.bind(FileInfo),
    createFolder: FileInfo.createFolder.bind(FileInfo),

}
