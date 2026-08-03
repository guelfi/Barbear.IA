import { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Clock, Scissors, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { barbershopsAPI, type PublicBarbershop, type PublicBarbershopDetail } from '../../api/barbershops';

const dayLabels: Record<string, string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

function formatAddress(address: any): string {
  if (!address) return 'Endereço não informado';
  if (typeof address === 'string') return address;
  const street = address.street ?? address.Street ?? '';
  const city = address.city ?? address.City ?? '';
  const state = address.state ?? address.State ?? '';
  return [street, city, state].filter(Boolean).join(' · ') || 'Endereço não informado';
}

function formatHours(hours: any): string[] {
  if (!hours || typeof hours !== 'object') return ['Horários sob consulta'];
  return Object.entries(dayLabels).map(([key, label]) => {
    const slot = hours[key];
    if (!slot || typeof slot !== 'object') return `${label}: Fechado`;
    const open = (slot as any).open ?? (slot as any).Open;
    const close = (slot as any).close ?? (slot as any).Close;
    if (!open || !close) return `${label}: Fechado`;
    return `${label}: ${open} – ${close}`;
  });
}

export function ClientBarbershops() {
  const [shops, setShops] = useState<PublicBarbershop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PublicBarbershopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await barbershopsAPI.discover();
        setShops(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar barbearias.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        setDetail(await barbershopsAPI.getPublicDetail(selectedId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes.');
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    void loadDetail();
  }, [selectedId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-muted-foreground">Carregando barbearias...</p>
      </div>
    );
  }

  if (error && shops.length === 0) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Barbearias</h2>
        <p className="text-sm text-muted-foreground">
          Consulte endereço, contato, horários e profissionais disponíveis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shops.map((shop) => (
          <Card
            key={shop.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedId === shop.id ? 'border-primary' : 'hover:border-primary/30'
            }`}
            onClick={() => setSelectedId(shop.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                {shop.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formatAddress(shop.address)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{shop.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{shop.email || '—'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(shop.id);
                }}
              >
                Ver detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {shops.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhuma barbearia disponível no momento.</p>
      )}

      {selectedId && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">
              {detail?.shop.name ?? 'Detalhes da barbearia'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingDetail && <p className="text-sm text-muted-foreground">Carregando detalhes...</p>}
            {detail && !loadingDetail && (
              <>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Horários de atendimento
                  </h3>
                  <ul className="grid gap-1 sm:grid-cols-2 text-sm text-muted-foreground">
                    {formatHours(detail.shop.businessHours).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Barbeiros disponíveis
                  </h3>
                  {detail.barbers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum barbeiro listado.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detail.barbers.map((barber) => (
                        <div
                          key={barber.id}
                          className="flex items-center gap-3 rounded-lg border border-border p-3"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={barber.avatarUrl} />
                            <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{barber.name}</p>
                            {barber.bio && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{barber.bio}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Scissors className="h-4 w-4" /> Serviços
                  </h3>
                  {detail.services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum serviço listado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detail.services.map((service) => (
                        <Badge key={service.id} variant="secondary" className="text-xs font-normal">
                          {service.name} · {service.durationMinutes}min · R${' '}
                          {Number(service.price).toFixed(2)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
