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
  RefreshCw
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
    <div className="space-y-4">
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
        <Label>Itens ({currentContent.items?.length || 0})</Label>
        {currentContent.items?.map((item: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{index + 1}</Badge>
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Ícone</Label>
                  <Input
                    value={item.icon || ""}
                    onChange={(e) => handleNestedChange("items", index, "icon", e.target.value)}
                    placeholder="Nome do ícone"
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
        <Label>Passos ({currentContent.steps?.length || 0})</Label>
        {currentContent.steps?.map((step: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{step.number}</Badge>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Título</Label>
                <Input
                  value={step.title || ""}
                  onChange={(e) => handleNestedChange("steps", index, "title", e.target.value)}
                  className="h-8 text-sm"
                />
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
        <Label>Planos ({currentContent.plans?.length || 0})</Label>
        {currentContent.plans?.map((plan: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={plan.highlighted ? "default" : "outline"}>{plan.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Destacar</Label>
                  <Switch
                    checked={plan.highlighted || false}
                    onCheckedChange={(checked) => handleNestedChange("plans", index, "highlighted", checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
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
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Recursos (um por linha)</Label>
                <Textarea
                  value={(plan.features || []).join("\n")}
                  onChange={(e) => handleNestedChange("plans", index, "features", e.target.value.split("\n"))}
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
        <Label>Perguntas ({currentContent.items?.length || 0})</Label>
        {currentContent.items?.map((item: any, index: number) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="space-y-3">
              <Badge variant="outline" className="mb-2">{index + 1}</Badge>
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
              Edite os textos e conteúdos da página inicial do sistema
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
