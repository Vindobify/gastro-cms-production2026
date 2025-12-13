/**
 * Sound-Benachrichtigungen für neue Bestellungen
 * 
 * Optionen:
 * 1. Browser Notification Sound (nutzt System-Sound)
 * 2. Web Audio API (generiert Beep-Sound)
 * 3. MP3-Datei (wenn vorhanden)
 */

export class OrderNotificationSound {
    private audioContext: AudioContext | null = null;
    private audioElement: HTMLAudioElement | null = null;

    constructor() {
        // Initialisiere Audio Context für Web Audio API
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
            this.audioContext = new AudioContext();
        }
    }

    /**
     * Spielt einen Benachrichtigungs-Sound ab
     * Versucht zuerst MP3, dann Web Audio API Beep
     */
    async play(): Promise<void> {
        try {
            // Option 1: MP3-Datei (falls vorhanden)
            if (await this.playMP3()) {
                return;
            }

            // Option 2: Web Audio API Beep
            this.playBeep();
        } catch (error) {
            console.error('Fehler beim Abspielen des Benachrichtigungs-Sounds:', error);
        }
    }

    /**
     * Versucht MP3-Datei abzuspielen
     */
    private async playMP3(): Promise<boolean> {
        try {
            if (!this.audioElement) {
                this.audioElement = new Audio('/sounds/new-order.mp3');
                this.audioElement.preload = 'auto';
            }

            await this.audioElement.play();
            return true;
        } catch (error) {
            // MP3 nicht gefunden oder Fehler beim Abspielen
            return false;
        }
    }

    /**
     * Generiert einen Beep-Sound mit Web Audio API
     * Zwei kurze Töne: Ding-Ding!
     */
    private playBeep(): void {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Erster Ton (höher)
        this.createBeep(800, now, 0.15);

        // Zweiter Ton (tiefer)
        this.createBeep(600, now + 0.2, 0.15);
    }

    /**
     * Erstellt einen einzelnen Beep-Ton
     */
    private createBeep(frequency: number, startTime: number, duration: number): void {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // Envelope für sanfteren Sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    /**
     * Browser-Benachrichtigung mit System-Sound
     */
    async showNotification(title: string, body: string): Promise<void> {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'new-order',
                requireInteraction: false,
                silent: false // Nutzt System-Sound
            });
        }
    }

    /**
     * Fordert Benachrichtigungs-Berechtigung an
     */
    async requestPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }
}

// Singleton-Instanz
let soundInstance: OrderNotificationSound | null = null;

export function getOrderSound(): OrderNotificationSound {
    if (!soundInstance) {
        soundInstance = new OrderNotificationSound();
    }
    return soundInstance;
}
