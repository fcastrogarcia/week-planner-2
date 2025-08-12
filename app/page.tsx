import { redirect } from "next/navigation";
import { startOfWeek, format } from "date-fns";

export default function Index() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const iso = format(weekStart, "yyyy-MM-dd");
  redirect(`/week?start=${iso}`);
}
