import Foundation
import ApplicationServices

typealias CGSMainConnectionIDFunc = @convention(c) () -> Int32
typealias SLSGetActiveSpaceFunc = @convention(c) (Int32) -> UInt64
typealias SLSCopyManagedDisplaySpacesFunc = @convention(c) (Int32) -> CFArray
typealias CGPostKeyboardEventFunc = @convention(c) (UInt16, UInt16, Bool) -> Void

let slHandle = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/SkyLight", RTLD_NOW)
var _activeSpaceFunc: SLSGetActiveSpaceFunc?
var _copySpacesFunc: SLSCopyManagedDisplaySpacesFunc?
var _connID: Int32 = 0

if let sl = slHandle {
    if let connPtr = dlsym(sl, "CGSMainConnectionID"),
       let activePtr = dlsym(sl, "SLSGetActiveSpace"),
       let spacesPtr = dlsym(sl, "SLSCopyManagedDisplaySpaces") {
        let connFunc = unsafeBitCast(connPtr, to: CGSMainConnectionIDFunc.self)
        _connID = connFunc()
        _activeSpaceFunc = unsafeBitCast(activePtr, to: SLSGetActiveSpaceFunc.self)
        _copySpacesFunc = unsafeBitCast(spacesPtr, to: SLSCopyManagedDisplaySpacesFunc.self)
    }
}

let appHandle = dlopen("/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices", RTLD_NOW)
guard let ptr = dlsym(appHandle, "CGPostKeyboardEvent") else {
    fputs("CGPostKeyboardEvent not found\n", stderr)
    exit(1)
}
let postKey = unsafeBitCast(ptr, to: CGPostKeyboardEventFunc.self)

fputs("[DAEMON_READY]\n", stdout)
fflush(stdout)

while let line = readLine() {
    let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty { continue }
    if trimmed == "exit" { break }

    let parts = trimmed.split(separator: " ")
    let requestedDir = String(parts[0])
    var effectiveDir = requestedDir
    var dwellTime = 0.02

    if parts.count > 1, let parsedDwell = Double(parts[1]) {
        dwellTime = parsedDwell / 1000.0
    }

    if requestedDir == "smart" {
        // Only smart boundary check applies if explicitly requested as smart
        if let copySpaces = _copySpacesFunc, let activeFunc = _activeSpaceFunc,
           let spacesList = copySpaces(_connID) as? [[String: Any]],
           let firstDisplay = spacesList.first, let spaces = firstDisplay["Spaces"] as? [[String: Any]] {
            let current = activeFunc(_connID)
            let idx = spaces.firstIndex { s in
                let id = s["id64"] as? UInt64 ?? (s["ManagedSpaceID"] as? UInt64 ?? 0)
                return id == current
            }

            if let idx = idx {
                if idx >= spaces.count - 1 {
                    effectiveDir = "left"
                } else {
                    effectiveDir = "right"
                }
            } else {
                effectiveDir = "right"
            }
        } else {
            effectiveDir = "right"
        }
    } else {
        // Direct right or left without unwanted reversal
        effectiveDir = requestedDir
    }

    let arrowKey: UInt16 = (effectiveDir == "left") ? 123 : 124

    postKey(0, 59, true)
    Thread.sleep(forTimeInterval: dwellTime)
    postKey(0, arrowKey, true)
    Thread.sleep(forTimeInterval: dwellTime)
    postKey(0, arrowKey, false)
    Thread.sleep(forTimeInterval: dwellTime)
    postKey(0, 59, false)

    fputs("[OK] Switched space \(effectiveDir)\n", stdout)
    fflush(stdout)
}
