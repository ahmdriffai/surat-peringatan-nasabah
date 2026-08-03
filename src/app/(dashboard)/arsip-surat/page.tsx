"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArsipList from "@/features/sp/component/arsip-list";
import { useGetAllSP, useSetArsipSP } from "@/features/sp/hook";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ArsipSuratPage() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [file, setFile] = useState<File | undefined>();

  const { data: sp } = useGetAllSP();
  const { mutate, isPending } = useSetArsipSP();

  const archived = (sp ?? []).filter((s) => s.arsipPdf);

  const handleSubmit = () => {
    if (!selectedId || !file) return;

    mutate(
      { id: selectedId, file },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedId("");
          setFile(undefined);
        },
      },
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Unggah Arsip Surat</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Unggah Arsip Surat</DialogTitle>
              <DialogDescription>
                Unggah file PDF hasil scan surat peringatan yang sudah
                dikirim.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="sp">Surat Peringatan</FieldLabel>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger id="sp" className="w-full">
                    <SelectValue placeholder="Pilih surat peringatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sp ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nomorSurat ?? "(belum ada nomor)"} —{" "}
                        {s.nasabah.nama}
                        {s.arsipPdf ? " (sudah ada arsip)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="file">File PDF</FieldLabel>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </Field>
              <Field>
                <Button
                  disabled={isPending || !selectedId || !file}
                  onClick={handleSubmit}
                  className="w-full"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Mengunggah..." : "Unggah"}
                </Button>
              </Field>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>

      <ArsipList sp={archived} />
    </div>
  );
}
