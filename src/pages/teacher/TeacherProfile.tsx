import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teacherProfile } from "@/data/teacher-portal-data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">{title}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export default function TeacherProfile() {
  const t = teacherProfile;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title} {t.firstName} {t.lastName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Staff profile · {t.department}</p>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 capitalize">{t.status}</Badge>
          <Badge variant="outline" className="font-mono">{t.staffId}</Badge>
        </div>
      </div>
      <Section title="Employment">
        <Row label="Faculty" value={t.faculty} />
        <Row label="Department" value={t.department} />
        <Row label="Title" value={t.title} />
        <Row label="Joined" value={t.joinedYear} />
      </Section>
      <Section title="Contact">
        <Row label="Email" value={t.email} />
        <Row label="Phone" value={t.phone} />
        <Row label="Office" value={t.office} />
      </Section>
    </div>
  );
}
