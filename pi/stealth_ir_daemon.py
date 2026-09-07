#!/usr/bin/env python3
"""
GhostKey - Raspberry Pi Wireless IR Pocket Clicker Daemon
Listens to IR Receiver on GPIO pin and blasts instant UDP panic signal to Mac over Wi-Fi.
No cables needed on your Mac!
"""

import time
import socket
import json
import sys

# CONFIGURATION
# Set this to your Mac's local IP (viewable in the GhostKey dashboard)
MAC_IP = "192.168.1.5"
MAC_PORT = 8888
IR_PIN = 18          # BCM GPIO 18 (Physical Pin 12 on Raspberry Pi header)
DEBOUNCE_SEC = 0.5   # Cooldown period between triggers to avoid double-firing

# Setup UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def send_trigger():
    payload = {
        "device": "RaspberryPi-IR-Clicker",
        "event": "ir_button_press",
        "timestamp": time.time()
    }
    msg = json.dumps(payload).encode('utf-8')
    try:
        sock.sendto(msg, (MAC_IP, MAC_PORT))
        print(f"[*] [PANIC TRIGGER SENT] -> {MAC_IP}:{MAC_PORT} at {time.strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"[!] Error sending packet: {e}")

def main():
    print("==================================================")
    print("   GhostKey - Raspberry Pi Pocket IR Clicker      ")
    print("==================================================")
    print(f" Target Mac IP:   {MAC_IP}:{MAC_PORT}")
    print(f" IR Receiver Pin: GPIO {IR_PIN} (Physical Pin 12)")
    print("==================================================")

    try:
        import RPi.GPIO as GPIO
    except ImportError:
        print("[!] RPi.GPIO module not found.")
        print("[*] If testing on non-Pi, running simulation mode (Press Enter to trigger)...")
        while True:
            try:
                input("Press [Enter] to simulate pocket click > ")
                send_trigger()
            except (KeyboardInterrupt, EOFError):
                break
        return

    # Raspberry Pi GPIO Setup
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    last_trigger = 0

    print("[+] Listening for pocket IR remote signals... (Press Ctrl+C to stop)")

    try:
        while True:
            # Active-low: IR receiver pulls pin LOW when modulated IR beam is received
            if GPIO.input(IR_PIN) == GPIO.LOW:
                now = time.time()
                if now - last_trigger > DEBOUNCE_SEC:
                    last_trigger = now
                    send_trigger()
                # Drain the remainder of the pulse burst
                time.sleep(0.05)
            time.sleep(0.005) # 5ms polling loop for ultra-low latency & low CPU usage
    except KeyboardInterrupt:
        print("\nStopping IR listener.")
    finally:
        GPIO.cleanup()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        MAC_IP = sys.argv[1]
    main()
