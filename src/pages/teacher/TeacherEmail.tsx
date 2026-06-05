import { useMemo, useState } from "react";
import { Send, X, Users, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/teacher/RichTextEditor";
import {
  subjects, semesters, studentsForSubject,
} from "@/data/teacher-portal-data";
import { toast } from "sonner";

export default function TeacherEmail() {
  const [subjectId, setSubject] = useState(subjects[0].id);
  const [semesterId, setSemester] = useState(semesters[0].id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");

  const audience = useMemo(() => studentsForSubject(subjectId, semesterId), [subjectId, semesterId]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set(audience.map((a) => a.student.id)));
  const clearAll = () => setSelected(new Set());

  const send = () => {
    if (selected.size === 0) return toast.error("Select at least one recipient.");
    if (!subj.trim()) return toast.error("Subject is required.");
    if (!body || body === "<p></p>") return toast.error("Email body is empty.");
    toast.success(`Email queued for ${selected.size} recipient${selected.size === 1 ? "" : "s"}.`);
    setSubj(""); setBody(""); clearAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Compose and send to students enrolled in your subjects.</p>
        </div>
        <Button onClick={send} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Send className="h-4 w-4 mr-2" /> Send
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardContent className="p-4 space-y-3">
              <Input value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Subject" className="h-11 text-base" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <RichTextEditor value={body} onChange={setBody} placeholder="Write your message…" />
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="p-3 flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</span>
              <Button variant="ghost" size="sm" onClick={() => toast.info("Attachment upload coming soon.")}>Add file</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-[var(--shadow-card)] h-fit lg:sticky lg:top-4">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" /> Recipients
              </p>
              <div className="space-y-2">
                <Select value={subjectId} onValueChange={(v) => { setSubject(v); clearAll(); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={semesterId} onValueChange={(v) => { setSemester(v); clearAll(); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{selected.size} / {audience.length} selected</span>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={selectAll}>Select all</Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearAll}>Clear</Button>
              </div>
            </div>

            {selected.size > 0 && (
              <div className="flex flex-wrap gap-1 max-h-24 overflow-auto border rounded p-2">
                {Array.from(selected).slice(0, 12).map((sid) => {
                  const st = audience.find((a) => a.student.id === sid)?.student;
                  if (!st) return null;
                  return (
                    <Badge key={sid} variant="outline" className="gap-1 pr-1">
                      {st.firstName} {st.lastName[0]}.
                      <button onClick={() => toggle(sid)}><X className="h-3 w-3" /></button>
                    </Badge>
                  );
                })}
                {selected.size > 12 && <Badge variant="outline">+{selected.size - 12}</Badge>}
              </div>
            )}

            <div className="border rounded-lg max-h-[360px] overflow-auto divide-y">
              {audience.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No students for this filter.</p>
              )}
              {audience.map((a) => (
                <label key={a.student.id} className="flex items-center gap-2 p-2 hover:bg-muted/30 cursor-pointer text-sm">
                  <Checkbox
                    checked={selected.has(a.student.id)}
                    onCheckedChange={() => toggle(a.student.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{a.student.firstName} {a.student.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{a.student.index}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
