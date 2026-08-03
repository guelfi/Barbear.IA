import { useEffect, useState } from 'react';
import { Calendar, Gift, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { appointmentsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { getLoyaltyPlanMock } from '../../data/loyaltyPlanMock';
import { formatDate } from '../../lib/formatDate';

type PastAppointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  price: number;
  service?: { name?: string } | string | null;
  barber?: { name?: string } | null;
};

export function ClientHome() {
  const { user } = useAuth();
  const loyalty = getLoyaltyPlanMock(user?.email);
  const [past, setPast] = useState<PastAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const all = await appointmentsAPI.getAll();
        const now = Date.now();
        const done = all
          .filter((a) => {
            const status = String(a.status).toLowerCase();
            const starts = a.date && a.time
              ? new Date(`${a.date}T${a.time}:00`).getTime()
              : 0;
            return status === 'completed' || (starts > 0 && starts < now && status !== 'cancelled');
          })
          .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
          .slice(0, 12);
        setPast(done);
      } catch {
        setPast([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Olá, {user?.name?.split(' ')[0] || 'cliente'}</h2>
        <p className="text-sm text-muted-foreground">
          Seus agendamentos realizados e plano de fidelidade.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos realizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && past.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum atendimento concluído ainda.</p>
          )}
          {past.map((a) => {
            const serviceName =
              typeof a.service === 'string' ? a.service : a.service?.name ?? 'Serviço';
            const barberName = a.barber?.name ?? 'Barbeiro';
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{serviceName}</p>
                  <p className="text-muted-foreground truncate">
                    {barberName} · {formatDate(a.date)} {a.time}
                  </p>
                </div>
                <Badge variant="secondary">{a.status === 'completed' ? 'Concluído' : a.status}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Plano de Fidelidade
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Dados demonstrativos (mock). Sistema real de planos virá em breve.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{loyalty.planName}</Badge>
            <Badge variant="outline">{loyalty.shopName}</Badge>
            <span className="text-xs text-muted-foreground">
              Válido até {formatDate(loyalty.validUntil)}
            </span>
          </div>

          <div className="space-y-3">
            {loyalty.credits.map((credit) => {
              const used = credit.includedTotal - credit.remaining;
              const pct = credit.includedTotal
                ? Math.round((credit.remaining / credit.includedTotal) * 100)
                : 0;
              return (
                <div key={credit.serviceKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Scissors className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{credit.serviceName}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {credit.remaining}/{credit.includedTotal} restantes
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    {used} utilizado(s) neste ciclo
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
