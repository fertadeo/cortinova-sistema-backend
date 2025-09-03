import { Response } from 'express';
import { Notification } from '../entities/Notifications';

interface SSEClient {
  id: string;
  user_id?: string; // Opcional para conexiones globales
  response: Response;
  lastActivity: Date;
  isGlobal?: boolean; // Indica si es una conexión global
}

export class SSEService {
  private clients: Map<string, SSEClient> = new Map();
  private userConnections: Map<string, Set<string>> = new Map();

  constructor() {
    // Limpiar conexiones inactivas cada 5 minutos
    setInterval(() => this.cleanupInactiveConnections(), 5 * 60 * 1000);
  }

  // Conectar un cliente SSE
  connect(user_id: string, response: Response): string {
    const clientId = this.generateClientId();
    
    // Configurar headers SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar evento de conexión
    this.sendEvent(response, 'connected', { clientId, timestamp: new Date().toISOString() });

    // Guardar conexión
    const client: SSEClient = {
      id: clientId,
      user_id,
      response,
      lastActivity: new Date(),
      isGlobal: false
    };

    this.clients.set(clientId, client);

    // Registrar conexión por usuario
    if (!this.userConnections.has(user_id)) {
      this.userConnections.set(user_id, new Set());
    }
    this.userConnections.get(user_id)!.add(clientId);

    // Manejar desconexión
    response.on('close', () => {
      this.disconnect(clientId);
    });

    response.on('error', () => {
      this.disconnect(clientId);
    });

    // Mantener conexión viva con ping cada 30 segundos
    const pingInterval = setInterval(() => {
      if (this.clients.has(clientId)) {
        this.sendEvent(response, 'ping', { timestamp: new Date().toISOString() });
        client.lastActivity = new Date();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    return clientId;
  }

  // Conectar un cliente SSE global (sin user_id específico)
  connectGlobal(response: Response): string {
    const clientId = this.generateClientId();
    
    console.log(`🌍 Conectando cliente SSE global: ${clientId}`);
    
    // Configurar headers SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar evento de conexión
    this.sendEvent(response, 'connected', { 
      clientId, 
      timestamp: new Date().toISOString(),
      type: 'global'
    });

    // Guardar conexión global
    const client: SSEClient = {
      id: clientId,
      response,
      lastActivity: new Date(),
      isGlobal: true
    };

    this.clients.set(clientId, client);
    
    console.log(`✅ Cliente SSE global conectado: ${clientId}`);
    console.log(`📊 Total de conexiones globales: ${this.getGlobalConnectionsCount()}`);

    // Manejar desconexión
    response.on('close', () => {
      console.log(`🔌 Cliente SSE global desconectado: ${clientId}`);
      this.disconnect(clientId);
    });

    response.on('error', (error) => {
      console.log(`❌ Error en cliente SSE global ${clientId}:`, error);
      this.disconnect(clientId);
    });

    // Mantener conexión viva con ping cada 30 segundos
    const pingInterval = setInterval(() => {
      if (this.clients.has(clientId)) {
        this.sendEvent(response, 'ping', { timestamp: new Date().toISOString() });
        client.lastActivity = new Date();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    return clientId;
  }

  // Desconectar un cliente
  disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remover de la lista de conexiones del usuario (solo si no es global)
      if (client.user_id && !client.isGlobal) {
        const userConnections = this.userConnections.get(client.user_id);
        if (userConnections) {
          userConnections.delete(clientId);
          if (userConnections.size === 0) {
            this.userConnections.delete(client.user_id);
          }
        }
      }

      // Cerrar conexión
      try {
        client.response.end();
      } catch (error) {
        console.error('Error al cerrar conexión SSE:', error);
      }

      this.clients.delete(clientId);
    }
  }

  // Enviar notificación a un usuario específico
  sendNotification(user_id: string, notification: Notification): void {
    const userConnections = this.userConnections.get(user_id);
    if (!userConnections) return;

    const eventData = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      action_url: notification.action_url,
      action_text: notification.action_text,
      metadata: notification.metadata,
      created_at: notification.created_at
    };

    // Enviar a todas las conexiones del usuario
    userConnections.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        this.sendEvent(client.response, 'message', eventData);
        client.lastActivity = new Date();
      }
    });
  }

  // Enviar evento a una respuesta específica
  private sendEvent(response: Response, event: string, data: any): void {
    try {
      const eventString = `event: ${event}\n`;
      const dataString = `data: ${JSON.stringify(data)}\n\n`;
      
      response.write(eventString);
      response.write(dataString);
      
      console.log(`📤 SSE Event enviado:`, {
        event,
        dataLength: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error al enviar evento SSE:', error);
    }
  }

  // Generar ID único para el cliente
  private generateClientId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpiar conexiones inactivas (más de 10 minutos sin actividad)
  private cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutos

    for (const [clientId, client] of this.clients.entries()) {
      const timeSinceLastActivity = now.getTime() - client.lastActivity.getTime();
      if (timeSinceLastActivity > inactiveThreshold) {
        console.log(`Desconectando cliente inactivo: ${clientId}`);
        this.disconnect(clientId);
      }
    }
  }

  // Obtener estadísticas de conexiones
  getStats(): { totalClients: number; userConnections: number; globalConnections: number } {
    return {
      totalClients: this.clients.size,
      userConnections: this.userConnections.size,
      globalConnections: this.getGlobalConnectionsCount()
    };
  }

  // Obtener número de conexiones globales
  private getGlobalConnectionsCount(): number {
    let count = 0;
    for (const [clientId, client] of this.clients.entries()) {
      if (client.isGlobal) {
        count++;
      }
    }
    return count;
  }

  // Enviar notificación a todas las conexiones globales
  sendGlobalNotification(notification: Notification): void {
    console.log('🚀 INICIANDO sendGlobalNotification...');
    console.log('📋 Notificación recibida:', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message
    });
    
    const eventData = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      action_url: notification.action_url,
      action_text: notification.action_text,
      metadata: notification.metadata,
      created_at: notification.created_at
    };

    console.log('🌍 Datos del evento a enviar:', eventData);
    console.log('📊 Total de clientes conectados:', this.clients.size);

    // Contar conexiones globales
    let globalConnections = 0;
    for (const [clientId, client] of this.clients.entries()) {
      console.log(`🔍 Revisando cliente ${clientId}:`, {
        isGlobal: client.isGlobal,
        user_id: client.user_id,
        lastActivity: client.lastActivity
      });
      
      if (client.isGlobal) {
        globalConnections++;
        console.log(`📡 Enviando a conexión global ${clientId}...`);
        
        try {
          this.sendEvent(client.response, 'message', eventData);
          client.lastActivity = new Date();
          console.log(`✅ Enviado exitosamente a conexión global: ${clientId}`);
        } catch (error) {
          console.error(`❌ Error al enviar a conexión global ${clientId}:`, error);
        }
      }
    }

    console.log(`🏁 Notificación global enviada a ${globalConnections} conexiones`);
    
    if (globalConnections === 0) {
      console.log('⚠️ ADVERTENCIA: No hay conexiones globales activas');
      console.log('📊 Estado de todas las conexiones:');
      for (const [clientId, client] of this.clients.entries()) {
        console.log(`  - ${clientId}: global=${client.isGlobal}, user_id=${client.user_id}`);
      }
    }
  }

  // Enviar notificación a todos los usuarios (para notificaciones del sistema)
  broadcastNotification(notification: Notification): void {
    for (const [user_id] of this.userConnections.entries()) {
      this.sendNotification(user_id, notification);
    }
  }
}
