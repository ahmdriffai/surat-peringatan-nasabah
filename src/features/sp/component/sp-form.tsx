"use client";

import { Button } from "@/components/ui/button";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Nasabah } from "@/generated/prisma/client";
import { JenisSP } from "@/generated/prisma/enums";
import { useZodForm } from "@/hook/use-form";
import { EnrichedLoanData } from "@/services/external/loans";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Gavel,
  Info,
  Loader2,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { formatCurrency, toDateInputValue } from "../label";
import { SPCreateInput, SPCreateInputSchema } from "../schema";
import LoanSearch from "./loan-search";

const KOLEKTIBILITAS_OPTIONS = [
  { value: 1, label: "1 — Lancar" },
  { value: 2, label: "2 — Dalam Perhatian Khusus" },
  { value: 3, label: "3 — Kurang Lancar" },
  { value: 4, label: "4 — Diragukan" },
  { value: 5, label: "5 — Macet" },
];

const JENIS_AGUNAN_OPTIONS = [
  "Tanah & Bangunan (SHM / SHGB)",
  "Tanah Pekarangan (SHM)",
  "Kendaraan Bermotor (BPKB)",
  "Kios / Los Pasar",
  "Lainnya",
];

interface NumberFieldProps {
  name: keyof Pick<
    SPCreateInput,
    | "plafond"
    | "saldo"
    | "tgkPokok"
    | "tgkBunga"
    | "tgkPokokHari"
    | "tgkBungaHari"
    | "sukuBunga"
    | "biayaAdministrasi"
    | "denda"
    | "batasWaktuHari"
    | "nilaiLimitLelang"
  >;
  label: string;
  placeholder: string;
  control: ReturnType<typeof useZodForm<typeof SPCreateInputSchema>>["control"];
}

function NumberField({ name, label, placeholder, control }: NumberFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            placeholder={placeholder}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value ?? ""}
            onChange={(e) =>
              field.onChange(
                isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber,
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
  );
}

interface Props {
  onSubmit: (data: SPCreateInput) => void;
  isPending: boolean;
  nasabah: Nasabah[];
  defaultValues?: SPCreateInput;
  submitLabel?: string;
}

export default function SPForm({
  isPending,
  onSubmit,
  nasabah,
  defaultValues,
  submitLabel = "Simpan",
}: Props) {
  const isEditMode = Boolean(defaultValues);
  const [selectedLoan, setSelectedLoan] = useState<EnrichedLoanData | null>(null);
  const [showManualSelect, setShowManualSelect] = useState(isEditMode);

  const form = useZodForm(SPCreateInputSchema, {
    defaultValues: {
      nasabahId: "",
      jenis: JenisSP.SP1,
      noPjm: "",
      jenisFasilitas: "",
      sukuBunga: 0,
      plafond: 0,
      saldo: 0,
      tgkPokok: 0,
      tgkBunga: 0,
      tgkPokokHari: 0,
      tgkBungaHari: 0,
      biayaAdministrasi: 0,
      denda: 0,
      kolektibilitas: 1,
      alasan: "",
      catatan: "",
      batasWaktuHari: 7,
      jenisAgunan: "",
      dokumenAgunan: "",
      atasNamaAgunan: "",
      lokasiAgunan: "",
      nilaiLimitLelang: 0,
      kpknl: "KPKNL Purwokerto",
      ...defaultValues,
    },
  });

  const handleSelectLoan = (loan: EnrichedLoanData) => {
    setSelectedLoan(loan);

    const colNum = Number(loan.Col) || 1;
    const tgkPokok = Math.abs(loan.TgkPokok || 0);
    const tgkBunga = Math.abs(loan.TgkBunga || 0);
    const tgkPokokHari = loan.TgkPokokHari || 0;
    const tgkBungaHari = loan.TgkBungaHAri ?? loan.TgkBungaHari ?? 0;
    const plafond = Math.abs(loan.Plafond || 0);
    const saldo = Math.abs(loan.Saldo || 0);
    const totalTunggakan = tgkPokok + tgkBunga;
    const denda = Math.round(totalTunggakan * 0.01); // 1% dari seluruh tunggakan

    // Rekomendasi jenis surat berdasarkan kolektibilitas
    let suggestedJenis: JenisSP = JenisSP.SP1;
    if (colNum >= 5) {
      suggestedJenis = JenisSP.SOMASI_1;
    } else if (colNum >= 4) {
      suggestedJenis = JenisSP.SP3;
    } else if (colNum >= 3) {
      suggestedJenis = JenisSP.SP2;
    }

    const today = new Date();
    const jatuhTempo = new Date(today);
    jatuhTempo.setDate(jatuhTempo.getDate() + 7);

    const reasonTemplate = `Berdasarkan catatan pembukuan, terdapat kewajiban fasilitas kredit ${loan.JnsPjm || "Pinjaman"} (No. Rekening/PK: ${loan.NoPjm}) yang telah menunggak dengan rincian tunggakan pokok sebesar ${formatCurrency(tgkPokok)} (${tgkPokokHari} hari) dan tunggakan bunga sebesar ${formatCurrency(tgkBunga)} (${tgkBungaHari} hari) dengan status kolektibilitas ${colNum}.`;

    form.setValue("nasabahId", loan.existingNasabahId || "");
    form.setValue("nasabahData", {
      cif: loan.NasabahID,
      nama: loan.Nama,
      nik: loan.NIK,
      nomorRekening: loan.NoPjm,
      email: loan.Email || undefined,
      telepon: loan.Phone || undefined,
      alamat: loan.Alamat || undefined,
    });
    form.setValue("noPjm", loan.NoPjm);
    form.setValue("jenisFasilitas", loan.JnsPjm || "Pinjaman");
    form.setValue("kolektibilitas", colNum);
    form.setValue("plafond", plafond);
    form.setValue("saldo", saldo);
    form.setValue("tgkPokok", tgkPokok);
    form.setValue("tgkBunga", tgkBunga);
    form.setValue("tgkPokokHari", tgkPokokHari);
    form.setValue("tgkBungaHari", tgkBungaHari);
    form.setValue("denda", denda);
    form.setValue("jenis", suggestedJenis);
    form.setValue("tanggalSurat", today);
    form.setValue("tanggalJatuhTempo", jatuhTempo);
    form.setValue("alasan", reasonTemplate);
  };

  const handleClearSelection = () => {
    setSelectedLoan(null);
    form.setValue("nasabahId", "");
    form.setValue("nasabahData", undefined);
  };

  const selectedJenis = form.watch("jenis");
  const tgkPokok = form.watch("tgkPokok") || 0;
  const tgkBunga = form.watch("tgkBunga") || 0;
  const denda = form.watch("denda") || 0;
  const biayaAdmin = form.watch("biayaAdministrasi") || 0;
  const totalKewajiban = tgkPokok + tgkBunga + denda + biayaAdmin;

  const isSomasi =
    selectedJenis === JenisSP.SOMASI_1 ||
    selectedJenis === JenisSP.SOMASI_2 ||
    selectedJenis === JenisSP.SOMASI_3;

  const isLelang = selectedJenis === JenisSP.PEMBERITAHUAN_LELANG;

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      {/* Bagian Pencarian Pinjaman Core Banking (jika bukan mode edit) */}
      {!isEditMode && (
        <LoanSearch
          onSelectLoan={handleSelectLoan}
          selectedLoan={selectedLoan}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Tombol toggle / fallback pemilihan manual */}
      {!isEditMode && !selectedLoan && (
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowManualSelect(!showManualSelect)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Users className="mr-1.5 size-3.5" />
            {showManualSelect
              ? "Sembunyikan pemilihan manual nasabah terdaftar"
              : "Atau pilih manual dari daftar nasabah terdaftar di database"}
            {showManualSelect ? (
              <ChevronUp className="ml-1 size-3.5" />
            ) : (
              <ChevronDown className="ml-1 size-3.5" />
            )}
          </Button>
        </div>
      )}

      {/* Select nasabah manual (jika edit mode atau dibuka manual) */}
      {(isEditMode || (showManualSelect && !selectedLoan)) && (
        <Controller
          control={form.control}
          name="nasabahId"
          render={({ field, fieldState }) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="nasabahId">Nasabah (Database)</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("nasabahData", undefined);
                  setSelectedLoan(null);
                }}
              >
                <SelectTrigger id="nasabahId" className="w-full">
                  <SelectValue placeholder="Pilih nasabah terdaftar" />
                </SelectTrigger>
                <SelectContent>
                  {nasabah.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.nama} — {n.nomorRekening} (CIF: {n.cif})
                    </SelectItem>
                  ))}
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
      )}

      <Controller
        control={form.control}
        name="jenis"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="jenis">Jenis Surat</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="jenis" className="w-full">
                <SelectValue placeholder="Pilih jenis surat" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Surat Peringatan (SP)</SelectLabel>
                  <SelectItem value={JenisSP.PEMBERITAHUAN}>
                    Surat Pemberitahuan
                  </SelectItem>
                  <SelectItem value={JenisSP.SP1}>
                    SP 1 — Peringatan Pertama
                  </SelectItem>
                  <SelectItem value={JenisSP.SP2}>
                    SP 2 — Peringatan Kedua
                  </SelectItem>
                  <SelectItem value={JenisSP.SP3}>
                    SP 3 — Peringatan Ketiga (Terakhir)
                  </SelectItem>
                  <SelectItem value={JenisSP.PEMBERITAHUAN_SKK}>
                    Pemberitahuan SKK (Kejaksaan)
                  </SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Surat Somasi (Teguran Hukum)</SelectLabel>
                  <SelectItem value={JenisSP.SOMASI_1}>
                    Surat Somasi I (Pertama)
                  </SelectItem>
                  <SelectItem value={JenisSP.SOMASI_2}>
                    Surat Somasi II (Kedua)
                  </SelectItem>
                  <SelectItem value={JenisSP.SOMASI_3}>
                    Surat Somasi III (Terakhir)
                  </SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Surat Lelang</SelectLabel>
                  <SelectItem value={JenisSP.PEMBERITAHUAN_LELANG}>
                    Surat Pemberitahuan Lelang Eksekusi
                  </SelectItem>
                </SelectGroup>
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

      {/* Banner informasi jenis surat */}
      {isSomasi && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300 sm:col-span-2">
          <Scale className="size-5 shrink-0" />
          <p>
            <strong>Surat Somasi:</strong> Merupakan teguran hukum formal
            wanprestasi berdasarkan Pasal 1238 KUHPerdata dengan batas waktu
            penyelesaian yang tegas sebelum upaya hukum lanjutan / penyitaan.
          </p>
        </div>
      )}

      {isLelang && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-300 sm:col-span-2">
          <Gavel className="size-5 shrink-0" />
          <p>
            <strong>Surat Pemberitahuan Lelang:</strong> Pemberitahuan resmi
            pelaksanaan lelang eksekusi agunan hak tanggungan / jaminan fidusia
            melalui KPKNL.
          </p>
        </div>
      )}

      <Controller
        control={form.control}
        name="kolektibilitas"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="kolektibilitas">Kolektibilitas</FieldLabel>
            <Select
              value={String(field.value)}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              <SelectTrigger id="kolektibilitas" className="w-full">
                <SelectValue placeholder="Pilih kolektibilitas" />
              </SelectTrigger>
              <SelectContent>
                {KOLEKTIBILITAS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
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
        name="noPjm"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="noPjm">Nomor Pinjaman / PK</FieldLabel>
            <Input
              id="noPjm"
              type="text"
              placeholder="Contoh: PK-001/2024"
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

      <Controller
        control={form.control}
        name="jenisFasilitas"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="jenisFasilitas">Jenis Fasilitas</FieldLabel>
            <Input
              id="jenisFasilitas"
              placeholder="Contoh: Kredit Modal Kerja / Investasi"
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

      <Controller
        control={form.control}
        name="tanggalAkadKredit"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalAkadKredit">
              Tanggal Akad Kredit
            </FieldLabel>
            <Input
              id="tanggalAkadKredit"
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

      <NumberField
        control={form.control}
        name="sukuBunga"
        label="Suku Bunga (%)"
        placeholder="Suku bunga tahunan"
      />

      <NumberField
        control={form.control}
        name="plafond"
        label="Plafond Pinjaman"
        placeholder="Plafond pinjaman"
      />

      <NumberField
        control={form.control}
        name="saldo"
        label="Baki Debet / Saldo"
        placeholder="Saldo baki debet saat ini"
      />

      <NumberField
        control={form.control}
        name="tgkPokok"
        label="Tunggakan Pokok (Rp)"
        placeholder="Nominal tunggakan pokok"
      />

      <NumberField
        control={form.control}
        name="tgkPokokHari"
        label="Tunggakan Pokok (hari)"
        placeholder="Jumlah hari tunggakan pokok"
      />

      <NumberField
        control={form.control}
        name="tgkBunga"
        label="Tunggakan Bunga (Rp)"
        placeholder="Nominal tunggakan bunga"
      />

      <NumberField
        control={form.control}
        name="tgkBungaHari"
        label="Tunggakan Bunga (hari)"
        placeholder="Jumlah hari tunggakan bunga"
      />

      <Controller
        control={form.control}
        name="denda"
        render={({ field, fieldState }) => {
          const totalTgk = (form.watch("tgkPokok") || 0) + (form.watch("tgkBunga") || 0);
          const autoDenda = Math.round(totalTgk * 0.01);

          return (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="denda">Denda Keterlambatan (Rp)</FieldLabel>
                {totalTgk > 0 && (
                  <button
                    type="button"
                    onClick={() => field.onChange(autoDenda)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Hitung 1% ({formatCurrency(autoDenda)})
                  </button>
                )}
              </div>
              <Input
                id="denda"
                type="number"
                placeholder="1% dari total tunggakan"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    isNaN(e.target.valueAsNumber)
                      ? undefined
                      : e.target.valueAsNumber,
                  )
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Standar denda 1% dari total tunggakan pokok + bunga ({formatCurrency(autoDenda)}).
              </p>
              {fieldState.error?.message && (
                <FieldError errors={[fieldState.error]}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          );
        }}
      />

      <NumberField
        control={form.control}
        name="biayaAdministrasi"
        label="Biaya Administrasi (Rp)"
        placeholder="Biaya administrasi (opsional)"
      />

      {/* Ringkasan Total Kewajiban */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm sm:col-span-2">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" />
          <span className="font-medium">Total Kewajiban Menunggak:</span>
        </div>
        <span className="font-bold font-mono text-base text-primary">
          {formatCurrency(totalKewajiban)}
        </span>
      </div>

      {/* Data Khusus Somasi */}
      {isSomasi && (
        <div className="space-y-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 sm:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-sm text-amber-900 dark:text-amber-200">
            <ShieldAlert className="size-4" />
            Parameter Surat Somasi
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              control={form.control}
              name="batasWaktuHari"
              label="Batas Waktu Penyelesaian (Hari Kalender)"
              placeholder="Contoh: 7"
            />
          </div>
        </div>
      )}

      {/* Data Khusus Agunan & Lelang */}
      {isLelang && (
        <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 sm:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-sm text-red-900 dark:text-red-200">
            <Gavel className="size-4" />
            Data Agunan & Rencana Pelaksanaan Lelang
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="jenisAgunan"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="jenisAgunan">Jenis Agunan</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="jenisAgunan" className="w-full">
                      <SelectValue placeholder="Pilih jenis agunan" />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_AGUNAN_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
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
              name="dokumenAgunan"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="dokumenAgunan">
                    Nomor Bukti Kepemilikan (SHM / BPKB)
                  </FieldLabel>
                  <Input
                    id="dokumenAgunan"
                    placeholder="Contoh: SHM No. 01234 / Desa Kalierang"
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

            <Controller
              control={form.control}
              name="atasNamaAgunan"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="atasNamaAgunan">
                    Atas Nama Pemegang Hak / Sertifikat
                  </FieldLabel>
                  <Input
                    id="atasNamaAgunan"
                    placeholder="Contoh: Slamet Riyadi"
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

            <Controller
              control={form.control}
              name="lokasiAgunan"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lokasiAgunan">
                    Lokasi / Alamat Objek Agunan
                  </FieldLabel>
                  <Input
                    id="lokasiAgunan"
                    placeholder="Contoh: Jl. Dieng Km 3, RT 02/05, Wonosobo"
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

            <NumberField
              control={form.control}
              name="nilaiLimitLelang"
              label="Nilai Limit / Taksiran Lelang (Rp)"
              placeholder="Nilai limit lelang"
            />

            <Controller
              control={form.control}
              name="kpknl"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="kpknl">Kantor Pelaksana Lelang (KPKNL)</FieldLabel>
                  <Input
                    id="kpknl"
                    placeholder="Contoh: KPKNL Purwokerto"
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

            <Controller
              control={form.control}
              name="tanggalLelang"
              render={({ field, fieldState }) => (
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="tanggalLelang">
                    Tanggal Rencana Pelaksanaan Lelang
                  </FieldLabel>
                  <Input
                    id="tanggalLelang"
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
          </div>
        </div>
      )}

      <Controller
        control={form.control}
        name="tanggalSurat"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalSurat">Tanggal Surat</FieldLabel>
            <Input
              id="tanggalSurat"
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

      <Controller
        control={form.control}
        name="tanggalJatuhTempo"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalJatuhTempo">
              {isSomasi
                ? "Batas Akhir Pelunasan Somasi"
                : isLelang
                  ? "Batas Terakhir Sebelum Pengumuman Lelang"
                  : "Jatuh Tempo Pembayaran"}
            </FieldLabel>
            <Input
              id="tanggalJatuhTempo"
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

      <Controller
        control={form.control}
        name="alasan"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="alasan">
              {isSomasi
                ? "Pokok Teguran Somasi"
                : isLelang
                  ? "Dasar Pelaksanaan Lelang"
                  : "Alasan Pemberian SP"}
            </FieldLabel>
            <Textarea
              id="alasan"
              rows={4}
              placeholder={
                isSomasi
                  ? "Jelaskan kronologi wanprestasi dan penegasan somasi..."
                  : isLelang
                    ? "Jelaskan dasar pelaksanaan eksekusi hak tanggungan/fidusia..."
                    : "Jelaskan alasan pemberian surat peringatan ini..."
              }
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

      <Controller
        control={form.control}
        name="catatan"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="catatan">
              Catatan <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Textarea
              id="catatan"
              rows={2}
              placeholder="Catatan internal / tambahan..."
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

      <Field className="sm:col-span-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </Field>
    </FieldGroup>
  );
}
