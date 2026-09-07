#!/usr/bin/env python3
import socket
import json
import time

MAC_IP = "127.0.0.1"
MAC_PORT = 8888

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
payload = {
    "device": "Test-Pocket-Clicker",
    "event": "simulated_ir_press",
    "timestamp": time.time()
}
msg = json.dumps(payload).encode('utf-8')
sock.sendto(msg, (MAC_IP, MAC_PORT))
print(f"[OK] Sent simulated pocket IR click to {MAC_IP}:{MAC_PORT}")
