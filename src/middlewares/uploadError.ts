import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error de subida: ${error.message}`
    });
  }

  if (error && error.message && error.message.includes('Solo se permiten archivos Excel')) {
    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos Excel (.xlsx, .xls)'
    });
  }

  next(error);
}; 