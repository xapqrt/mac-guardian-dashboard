#!/usr/bin/env python3
"""
GhostKey - Raspberry Pi Ultrasonic Doorway Tripwire Daemon
Measures doorway distance in real-time. The split-second someone enters,
it blasts an instant UDP panic packet to your Mac over Wi-Fi.
Zero cables on your Mac!
"""

import time
import socket
import json
import sys

# CONFIGURATION
MAC_IP = "192.168.1.5"  # Your Mac's Wi-Fi IP address (check GhostKey dashboard)
MAC_PORT = 8888         # UDP Port on your Mac

# PIN CONFIGURATION (BCM GPIO numbers)
TRIG_PIN = 23   # Physical Pin 16 on Raspberry Pi
ECHO_PIN = 24   # Physical Pin 18 on Raspberry Pi

# THRESHOLDS
SAMPLE_INTERVAL = 0.06  # Measures distance ~16 times per second for instant reaction
DEBOUNCE_SEC = 2.0      # Cooldown before firing another trigger to avoid spamming

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def send_packet(payload):
    try:
        msg = json.dumps(payload).encode('utf-8')
        sock.sendto(msg, (MAC_IP, MAC_PORT))
    except Exception as e:
        print(f"[!] Network error: {e}")

def main():
    print("==================================================")
    print("   GhostKey - Ultrasonic Doorway Tripwire         ")
    print("==================================================")
    print(f" Target Mac:  {MAC_IP}:{MAC_PORT}")
    print(f" TRIG Pin:    GPIO {TRIG_PIN} (Physical Pin 16)")
    print(f" ECHO Pin:    GPIO {ECHO_PIN} (Physical Pin 18)")
    print("==================================================")

    try:
        import RPi.GPIO as GPIO
    except ImportError:
        print("[!] RPi.GPIO not found. Running in simulation mode.")
        print("[*] Press Enter to simulate someone walking through the door...")
        while True:
            try:
                input("> ")
                send_packet({
                    "device": "RaspberryPi-Tripwire",
                    "event": "doorway_breach",
                    "distance_cm": 65.2,
                    "timestamp": time.time()
                })
                print("[*] [PANIC TRIGGER SENT TO MAC]")
            except (KeyboardInterrupt, EOFError):
                break
        return

    # Setup GPIO
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TRIG_PIN, GPIO.OUT)
    GPIO.setup(ECHO_PIN, GPIO.IN)

    GPIO.output(TRIG_PIN, False)
    print("[+] Waiting for sensor to settle...")
    time.sleep(1)

    def measure_distance():
        # Send 10us trigger pulse
        GPIO.output(TRIG_PIN, True)
        time.sleep(0.00001)
        GPIO.output(TRIG_PIN, False)

        pulse_start = time.time()
        timeout_start = pulse_start

        # Wait for echo to go HIGH
        while GPIO.input(ECHO_PIN) == 0:
            pulse_start = time.time()
            if pulse_start - timeout_start > 0.05:
                return None # Timeout

        pulse_end = pulse_start
        # Wait for echo to go LOW
        while GPIO.input(ECHO_PIN) == 1:
            pulse_end = time.time()
            if pulse_end - pulse_start > 0.05:
                return None # Timeout

        pulse_duration = pulse_end - pulse_start
        # Speed of sound = 34300 cm/s
        distance = (pulse_duration * 34300) / 2
        return round(distance, 1)

    # AUTO-CALIBRATION: Measure baseline doorway distance
    print("[*] Calibrating doorway distance... Please do NOT stand in the doorway.")
    readings = []
    for _ in range(10):
        d = measure_distance()
        if d and 20 < d < 400:
            readings.append(d)
        time.sleep(0.1)

    if readings:
        baseline = sum(readings) / len(readings)
    else:
        baseline = 160.0 # Default fallback 160cm

    # Breach threshold: if distance drops more than 30% or drops below baseline - 35cm
    breach_threshold = max(30.0, baseline - 35.0)
    print(f"[OK] Calibrated Baseline: {baseline:.1f} cm")
    print(f"[OK] Breach Trigger Armed for distances < {breach_threshold:.1f} cm")
    print("[+] Doorway Tripwire ACTIVE! (Press Ctrl+C to stop)")

    last_trigger = 0
    last_telemetry = 0

    try:
        while True:
            dist = measure_distance()
            now = time.time()

            if dist is not None:
                # Periodic telemetry to Mac dashboard every 1.5s
                if now - last_telemetry > 1.5:
                    send_packet({
                        "device": "RaspberryPi-Tripwire",
                        "event": "telemetry",
                        "distance_cm": dist,
                        "baseline_cm": baseline,
                        "threshold_cm": breach_threshold
                    })
                    last_telemetry = now

                # Check breach
                if dist < breach_threshold:
                    if now - last_trigger > DEBOUNCE_SEC:
                        last_trigger = now
                        print(f"[!] [BREACH DETECTED!] Distance dropped to {dist} cm (Threshold: {breach_threshold:.1f} cm)")
                        send_packet({
                            "device": "RaspberryPi-Tripwire",
                            "event": "doorway_breach",
                            "distance_cm": dist,
                            "baseline_cm": baseline,
                            "timestamp": now
                        })
            time.sleep(SAMPLE_INTERVAL)
    except KeyboardInterrupt:
        print("\nStopping tripwire.")
    finally:
        GPIO.cleanup()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        MAC_IP = sys.argv[1]
    main()
