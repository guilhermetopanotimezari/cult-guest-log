import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Download, MessageCircle, Trash2 } from 'lucide-react';
import { Visitor } from '@/types/visitor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface VisitorListProps {
  visitors: Visitor[];
  onDeleteVisitor: (id: string) => void;
}

export const VisitorList: React.FC<VisitorListProps> = ({ visitors, onDeleteVisitor }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const filteredVisitors = visitors.filter(visitor =>
    visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phone.includes(searchTerm)
  );

  const exportToExcel = () => {
    if (visitors.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não há visitantes para exportar.",
        variant: "destructive",
      });
      return;
    }

    const exportData = visitors.map(visitor => {
      const period = visitor.serviceTime ? `${visitor.serviceTime}h` : 'Não informado';
      return {
        'Dados': `Culto ${period}: ${visitor.serviceDate}\nNome: ${visitor.fullName}\nFone: ${visitor.phone}\nCidade: ${visitor.city}\nObs: ${visitor.observations || 'Sem observações'}\n`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitantes');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `visitantes_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    saveAs(data, fileName);

    toast({
      title: "Planilha exportada!",
      description: `Arquivo ${fileName} baixado com sucesso.`,
    });
  };

  const exportToCSV = () => {
    if (visitors.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não há visitantes para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Dados dos Visitantes'];
    const csvData = visitors.map(visitor => {
      const period = visitor.serviceTime ? `${visitor.serviceTime}h` : 'Não informado';
      return [`Culto ${period}: ${visitor.serviceDate}\nNome: ${visitor.fullName}\nFone: ${visitor.phone}\nCidade: ${visitor.city}\nObs: ${visitor.observations || 'Sem observações'}`];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `visitantes_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
    saveAs(blob, fileName);

    toast({
      title: "CSV exportado!",
      description: `Arquivo ${fileName} baixado com sucesso.`,
    });
  };

  const sendToWhatsApp = () => {
    if (!whatsappNumber) {
      toast({
        title: "Número necessário",
        description: "Digite um número do WhatsApp para enviar.",
        variant: "destructive",
      });
      return;
    }

    if (visitors.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não há visitantes para enviar.",
        variant: "destructive",
      });
      return;
    }

    const message = `*Lista de Visitantes da Igreja*\n\n` +
      visitors.map((visitor, index) => {
        const period = visitor.serviceTime ? `${visitor.serviceTime}h` : 'Não informado';
        return `*Culto ${period}: ${visitor.serviceDate}\n` +
               `Nome: ${visitor.fullName}\n` +
               `Fone: ${visitor.phone}\n` +
               `Cidade: ${visitor.city}\n` +
               `Obs: ${visitor.observations || 'Sem observações'}\n`;
      }).join('\n') +
      `\nTotal: ${visitors.length} visitante(s)\n` +
      `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp aberto!",
      description: "A mensagem foi preparada para envio.",
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o visitante ${name}?`)) {
      onDeleteVisitor(id);
      toast({
        title: "Visitante excluído",
        description: `${name} foi removido da lista.`,
      });
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="gradient-card">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            Lista de Visitantes ({visitors.length})
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              Enviar para o WhatsApp:
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="(11) 99999-9999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="h-9 text-sm min-w-[140px]"
              />
              <Button 
                onClick={sendToWhatsApp}
                size="sm"
                className="px-3 bg-green-600 hover:bg-green-700 shrink-0"
                disabled={visitors.length === 0}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar visitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>


        {/* Visitors List */}
        <div className="space-y-3">
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {visitors.length === 0 
                ? "Nenhum visitante cadastrado ainda." 
                : "Nenhum visitante encontrado com essa busca."
              }
            </div>
          ) : (
            filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="border rounded-lg p-4 bg-card shadow-soft hover:shadow-medium transition-smooth">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{visitor.fullName}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{visitor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏙️</span>
                        <span>{visitor.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{visitor.serviceDate} às {visitor.serviceTime}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs">
                        Cadastrado em {format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(visitor.id, visitor.fullName)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};