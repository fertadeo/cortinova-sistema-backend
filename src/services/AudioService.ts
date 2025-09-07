export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Precargar sonidos de notificación
      await this.preloadSounds();
      
      console.log('🎵 AudioService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar AudioService:', error);
      this.isEnabled = false;
    }
  }

  private async preloadSounds() {
    if (!this.audioContext) return;

    const sounds = {
      'notification': '/sounds/notification.mp3',
      'alert': '/sounds/alert.mp3',
      'success': '/sounds/success.mp3',
      'warning': '/sounds/warning.mp3'
    };

    for (const [name, url] of Object.entries(sounds)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(name, audioBuffer);
        console.log(`🎵 Sonido ${name} precargado`);
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar el sonido ${name}:`, error);
      }
    }
  }

  // Reproducir sonido de notificación
  async playNotificationSound(priority: string = 'medium'): Promise<void> {
    if (!this.isEnabled || !this.audioContext) {
      console.log('🔇 Sonido deshabilitado o AudioContext no disponible');
      return;
    }

    try {
      // Seleccionar sonido según prioridad
      let soundName = 'notification';
      
      switch (priority) {
        case 'urgent':
        case 'high':
          soundName = 'alert';
          break;
        case 'medium':
          soundName = 'notification';
          break;
        case 'low':
          soundName = 'success';
          break;
        default:
          soundName = 'notification';
      }

      const audioBuffer = this.audioBuffers.get(soundName);
      if (!audioBuffer) {
        console.warn(`⚠️ Sonido ${soundName} no disponible, usando notificación por defecto`);
        return;
      }

      // Crear fuente de audio
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configurar volumen
      gainNode.gain.value = this.volume;

      // Reproducir
      source.start(0);
      
      console.log(`🔊 Reproduciendo sonido: ${soundName} (prioridad: ${priority})`);
    } catch (error) {
      console.error('❌ Error al reproducir sonido:', error);
    }
  }

  // Reproducir sonido personalizado
  async playCustomSound(audioUrl: string): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      gainNode.gain.value = this.volume;

      source.start(0);
      console.log('🔊 Reproduciendo sonido personalizado');
    } catch (error) {
      console.error('❌ Error al reproducir sonido personalizado:', error);
    }
  }

  // Reproducir beep simple (fallback)
  playBeep(frequency: number = 800, duration: number = 200): void {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      console.log(`🔊 Reproduciendo beep: ${frequency}Hz por ${duration}ms`);
    } catch (error) {
      console.error('❌ Error al reproducir beep:', error);
    }
  }

  // Habilitar/deshabilitar sonido
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔊 Sonido ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  // Configurar volumen
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volumen configurado a: ${this.volume}`);
  }

  // Obtener estado del audio
  getStatus(): { enabled: boolean; volume: number; contextAvailable: boolean } {
    return {
      enabled: this.isEnabled,
      volume: this.volume,
      contextAvailable: !!this.audioContext
    };
  }

  // Limpiar recursos
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffers.clear();
    console.log('🔇 AudioService limpiado');
  }
}
