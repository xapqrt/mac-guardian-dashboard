const fs = require('fs');
const express = require('express');
const http = require('http');
const dgram = require('dgram');
const { WebSocketServer } = require('ws');
const os = require('os');
const path = require('path');
const cors = require('cors');
const macos = require('./macos');
const BluetoothSniffer = require('./bluetooth_sniffer');

const HTTP_PORT = process.env.PORT || 5050;
const UDP_PORT = process.env.UDP_PORT || 8888;

const app = express();
app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Clean, beginner-friendly settings
let config = {
  // Earbud Trigger Settings
  enableInEarRemoval: false, // Turned OFF by user request (avoid tweaky sensor)
  enableStemTap: true,       // Turned ON
  tapMode: 'multi_action',   // 'multi_action', 'double', or 'single'
  singleTapAction: 'switch_right',  // Options: switch_right, switch_left, panic, return, mute_toggle, pause_media, hide_window, decoy, none
  doubleTapAction: 'panic',         // Options: switch_right, switch_left, panic, return, mute_toggle, pause_media, hide_window, decoy, none
  tripleTapAction: 'switch_left',   // Options: switch_right, switch_left, panic, return, mute_toggle, pause_media, hide_window, decoy, none
  suppressOriginalMedia: true,      // Prevent system pause/gamemode from interfering
  tapWindowMs: 500,                 // Multi-tap detection window
  doubleTapWindowMs: 700,           // Legacy double-tap window
  debounceMs: 200,

  // What happens to sound
  muteAudio: true,
  muteMode: 'zero',          // 'zero' = silent, 'lower_to_10' = quiet (10%)
  muteMic: false,
  restoreVolumeLevel: 50,

  // What happens to your screen
  switchDesktop: true,
  desktopDirection: 'right', // Moves once to the right
  slideDwellTimeMs: 20,

  // Media Playback
  pauseMedia: true,
  pauseChrome: true,
  pauseQuickTime: true,
  hideChromeWindow: false,

  // Decoy app to bring to front
  decoyApp: 'none',

  // Returning back
  toggleMode: true,          // Double-tap again to return to your movie
  autoRevertSeconds: 0,

  activePreset: 'custom'
};

let latestBtStats = {
  rate_kbps: 0,
  rssi_dbm: 0,
  retx_percent: 0,
  packets: 0,
  status: 'INITIALIZING'
};

const logs = [];
function addLog(source, message, details = {}) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleTimeString(),
    source,
    message,
    details
  };
  logs.unshift(entry);
  if (logs.length > 100) logs.pop();
  broadcast({ type: 'log', entry });
  return entry;
}

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ interface: name, address: net.address });
      }
    }
  }
  return addresses;
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'init',
    isPanicking: macos.isPanicking,
    config,
    logs: logs.slice(0, 30),
    ips: getLocalIPs(),
    btStats: latestBtStats
  }));
});

app.get('/api/status', (req, res) => {
  res.json({
    isPanicking: macos.isPanicking,
    config,
    ips: getLocalIPs(),
    btStats: latestBtStats
  });
});

app.post('/api/config', (req, res) => {
  config = { ...config, ...req.body };
  broadcast({ type: 'config_update', config });
  res.json({ success: true, config });
});

app.post('/api/panic', async (req, res) => {
  const source = req.body.source || 'Control Center';
  let result;
  if (req.body.status) {
    macos.isPanicking = (req.body.status === 'panicked');
    result = { status: req.body.status, isPanicking: macos.isPanicking };
  } else {
    result = await macos.triggerPanic(config);
  }
  addLog(source, result.status === 'reverted' ? 'Returned to movie (Unmuted)' : 'Switched to right desktop (Muted)', result);
  broadcast({ type: 'panic_state', isPanicking: macos.isPanicking, result, source });
  res.json(result);
});

app.post('/api/action', async (req, res) => {
  const action = req.body.action || 'panic';
  const source = req.body.source || 'Manual Control';
  const result = await macos.executeAction(action, config);
  addLog(source, `Executed Action: ${action}`, result);
  broadcast({ type: 'panic_state', isPanicking: macos.isPanicking, result, source });
  res.json(result);
});

app.post('/api/switch-here', async (req, res) => {
  const { exec } = require('child_process');
  exec('osascript -e \'tell application "Antigravity" to activate\'', (err) => {
    res.json({ success: !err });
  });
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Setup UDP Listener
const udpSocket = dgram.createSocket('udp4');
udpSocket.on('error', (err) => console.error('[UDP Error]:', err));
udpSocket.on('message', async (msg, rinfo) => {
  const raw = msg.toString().trim();
  const result = await macos.triggerPanic(config);
  addLog(`UDP @ ${rinfo.address}`, result.status === 'reverted' ? 'Reverted' : 'UDP Panic Triggered', { raw });
  broadcast({ type: 'panic_state', isPanicking: macos.isPanicking, result });
});
udpSocket.bind(UDP_PORT, '0.0.0.0');

// Start the Live Bluetooth Packet Sniffer
const sniffer = new BluetoothSniffer(
  () => config,
  (source, status) => {
    addLog(source, status === 'panicked' ? 'Switched to right desktop & muted audio' : 'Returned back to movie & unmuted', { status });
    broadcast({ type: 'panic_state', isPanicking: macos.isPanicking, source });
  },
  (stats) => {
    latestBtStats = stats;
    broadcast({ type: 'bt_stats', stats });
  }
);
sniffer.start();

server.listen(HTTP_PORT, () => {
  const ips = getLocalIPs();
  const primaryIP = ips[0] ? ips[0].address : 'localhost';
  console.log(`\n======================================================`);
  console.log(`  GHOST-KEY: 2-TAP BLUETOOTH HUB READY`);
  console.log(`======================================================`);
  console.log(`  Mac Dashboard:  http://localhost:${HTTP_PORT}`);
  console.log(`  Local Network:  http://${primaryIP}:${HTTP_PORT}`);
  console.log(`======================================================\n`);
});
