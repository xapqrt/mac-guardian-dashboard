const { exec, spawn } = require('child_process');
const path = require('path');

class MacOSController {
  constructor() {
    this.isPanicking = false;
    this.lastTriggerTime = 0;
    this.previousVolume = 50;
    this.autoRevertTimer = null;
    this.lastPanicDirection = 'right';

    this.daemonProcess = null;
    this.daemonReady = false;
    this.pendingCallbacks = [];
    this.initDaemon();
  }

  initDaemon() {
    const binPath = path.join(__dirname, 'daemon_switch');
    try {
      this.daemonProcess = spawn(binPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });

      let buffer = '';
      this.daemonProcess.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const text = line.trim();
          if (text === '[DAEMON_READY]') {
            this.daemonReady = true;
          } else if (text.startsWith('[OK]') || text.startsWith('[ERR]')) {
            const cb = this.pendingCallbacks.shift();
            if (cb) {
              let effective = 'right';
              if (text.includes('left')) effective = 'left';
              cb({ success: text.startsWith('[OK]'), output: text, effectiveDirection: effective });
            }
          }
        }
      });

      this.daemonProcess.stderr.on('data', (err) => {
        console.warn('[Daemon Switch stderr]:', err.toString().trim());
      });

      this.daemonProcess.on('exit', () => {
        this.daemonReady = false;
        setTimeout(() => this.initDaemon(), 1000);
      });
    } catch (e) {
      console.warn('Could not launch daemon_switch:', e.message);
    }
  }

  runAppleScript(script) {
    return new Promise((resolve) => {
      exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error, stdout, stderr) => {
        if (error) {
          console.warn('[AppleScript Warning]:', stderr.trim() || error.message);
          resolve({ success: false, error: stderr.trim() || error.message });
        } else {
          resolve({ success: true, output: stdout.trim() });
        }
      });
    });
  }

  async getVolume() {
    const res = await this.runAppleScript('output volume of (get volume settings)');
    const v = parseInt(res.output, 10);
    return isNaN(v) ? 50 : v;
  }

  mute(mode = 'zero', muteMic = false) {
    let script = '';
    if (mode === 'zero') {
      script += 'set volume output muted true\nset volume output volume 0\n';
    } else if (mode === 'lower_to_10') {
      script += 'set volume output volume 10\n';
    } else {
      script += 'set volume output muted true\n';
    }

    if (muteMic) {
      script += 'set volume input volume 0\n';
    }

    return this.runAppleScript(script);
  }

  unmute(restoreLevel = 50, restoreMic = false) {
    let script = `set volume output muted false\nset volume output volume ${restoreLevel}\n`;
    if (restoreMic) {
      script += 'set volume input volume 75\n';
    }
    return this.runAppleScript(script);
  }

  switchOneDesktop(direction = 'right', dwellMs = 20) {
    return new Promise((resolve) => {
      if (this.daemonProcess && this.daemonProcess.stdin && !this.daemonProcess.killed) {
        this.pendingCallbacks.push(resolve);
        this.daemonProcess.stdin.write(`${direction} ${dwellMs}\n`);
      } else {
        const helperPath = path.join(__dirname, 'switch_space');
        exec(`"${helperPath}" ${direction}`, (err, stdout) => {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            const out = stdout.trim();
            let effective = direction;
            if (out.includes('left')) effective = 'left';
            else if (out.includes('right')) effective = 'right';
            resolve({ success: true, output: out, effectiveDirection: effective });
          }
        });
      }
    });
  }

  pauseMedia(opts = {}) {
    let script = '';
    if (opts.pauseChrome !== false) {
      script += `
        try
          tell application "Google Chrome"
            execute active tab of front window javascript "document.querySelectorAll('video, audio').forEach(function(v){v.pause();});"
          end tell
        end try
      `;
    }
    if (opts.pauseQuickTime !== false) {
      script += `
        try
          tell application "QuickTime Player" to pause every document
        end try
      `;
    }
    return this.runAppleScript(script);
  }

  hideMediaApps() {
    const script = `
      try
        tell application "System Events"
          set visible of process "Google Chrome" to false
        end tell
      end try
    `;
    return this.runAppleScript(script);
  }

  showMediaApps() {
    const script = `
      try
        tell application "System Events"
          set visible of process "Google Chrome" to true
        end tell
        tell application "Google Chrome" to activate
      end try
    `;
    return this.runAppleScript(script);
  }

  focusDecoyApp(appName = 'none') {
    if (!appName || appName === 'none') return Promise.resolve();
    const script = `tell application "${appName}" to activate`;
    return this.runAppleScript(script);
  }

  async executeAction(actionType, actionConfig = {}) {
    const actionsTaken = [];
    const dwell = actionConfig.slideDwellTimeMs || 20;

    switch (actionType) {
      case 'switch_right':
        await this.switchOneDesktop('right', dwell);
        actionsTaken.push('switch_right');
        break;

      case 'switch_left':
        await this.switchOneDesktop('left', dwell);
        actionsTaken.push('switch_left');
        break;

      case 'mute_toggle':
        if (this.isPanicking) {
          const restoreVol = actionConfig.restoreVolumeLevel || 50;
          await this.unmute(restoreVol, actionConfig.muteMic || false);
          actionsTaken.push('unmuted');
        } else {
          await this.mute(actionConfig.muteMode || 'zero', actionConfig.muteMic || false);
          actionsTaken.push('muted_' + (actionConfig.muteMode || 'zero'));
        }
        break;

      case 'mute_audio':
        await this.mute(actionConfig.muteMode || 'zero', actionConfig.muteMic || false);
        actionsTaken.push('muted_' + (actionConfig.muteMode || 'zero'));
        break;

      case 'unmute_audio':
        await this.unmute(actionConfig.restoreVolumeLevel || 50, actionConfig.muteMic || false);
        actionsTaken.push('unmuted');
        break;

      case 'pause_media':
        await this.pauseMedia(actionConfig);
        actionsTaken.push('pause_media');
        break;

      case 'hide_window':
        await this.hideMediaApps();
        actionsTaken.push('hide_media_window');
        break;

      case 'restore_window':
        await this.showMediaApps();
        actionsTaken.push('show_media_window');
        break;

      case 'decoy':
        if (actionConfig.decoyApp && actionConfig.decoyApp !== 'none') {
          await this.focusDecoyApp(actionConfig.decoyApp);
          actionsTaken.push('focus_' + actionConfig.decoyApp);
        }
        break;

      case 'return':
        return await this.restore(actionConfig);

      case 'panic':
      default:
        return await this.triggerPanic(actionConfig);
    }

    return { status: 'success', actionsTaken };
  }

  async triggerPanic(config = {}) {
    const now = Date.now();
    const debounce = config.debounceMs || 250;
    if (now - this.lastTriggerTime < debounce) {
      return { status: 'debounced', isPanicking: this.isPanicking };
    }
    this.lastTriggerTime = now;

    if (this.autoRevertTimer) {
      clearTimeout(this.autoRevertTimer);
      this.autoRevertTimer = null;
    }

    // If already in panic state:
    if (this.isPanicking) {
      if (config.toggleMode) {
        return this.restore(config);
      } else {
        // User turned off recovery/return! Keep continuing to move desktop on each tap!
        console.log('[GhostKey] Already in panic state and toggleMode is OFF -> Continuing space switch as requested!');
        const dwell = config.slideDwellTimeMs || 20;
        const actionsTaken = [];
        if (config.switchDesktop !== false) {
          const dir = config.desktopDirection || 'right';
          await this.switchOneDesktop(dir, dwell);
          actionsTaken.push('switch_desktop_' + dir);
        }
        return {
          status: 'panicked',
          isPanicking: true,
          actionsTaken,
          continued: true
        };
      }
    }

    this.isPanicking = true;
    const actionsTaken = [];
    const dwell = config.slideDwellTimeMs || 20;

    // 1. Move Desktop: ONLY if switchDesktop is enabled!
    let switchPromise = Promise.resolve({ effectiveDirection: 'none' });
    if (config.switchDesktop !== false) {
      const dir = config.desktopDirection || 'right';
      switchPromise = this.switchOneDesktop(dir, dwell);
    }

    // 2. Audio Mute: ONLY if muteAudio is enabled!
    if (config.muteAudio !== false) {
      this.mute(config.muteMode || 'zero', config.muteMic || false);
      actionsTaken.push('mute_' + (config.muteMode || 'zero'));
    }

    // 3. Pause Media: ONLY if pauseChrome is enabled!
    if (config.pauseChrome !== false) {
      this.pauseMedia(config).catch(() => {});
      actionsTaken.push('pause_media');
    }

    // 4. Hide Chrome Window: ONLY if hideChromeWindow is enabled!
    if (config.hideChromeWindow) {
      this.hideMediaApps().catch(() => {});
      actionsTaken.push('hide_media_window');
    }

    // 5. Decoy App: ONLY if decoyApp is chosen!
    if (config.decoyApp && config.decoyApp !== 'none') {
      this.focusDecoyApp(config.decoyApp).catch(() => {});
      actionsTaken.push('focus_' + config.decoyApp);
    }

    const switchRes = await switchPromise;
    if (config.switchDesktop !== false) {
      this.lastPanicDirection = switchRes.effectiveDirection || config.desktopDirection || 'right';
      actionsTaken.push('switch_desktop_' + this.lastPanicDirection);
    }

    // 6. Auto-Revert Timer if enabled
    if (config.autoRevertSeconds && config.autoRevertSeconds > 0) {
      this.autoRevertTimer = setTimeout(async () => {
        await this.restore(config);
      }, config.autoRevertSeconds * 1000);
      actionsTaken.push(`auto_revert_${config.autoRevertSeconds}s`);
    }

    console.log('[GhostKey] Panic Fired:', actionsTaken.join(', '));
    return {
      status: 'panicked',
      isPanicking: true,
      actionsTaken
    };
  }

  async restore(config = {}) {
    if (this.autoRevertTimer) {
      clearTimeout(this.autoRevertTimer);
      this.autoRevertTimer = null;
    }
    this.isPanicking = false;
    const dwell = config.slideDwellTimeMs || 20;

    // 1. Switch back: ONLY if switchDesktop is enabled!
    let switchPromise = Promise.resolve();
    if (config.switchDesktop !== false) {
      const oppositeDir = this.lastPanicDirection === 'right' ? 'left' : 'right';
      switchPromise = this.switchOneDesktop(oppositeDir, dwell);
    }

    // 2. Unmute audio: ONLY if audio was muted!
    if (config.muteAudio !== false) {
      const restoreVol = config.restoreVolumeLevel || 50;
      this.unmute(restoreVol, config.muteMic || false);
    }

    // 3. Restore media window if previously hidden
    if (config.hideChromeWindow) {
      this.showMediaApps().catch(() => {});
    }

    await switchPromise;
    console.log('[GhostKey] Restored: Returned to movie & original volume');
    return { status: 'reverted', isPanicking: false };
  }
}

module.exports = new MacOSController();
