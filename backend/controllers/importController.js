const xlsx = require('xlsx');
const User = require('../models/User');
const Book = require('../models/Book');
const Exemplar = require('../models/Exemplar');
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');
const bcrypt = require('bcryptjs');
const fs = require('fs');

exports.importUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo Excel está vacío.' });
        }

        const existingUsers = await User.find({}, 'rut correo').lean();
        const existingRuts = new Set(existingUsers.map(u => u.rut));
        const existingEmails = new Set(existingUsers.map(u => u.correo));

        const newUsersData = [];
        const errors = [];
        const salt = await bcrypt.genSalt(10);

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            const { primerNombre, rut, correo, rol } = row;

            if (!primerNombre || !rut || !correo || !rol) {
                errors.push(`${currentRow}: Faltan campos obligatorios (primerNombre, rut, correo, rol).`);
                continue;
            }

            const rutStr = String(rut);
            if (existingRuts.has(rutStr) || existingEmails.has(correo)) {
                errors.push(`${currentRow}: El RUT (${rutStr}) o correo (${correo}) ya está registrado.`);
                continue;
            }
            
            const password = row.password ? String(row.password) : rutStr;
            const hashedPassword = await bcrypt.hash(password, salt);

            newUsersData.push({
                ...row,
                rut: rutStr,
                hashedPassword,
                curso: row.rol === 'alumno' ? row.curso : undefined
            });

            existingRuts.add(rutStr);
            existingEmails.add(correo);
        }

        if (newUsersData.length > 0) {
            await User.insertMany(newUsersData, { ordered: false });
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${newUsersData.length} de ${data.length} nuevos usuarios.`,
            successCount: newUsersData.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error en la importación de usuarios:', error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    } finally {
        fs.unlinkSync(filePath);
    }
};

exports.importBooks = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo Excel está vacío.' });
        }

        const existingBooksRaw = await Book.find({}, 'titulo autor').lean();
        const existingBooksSet = new Set(existingBooksRaw.map(b => `${b.titulo.toLowerCase().trim()}|${b.autor.toLowerCase().trim()}`));
        
        const errors = [];
        const booksToProcess = new Map();

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            const titulo = row.titulo ? String(row.titulo).trim() : '';
            const autor = row.autor ? String(row.autor).trim() : '';
            const sede = row.sede ? String(row.sede).trim() : '';

            if (!titulo || !autor || !sede) {
                errors.push(`${currentRow}: Faltan campos obligatorios (titulo, autor, sede).`);
                continue;
            }

            const bookKey = `${titulo.toLowerCase()}|${autor.toLowerCase()}`;
            
            if (existingBooksSet.has(bookKey)) {
                continue;
            }

            // --- INICIO DE LA CORRECCIÓN ---
            // Leemos la cantidad desde la columna del Excel. Si no existe o no es un número, por defecto será 1.
            const cantidad = parseInt(row.cantidadEjemplares) || 1;

            if (booksToProcess.has(bookKey)) {
                // Si el libro ya estaba en el archivo (en una fila anterior), sumamos las cantidades.
                booksToProcess.get(bookKey).cantidadEjemplares += cantidad;
            } else {
                // Si es un libro nuevo en el archivo, lo añadimos con su cantidad especificada.
                const cleanRow = { ...row, titulo, autor, sede };
                booksToProcess.set(bookKey, {
                    ...cleanRow,
                    cantidadEjemplares: cantidad
                });
            }
            // --- FIN DE LA CORRECCIÓN ---
        }

        const newBooksData = Array.from(booksToProcess.values());
        let createdCount = 0;

        if (newBooksData.length > 0) {
            const booksToInsert = newBooksData.map(({cantidadEjemplares, ...book}) => book);
            const createdBooks = await Book.insertMany(booksToInsert, { ordered: false });
            createdCount = createdBooks.length;

            const allExemplars = [];
            createdBooks.forEach((bookDoc) => {
                const originalBookData = newBooksData.find(b => b.titulo.trim().toLowerCase() === bookDoc.titulo.toLowerCase() && b.autor.trim().toLowerCase() === bookDoc.autor.toLowerCase());
                const quantity = originalBookData ? originalBookData.cantidadEjemplares : 0;
                if (quantity > 0) {
                    for (let i = 1; i <= quantity; i++) {
                        allExemplars.push({
                            libroId: bookDoc._id,
                            numeroCopia: i,
                            estado: 'disponible'
                        });
                    }
                }
            });

            if (allExemplars.length > 0) {
                await Exemplar.insertMany(allExemplars, { ordered: false });
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} nuevos títulos de libros únicos a partir de tu archivo.`,
            successCount: createdCount,
            totalRows: data.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error en la importación de libros:', error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    } finally {
        fs.unlinkSync(filePath);
    }
};

exports.importResources = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo Excel está vacío.' });
        }

        const existingResourcesRaw = await ResourceCRA.find({}, 'nombre').lean();
        const existingResourcesSet = new Set(existingResourcesRaw.map(r => r.nombre.toLowerCase().trim()));

        const newResourcesData = [];
        const errors = [];

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            const { nombre, categoria, sede } = row;

            if (!nombre || !categoria || !sede) {
                errors.push(`${currentRow}: Faltan campos obligatorios (nombre, categoria, sede).`);
                continue;
            }

            if (existingResourcesSet.has(nombre.toLowerCase().trim())) {
                errors.push(`${currentRow}: El recurso "${nombre}" ya existe.`);
                continue;
            }

            newResourcesData.push({
                ...row,
                cantidadInstancias: parseInt(row.cantidadInstancias) || 1,
            });
            existingResourcesSet.add(nombre.toLowerCase().trim());
        }

        let createdCount = 0;
        if (newResourcesData.length > 0) {
            const createdResources = await ResourceCRA.insertMany(newResourcesData.map(({cantidadInstancias, ...res}) => res), { ordered: false });
            createdCount = createdResources.length;

            const allInstances = [];
            const instanceCounts = {
                Basica: await ResourceInstance.countDocuments({ codigoInterno: { $regex: /^RBB/ } }),
                Media: await ResourceInstance.countDocuments({ codigoInterno: { $regex: /^RBM/ } })
            };

            createdResources.forEach(resDoc => {
                const originalResData = newResourcesData.find(r => r.nombre === resDoc.nombre);
                const quantity = originalResData ? originalResData.cantidadInstancias : 1;
                const sedePrefix = resDoc.sede === 'Basica' ? 'RBB' : 'RBM';

                for (let i = 1; i <= quantity; i++) {
                    const sequentialNumber = (instanceCounts[resDoc.sede] + i).toString().padStart(3, '0');
                    allInstances.push({
                        resourceId: resDoc._id,
                        codigoInterno: `${sedePrefix}-${sequentialNumber}`,
                        estado: 'disponible'
                    });
                }
                instanceCounts[resDoc.sede] += quantity;
            });

            if (allInstances.length > 0) {
                await ResourceInstance.insertMany(allInstances, { ordered: false });
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} de ${newResourcesData.length} recursos válidos.`,
            successCount: createdCount,
            totalRows: data.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error en la importación de recursos:', error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    } finally {
        fs.unlinkSync(filePath);
    }
};