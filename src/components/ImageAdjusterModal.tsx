/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Square, RectangleVertical, RefreshCw } from "lucide-react";

interface ImageAdjusterModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialRatio?: 'square' | 'portrait';
  onClose: () => void;
  onSave: (croppedDataUrl: string, ratio: 'square' | 'portrait') => void;
}

export function ImageAdjusterModal({
  isOpen,
  imageUrl,
  initialRatio = 'square',
  onClose,
  onSave
}: ImageAdjusterModalProps) {
  const [ratio, setRatio] = useState<'square' | 'portrait'>(initialRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRatio(initialRatio);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, [imageUrl, initialRatio, isOpen]);

  // Load Image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Mouse / Touch Dragging logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleApply = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const targetWidth = ratio === 'square' ? 800 : 800;
      const targetHeight = ratio === 'square' ? 800 : 1066;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Clear Canvas
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Container aspect ratio box in UI
      const containerRect = containerRef.current.getBoundingClientRect();
      const previewW = containerRect.width;
      const previewH = containerRect.height;

      // Scale factor from preview box to canvas output
      const scaleFactor = targetWidth / previewW;

      ctx.save();
      // Move to center of canvas
      ctx.translate(targetWidth / 2 + offset.x * scaleFactor, targetHeight / 2 + offset.y * scaleFactor);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      // Compute fit scale
      const isRotated90 = rotation === 90 || rotation === 270;
      const imgWidth = isRotated90 ? img.height : img.width;
      const imgHeight = isRotated90 ? img.width : img.height;

      // Calculate object-fit style scaling inside preview
      const ratioWidth = targetWidth / imgWidth;
      const ratioHeight = targetHeight / imgHeight;
      const baseFitScale = Math.max(ratioWidth, ratioHeight);

      const drawW = img.width * baseFitScale;
      const drawH = img.height * baseFitScale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Export compressed Data URL (JPEG, quality 0.88 for optimal balance)
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-montserrat">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-beige-300 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#FFF7E6] border-b border-beige-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[#5d4037] text-white rounded-xl">
                <Move size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-beige-900">Adjust & Crop Image</h3>
                <p className="text-[11px] text-beige-900/60">Drag to position, zoom and rotate to fit perfectly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-beige-900/60 hover:text-beige-900 hover:bg-beige-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Interactive Preview Container */}
          <div className="p-6 bg-neutral-900 flex flex-col items-center justify-center relative overflow-hidden select-none">
            <div className="text-[11px] text-neutral-400 mb-3 flex items-center space-x-1 font-semibold">
              <Move size={12} className="animate-pulse text-amber-400" />
              <span>Click & Drag image inside frame to re-center</span>
            </div>

            {/* Frame Box */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              className={`relative overflow-hidden bg-neutral-800 rounded-2xl border-2 border-dashed border-amber-400/80 shadow-2xl cursor-grab active:cursor-grabbing transition-all flex items-center justify-center ${
                ratio === 'portrait' ? 'w-64 h-80' : 'w-72 h-72'
              }`}
            >
              {/* Overlay grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 border border-white/10">
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div className="" />
              </div>

              {/* Transformed Image */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`
                }}
              >
                <img
                  src={imageUrl}
                  alt="Crop preview"
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-6 bg-white space-y-5">
            {/* Aspect Ratio & Quick Tools */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 bg-beige-100 p-1 rounded-xl border border-beige-300">
                <button
                  type="button"
                  onClick={() => setRatio('square')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    ratio === 'square'
                      ? 'bg-[#5d4037] text-white shadow-xs'
                      : 'text-beige-900/70 hover:text-beige-900'
                  }`}
                >
                  <Square size={13} />
                  <span>Square (1:1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatio('portrait')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    ratio === 'portrait'
                      ? 'bg-[#5d4037] text-white shadow-xs'
                      : 'text-beige-900/70 hover:text-beige-900'
                  }`}
                >
                  <RectangleVertical size={13} />
                  <span>Portrait (3:4)</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-2 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-xl border border-beige-300 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw size={15} />
                  <span className="hidden sm:inline">Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 bg-beige-100 hover:bg-beige-200 text-beige-900/70 hover:text-beige-900 rounded-xl border border-beige-300 transition-colors cursor-pointer"
                  title="Reset Adjustments"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-beige-900">
                <span className="flex items-center space-x-1">
                  <ZoomIn size={14} className="text-[#5d4037]" />
                  <span>Zoom Scale:</span>
                </span>
                <span className="text-[#5d4037] bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                  className="p-1.5 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-lg border border-beige-300 cursor-pointer"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#5d4037] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                  className="p-1.5 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-lg border border-beige-300 cursor-pointer"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-beige-100 hover:bg-beige-200 text-beige-900 text-xs font-bold rounded-xl border border-beige-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-[#5d4037] hover:bg-[#4a332c] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
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
