import { useState, useEffect, useCallback } from "react";
import { DoorOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselItem {
  image_url?: string;
  title: string;
  description: string;
}

interface HeroCarouselProps {
  items: CarouselItem[];
}

export const HeroCarousel = ({ items }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, items.length]);

  if (!items || items.length === 0) {
    return (
      <div className="aspect-video max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(220,25%,10%)] to-[hsl(225,25%,8%)] border border-[hsl(210,20%,18%)] overflow-hidden shadow-2xl shadow-black/40 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10 mb-6 animate-float border border-[hsl(188,85%,50%)]/30 shadow-lg shadow-[hsl(188,85%,50%)]/20">
            <DoorOpen className="w-12 h-12 text-[hsl(188,85%,55%)]" />
          </div>
          <p className="text-2xl font-semibold mb-2 text-white">Sala Inteligente</p>
          <p className="text-[hsl(210,15%,55%)]">Controle total na palma da mão</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div 
      className="relative aspect-video max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(220,25%,10%)] to-[hsl(225,25%,8%)] border border-[hsl(210,20%,18%)] overflow-hidden shadow-2xl shadow-black/40"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(188,85%,50%,0.05),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnptLTQtMnYtMmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

      {/* Image or placeholder */}
      {currentItem.image_url ? (
        <img 
          src={currentItem.image_url} 
          alt={currentItem.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
      ) : null}

      {/* Content overlay */}
      <div className={cn(
        "relative h-full flex items-center justify-center",
        currentItem.image_url && "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      )}>
        <div className="text-center p-8">
          {!currentItem.image_url && (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10 mb-6 animate-float border border-[hsl(188,85%,50%)]/30 shadow-lg shadow-[hsl(188,85%,50%)]/20">
              <DoorOpen className="w-12 h-12 text-[hsl(188,85%,55%)]" />
            </div>
          )}
          <p className="text-2xl font-semibold mb-2 text-white">{currentItem.title}</p>
          <p className="text-[hsl(210,15%,55%)]">{currentItem.description}</p>
        </div>
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-6 bg-[hsl(188,85%,50%)]" 
                  : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
