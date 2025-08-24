import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Zap, Star, Trophy, Target, Users, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Header Mobile */}
        <div className="lg:hidden p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Logo size="sm" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-yellow-400">Duarte Powerlifting</h1>
              <p className="text-xs text-slate-400">Elite Training System</p>
            </div>
          </div>
        </div>

        {/* Left side - Hero Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-400/5"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-yellow-400/15 rounded-full blur-2xl"></div>
          
          {/* Header Desktop */}
          <div className="absolute top-6 left-6 right-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Logo size="sm" />
                <div className="text-left">
                  <h1 className="text-xl font-bold text-yellow-400">Duarte Powerlifting</h1>
                  <p className="text-xs text-slate-400">Elite Training System</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-slate-300">Plataforma Premium</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <div className="mb-8">
              <Trophy className="h-16 w-16 text-yellow-400 mb-6" />
              <h2 className="text-5xl font-bold text-white mb-4">
                Alcance seu
                <span className="text-yellow-400 block">Potencial Máximo</span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Sistema completo de treinamento de powerlifting com acompanhamento profissional, 
                análise de performance e resultados comprovados.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-400/20 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Treinos Personalizados</h3>
                  <p className="text-slate-400">Programação específica para seus objetivos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-400/20 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Acompanhamento Profissional</h3>
                  <p className="text-slate-400">Suporte contínuo do seu treinador</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-400/20 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Tecnologia Avançada</h3>
                  <p className="text-slate-400">Cálculos automáticos de 1RM e progressão</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 rounded-lg border border-yellow-400/20">
              <div className="text-center">
                <p className="text-sm text-slate-300 mb-2">Junte-se a mais de</p>
                <p className="text-3xl font-bold text-yellow-400">500+ atletas</p>
                <p className="text-sm text-slate-400">que já transformaram seus resultados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-slate-900/50 lg:bg-transparent">
          <div className="w-full max-w-md space-y-6">

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-600 p-1 rounded-xl backdrop-blur-sm mb-6 h-12">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:scale-105 text-slate-300 rounded-lg transition-all duration-500 ease-in-out font-medium flex items-center justify-center h-full"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:scale-105 text-slate-300 rounded-lg transition-all duration-500 ease-in-out font-medium flex items-center justify-center h-full"
                >
                  Registrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-600/50 shadow-2xl rounded-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-white text-xl sm:text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-slate-400 text-sm text-center">
                      Entre com suas credenciais para acessar sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-200 font-medium text-sm">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 transition-all text-sm"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-slate-200 font-medium text-sm">Senha</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 pr-10 transition-all text-sm"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-6"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            <span>Entrando...</span>
                          </div>
                        ) : (
                          "Entrar na Plataforma"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-600/50 shadow-2xl rounded-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-white text-xl sm:text-2xl font-bold text-center">Crie sua conta</CardTitle>
                    <CardDescription className="text-slate-400 text-sm text-center">
                      Comece sua jornada no Duarte Powerlifting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-200 font-medium text-sm">Nome</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 transition-all text-sm"
                            placeholder="Seu nome"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-200 font-medium text-sm">Sobrenome</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 transition-all text-sm"
                            placeholder="Seu sobrenome"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-slate-200 font-medium text-sm">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 transition-all text-sm"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-slate-200 font-medium text-sm">Senha</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg h-11 px-3 pr-10 transition-all text-sm"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                        <h4 className="font-medium text-white mb-2 text-sm">Tipos de Conta</h4>
                        <div className="text-xs text-slate-300 space-y-1">
                          <p>• <strong>Alunos:</strong> Registre-se para receber treinos personalizados</p>
                          <p>• <strong>Treinadores:</strong> Entre em contato para credenciais especiais</p>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-6"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            <span>Criando conta...</span>
                          </div>
                        ) : (
                          "Criar Conta Grátis"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}