import { listNodes } from "@/lib/db/queries";
import { LibraryClient } from "@/components/library/LibraryClient";

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  const nodes = listNodes().sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Library</h1>
      <LibraryClient nodes={nodes} />
    </div>
  );
}
