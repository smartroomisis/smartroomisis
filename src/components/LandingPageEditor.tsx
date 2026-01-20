import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useLandingPageConfig, 
  useUpdateLandingPageSection,
  useToggleLandingPageSection 
} from "@/hooks/useLandingPageConfig";
import { 
  Save, 
  Eye, 
  EyeOff, 
  Layout, 
  Star, 
  HelpCircle, 
  Megaphone,
  ListOrdered,
  DollarSign,
  RefreshCw,
  Plus,
  Trash2,
  Image,
  GripVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Layout className="w-4 h-4" />,
  features: <Star className="w-4 h-4" />,
  how_it_works: <ListOrdered className="w-4 h-4" />,
  pricing: <DollarSign className="w-4 h-4" />,
  faq: <HelpCircle className="w-4 h-4" />,
  cta: <Megaphone className="w-4 h-4" />,
};

const sectionLabels: Record<string, string> = {
  hero: "Hero (Principal)",
  features: "Recursos",
  how_it_works: "Como Funciona",
  pricing: "Planos e Preços",
  faq: "FAQ",
  cta: "Chamada para Ação",
};

export const LandingPageEditor = () => {
  const { data: sections, isLoading, refetch } = useLandingPageConfig();
  const updateSection = useUpdateLandingPageSection();
  const toggleSection = useToggleLandingPageSection();
  const [activeSection, setActiveSection] = useState("hero");
  const [editedContent, setEditedContent] = useState<Record<string, any>>({});

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentSection = sections?.find((s) => s.section_key === activeSection);
  const currentContent = editedContent[activeSection] || currentSection?.content || {};

  const handleContentChange = (key: string, value: any) => {
    setEditedContent((prev) => ({
      ...prev,
      [activeSection]: {
        ...(prev[activeSection] || currentSection?.content || {}),
        [key]: value,
      },
    }));
  };

  const handleNestedChange = (arrayKey: string, index: number, field: string, value: any) => {
    const currentArray = currentContent[arrayKey] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    handleContentChange(arrayKey, updatedArray);
  };

  const handleAddItem = (arrayKey: string, template: Record<string, any>) => {
    const currentArray = currentContent[arrayKey] || [];
    handleContentChange(arrayKey, [...currentArray, template]);
  };

  const handleRemoveItem = (arrayKey: string, index: number) => {
    const currentArray = currentContent[arrayKey] || [];
    handleContentChange(arrayKey, currentArray.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    if (editedContent[activeSection]) {
      updateSection.mutate({
        sectionKey: activeSection,
        content: editedContent[activeSection],
      });
    }
  };

  const handleToggleVisibility = (sectionKey: string, isActive: boolean) => {
    toggleSection.mutate({ sectionKey, isActive });
  };

  const renderHeroEditor = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Texto do Badge</Label>
        <Input
          value={currentContent.badge_text || ""}
          onChange={(e) => handleContentChange("badge_text", e.target.value)}
          placeholder="Ex: 100% Autônomo • Sem recepção"
        />
      </div>
      <div className="space-y-2">
        <Label>Título Principal</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Título do Hero"
        />
      </div>
      <div className="space-y-2">
        <Label>Subtítulo</Label>
        <Textarea
          value={currentContent.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          placeholder="Descrição do Hero"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Botão Principal</Label>
          <Input
            value={currentContent.cta_primary || ""}
            onChange={(e) => handleContentChange("cta_primary", e.target.value)}
            placeholder="Texto do botão"
          />
        </div>
        <div className="space-y-2">
          <Label>Botão Secundário</Label>
          <Input
            value={currentContent.cta_secondary || ""}
            onChange={(e) => handleContentChange("cta_secondary", e.target.value)}
            placeholder="Texto do botão"
          />
        </div>
      </div>

      {/* Carousel Items */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Image className="w-4 h-4" />
            Carrossel de Imagens ({currentContent.carousel_items?.length || 0})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem("carousel_items", {
              image_url: "",
              title: "Novo Slide",
              description: "Descrição do slide"
            })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Slide
          </Button>
        </div>
        {currentContent.carousel_items?.map((item: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">Slide {index + 1}</Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveItem("carousel_items", index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL da Imagem (opcional)</Label>
                <Input
                  value={item.image_url || ""}
                  onChange={(e) => handleNestedChange("carousel_items", index, "image_url", e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={item.title || ""}
                    onChange={(e) => handleNestedChange("carousel_items", index, "title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    value={item.description || ""}
                    onChange={(e) => handleNestedChange("carousel_items", index, "description", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFeaturesEditor = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Título da Seção</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subtítulo</Label>
        <Input
          value={currentContent.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Recursos ({currentContent.items?.length || 0})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem("items", {
              icon: "Star",
              title: "Novo Recurso",
              description: "Descrição do recurso"
            })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {currentContent.items?.map((item: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveItem("items", index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Ícone (Lucide)</Label>
                  <Input
                    value={item.icon || ""}
                    onChange={(e) => handleNestedChange("items", index, "icon", e.target.value)}
                    placeholder="Lightbulb, Wifi, Coffee..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={item.title || ""}
                    onChange={(e) => handleNestedChange("items", index, "title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={item.description || ""}
                  onChange={(e) => handleNestedChange("items", index, "description", e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHowItWorksEditor = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Título da Seção</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subtítulo</Label>
        <Input
          value={currentContent.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Passos ({currentContent.steps?.length || 0})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem("steps", {
              number: (currentContent.steps?.length || 0) + 1,
              title: "Novo Passo",
              description: "Descrição do passo",
              icon: "Zap"
            })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {currentContent.steps?.map((step: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge>{step.number || index + 1}</Badge>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveItem("steps", index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Número</Label>
                  <Input
                    type="number"
                    value={step.number || index + 1}
                    onChange={(e) => handleNestedChange("steps", index, "number", parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ícone</Label>
                  <Input
                    value={step.icon || ""}
                    onChange={(e) => handleNestedChange("steps", index, "icon", e.target.value)}
                    placeholder="Calendar, KeyRound..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={step.title || ""}
                    onChange={(e) => handleNestedChange("steps", index, "title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={step.description || ""}
                  onChange={(e) => handleNestedChange("steps", index, "description", e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPricingEditor = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Título da Seção</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subtítulo</Label>
        <Input
          value={currentContent.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Planos ({currentContent.plans?.length || 0})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem("plans", {
              name: "Novo Plano",
              price: "R$ 0",
              period: "/mês",
              features: ["Recurso 1", "Recurso 2"],
              highlighted: false,
              cta: "Escolher"
            })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {currentContent.plans?.map((plan: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant={plan.highlighted ? "default" : "outline"}>{plan.name}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Destacar</Label>
                    <Switch
                      checked={plan.highlighted || false}
                      onCheckedChange={(checked) => handleNestedChange("plans", index, "highlighted", checked)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem("plans", index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={plan.name || ""}
                    onChange={(e) => handleNestedChange("plans", index, "name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Preço</Label>
                  <Input
                    value={plan.price || ""}
                    onChange={(e) => handleNestedChange("plans", index, "price", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Período</Label>
                  <Input
                    value={plan.period || ""}
                    onChange={(e) => handleNestedChange("plans", index, "period", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CTA</Label>
                  <Input
                    value={plan.cta || ""}
                    onChange={(e) => handleNestedChange("plans", index, "cta", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Recursos (um por linha)</Label>
                <Textarea
                  value={(plan.features || []).join("\n")}
                  onChange={(e) => handleNestedChange("plans", index, "features", e.target.value.split("\n").filter(Boolean))}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFaqEditor = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Título da Seção</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Perguntas ({currentContent.items?.length || 0})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddItem("items", {
              question: "Nova pergunta?",
              answer: "Resposta da pergunta."
            })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {currentContent.items?.map((item: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveItem("items", index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pergunta</Label>
                <Input
                  value={item.question || ""}
                  onChange={(e) => handleNestedChange("items", index, "question", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Resposta</Label>
                <Textarea
                  value={item.answer || ""}
                  onChange={(e) => handleNestedChange("items", index, "answer", e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCtaEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          value={currentContent.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subtítulo</Label>
        <Textarea
          value={currentContent.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Texto do Botão</Label>
          <Input
            value={currentContent.button_text || ""}
            onChange={(e) => handleContentChange("button_text", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Link do Botão</Label>
          <Input
            value={currentContent.button_link || ""}
            onChange={(e) => handleContentChange("button_link", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (activeSection) {
      case "hero":
        return renderHeroEditor();
      case "features":
        return renderFeaturesEditor();
      case "how_it_works":
        return renderHowItWorksEditor();
      case "pricing":
        return renderPricingEditor();
      case "faq":
        return renderFaqEditor();
      case "cta":
        return renderCtaEditor();
      default:
        return <p className="text-muted-foreground">Selecione uma seção para editar</p>;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Editor da Landing Page
            </CardTitle>
            <CardDescription>
              Edite os textos, imagens e conteúdos da página inicial
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {sections?.map((section) => (
                <TabsTrigger
                  key={section.section_key}
                  value={section.section_key}
                  className="flex items-center gap-2"
                >
                  {sectionIcons[section.section_key]}
                  <span className="hidden sm:inline">{sectionLabels[section.section_key]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {sections?.map((section) => (
            <TabsContent key={section.section_key} value={section.section_key} className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {section.is_active ? (
                      <Eye className="w-4 h-4 text-success" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {section.is_active ? "Seção visível" : "Seção oculta"}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={section.is_active}
                  onCheckedChange={(checked) => handleToggleVisibility(section.section_key, checked)}
                />
              </div>

              {renderEditor()}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={updateSection.isPending || !editedContent[activeSection]}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSection.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
