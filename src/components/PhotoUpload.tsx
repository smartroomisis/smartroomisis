import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  required?: boolean;
}

export function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5,
  required = false 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    const newPhotos: string[] = [];
    
    for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      
      // Convert to base64 for demo - in production, upload to storage
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      newPhotos.push(base64);
    }

    onPhotosChange([...photos, ...newPhotos]);
    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-primary/5",
            required && photos.length === 0 ? "border-warning/50" : "border-border"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          ) : (
            <>
              <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {photos.length === 0 
                  ? "Toque para adicionar fotos" 
                  : `Adicionar mais fotos (${photos.length}/${maxPhotos})`
                }
              </p>
              {required && photos.length === 0 && (
                <p className="text-xs text-warning mt-1">* Obrigatório para liberar sala</p>
              )}
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImageIcon className="w-4 h-4" />
        <span>{photos.length} de {maxPhotos} fotos</span>
      </div>
    </div>
  );
}
