import React, { useState, useEffect } from 'react';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorList } from '@/components/VisitorList';
import { Visitor, VisitorFormData } from '@/types/visitor';
import churchHeader from '@/assets/church-header.jpg';
import { Church } from 'lucide-react';

const Index = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // Load visitors from localStorage on component mount
  useEffect(() => {
    const savedVisitors = localStorage.getItem('church-visitors');
    if (savedVisitors) {
      setVisitors(JSON.parse(savedVisitors));
    }
  }, []);

  // Save visitors to localStorage whenever visitors state changes
  useEffect(() => {
    localStorage.setItem('church-visitors', JSON.stringify(visitors));
  }, [visitors]);

  const handleAddVisitor = (formData: VisitorFormData) => {
    const newVisitor: Visitor = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setVisitors(prev => [newVisitor, ...prev]);
  };

  const handleDeleteVisitor = (id: string) => {
    setVisitors(prev => prev.filter(visitor => visitor.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <img 
          src={churchHeader} 
          alt="Igreja" 
          className="w-full h-48 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 mb-2">
            <Church className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Cadastro de Visitantes
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sistema simples para registrar visitantes da igreja
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Visitor Form */}
          <VisitorForm onSubmit={handleAddVisitor} />
          
          {/* Visitor List */}
          <VisitorList 
            visitors={visitors} 
            onDeleteVisitor={handleDeleteVisitor}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de Cadastro de Visitantes da Igreja
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Desenvolvido para facilitar o acolhimento dos visitantes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
