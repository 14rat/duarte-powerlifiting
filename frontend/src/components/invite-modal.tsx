import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, Copy, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setInviteLink(data.magicLink);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Convite enviado!",
        description: `Email enviado para ${email} com credenciais e link de acesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    sendInviteMutation.mutate(email);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setInviteLink("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-black to-gray-900 text-white border-yellow-400/30">
        <DialogHeader className="border-b border-yellow-400/20 pb-4">
          <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center">
            <UserPlus className="w-6 h-6 mr-2" />
            Convidar Aluno
          </DialogTitle>
          <p className="text-gray-400">Envie um convite para um novo aluno se juntar ao seu grupo</p>
        </DialogHeader>

        <div className="space-y-6">
          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-yellow-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email do Aluno
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@exemplo.com"
                  className="bg-gray-800 border-gray-600 text-white focus:border-yellow-400"
                  disabled={sendInviteMutation.isPending}
                />
                <p className="text-xs text-gray-500">
                  O aluno receberá um link para se cadastrar como seu estudante
                </p>
              </div>

              <Button
                type="submit"
                disabled={sendInviteMutation.isPending || !email}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold py-3"
              >
                {sendInviteMutation.isPending ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-spin" />
                    Gerando convite...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gerar Link de Convite
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Card className="bg-green-900/20 border border-green-400/30">
                <CardContent className="pt-4">
                  <div className="flex items-center text-green-400 mb-3">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Convite gerado com sucesso!</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Email enviado para <strong>{email}</strong> com credenciais automáticas e link mágico de acesso. O aluno pode clicar diretamente no email para entrar na plataforma.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                      <p className="text-xs text-gray-400 mb-2">Link Mágico (também enviado por email):</p>
                      <p className="text-sm text-white break-all font-mono">
                        {inviteLink}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button
                        onClick={() => window.open(`mailto:${email}?subject=Seu acesso ao GrindBoard&body=Seu link de acesso: ${inviteLink}`, '_blank')}
                        variant="outline"
                        className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Reenviar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border border-blue-400/30">
                <CardContent className="pt-4">
                  <div className="flex items-start text-blue-400">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Importante:</p>
                      <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                        <li>Email enviado com credenciais automáticas</li>
                        <li>Link mágico para login direto</li>
                        <li>Conta criada automaticamente</li>
                        <li>Link expira em 7 dias</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {inviteLink ? "Concluído" : "Cancelar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}