import { Audio } from 'expo-av';

class SosSoundService {
    private sound: Audio.Sound | null = null;
    private isPlaying: boolean = false;

    async startAlarm() {
        console.log('[SosSoundService] startAlarm() called');
        if (this.isPlaying) {
            console.log('[SosSoundService] Alarm is already playing, ignoring start request');
            return;
        }

        try {
            console.log('[SosSoundService] Configuring audio mode...');
            // Configure audio to play in silent mode and at max volume
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            console.log('[SosSoundService] Loading sound asset...');
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/siren.mp3'),
                { shouldPlay: false, isLooping: true, volume: 1.0 }
            );

            this.sound = sound;

            console.log('[SosSoundService] Playing sound...');
            await this.sound.playAsync();

            this.isPlaying = true;
            console.log('[SosSoundService] Alarm started successfully.');
        } catch (error) {
            console.error('[SosSoundService] Failed to start alarm:', error);
        }
    }

    async stopAlarm() {
        console.log('[SosSoundService] stopAlarm() called');
        if (!this.sound) {
            console.log('[SosSoundService] No sound instance to stop.');
            return;
        }

        try {
            console.log('[SosSoundService] Stopping and unloading sound...');
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
            this.sound = null;
            this.isPlaying = false;
            console.log('[SosSoundService] Alarm stopped successfully.');
        } catch (error) {
            console.error('[SosSoundService] Failed to stop alarm:', error);
        }
    }

    isActive() {
        return this.isPlaying;
    }
}

export default new SosSoundService();
