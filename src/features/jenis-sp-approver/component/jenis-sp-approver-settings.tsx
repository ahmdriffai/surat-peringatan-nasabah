"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/generated/prisma/client";
import { JenisSP } from "@/generated/prisma/enums";
import { JENIS_LABEL } from "@/features/sp/label";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGetJenisSPApprovers, useSetJenisSPApprovers } from "../hook";

const JENIS_LIST = Object.values(JenisSP);

interface Props {
  approvers: User[];
}

export default function JenisSPApproverSettings({ approvers }: Props) {
  const { data: rules } = useGetJenisSPApprovers();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {JENIS_LIST.map((jenis) => {
        const initialApproverIds =
          rules?.filter((r) => r.jenis === jenis).map((r) => r.approverId) ??
          [];

        return (
          <JenisSPApproverCard
            // Remount saat data approver dari server berubah/selesai dimuat,
            // supaya state lokal `selected` selalu mulai dari nilai terbaru
            // tanpa perlu sinkronisasi lewat useEffect.
            key={`${jenis}:${initialApproverIds.join(",")}`}
            jenis={jenis}
            approvers={approvers}
            initialApproverIds={initialApproverIds}
          />
        );
      })}
    </div>
  );
}

function JenisSPApproverCard({
  jenis,
  approvers,
  initialApproverIds,
}: {
  jenis: JenisSP;
  approvers: User[];
  initialApproverIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialApproverIds);
  const { mutate, isPending } = useSetJenisSPApprovers();

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((a) => a !== id),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = () => {
    mutate({ jenis, approverIds: selected });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {JENIS_LABEL[jenis] ?? jenis}
        </CardTitle>
        <CardDescription>
          Approver akan diminta persetujuan sesuai urutan di bawah.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {approvers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada user dengan role Approver.
            </p>
          )}
          {approvers.map((approver) => (
            <label
              key={approver.id}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selected.includes(approver.id)}
                onCheckedChange={(checked) =>
                  toggle(approver.id, checked === true)
                }
              />
              {approver.nama}
            </label>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="space-y-1.5 border-t pt-3">
            <p className="text-xs text-muted-foreground">Urutan approval</p>
            {selected.map((id, index) => {
              const approver = approvers.find((a) => a.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm"
                >
                  <span>
                    {index + 1}. {approver?.nama ?? id}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === selected.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          size="sm"
          disabled={isPending || selected.length === 0}
          onClick={handleSave}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}
