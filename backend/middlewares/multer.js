import multer from 'multer'


const storage = multer.diskStorage({  //Ssave Uploaded file temp on server.
    destination:(req, file, cb)=> { 
        cb(null, "./public")  // store the temp image in this folder 
    },
    filename:(req, file, cb)=> {
        cb(null, file.originalname)
    }
})

export const upload = multer({storage}) 