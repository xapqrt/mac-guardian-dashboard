import Cocoa
import Foundation
import CoreAudio
import ApplicationServices

// GhostKey Native Ultra-Stealth Daemon for macOS & OnePlus Buds Nord 4
// 1. In-Ear Removal Detection (CoreAudio device running state)
// 2. Earbud Disconnect / In-Case Detection (CoreAudio default device change)
// 3. Bluetooth Stem Touch Taps (IOHIDEventSystemClient Consumer Usage 0xCD, 0xB5, 0xB6)
// 4. Intelligent Space Switcher (Uses CGPostKeyboardEvent with 60ms dwell time)
// 5. Instant Dual Mute (Muted flag + Volume 0)

typealias CGSMainConnectionIDFunc = @convention(c) () -> Int32
typealias SLSGetActiveSpaceFunc = @convention(c) (Int32) -> UInt64
typealias SLSCopyManagedDisplaySpacesFunc = @convention(c) (Int32) -> CFArray
typealias CGPostKeyboardEventFunc = @convention(c) (UInt16, UInt16, Bool) -> Void

typealias IOHIDEventSystemClientCreateFunc = @convention(c) (CFAllocator?) -> UnsafeMutableRawPointer?
typealias IOHIDEventCallback = @convention(c) (UnsafeMutableRawPointer?, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?) -> Void
typealias IOHIDEventSystemClientRegisterEventCallbackFunc = @convention(c) (UnsafeMutableRawPointer?, IOHIDEventCallback, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?) -> Void
typealias IOHIDEventSystemClientScheduleWithDispatchQueueFunc = @convention(c) (UnsafeMutableRawPointer?, DispatchQueue) -> Void
typealias IOHIDEventGetIntegerValueFunc = @convention(c) (UnsafeMutableRawPointer?, UInt32) -> CFIndex
typealias IOHIDEventGetTypeFunc = @convention(c) (UnsafeMutableRawPointer?) -> UInt32

setbuf(stdout, nil)

var _postKey: CGPostKeyboardEventFunc?
var _getEventType: IOHIDEventGetTypeFunc?
var _getIntegerValue: IOHIDEventGetIntegerValueFunc?
var _activeSpaceFunc: SLSGetActiveSpaceFunc?
var _copySpacesFunc: SLSCopyManagedDisplaySpacesFunc?
var _connID: Int32 = 0

let hidCallback: IOHIDEventCallback = { target, context, sender, event in
    guard let event = event, let getType = _getEventType, let getInt = _getIntegerValue else { return }
    if getType(event) == 3 { // Keyboard / Consumer
        let usagePage = getInt(event, 0x00030000)
        let usage = getInt(event, 0x00030001)
        let down = getInt(event, 0x00030002)

        if usagePage == 0x0C && down == 1 {
            switch usage {
            case 0xCD:
                GhostKeyController.shared.onTrigger(source: "OnePlus Earbud Tap (Play/Pause)")
            case 0xB5:
                GhostKeyController.shared.onTrigger(source: "OnePlus Earbud Double-Tap (Next Track)")
            case 0xB6:
                GhostKeyController.shared.onTrigger(source: "OnePlus Earbud Triple-Tap (Prev Track)")
            default:
                break
            }
        }
    }
}

class GhostKeyController {
    static let shared = GhostKeyController()

    var isPanicking = false
    var lastTriggerTime: TimeInterval = 0
    let debounceInterval: TimeInterval = 0.6

    var monitoredDevice: AudioDeviceID = 0
    var lastAudioRunning: Bool = false
    var initialVolume: Int = 50

    var lastSwitchedDirection: String = "right"

    func loadSymbols() {
        let appHandle = dlopen("/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices", RTLD_NOW)
        if let ptr = dlsym(appHandle, "CGPostKeyboardEvent") {
            _postKey = unsafeBitCast(ptr, to: CGPostKeyboardEventFunc.self)
        }

        let slHandle = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/SkyLight", RTLD_NOW)
        if let connPtr = dlsym(slHandle, "CGSMainConnectionID"),
           let activePtr = dlsym(slHandle, "SLSGetActiveSpace"),
           let spacesPtr = dlsym(slHandle, "SLSCopyManagedDisplaySpaces") {
            let connFunc = unsafeBitCast(connPtr, to: CGSMainConnectionIDFunc.self)
            _connID = connFunc()
            _activeSpaceFunc = unsafeBitCast(activePtr, to: SLSGetActiveSpaceFunc.self)
            _copySpacesFunc = unsafeBitCast(spacesPtr, to: SLSCopyManagedDisplaySpacesFunc.self)
        }
    }

    func getCurrentSpace() -> UInt64 {
        guard let f = _activeSpaceFunc else { return 0 }
        return f(_connID)
    }

    func switchOneDesktop(preferRight: Bool = true) {
        guard let postKey = _postKey else { return }

        // Let's check spaces to ensure we don't hit a dead end wall
        var direction = preferRight ? "right" : "left"

        if let copySpaces = _copySpacesFunc, let spacesList = copySpaces(_connID) as? [[String: Any]],
           let firstDisplay = spacesList.first, let spaces = firstDisplay["Spaces"] as? [[String: Any]] {
            let current = getCurrentSpace()
            // Find index of current space
            let idx = spaces.firstIndex { s in
                let id = s["id64"] as? UInt64 ?? (s["ManagedSpaceID"] as? UInt64 ?? 0)
                return id == current
            }

            if let idx = idx {
                if preferRight {
                    // If we're already at the end of the spaces list, go left instead!
                    if idx >= spaces.count - 1 {
                        direction = "left"
                    } else {
                        direction = "right"
                    }
                } else {
                    // Prefer left (reverting)
                    if idx <= 0 {
                        direction = "right"
                    } else {
                        direction = "left"
                    }
                }
            }
        }

        lastSwitchedDirection = direction
        let arrowKey: UInt16 = (direction == "right") ? 124 : 123

        print("[Space Switch] Shifting 1 Space to the \(direction) (Key: \(arrowKey))")

        // Send Control + Arrow with 60ms dwell time so WindowServer reliably processes it
        postKey(0, 59, true) // Control Down
        Thread.sleep(forTimeInterval: 0.06)
        postKey(0, arrowKey, true) // Arrow Down
        Thread.sleep(forTimeInterval: 0.06)
        postKey(0, arrowKey, false) // Arrow Up
        Thread.sleep(forTimeInterval: 0.06)
        postKey(0, 59, false) // Control Up
    }

    func muteAll() {
        let script = "set volume output muted true\nset volume output volume 0"
        var err: NSDictionary?
        if let ascript = NSAppleScript(source: script) {
            ascript.executeAndReturnError(&err)
        }
    }

    func unmuteAll() {
        let script = "set volume output muted false\nset volume output volume \(initialVolume)"
        var err: NSDictionary?
        if let ascript = NSAppleScript(source: script) {
            ascript.executeAndReturnError(&err)
        }
    }

    func pauseChromeMedia() {
        let script = """
        try
            tell application "Google Chrome"
                execute front window active tab javascript "document.querySelectorAll('video, audio').forEach(v => v.pause());"
            end tell
        end try
        """
        var err: NSDictionary?
        if let ascript = NSAppleScript(source: script) {
            ascript.executeAndReturnError(&err)
        }
    }

    func notifyServer(source: String, status: String) {
        guard let url = URL(string: "http://localhost:5050/api/panic") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["source": source, "status": status]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req).resume()
    }

    func onTrigger(source: String) {
        let now = Date().timeIntervalSince1970
        if now - lastTriggerTime < debounceInterval {
            return
        }
        lastTriggerTime = now

        if isPanicking {
            // REVERT: Put earbud back in / second tap
            isPanicking = false
            print("\n[+] [REVERT TO NORMAL] Source: \(source) at \(Date())")
            unmuteAll()
            // Revert back opposite to last switch
            switchOneDesktop(preferRight: (lastSwitchedDirection == "left"))
            notifyServer(source: source, status: "reverted")
        } else {
            // PANIC: Took earbud off / tapped earbud
            isPanicking = true
            print("\n[!] [PANIC ACTIVATED] Source: \(source) at \(Date())")
            muteAll()
            pauseChromeMedia()
            switchOneDesktop(preferRight: true)
            notifyServer(source: source, status: "panicked")
        }
    }

    func setupCoreAudioListener() {
        func getDefaultDevice() -> AudioDeviceID {
            var deviceID = AudioDeviceID(0)
            var size = UInt32(MemoryLayout<AudioDeviceID>.size)
            var address = AudioObjectPropertyAddress(
                mSelector: kAudioHardwarePropertyDefaultOutputDevice,
                mScope: kAudioObjectPropertyScopeGlobal,
                mElement: kAudioObjectPropertyElementMain
            )
            AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size, &deviceID)
            return deviceID
        }

        func isRunning(dev: AudioDeviceID) -> Bool {
            if dev == 0 { return false }
            var running = UInt32(0)
            var size = UInt32(MemoryLayout<UInt32>.size)
            var address = AudioObjectPropertyAddress(
                mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
                mScope: kAudioObjectPropertyScopeGlobal,
                mElement: kAudioObjectPropertyElementMain
            )
            AudioObjectGetPropertyData(dev, &address, 0, nil, &size, &running)
            return running != 0
        }

        monitoredDevice = getDefaultDevice()
        lastAudioRunning = isRunning(dev: monitoredDevice)

        print("[+] CoreAudio Monitoring Output Device ID: \(monitoredDevice)")
        print("[+] Initial Audio Running State: \(lastAudioRunning)")

        // 70ms Hardware Polling Loop
        let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
        timer.schedule(deadline: .now(), repeating: .milliseconds(70))
        timer.setEventHandler { [weak self] in
            guard let self = self else { return }
            let currentDev = getDefaultDevice()
            
            // Check if device changed (earbud disconnected or put in case)
            if currentDev != self.monitoredDevice {
                print("[!] Audio Device Changed: \(self.monitoredDevice) -> \(currentDev)")
                self.monitoredDevice = currentDev
                if !self.isPanicking {
                    self.onTrigger(source: "OnePlus Earbud Disconnected / Removed")
                }
                return
            }

            // Check running state
            let currentRunning = isRunning(dev: self.monitoredDevice)
            if currentRunning != self.lastAudioRunning {
                self.lastAudioRunning = currentRunning
                if !currentRunning {
                    // Audio paused -> Earbud taken out!
                    self.onTrigger(source: "OnePlus In-Ear Detection: Earbud Removed (Paused)")
                } else if self.isPanicking {
                    // Audio resumed -> Earbud put back in!
                    self.onTrigger(source: "OnePlus In-Ear Detection: Earbud Put Back (Resumed)")
                }
            }
        }
        timer.resume()
    }

    func setupHIDListener() {
        let handle = dlopen(nil, RTLD_NOW)
        guard let clientCreatePtr = dlsym(handle, "IOHIDEventSystemClientCreate"),
              let registerCallbackPtr = dlsym(handle, "IOHIDEventSystemClientRegisterEventCallback"),
              let schedulePtr = dlsym(handle, "IOHIDEventSystemClientScheduleWithDispatchQueue"),
              let getIntegerValuePtr = dlsym(handle, "IOHIDEventGetIntegerValue"),
              let getEventTypePtr = dlsym(handle, "IOHIDEventGetType") else {
            return
        }

        let clientCreate = unsafeBitCast(clientCreatePtr, to: IOHIDEventSystemClientCreateFunc.self)
        let registerCallback = unsafeBitCast(registerCallbackPtr, to: IOHIDEventSystemClientRegisterEventCallbackFunc.self)
        let scheduleWithQueue = unsafeBitCast(schedulePtr, to: IOHIDEventSystemClientScheduleWithDispatchQueueFunc.self)
        _getIntegerValue = unsafeBitCast(getIntegerValuePtr, to: IOHIDEventGetIntegerValueFunc.self)
        _getEventType = unsafeBitCast(getEventTypePtr, to: IOHIDEventGetTypeFunc.self)

        guard let client = clientCreate(kCFAllocatorDefault) else { return }
        registerCallback(client, hidCallback, nil, nil)
        scheduleWithQueue(client, DispatchQueue.main)
        print("[+] Bluetooth Touch Tap Listener Active.")
    }

    func start() {
        loadSymbols()
        print("=================================================================")
        print("   GhostKey // OnePlus Buds Nord 4 Stealth Daemon Active         ")
        print("=================================================================")
        print("✓ Removing Earbud: Instantly mutes sound & slides 1 Desktop Right")
        print("✓ Tapping Earbud: Instantly mutes sound & slides 1 Desktop Right")
        print("✓ Putting Earbud back in / 2nd Tap: Restores sound & slides back")
        print("=================================================================")

        setupCoreAudioListener()
        setupHIDListener()

        CFRunLoopRun()
    }
}

GhostKeyController.shared.start()
