import multer from 'multer'
import CloudinaryStorage from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eva-productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
})

const storageDocumentos = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eva-documentos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
})

export const upload = multer({ storage })

export const uploadDocumento = multer({
  storage: storageDocumentos,
})