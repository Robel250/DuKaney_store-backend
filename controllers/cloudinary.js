// import cloudinary from 'cloudinary';

// cloudinary.config({
//   cloud_name: "dzqyjbkze",
//   api_key: "723592648957736",
//   api_secret: "akSyc15j7mYdbR1m8-fhb8P3M50",
// });
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: 'dzqyjbkze', // Cloudinary cloud name
  api_key: '723592648957736',
  api_secret: 'akSyc15j7mYdbR1m8-fhb8P3M50',
});

if (req.file) {
  const result = await cloudinary.uploader.upload(req.file.path);
  console.log(result);  // Log result from Cloudinary
  imageUrl = result.secure_url;  // The URL after uploading to Cloudinary
}
