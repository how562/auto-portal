import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState } from "@/components/admin-ui";
import { Plus, Trash2, Pin, PinOff, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notes")({
  component: NotesPage,
});

type Note = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updated_at: string;
};

function NotesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, body, pinned, updated_at")
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });

  const filtered = (notes ?? []).filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  const selected = notes?.find((n) => n.id === selectedId) ?? null;

  // Sync draft when selection changes
  useEffect(() => {
    if (selected) setDraft({ title: selected.title, body: selected.body });
    else setDraft(null);
  }, [selectedId, selected?.updated_at]);

  // Auto-select first note
  useEffect(() => {
    if (!selectedId && notes && notes.length > 0) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, title: "Untitled", body: "" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setSelectedId(id);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!selected || !draft) return;
      const { error } = await supabase
        .from("notes")
        .update({ title: draft.title || "Untitled", body: draft.body })
        .eq("id", selected.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePin = useMutation({
    mutationFn: async (n: Note) => {
      const { error } = await supabase.from("notes").update({ pinned: !n.pinned }).eq("id", n.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      toast.success("Deleted");
      if (selectedId === id) setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Personal scratchpad — only you can see your notes."
        action={
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* List */}
        <div className="rounded-md border bg-card">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No notes" hint="Create your first note to get started." />
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => setSelectedId(n.id)}
                      className={cn(
                        "flex w-full flex-col items-start gap-1 px-3 py-2 text-left hover:bg-muted/40",
                        selectedId === n.id && "bg-muted/60",
                      )}
                    >
                      <div className="flex w-full items-center gap-2">
                        {n.pinned && <Pin className="h-3 w-3 text-primary" />}
                        <span className="flex-1 truncate text-sm font-medium">{n.title || "Untitled"}</span>
                      </div>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {n.body || "No content"}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {new Date(n.updated_at).toLocaleString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-md border bg-card">
          {!selected || !draft ? (
            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-sm text-muted-foreground">
              Select a note or create a new one.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b p-2">
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title"
                  className="border-0 text-base font-semibold shadow-none focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  title={selected.pinned ? "Unpin" : "Pin"}
                  onClick={() => togglePin.mutate(selected)}
                >
                  {selected.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={() => {
                    if (confirm("Delete this note?")) del.mutate(selected.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="Write your note…"
                className="min-h-[400px] flex-1 resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center justify-between border-t p-2 text-xs text-muted-foreground">
                <span>Last updated {new Date(selected.updated_at).toLocaleString()}</span>
                <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
