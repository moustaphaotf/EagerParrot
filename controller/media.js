const fs = require('fs');
const multer = require("multer");
const sqlite = require("sqlite3");

const mimes = [
    {mime: "image/bmp", type: "image"},
    {mime: "image/gif", type: "image"},
    {mime: "image/ief", type: "image"},
    {mime: "image/jpeg", type: "image"},
    {mime: "image/jpg", type: "image"},
    {mime: "image/svg+xml", type: "image"},
    {mime: "image/png", type: "image"},
    {mime: "video/mpeg", type: "video"},
    {mime: "video/mp4", type: "video"},
    {mime: "audio/mpeg", type: "audio"},
    {mime: "audio/ogg", type: "audio"},
    {mime: "audio/vorbis", type: "audio"},
    {mime: "audio/vnd.wav", type: "audio"},
]; 


const fileFilter = (req, file, cb) => {
    if(mimes.every(m => m.mime !== file.mimetype)){
        return cb(null, false);
    }
    cb(null, true);  
}

const upload = multer({dest: "./public/media", fileFilter});


module.exports = class {
    static new_media = [
        upload.single("media"),
        (req, res, next) => {
            if(!req.file) {
                return res.status(500).json({error: 1, message: "Ce format de fichier n'est pas autorisé !"});
            } else {
                // const filetype = mimes.filter(m => m.mime === file.mimetype)[0];
                const filetype = mimes.filter(m => m.mime === req.file.mimetype)[0];
                const media = {
                    path: "/media/" + req.file.filename,
                    mime: filetype.mime,
                    type: filetype.type
                };
                if(req.session.medias) {
                    req.session.medias.unshift(media);
                } else {
                    req.session.medias = [media];
                }
                return res.status(200).json({message: "Le fichier a été uploadé avec succès !", data: media});
            }
        }
    ]

    static delete_media(req, res, next) {
        // Le supprimer de la session
        if(req.session.medias) {
            req.session.medias = req.session.medias.filter(m => m.path !== req.body.path);
        }

        // Le supprimer de la base de données
        const db = new sqlite.Database('eagerparrot.db', err => {
            if(err) console.log("Error while opening the datase !");
        });

        db.run("DELETE FROM media WHERE path=?", req.body.path, err => {
            if(err) console.log("Error while deleting the media !", err.message);
        });
        db.close();


        // Supprimer le fichier en mémoire
        const fullfilename = './public' + req.body.path;
        
        if(fs.existsSync(fullfilename)) {
            fs.unlink(fullfilename, err => {
                if(err) return res.status(500).json({error:1 , message: "Une erreur est survenue lors de la suppression du fichier !"});
                return res.status(200).json({error: 0, message: "Le fichier a été supprimé avec succès !"});
            });
        } else {
            res.status(404).json({error:-1 , message: "Le fichier que vous essayer de supprimer n'existe pas !"});
        }
    }
}