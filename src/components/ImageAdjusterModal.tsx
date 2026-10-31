/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Move,
  Square,
  RectangleVertical,
  RefreshCw,
  Maximize2,
  Minimize2
} from "lucide-react";

interface ImageAdjusterModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialRatio?: "square" | "portrait";
  onClose: () => void;
  onSave: (croppedDataUrl: string, ratio: "square" | "portrait") => void;
}

export function ImageAdjusterModal({
  isOpen,
  imageUrl,
  initialRatio = "square",
  onClose,
  onSave,
}: ImageAdjusterModalProps) {
  const [ratio, setRatio] = useState<"square" | "portrait">(initialRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 800,
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  // Frame dimensions for preview UI
  // Square: 280x280 (1:1)
  // Portrait: 240x320 (exact 3:4 aspect ratio)
  const previewWidth = ratio === "square" ? 280 : 240;
  const previewHeight = ratio === "square" ? 280 : 320;

  // Target output canvas dimensions:
  // Square: 800x800
  // Portrait: 800x1067 (exact 3:4 aspect ratio)
  const targetWidth = 800;
  const targetHeight = ratio === "square" ? 800 : 1067;

  // Scale factor between preview display and output canvas
  const scaleFactor = targetWidth / previewWidth;

  // Reset transforms on opening or image url change
  useEffect(() => {
    setRatio(initialRatio);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    pinchStartDistRef.current = null;
  }, [imageUrl, initialRatio, isOpen]);

  // Preload Image & extract natural dimensions
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setNaturalSize({
        width: img.naturalWidth || img.width || 800,
        height: img.naturalHeight || img.height || 800,
      });
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    };
    img.onerror = () => {
      console.warn("Could not load image into ImageAdjusterModal");
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate base width & height to cover the preview frame
  const isRotated90 = rotation === 90 || rotation === 270;
  const effectiveImgWidth = isRotated90 ? naturalSize.height : naturalSize.width;
  const effectiveImgHeight = isRotated90 ? naturalSize.width : naturalSize.height;

  // Scale needed to cover the preview box completely
  const coverScale = Math.max(
    previewWidth / effectiveImgWidth,
    previewHeight / effectiveImgHeight
  );

  // Base dimensions of the image in the preview container
  const baseWidth = naturalSize.width * coverScale;
  const baseHeight = naturalSize.height * coverScale;

  // Reset all adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Fit image to show entire photo within the frame
  const handleFit = () => {
    const fitScale = Math.min(
      previewWidth / effectiveImgWidth,
      previewHeight / effectiveImgHeight
    );
    const fitZoom = +(fitScale / coverScale).toFixed(2);
    setZoom(Math.max(0.2, fitZoom));
    setOffset({ x: 0, y: 0 });
  };

  // Fill image to completely cover the frame
  const handleFill = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Safe client coordinate extractor from Touch or Mouse event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      if ("changedTouches" in e && e.changedTouches && e.changedTouches.length > 0) {
        return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
      }
      return null;
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  // Touch / Mouse Start
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // If multi-touch (pinch to zoom)
    if ("touches" in e && e.touches.length >= 2) {
      setIsDragging(true);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
      return;
    }

    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDragging(true);
    setDragStart({ x: coords.clientX - offset.x, y: coords.clientY - offset.y });
  };

  // Touch / Mouse Move
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      // Handle pinch zoom
      if ("touches" in e && e.touches.length >= 2) {
        if (pinchStartDistRef.current !== null) {
          const newDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const factor = newDist / pinchStartDistRef.current;
          const nextZoom = +(pinchStartZoomRef.current * factor).toFixed(2);
          setZoom(Math.max(0.2, Math.min(4.0, nextZoom)));
        }
        return;
      }

      if (!isDragging) return;
      const coords = getCoordinates(e);
      if (!coords) return;

      setOffset({
        x: coords.clientX - dragStart.x,
        y: coords.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  // Global window listeners for drag & pinch release
  useEffect(() => {
    const handleEnd = () => {
      setIsDragging(false);
      pinchStartDistRef.current = null;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsDragging(false);
        pinchStartDistRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: true });
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
      window.addEventListener("blur", handleEnd);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
      window.removeEventListener("blur", handleEnd);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isDragging, handleMove]);

  // Apply crop & export high-quality image
  const handleApply = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Background fill
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Translate to canvas center, apply offset scaled to output canvas, rotate, scale
      ctx.save();
      ctx.translate(
        targetWidth / 2 + offset.x * scaleFactor,
        targetHeight / 2 + offset.y * scaleFactor
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw the image centered identically to preview
      const drawWidth = baseWidth * scaleFactor;
      const drawHeight = baseHeight * scaleFactor;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Export high-quality JPEG (0.92)
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onSave(croppedDataUrl, ratio);
      onClose();
    } catch (err) {
      console.error("Error generating cropped image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm font-montserrat select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-beige-300 flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#FFF7E6] border-b border-beige-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#5d4037] text-white rounded-xl shadow-xs">
                <Move size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-beige-900 leading-tight">
                  Adjust & Scale Image
                </h3>
                <p className="text-[10px] text-beige-900/60 mt-0.5">
                  Zoom, position & scale to fit perfectly in your shop
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-beige-900/60 hover:text-beige-900 hover:bg-beige-200/60 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Preview Canvas Frame */}
          <div className="p-4 sm:p-6 bg-neutral-900 flex flex-col items-center justify-center relative overflow-hidden select-none touch-none">
            <div className="text-[10px] sm:text-[11px] text-neutral-300 mb-2.5 flex items-center space-x-1.5 font-medium">
              <Move size={12} className="text-amber-400" />
              <span>Drag to reposition • Pinch or use slider below to zoom & scale</span>
            </div>

            {/* Frame Box */}
            <div
              ref={containerRef}
              onMouseDown={handleStart}
              onTouchStart={handleStart}
              style={{
                width: previewWidth,
                height: previewHeight,
              }}
              className="relative overflow-hidden bg-neutral-950 rounded-2xl border-2 border-dashed border-amber-400/90 shadow-2xl cursor-grab active:cursor-grabbing transition-all flex items-center justify-center touch-none select-none"
            >
              {/* Overlay Grid Guidelines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 border border-white/10">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div />
              </div>

              {/* Exact Centered Transformed Image */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: baseWidth,
                  height: baseHeight,
                  marginLeft: -baseWidth / 2,
                  marginTop: -baseHeight / 2,
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
                className="pointer-events-none select-none"
              >
                <img
                  src={imageUrl}
                  alt="Scale preview"
                  className="w-full h-full object-fill pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 sm:p-5 bg-white space-y-4 overflow-y-auto">
            {/* Aspect Ratio Selector & Rotation */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-1.5 bg-beige-100 p-1 rounded-xl border border-beige-300">
                <button
                  type="button"
                  onClick={() => setRatio("square")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    ratio === "square"
                      ? "bg-[#5d4037] text-white shadow-xs"
                      : "text-beige-900/70 hover:text-beige-900"
                  }`}
                >
                  <Square size={13} />
                  <span>Square (1:1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatio("portrait")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    ratio === "portrait"
                      ? "bg-[#5d4037] text-white shadow-xs"
                      : "text-beige-900/70 hover:text-beige-900"
                  }`}
                >
                  <RectangleVertical size={13} />
                  <span>Portrait (3:4)</span>
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-2.5 py-1.5 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-xl border border-beige-300 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw size={14} />
                  <span className="hidden sm:inline">Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 bg-beige-100 hover:bg-beige-200 text-beige-900/70 hover:text-beige-900 rounded-xl border border-beige-300 transition-colors cursor-pointer"
                  title="Reset all adjustments"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Scale & Zoom Controls */}
            <div className="space-y-2 bg-beige-50 p-3 rounded-2xl border border-beige-200">
              <div className="flex justify-between items-center text-xs font-bold text-beige-900">
                <span className="flex items-center space-x-1.5 text-[#5d4037]">
                  <ZoomIn size={14} />
                  <span>Image Scale / Zoom:</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleFit}
                    className="px-2 py-0.5 bg-white hover:bg-beige-200 text-[#5d4037] border border-beige-300 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center space-x-1"
                    title="Scale image down to fit completely inside frame"
                  >
                    <Minimize2 size={10} />
                    <span>Fit All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFill}
                    className="px-2 py-0.5 bg-white hover:bg-beige-200 text-[#5d4037] border border-beige-300 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center space-x-1"
                    title="Fill frame"
                  >
                    <Maximize2 size={10} />
                    <span>Fill (100%)</span>
                  </button>
                  <span className="text-[#5d4037] bg-amber-100 font-extrabold px-2 py-0.5 rounded text-[11px] min-w-[45px] text-center border border-amber-300/60">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Slider with +/- buttons */}
              <div className="flex items-center space-x-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.2, +(prev - 0.1).toFixed(2)))}
                  className="p-2 bg-white hover:bg-beige-200 text-beige-900 rounded-xl border border-beige-300 cursor-pointer transition-colors shrink-0 shadow-2xs"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="0.2"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#5d4037] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3.5, +(prev + 0.1).toFixed(2)))}
                  className="p-2 bg-white hover:bg-beige-200 text-beige-900 rounded-xl border border-beige-300 cursor-pointer transition-colors shrink-0 shadow-2xs"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-beige-100 hover:bg-beige-200 text-beige-900 text-xs font-bold rounded-xl border border-beige-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-[#5d4037] hover:bg-[#4a332c] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>{isProcessing ? "Processing..." : "Apply & Save Image"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
