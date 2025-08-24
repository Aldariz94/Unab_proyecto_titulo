const multer = require('multer');
const path = require('path');

// Configura multer para guardar el archivo en el disco, en una carpeta temporal
const storage = multer.diskStorage({
  destination: 'uploads/', // Asegúrate de que esta carpeta exista en la raíz de tu backend
  filename: (req, file, cb) => {
    // Crea un nombre de archivo único para evitar colisiones
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Aumentamos el límite a 20MB para archivos grandes
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no válido. Solo se aceptan archivos de Excel (.xlsx, .xls)'), false);
        }
    }
});

// Se corrige 'export default' por 'module.exports' para ser compatible con require()
module.exports = upload;