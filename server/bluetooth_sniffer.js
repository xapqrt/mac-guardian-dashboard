const { spawn } = require('child_process');
const macos = require('./macos');

class BluetoothSniffer {
  constructor(getConfigCallback, onEventCallback, onTelemetryCallback) {
    this.getConfig = getConfigCallback || (() => ({}));
    this.onEvent = onEventCallback || (() => {});
    this.onTelemetry = onTelemetryCallback || (() => {});
    this.process = null;
    this.lastA2DPTime = Date.now();
    this.isPlaying = false;
    this.lastTrigger = 0;

    // Double tap state
    this.tapCount = 0;
    this.tapTimer = null;
  }

  start() {
    console.log('[Bluetooth Sniffer] Initializing live packet stream from bluetoothd...');

    const args = [
      'stream',
      '--predicate',
      'process == "bluetoothd" && (composedMessage contains "AVRCP" || composedMessage contains "A2DP" || composedMessage contains "playback state" || composedMessage contains "nowPlayingApplicationPlaybackStateDidChange")'
    ];

    this.process = spawn('/usr/bin/log', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let buffer = '';
    this.process.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        this.parseLine(line);
      }
    });

    this.process.stderr.on('data', (err) => {
      console.warn('[bluetoothd stream stderr]:', err.toString().trim());
    });

    this.process.on('exit', (code) => {
      console.log('[Bluetooth Sniffer] bluetoothd stream exited with code', code);
      setTimeout(() => this.start(), 2000);
    });

    // Inactivity check: ONLY runs if user explicitly turned on enableInEarRemoval
    setInterval(() => {
      const cfg = this.getConfig();
      if (!cfg.enableInEarRemoval) return;

      const timeout = cfg.streamInactivityTimeoutMs || 1000;
      const timeSinceLastPacket = Date.now() - this.lastA2DPTime;

      if (this.isPlaying && timeSinceLastPacket > timeout && !macos.isPanicking) {
        this.isPlaying = false;
        console.log(`[!] [In-Ear Detection] Stream stopped -> Earbud Removed`);
        this.handleTrigger('OnePlus In-Ear Sensor: Earbud Removed', 'panic');
      }
    }, 150);

    console.log('[Bluetooth Sniffer] Fast Packet Sniffer ACTIVE & ARMED.');
  }

  parseLine(line) {
    const text = line.trim();
    if (!text) return;

    // 1. Live A2DP Telemetry LinkQualityReport
    if (text.includes('A2DP LinkQualityReport')) {
      this.lastA2DPTime = Date.now();
      if (!this.isPlaying) {
        this.isPlaying = true;
      }

      const rateMatch = text.match(/rate\s*=\s*(\d+)\s*kbps/i);
      const rssiMatch = text.match(/RSSI\s*=\s*(-?\d+)/i);
      const retxMatch = text.match(/ReTx\s*=\s*([\d\.]+)%/i);
      const pktsMatch = text.match(/2EDR pkts\s*=\s*(\d+)/i);

      const stats = {
        timestamp: new Date().toLocaleTimeString(),
        rate_kbps: rateMatch ? parseInt(rateMatch[1], 10) : 224,
        rssi_dbm: rssiMatch ? parseInt(rssiMatch[1], 10) : -50,
        retx_percent: retxMatch ? parseFloat(retxMatch[1]) : 0,
        packets: pktsMatch ? parseInt(pktsMatch[1], 10) : 48,
        status: 'STREAMING_ACTIVE'
      };

      this.onTelemetry(stats);
      return;
    }

    const cfg = this.getConfig();

    // 2. Hardware Stem Touch Taps (Received AVRCP command from earbuds)
    if (text.includes('Received AVRCP')) {
      // If stem tap detection is disabled by user, completely ignore it!
      if (!cfg.enableStemTap) {
        console.log('[!] Stem Tap Ignored (enableStemTap is OFF)');
        return;
      }

      this.tapCount++;
      const tapWindow = cfg.tapWindowMs || (cfg.tapMode === 'double' ? (cfg.doubleTapWindowMs || 650) : 500);

      console.log(`[!] Stem Tap Registered: Tap #${this.tapCount} (Window: ${tapWindow}ms)...`);

      if (this.tapTimer) {
        clearTimeout(this.tapTimer);
      }

      // If reached 3 taps, trigger triple tap immediately!
      if (this.tapCount >= 3) {
        this.tapTimer = null;
        const finalCount = 3;
        this.tapCount = 0;
        this.dispatchTapAction(finalCount, cfg);
        return;
      }

      // Wait for possible subsequent taps within the window
      this.tapTimer = setTimeout(() => {
        const finalCount = this.tapCount;
        this.tapCount = 0;
        this.tapTimer = null;
        this.dispatchTapAction(finalCount, cfg);
      }, tapWindow);

      return;
    }

    // 3. In-Ear Removal / Insertion (ONLY if enabled by user!)
    if (cfg.enableInEarRemoval) {
      if (text.includes('playback state') || text.includes('nowPlayingApplicationPlaybackStateDidChange')) {
        if (text.includes('Pause') || text.includes("'paused'") || text.includes('<Paused>')) {
          console.log('\n[!] >>> IN-EAR REMOVAL DETECTED <<<');
          this.handleTrigger('OnePlus Buds: In-Ear Removal', 'panic');
        } else if (text.includes('Play') || text.includes("'playing'") || text.includes('<Playing>')) {
          console.log('\n[!] >>> IN-EAR INSERTION DETECTED <<<');
          this.handleTrigger('OnePlus Buds: In-Ear Insertion', 'restore');
        }
      }
    }
  }

  async dispatchTapAction(tapCount, cfg) {
    let action = 'none';
    let label = '';

    if (tapCount === 1) {
      action = cfg.singleTapAction || (cfg.tapMode === 'single' ? 'panic' : 'none');
      label = 'Single Stem Tap (1x)';
    } else if (tapCount === 2) {
      action = cfg.doubleTapAction || 'panic';
      label = 'Double Stem Tap (2x)';
    } else if (tapCount >= 3) {
      action = cfg.tripleTapAction || 'switch_left';
      label = 'Triple Stem Tap (3x)';
    }

    if (action === 'none') {
      console.log(`[!] ${label} occurred, but action is set to 'none'. Ignored.`);
      return;
    }

    console.log(`\n======================================================`);
    console.log(`  [STEM TAP DETECTED] ${label}`);
    console.log(`  Assigned Action: ${action}`);
    console.log(`======================================================\n`);

    if (action === 'panic') {
      this.handleTrigger(`OnePlus Buds: ${label}`, 'toggle');
    } else if (action === 'return') {
      this.handleTrigger(`OnePlus Buds: ${label}`, 'restore');
    } else {
      // Direct action execution
      const res = await macos.executeAction(action, cfg);
      this.onEvent(`OnePlus Buds: ${label} [${action}]`, res.status || 'success');
    }
  }

  async handleTrigger(source, intent) {
    const cfg = this.getConfig();
    const debounce = cfg.debounceMs || 200;
    const now = Date.now();
    if (now - this.lastTrigger < debounce) return;
    this.lastTrigger = now;

    console.log(`\n======================================================`);
    console.log(`  [TRIGGER] ${source}`);
    console.log(`  Intent: ${intent} | Currently Hidden: ${macos.isPanicking} | toggleMode: ${cfg.toggleMode}`);
    console.log(`======================================================\n`);

    if (intent === 'panic') {
      if (!macos.isPanicking) {
        const res = await macos.triggerPanic(cfg);
        this.onEvent(source, res.status);
      }
    } else if (intent === 'restore') {
      if (macos.isPanicking) {
        const res = await macos.restore(cfg);
        this.onEvent(source, res.status);
      }
    } else if (intent === 'toggle') {
      if (macos.isPanicking) {
        // If already in panic, check if toggleMode (tap to return) is enabled
        if (cfg.toggleMode) {
          console.log(`[!] Returning to movie space via tap...`);
          const res = await macos.restore(cfg);
          this.onEvent(source, res.status);
        } else {
          // If recovery/return is OFF, continue moving desktop on each tap!
          console.log(`[!] Recovery is OFF. Shifting desktop again on tap!`);
          const res = await macos.triggerPanic(cfg);
          this.onEvent(source, res.status);
        }
      } else {
        // Trigger panic
        const res = await macos.triggerPanic(cfg);
        this.onEvent(source, res.status);
      }
    }
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

module.exports = BluetoothSniffer;
