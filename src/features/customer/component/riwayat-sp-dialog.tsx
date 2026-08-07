"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllSP } from "@/features/sp/hook";
import {
  formatDate,
  JENIS_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "@/features/sp/label";
import { Nasabah } from "@/generated/prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";

interface Props {
  nasabah: Nasabah | null;
  onOpenChange: (open: boolean) => void;
}

export default function RiwayatSPDialog({ nasabah, onOpenChange }: Props) {
  const { data: allSP } = useGetAllSP();

  const riwayat = (allSP ?? [])
    .filter((sp) => sp.nasabahId === nasabah?.id)
    .sort(
      (a, b) =>
        new Date(b.tanggalSurat).getTime() - new Date(a.tanggalSurat).getTime(),
    );

  return (
    <Dialog open={!!nasabah} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Riwayat Surat Peringatan</DialogTitle>
          <DialogDescription>
            Seluruh surat peringatan yang pernah diterbitkan untuk{" "}
            {nasabah?.nama}.
          </DialogDescription>
        </DialogHeader>

        {riwayat.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada surat peringatan untuk nasabah ini.
          </p>
        ) : (
          <div className="space-y-3">
            {riwayat.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center justify-between gap-4 rounded-xl border p-3"
              >
                <div className="space-y-0.5">
                  <p className="font-mono text-sm font-medium">
                    {sp.nomorSurat ?? "Belum diterbitkan"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {JENIS_LABEL[sp.jenis] ?? sp.jenis} &middot;{" "}
                    {formatDate(sp.tanggalSurat)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_CLASS[sp.status]}
                  >
                    {STATUS_LABEL[sp.status]}
                  </Badge>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/surat-peringatan/${sp.id}`}>
                      <Eye />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
