"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllNasabah } from "@/features/customer/hook";
import {
  useApproveSP,
  useDeleteSP,
  useRejectSP,
  useRevisiSP,
  useSubmitForApproval,
  useTandaiSelesai,
  useTandaiTerkirim,
  useUpdateSP,
} from "@/features/sp/hook";
import { MetodePengiriman } from "@/generated/prisma/enums";
import { useZodForm } from "@/hook/use-form";
import {
  CheckCircle,
  ImagePlus,
  Loader2,
  Pen,
  Printer,
  RotateCcw,
  Send,
  Trash2,
  Trash2Icon,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { toDateInputValue } from "../label";
import {
  ApproveSPInput,
  ApproveSPInputSchema,
  RejectSPInput,
  RejectSPInputSchema,
  SPCreateInput,
  SPWithNasabah,
  TandaiTerkirimInput,
  TandaiTerkirimInputSchema,
} from "../schema";
import { isMyApprovalTurn } from "../utils";
import SPForm from "./sp-form";

interface Props {
  sp: SPWithNasabah;
}

export default function SPStatusActions({ sp }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aksi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <ActionButtons sp={sp} />
      </CardContent>
    </Card>
  );
}

function ActionButtons({ sp }: Props) {
  const { data: session } = useSession();
  const role = session?.user.role;
  const userId = session?.user.id;
  const isAdmin = role === "ADMIN";
  const isApprover = role === "APPROVER";

  const isMyTurn = isMyApprovalTurn(sp, userId);
  const alreadyApproved = sp.approvals.some(
    (a) => a.approverId === userId && a.status !== "PENDING",
  );
  const canEdit = isAdmin || sp.petugasId === userId;

  switch (sp.status) {
    case "DRAFT":
      if (isApprover) return null;
      return (
        <>
          {canEdit && <EditDialog sp={sp} />}
          <AjukanButton spId={sp.id} />
          <DeleteButton sp={sp} />
        </>
      );

    case "MENUNGGU_APPROVAL":
      return (
        <>
          {isMyTurn ? (
            <>
              <ApproveDialog spId={sp.id} />
              <RejectDialog spId={sp.id} />
            </>
          ) : role === "APPROVER" ? (
            <p className="text-sm text-muted-foreground">
              {alreadyApproved
                ? "Anda sudah menyetujui, menunggu approver berikutnya."
                : "Menunggu giliran approver lain."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Menunggu persetujuan approver.
            </p>
          )}
          {isAdmin && <DeleteButton sp={sp} />}
        </>
      );

    case "DISETUJUI":
      // Approver hanya bisa cetak, tidak bisa mengirim atau menghapus surat.
      return (
        <>
          <CetakButton spId={sp.id} />
          {!isApprover && (
            <>
              <KirimDialog spId={sp.id} />
              <DeleteButton sp={sp} />
            </>
          )}
        </>
      );

    case "DITOLAK":
      if (isApprover) return null;
      return (
        <>
          {canEdit && <EditDialog sp={sp} />}
          <RevisiButton spId={sp.id} />
          <DeleteButton sp={sp} />
        </>
      );

    case "TERKIRIM":
      return (
        <>
          <CetakButton spId={sp.id} />
          {!isApprover && <SelesaiDialog spId={sp.id} />}
        </>
      );

    case "SELESAI":
      return <CetakButton spId={sp.id} />;
  }
}

function CetakButton({ spId }: { spId: string }) {
  return (
    <Button variant="outline" asChild>
      <Link href={`/surat-peringatan/${spId}/cetak`} target="_blank">
        <Printer className="size-4" />
        Cetak Surat
      </Link>
    </Button>
  );
}

function EditDialog({ sp }: { sp: SPWithNasabah }) {
  const [open, setOpen] = useState(false);
  const { data: nasabah } = useGetAllNasabah();
  const { mutate, isPending } = useUpdateSP();

  const defaultValues: SPCreateInput = {
    nasabahId: sp.nasabahId,
    jenis: sp.jenis,
    noPjm: sp.noPjm,
    jenisFasilitas: sp.jenisFasilitas ?? "",
    tanggalAkadKredit: sp.tanggalAkadKredit ?? new Date(),
    sukuBunga: sp.sukuBunga ?? 0,
    plafond: sp.plafond,
    saldo: sp.saldo,
    tgkPokok: sp.tgkPokok,
    tgkBunga: sp.tgkBunga,
    tgkPokokHari: sp.tgkPokokHari,
    tgkBungaHari: sp.tgkBungaHari,
    biayaAdministrasi: sp.biayaAdministrasi ?? 0,
    kolektibilitas: sp.kolektibilitas,
    alasan: sp.alasan,
    tanggalSurat: sp.tanggalSurat,
    tanggalJatuhTempo: sp.tanggalJatuhTempo,
    catatan: sp.catatan ?? "",
  };

  const handleSubmit = (data: SPCreateInput) => {
    mutate({ id: sp.id, data }, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pen className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit surat peringatan</DialogTitle>
          <DialogDescription>
            Perbarui data surat peringatan berikut lalu simpan perubahan.
          </DialogDescription>
        </DialogHeader>
        <SPForm
          onSubmit={handleSubmit}
          isPending={isPending}
          nasabah={nasabah ?? []}
          defaultValues={defaultValues}
          submitLabel="Simpan perubahan"
        />
      </DialogContent>
    </Dialog>
  );
}

function AjukanButton({ spId }: { spId: string }) {
  const { mutate, isPending } = useSubmitForApproval();

  return (
    <Button disabled={isPending} onClick={() => mutate(spId)}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Send className="size-4" />
      )}
      Ajukan untuk Approval
    </Button>
  );
}

function RevisiButton({ spId }: { spId: string }) {
  const { mutate, isPending } = useRevisiSP();

  return (
    <Button variant="outline" disabled={isPending} onClick={() => mutate(spId)}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RotateCcw className="size-4" />
      )}
      Revisi (Kembali ke Draft)
    </Button>
  );
}

function DeleteButton({ sp }: { sp: SPWithNasabah }) {
  const router = useRouter();
  const { mutate, isPending } = useDeleteSP();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus surat peringatan?</AlertDialogTitle>
          <AlertDialogDescription>
            Surat peringatan {sp.nomorSurat ?? sp.id} akan dihapus secara
            permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            variant="destructive"
            onClick={() =>
              mutate(sp.id, {
                onSuccess: () => router.push("/surat-peringatan"),
              })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ApproveDialog({ spId }: { spId: string }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { mutate, isPending } = useApproveSP();
  const form = useZodForm(ApproveSPInputSchema, {
    defaultValues: { catatan: "" },
  });

  const onSubmit = (data: ApproveSPInput) => {
    mutate(
      { id: spId, data },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle className="size-4" />
          Setujui
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setujui Surat Peringatan</DialogTitle>
          <DialogDescription>
            Menyetujui sebagai {session?.user.nama}.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="catatan"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="catatanApprove">
                  Catatan{" "}
                  <span className="text-muted-foreground">(opsional)</span>
                </FieldLabel>
                <Textarea
                  id="catatanApprove"
                  rows={2}
                  placeholder="Catatan persetujuan..."
                  {...field}
                />
                {fieldState.error?.message && (
                  <FieldError errors={[fieldState.error]}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Field>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Konfirmasi Persetujuan"}
            </Button>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ spId }: { spId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useRejectSP();
  const form = useZodForm(RejectSPInputSchema, {
    defaultValues: { catatan: "" },
  });

  const onSubmit = (data: RejectSPInput) => {
    mutate(
      { id: spId, data },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XCircle className="size-4" />
          Tolak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tolak Surat Peringatan</DialogTitle>
          <DialogDescription>
            Surat peringatan akan dikembalikan ke pembuat untuk direvisi.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="catatan"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="catatanTolak">Alasan Penolakan</FieldLabel>
                <Textarea
                  id="catatanTolak"
                  rows={3}
                  placeholder="Jelaskan alasan penolakan..."
                  {...field}
                />
                {fieldState.error?.message && (
                  <FieldError errors={[fieldState.error]}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Field>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Memproses..." : "Konfirmasi Penolakan"}
            </Button>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}

function KirimDialog({ spId }: { spId: string }) {
  const [open, setOpen] = useState(false);
  const [buktiKirim, setBuktiKirim] = useState<File | undefined>();
  const { mutate, isPending } = useTandaiTerkirim();
  const form = useZodForm(TandaiTerkirimInputSchema, {
    defaultValues: {
      metodePengiriman: MetodePengiriman.POS,
      tanggalKirim: new Date(),
      noResi: "",
    },
  });
  const metode = form.watch("metodePengiriman");

  const onSubmit = (data: TandaiTerkirimInput) => {
    mutate(
      { id: spId, data, buktiKirim },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          setBuktiKirim(undefined);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="size-4" />
          Kirim Surat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tandai Surat Terkirim</DialogTitle>
          <DialogDescription>
            Masukkan informasi pengiriman surat peringatan kepada nasabah.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="metodePengiriman"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="metodePengiriman">
                  Metode Pengiriman
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="metodePengiriman" className="w-full">
                    <SelectValue placeholder="Pilih metode..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MetodePengiriman.POS}>
                      Pos / Ekspedisi
                    </SelectItem>
                    <SelectItem value={MetodePengiriman.EMAIL}>
                      Email
                    </SelectItem>
                    <SelectItem value={MetodePengiriman.LANGSUNG}>
                      Langsung / Tatap Muka
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error?.message && (
                  <FieldError errors={[fieldState.error]}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="tanggalKirim"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="tanggalKirim">Tanggal Kirim</FieldLabel>
                <Input
                  id="tanggalKirim"
                  type="date"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={toDateInputValue(field.value)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? new Date(e.target.value) : undefined,
                    )
                  }
                />
                {fieldState.error?.message && (
                  <FieldError errors={[fieldState.error]}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          {metode === MetodePengiriman.POS && (
            <Controller
              control={form.control}
              name="noResi"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="noResi">
                    No. Resi{" "}
                    <span className="text-muted-foreground">(opsional)</span>
                  </FieldLabel>
                  <Input
                    id="noResi"
                    placeholder="Nomor resi pengiriman"
                    {...field}
                  />
                  {fieldState.error?.message && (
                    <FieldError errors={[fieldState.error]}>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          )}
          <Field>
            <FieldLabel htmlFor="buktiKirim">
              Bukti Kirim{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input
              id="buktiKirim"
              type="file"
              accept="image/*"
              onChange={(e) => setBuktiKirim(e.target.files?.[0])}
            />
          </Field>
          <Field>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Konfirmasi Pengiriman"}
            </Button>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}

function SelesaiDialog({ spId }: { spId: string }) {
  const [open, setOpen] = useState(false);
  const [buktiTandaTerima, setBuktiTandaTerima] = useState<File | undefined>();
  const { mutate, isPending } = useTandaiSelesai();

  const handleSubmit = () => {
    mutate(
      { id: spId, buktiTandaTerima },
      {
        onSuccess: () => {
          setOpen(false);
          setBuktiTandaTerima(undefined);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle className="size-4" />
          Tandai Selesai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tandai Surat Selesai</DialogTitle>
          <DialogDescription>
            Upload bukti tanda terima dari nasabah sebagai konfirmasi penerimaan
            surat.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="buktiTandaTerima">
              Bukti Tanda Terima{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input
              id="buktiTandaTerima"
              type="file"
              accept="image/*"
              onChange={(e) => setBuktiTandaTerima(e.target.files?.[0])}
            />
          </Field>
          <Field>
            <Button disabled={isPending} onClick={handleSubmit}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isPending ? "Menyimpan..." : "Konfirmasi Selesai"}
            </Button>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
