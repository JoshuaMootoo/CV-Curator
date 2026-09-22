"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteNodeAction, getNodeCvUsageAction } from "@/app/library/actions";
import { Trash2 } from "lucide-react";

export function DeleteNodeDialog({ nodeId, nodeTitle }: { nodeId: string; nodeTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usedInCvs, setUsedInCvs] = useState<{ id: string; name: string }[] | null>(null);

  const loading = open && usedInCvs === null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getNodeCvUsageAction(nodeId).then((result) => {
      if (!cancelled) setUsedInCvs(result.success ? result.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [open, nodeId]);

  async function handleDelete() {
    setDeleting(true);
    await deleteNodeAction(nodeId);
    setDeleting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="size-3.5" /> Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{nodeTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            {loading && "Checking where this node is used..."}
            {!loading && usedInCvs?.length === 0 && "This node isn't used on any CV."}
            {!loading && usedInCvs && usedInCvs.length > 0 && (
              <>
                This node is used on {usedInCvs.length} CV
                {usedInCvs.length === 1 ? "" : "s"}: {usedInCvs.map((cv) => cv.name).join(", ")}.
                Deleting it will remove it from {usedInCvs.length === 1 ? "that CV" : "those CVs"} too.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
