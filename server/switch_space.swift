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
    print("CGPostKeyboardEvent not found")
    exit(1)
}
let postKey = unsafeBitCast(ptr, to: CGPostKeyboardEventFunc.self)

var requestedDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "right"
var effectiveDir = requestedDir

// Smart boundary detection:
// If smart or right requested and we are at the rightmost space, switch left.
// If left requested and we are at the leftmost space (index 0), switch right.
if let copySpaces = _copySpacesFunc, let activeFunc = _activeSpaceFunc,
   let spacesList = copySpaces(_connID) as? [[String: Any]],
   let firstDisplay = spacesList.first, let spaces = firstDisplay["Spaces"] as? [[String: Any]] {
    let current = activeFunc(_connID)
    let idx = spaces.firstIndex { s in
        let id = s["id64"] as? UInt64 ?? (s["ManagedSpaceID"] as? UInt64 ?? 0)
        return id == current
    }

    if let idx = idx {
        if (requestedDir == "right" || requestedDir == "smart") && idx >= spaces.count - 1 {
            effectiveDir = "left"
            print("[Boundary] Space \(idx)/\(spaces.count - 1) is rightmost. Sliding left.")
        } else if requestedDir == "left" && idx <= 0 {
            effectiveDir = "right"
            print("[Boundary] Space \(idx)/\(spaces.count - 1) is leftmost. Sliding right.")
        } else if requestedDir == "smart" {
            effectiveDir = "right"
        }
    }
}

let arrowKey: UInt16 = (effectiveDir == "left") ? 123 : 124

postKey(0, 59, true) // Control Down
Thread.sleep(forTimeInterval: 0.06)
postKey(0, arrowKey, true) // Arrow Down
Thread.sleep(forTimeInterval: 0.06)
postKey(0, arrowKey, false) // Arrow Up
Thread.sleep(forTimeInterval: 0.06)
postKey(0, 59, false) // Control Up

print("[OK] Switched space \(effectiveDir)")
