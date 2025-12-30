import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Percent,
  Copy
} from "lucide-react";

export interface Coupon {
  code: string;
  discount: number;
  active: boolean;
  usageCount: number;
  maxUsage: number | null;
  expiresAt: string | null;
}

const COUPONS_STORAGE_KEY = "smart_room_coupons";

export function getCoupons(): Coupon[] {
  try {
    const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    console.error("Error loading coupons");
  }
  return [];
}

export function saveCoupons(coupons: Coupon[]): void {
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
}

export function validateCoupon(code: string): { valid: boolean; discount: number; message: string } {
  const coupons = getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
  if (!coupon) {
    return { valid: false, discount: 0, message: "Cupom não encontrado" };
  }
  
  if (!coupon.active) {
    return { valid: false, discount: 0, message: "Cupom desativado" };
  }
  
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    return { valid: false, discount: 0, message: "Limite de uso excedido" };
  }
  
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, message: "Cupom expirado" };
  }
  
  return { valid: true, discount: coupon.discount, message: `Desconto de ${coupon.discount}% aplicado!` };
}

export function useCoupon(code: string): void {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index !== -1) {
    coupons[index].usageCount += 1;
    saveCoupons(coupons);
  }
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newMaxUsage, setNewMaxUsage] = useState("");

  useEffect(() => {
    setCoupons(getCoupons());
  }, []);

  const handleAddCoupon = () => {
    if (!newCode.trim() || !newDiscount) {
      toast({
        title: "Erro",
        description: "Preencha o código e o desconto",
        variant: "destructive",
      });
      return;
    }

    const code = newCode.toUpperCase().trim();
    if (coupons.some(c => c.code === code)) {
      toast({
        title: "Erro",
        description: "Este código já existe",
        variant: "destructive",
      });
      return;
    }

    const discount = parseFloat(newDiscount);
    if (discount <= 0 || discount > 100) {
      toast({
        title: "Erro",
        description: "Desconto deve ser entre 1% e 100%",
        variant: "destructive",
      });
      return;
    }

    const newCoupon: Coupon = {
      code,
      discount,
      active: true,
      usageCount: 0,
      maxUsage: newMaxUsage ? parseInt(newMaxUsage) : null,
      expiresAt: null,
    };

    const updated = [...coupons, newCoupon];
    setCoupons(updated);
    saveCoupons(updated);

    setNewCode("");
    setNewDiscount("");
    setNewMaxUsage("");

    toast({
      title: "Cupom Criado",
      description: `Código ${code} com ${discount}% de desconto`,
    });
  };

  const handleToggleCoupon = (code: string) => {
    const updated = coupons.map(c => 
      c.code === code ? { ...c, active: !c.active } : c
    );
    setCoupons(updated);
    saveCoupons(updated);
  };

  const handleDeleteCoupon = (code: string) => {
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    saveCoupons(updated);
    toast({
      title: "Cupom Removido",
      description: `Código ${code} foi excluído`,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código Copiado",
      description: code,
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Ticket className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Gestão de Cupons</h3>
      </div>

      {/* Add Coupon Form */}
      <div className="grid gap-4 md:grid-cols-4 mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="space-y-2">
          <Label>Código</Label>
          <Input
            placeholder="VIP20"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label>Desconto (%)</Label>
          <Input
            type="number"
            placeholder="20"
            min="1"
            max="100"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Limite de Uso</Label>
          <Input
            type="number"
            placeholder="Ilimitado"
            min="1"
            value={newMaxUsage}
            onChange={(e) => setNewMaxUsage(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleAddCoupon} className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Coupons List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum cupom cadastrado</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.code}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                coupon.active 
                  ? "bg-card border-border" 
                  : "bg-muted/30 border-muted opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="font-mono text-lg font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  {coupon.code}
                  <Copy className="w-3 h-3 opacity-50" />
                </button>
                <div className="flex items-center gap-1 text-success">
                  <Percent className="w-4 h-4" />
                  <span className="font-semibold">{coupon.discount}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {coupon.usageCount} uso{coupon.usageCount !== 1 ? "s" : ""}
                  {coupon.maxUsage && ` / ${coupon.maxUsage}`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {coupon.active ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={coupon.active}
                    onCheckedChange={() => handleToggleCoupon(coupon.code)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCoupon(coupon.code)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
