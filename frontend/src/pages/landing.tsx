import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-dark-800 border-dark-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">GrindBoard</h1>
              <p className="text-dark-300 text-sm">
                Sistema completo de gerenciamento de treinos de powerlifting
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-left space-y-2">
                <h2 className="text-lg font-semibold">Para Treinadores</h2>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• Calendário completo de treinos</li>
                  <li>• Sistema de convites para alunos</li>
                  <li>• Acompanhamento de progresso</li>
                  <li>• Check-ins semanais automatizados</li>
                </ul>
              </div>

              <div className="text-left space-y-2">
                <h2 className="text-lg font-semibold">Para Alunos</h2>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• Execução de treinos com RPE</li>
                  <li>• Estimador de 1RM integrado</li>
                  <li>• Histórico de performance</li>
                  <li>• Interface mobile otimizada</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="w-full bg-primary text-dark-900 hover:bg-gold-400 font-semibold"
            >
              Entrar com Replit
            </Button>

            <p className="text-xs text-dark-400 text-center">
              Acesso exclusivo para treinadores credenciados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
