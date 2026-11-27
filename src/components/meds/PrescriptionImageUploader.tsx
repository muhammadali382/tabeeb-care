"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { extractTextFromImage } from "@/lib/ocr/client_ocr";

interface PrescriptionImageUploaderProps {
  onExtractedText: (text: string) => void;
}

export function PrescriptionImageUploader({
  onExtractedText,
}: PrescriptionImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanDone, setScanDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrescriptionOcr = async (source: File | string, displayUrl: string) => {
    setError(null);
    setScanDone(false);
    setPreviewUrl(displayUrl);
    setIsScanning(true);
    setProgress(8);

    try {
      const res = await extractTextFromImage(source, (pct) => setProgress(pct));
      if (!res.text) {
        setError(
          "Could not read clear text from this image. Try a clearer printed photo or type below."
        );
      } else {
        onExtractedText(res.text);
        setScanDone(true);
      }
    } catch (err) {
      console.error("Prescription OCR error:", err);
      setError("Image OCR failed. Please try another PNG/JPG photo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    void runPrescriptionOcr(file, url);
  };

  return (
    <div className="p-3.5 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
          <Camera className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Scan Printed Prescription Photo (OCR)</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => void runPrescriptionOcr("/demo-prescription.png", "/demo-prescription.png")}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Sample Rx</span>
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
              Extracting medicines with local OCR...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {previewUrl && !isScanning && (
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
          <img
            src={previewUrl}
            alt="Prescription preview"
            className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
          />
          <div className="text-xs flex-1 min-w-0">
            {scanDone ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Text extracted into the box below! Review and click Analyze.</span>
              </span>
            ) : error ? (
              <span className="text-red-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
