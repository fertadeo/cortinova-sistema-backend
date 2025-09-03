import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
  user_id?: string;
}

// Middleware de autenticación estricta (requiere token)
const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    req.user = decoded;
    
    // Extraer user_id del token y agregarlo al request
    if (decoded.user_id) {
      req.user_id = decoded.user_id;
    } else if (decoded.id) {
      req.user_id = decoded.id.toString();
    } else {
      return res.status(401).json({ message: 'Token inválido: user_id no encontrado' });
    }

    console.log('Usuario autenticado:', { user_id: req.user_id, decoded });

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware de autenticación opcional (usa token si está disponible)
const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      // Usar la misma clave secreta que en el login
      const decoded = jwt.verify(token, 'secret_key') as jwt.JwtPayload;

      req.user = decoded;
      
      // Extraer user_id del token y agregarlo al request
      if (decoded.user_id) {
        req.user_id = decoded.user_id;
      } else if (decoded.id) {
        req.user_id = decoded.id.toString();
      }

      console.log('Usuario autenticado (opcional):', { user_id: req.user_id, decoded });
    } catch (error) {
      console.log('Token inválido, continuando sin autenticación:', error);
      // No fallar, continuar sin autenticación
    }
  } else {
    console.log('No hay token, continuando sin autenticación');
  }

  next();
};

// Middleware sin autenticación (para notificaciones públicas)
const noAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Generar un ID de usuario temporal basado en IP y User-Agent
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Crear un hash simple para identificar al usuario
  const tempUserId = `temp_${Buffer.from(`${clientIP}-${userAgent}`).toString('base64').substring(0, 16)}`;
  
  req.user_id = tempUserId;
  
  console.log('Usuario temporal generado:', { 
    user_id: req.user_id, 
    ip: clientIP,
    userAgent: userAgent.substring(0, 50) + '...'
  });

  next();
};

export { auth as authenticateToken, optionalAuth, noAuth };