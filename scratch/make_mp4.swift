import Foundation
import AVFoundation
import CoreGraphics
import ImageIO

guard CommandLine.arguments.count >= 4 else {
    print("Usage: make_mp4 <frames_dir> <fps> <output_path>")
    exit(1)
}

let framesDir = CommandLine.arguments[1]
let fps = Int32(CommandLine.arguments[2]) ?? 30
let outputPath = CommandLine.arguments[3]

let fileManager = FileManager.default
guard let files = try? fileManager.contentsOfDirectory(atPath: framesDir) else {
    print("Could not read directory \(framesDir)")
    exit(1)
}

let sortedFiles = files.filter { $0.hasSuffix(".png") }.sorted()
guard !sortedFiles.isEmpty else {
    print("No PNG files found in \(framesDir)")
    exit(1)
}

print("Found \(sortedFiles.count) frames. Starting video encoding...")

// Read first image to get dimensions
let firstImagePath = (framesDir as NSString).appendingPathComponent(sortedFiles[0])
guard let firstImageSource = CGImageSourceCreateWithURL(URL(fileURLWithPath: firstImagePath) as CFURL, nil),
      let firstImage = CGImageSourceCreateImageAtIndex(firstImageSource, 0, nil) else {
    print("Could not read first frame: \(firstImagePath)")
    exit(1)
}

let width = firstImage.width
let height = firstImage.height
print("Video dimensions: \(width)x\(height) @ \(fps)fps")

let outputURL = URL(fileURLWithPath: outputPath)
try? fileManager.removeItem(at: outputURL)

guard let assetWriter = try? AVAssetWriter(outputURL: outputURL, fileType: .mp4) else {
    print("Could not create AVAssetWriter")
    exit(1)
}

let videoSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 8_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]

let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
writerInput.expectsMediaDataInRealTime = false

let sourcePixelBufferAttributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height
]

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: writerInput,
    sourcePixelBufferAttributes: sourcePixelBufferAttributes
)

guard assetWriter.canAdd(writerInput) else {
    print("Cannot add writer input")
    exit(1)
}
assetWriter.add(writerInput)

assetWriter.startWriting()
assetWriter.startSession(atSourceTime: .zero)

func pixelBuffer(from image: CGImage, pool: CVPixelBufferPool?) -> CVPixelBuffer? {
    var pixelBuffer: CVPixelBuffer?
    if let pool = pool {
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
    } else {
        CVPixelBufferCreate(nil, width, height, kCVPixelFormatType_32ARGB, nil, &pixelBuffer)
    }
    
    guard let buffer = pixelBuffer else { return nil }
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    
    guard let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else { return nil }
    
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return buffer
}

var frameCount: Int64 = 0
for file in sortedFiles {
    let filePath = (framesDir as NSString).appendingPathComponent(file)
    guard let imgSource = CGImageSourceCreateWithURL(URL(fileURLWithPath: filePath) as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(imgSource, 0, nil) else {
        continue
    }
    
    while !writerInput.isReadyForMoreMediaData {
        usleep(5000)
    }
    
    if let buffer = pixelBuffer(from: img, pool: adaptor.pixelBufferPool) {
        let frameTime = CMTime(value: frameCount, timescale: fps)
        adaptor.append(buffer, withPresentationTime: frameTime)
        frameCount += 1
    }
}

writerInput.markAsFinished()
let group = DispatchGroup()
group.enter()
assetWriter.finishWriting {
    group.leave()
}
group.wait()

print("SUCCESS: Video created at \(outputPath) (\(frameCount) frames)")
