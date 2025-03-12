// import multer from 'multer';

// const storage=multer.diskStorage({
//     destination:(req,file,cd)=>{
//         cd(null,`upload/`);
//     },
//     filename: (req,file,cd)=>{
//         cd(null,`{file.originalname}`)
//     }
// });


// const filefilter=(req,file,cd)=>{
//     if(file.mimetype.startsWith('image/')){
//         cd(null,true);
//     }else{
//         cd( new Error('Invaid file type,only image are allowed'),false);
//     }
// };
// const upload = multer({storage,filefilter});
// export default upload;
  
    
import multer from 'multer';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// router.post("/", authenticate, requireAdmin, upload.single("image"), async (req, res) => {
//   try {
//     console.log(req.file);  // Check if file is being uploaded correctly
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     // Continue processing after file upload...
//   } catch (error) {
//     console.error("Error creating item:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
