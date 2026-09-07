import Cocoa
import Foundation

typealias IOHIDEventSystemClientCreateFunc = @convention(c) (CFAllocator?) -> UnsafeMutableRawPointer?
typealias IOHIDEventCallback = @convention(c) (UnsafeMutableRawPointer?, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?) -> Void
typealias IOHIDEventSystemClientRegisterEventCallbackFunc = @convention(c) (UnsafeMutableRawPointer?, IOHIDEventCallback, UnsafeMutableRawPointer?, UnsafeMutableRawPointer?) -> Void
typealias IOHIDEventSystemClientScheduleWithDispatchQueueFunc = @convention(c) (UnsafeMutableRawPointer?, DispatchQueue) -> Void
typealias IOHIDEventGetIntegerValueFunc = @convention(c) (UnsafeMutableRawPointer?, UInt32) -> CFIndex
typealias IOHIDEventGetTypeFunc = @convention(c) (UnsafeMutableRawPointer?) -> UInt32

typealias MRIsPlayingFunc = @convention(c) (DispatchQueue, @escaping (Bool) -> Void) -> Void

// Global symbols for C callback
var _getEventType: IOHIDEventGetTypeFunc?
var _getIntegerValue: IOHIDEventGetIntegerValueFunc?

let hidCallback: IOHIDEventCallback = { target, context, sender, event in
    guard let event = event, let getType = _getEventType, let getInt = _getIntegerValue else { return }
    let type = getType(event)
    // Type 3 = Keyboard / Consumer Control
    if type == 3 {
        let usagePage = getInt(event, 0x00030000)
        let usage = getInt(event, 0x00030001)
        let down = getInt(event, 0x00030002)

        if usagePage == 0x0C && down == 1 {
            switch usage {
            case 0xCD: // Play / Pause
                EarbudMonitor.shared.triggerPanic(source: "OnePlus Earbud Tap (Play/Pause)")
            case 0xB5: // Next Track
                EarbudMonitor.shared.triggerPanic(source: "OnePlus Earbud Double-Tap (Next Track)")
            case 0xB6: // Prev Track
                EarbudMonitor.shared.triggerPanic(source: "OnePlus Earbud Triple-Tap (Prev Track)")
            default:
                break
            }
        }
    }
}

class EarbudMonitor {
    static let shared = EarbudMonitor()
    var lastTriggerTime: TimeInterval = 0
    let debounceInterval: TimeInterval = 0.6
    let panicURL = URL(string: "http://localhost:5050/api/panic")!

    var lastPlayingState: Bool? = nil

    func triggerPanic(source: String) {
        let now = Date().timeIntervalSince1970
        if now - lastTriggerTime < debounceInterval {
            return
        }
        lastTriggerTime = now

        print("\n[!] >>> TRIGGER FIRED: \(source) <<<")

        var request = URLRequest(url: panicURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["source": source]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        let task = URLSession.shared.dataTask(with: request) { _, _, error in
            if let error = error {
                print("[!] Error triggering panic: \(error.localizedDescription)")
            } else {
                print("[OK] GhostKey Panic dispatched successfully!")
            }
        }
        task.resume()
    }

    func setupHIDListener() {
        let handle = dlopen(nil, RTLD_NOW)
        guard let clientCreatePtr = dlsym(handle, "IOHIDEventSystemClientCreate"),
              let registerCallbackPtr = dlsym(handle, "IOHIDEventSystemClientRegisterEventCallback"),
              let schedulePtr = dlsym(handle, "IOHIDEventSystemClientScheduleWithDispatchQueue"),
              let getIntegerValuePtr = dlsym(handle, "IOHIDEventGetIntegerValue"),
              let getEventTypePtr = dlsym(handle, "IOHIDEventGetType") else {
            print("[!] Could not load IOHIDEventSystemClient symbols")
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
        print("[+] Hardware Bluetooth Tap Listener initialized.")
    }

    func setupMediaRemoteListener() {
        let _ = Bundle(path: "/System/Library/PrivateFrameworks/MediaRemote.framework")?.load()
        guard let bundle = CFBundleGetBundleWithIdentifier("com.apple.MediaRemote" as CFString),
              let isPlayingPtr = CFBundleGetFunctionPointerForName(bundle, "MRMediaRemoteGetNowPlayingApplicationIsPlaying" as CFString) else {
            print("[!] MediaRemote framework not available")
            return
        }

        let getIsPlaying = unsafeBitCast(isPlayingPtr, to: MRIsPlayingFunc.self)

        // Poll playback state every 200ms to detect ear-removal pause
        let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
        timer.schedule(deadline: .now(), repeating: .milliseconds(200))
        timer.setEventHandler { [weak self] in
            guard let self = self else { return }
            getIsPlaying(DispatchQueue.main) { isPlaying in
                if let last = self.lastPlayingState {
                    // Transition from playing -> paused (Earbud removed or paused)
                    if last == true && isPlaying == false {
                        self.triggerPanic(source: "Earbud Removed (Auto-Pause)")
                    } else if last == false && isPlaying == true {
                        // Put back in ear / resumed
                        self.triggerPanic(source: "Earbud Put Back (Resumed)")
                    }
                }
                self.lastPlayingState = isPlaying
            }
        }
        timer.resume()
        print("[+] Ear-Detection (Auto-Pause on Removal) Listener initialized.")
    }

    func start() {
        print("==================================================")
        print("  GhostKey: OnePlus Buds Nord 4 Stealth Listener  ")
        print("==================================================")
        print("✓ Tap Earbud: Switches 1 Desktop Right & Mutes")
        print("✓ Take Off Earbud: Switches 1 Desktop Right & Mutes")
        print("✓ Tap Again / Put Back In: Returns 1 Desktop Left")
        print("==================================================")

        setupHIDListener()
        setupMediaRemoteListener()

        CFRunLoopRun()
    }
}

EarbudMonitor.shared.start()
