import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Download, Trash2 } from 'lucide-react';
import { Visitor } from '@/types/visitor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface VisitorListProps {
  visitors: Visitor[];
  onDeleteVisitor: (id: string) => void;
  onClearAllVisitors: () => void;
}

export const VisitorList: React.FC<VisitorListProps> = ({ visitors, onDeleteVisitor, onClearAllVisitors }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = visitors.filter(visitor =>
    visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phone.includes(searchTerm)
  );

  const downloadExcel = () => {
    if (visitors.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não há visitantes para exportar.",
        variant: "destructive",
      });
      return;
    }

    const exportData = visitors.map(visitor => ({
      'Data do Culto': visitor.serviceDate,
      'Horário': visitor.serviceTime ? `${visitor.serviceTime}h` : 'Não informado',
      'Nome Completo': visitor.fullName,
      'Telefone': visitor.phone,
      'Cidade': visitor.city,
      'Observações': visitor.observations || 'Sem observações',
      'Data de Cadastro': format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitantes');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `visitantes_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    saveAs(data, fileName);

    toast({
      title: "Planilha baixada!",
      description: `Arquivo ${fileName} baixado com sucesso.`,
    });

    // Limpar a lista após o download
    onClearAllVisitors();
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

  const handleDeleteAll = () => {
    if (window.confirm(`Deseja realmente excluir todos os ${visitors.length} visitantes? Esta ação não pode ser desfeita.`)) {
      visitors.forEach(visitor => onDeleteVisitor(visitor.id));
      toast({
        title: "Todos os visitantes excluídos",
        description: `${visitors.length} visitantes foram removidos da lista.`,
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
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={downloadExcel}
              size="sm"
              className="px-4 gap-2"
              disabled={visitors.length === 0}
            >
              <Download className="h-4 w-4" />
              Download da planilha
            </Button>
            <p className="text-xs text-muted-foreground text-right">
              Faça o download da lista após o término dos cadastros de visitantes
            </p>
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

        {/* Delete All Button */}
        {visitors.length > 1 && (
          <div className="pt-4 border-t">
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remover Todos os Visitantes ({visitors.length})
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};