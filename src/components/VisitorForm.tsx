import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { VisitorFormData } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';

interface VisitorFormProps {
  onSubmit: (data: VisitorFormData) => void;
}

export const VisitorForm: React.FC<VisitorFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VisitorFormData>({
    fullName: '',
    phone: '',
    city: '',
    serviceDate: '',
    serviceTime: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number with mask
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      const formattedPhone = phoneValue.replace(
        /(\d{2})(\d{4,5})(\d{4})/,
        '($1) $2-$3'
      );
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        serviceDate: format(date, 'dd/MM/yyyy')
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.city || !formData.serviceDate || !formData.serviceTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      fullName: '',
      phone: '',
      city: '',
      serviceDate: '',
      serviceTime: '',
    });
    setSelectedDate(undefined);

    toast({
      title: "Visitante cadastrado!",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="gradient-card">
        <CardTitle className="flex items-center gap-2 text-primary">
          <UserPlus className="h-5 w-5" />
          Cadastrar Visitante
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Digite o nome completo do visitante"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone (com DDD) *
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Cidade *
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Digite a cidade do visitante"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data do Culto *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate 
                      ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecione a data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceTime" className="text-sm font-medium">
                Horário do Culto *
              </Label>
              <Input
                id="serviceTime"
                name="serviceTime"
                type="time"
                value={formData.serviceTime}
                onChange={handleInputChange}
                className="h-12 text-base"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="gradient"
            size="xl"
            className="w-full"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Cadastrar Visitante
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};