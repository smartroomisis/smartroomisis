import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStorage } from "@/hooks/useStorage";
import { ROOM_ID } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoUpload } from "@/components/PhotoUpload";
import { toast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Send,
  Loader2,
  CheckCircle
} from "lucide-react";

const problemCategories = [
  { value: "equipamento", label: "Equipamento Danificado" },
  { value: "limpeza", label: "Problema de Limpeza" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "seguranca", label: "Segurança" },
  { value: "outros", label: "Outros" },
];

export default function StaffProblems() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !title.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending problem report
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSuccess(true);
    toast({
      title: "Problema reportado!",
      description: "A administração será notificada imediatamente.",
    });
    
    setTimeout(() => {
      setIsSuccess(false);
      setCategory("");
      setTitle("");
      setDescription("");
      setPhotos([]);
    }, 3000);
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-admin">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-warning" />
            Relatar Problema
          </h2>
          <p className="text-muted-foreground text-sm">
            Registre problemas encontrados na sala
          </p>
        </div>

        <GlassCard className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {problemCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Título do Problema *</Label>
              <Input
                id="title"
                placeholder="Ex: Ar condicionado não funciona"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema em detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Fotos (opcional)</Label>
              <div className="mt-1">
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={3}
                  required={false}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Problema Reportado!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Relatório
                </>
              )}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
