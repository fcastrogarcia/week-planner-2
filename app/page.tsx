import { redirect } from 'next/navigation';
import { startOfWeek, format } from 'date-fns';

// Forzar que esta página no se genere de forma estática y así usar siempre la semana actual
export const dynamic = 'force-dynamic';

export default function Index() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const iso = format(weekStart, 'yyyy-MM-dd');
  redirect(`/week?start=${iso}`);
}
