"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllKepalaKejaksaan } from "@/features/kejaksaan/hook";
import { useGetDetailSP, useSetKejaksaanSP } from "@/features/sp/hook";
import {
  formatCurrency,
  formatDate,
  JENIS_LABEL,
  KOLEKTIBILITAS_LABEL,
} from "@/features/sp/label";
import { SPWithNasabah } from "@/features/sp/schema";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type Approval = SPWithNasabah["approvals"][number];

export default function CetakSPPage() {
  const params = useParams<{ id: string }>();
  const { data: sp, isLoading } = useGetDetailSP(params.id);
  const { data: kejaksaanList } = useGetAllKepalaKejaksaan();
  const { mutate: setKejaksaan } = useSetKejaksaanSP();

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Memuat...</p>;
  }
  if (!sp) {
    return (
      <p className="p-8 text-sm text-muted-foreground">
        Surat peringatan tidak ditemukan.
      </p>
    );
  }

  const verifikasiUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verifikasi/${sp.id}`
      : "";
  const penandaTangan = sp.approvals
    .filter((a) => a.status === "DISETUJUI")
    .at(-1);

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-0">
      <style>{`
        @page {
          size: 215mm 330mm; /* F4 / Folio */
          margin: 15mm 25mm; /* extra left/right margin */
        }
      `}</style>

      <div className="mb-6 flex items-center justify-end gap-2 print:hidden">
        {sp.jenis === "PEMBERITAHUAN_SKK" && (
          <Select
            value={sp.kejaksaanId ?? undefined}
            onValueChange={(value) =>
              setKejaksaan({ id: sp.id, kejaksaanId: value })
            }
          >
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Pilih Kepala Kejaksaan Negeri (Penerima Kuasa)" />
            </SelectTrigger>
            <SelectContent>
              {kejaksaanList?.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.nama} — {k.jabatan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      <div className="relative rounded-lg border bg-white p-10 text-sm text-black print:border-none print:p-0">
        {/* Watermark logo, centered behind the letter content */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-72 -translate-x-1/2 -translate-y-1/2 opacity-[0.2] print:opacity-20"
        />

        {/* thead/tfoot repeat on every printed page (incl. print-to-PDF);
            a plain flex/div layout only shows them once. */}
        <table className="relative z-10 w-full border-collapse">
          <thead>
            <tr>
              <td className="p-0 pb-4">
                <KopSurat tanggalSurat={sp.tanggalSurat} />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="space-y-3 p-0 py-2 align-top">
                {sp.jenis === "PEMBERITAHUAN_SKK" ? (
                  <SuratKuasaKhususBody
                    sp={sp}
                    penandaTangan={penandaTangan}
                    verifikasiUrl={verifikasiUrl}
                  />
                ) : (
                  <SuratPeringatanBody
                    sp={sp}
                    penandaTangan={penandaTangan}
                    verifikasiUrl={verifikasiUrl}
                  />
                )}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="p-0 pt-4">
                <FooterKopSurat />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function KopSurat({ tanggalSurat }: { tanggalSurat: Date }) {
  return (
    <div className="flex items-start justify-between border-b-2 border-black pb-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-bawon.svg" alt="Bank Wonosobo" className="h-9" />
      <p className="text-xs">Wonosobo, {formatDate(tanggalSurat)}</p>
    </div>
  );
}

function FooterKopSurat() {
  return (
    <div className="border-t pt-2 text-center text-[9px] text-neutral-500">
      <p className="font-bold">KANTOR PUSAT</p>
      <p>
        Jl. Ahmad Yani No. 160 Wonosobo Telp.(0286) 322575, 321293, Fax. (0286)
        325067
      </p>
      <p>Email: bank.wonosobo@yahoo.com, www.bank wonosobo.co.id</p>
    </div>
  );
}

function TandaTanganBank({
  penandaTangan,
  verifikasiUrl,
}: {
  penandaTangan: Approval | undefined;
  verifikasiUrl: string;
}) {
  if (!penandaTangan) return null;

  return (
    <div className="w-56 space-y-0.5 text-center text-xs">
      <p>PT. BPR BANK WONOSOBO (PERSERODA)</p>
      <p className="text-[10px] text-neutral-500">
        Disetujui secara elektronik oleh
      </p>
      <p className="font-medium">
        {penandaTangan.approver.jabatan ?? "Direktur Utama"}
      </p>

      <div className="flex flex-col items-center gap-0.5 py-1">
        {verifikasiUrl && (
          <QRCodeSVG
            value={verifikasiUrl}
            size={64}
            level="H"
            imageSettings={{
              src: "/logo-icon.png",
              height: 16,
              width: 16,
              excavate: true,
            }}
          />
        )}
      </div>

      <p className="font-bold underline">{penandaTangan.approver.nama}</p>
      {penandaTangan.approvedAt && (
        <p className="text-[10px] text-neutral-500">
          Disetujui: {formatDate(penandaTangan.approvedAt)}
        </p>
      )}

      <p className="pt-1 text-[9px] leading-snug text-neutral-500">
        Dokumen ini sah tanpa tanda tangan basah. Keaslian dokumen dapat
        diverifikasi dengan memindai QR Code.
      </p>
    </div>
  );
}

function StatBlock({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="text-neutral-500">{label}</p>
      <p className={cn(bold && "font-bold")}>{value}</p>
    </div>
  );
}

// ─── Surat Peringatan / Pemberitahuan (ke nasabah) ──────────────────────────

function SuratPeringatanBody({
  sp,
  penandaTangan,
  verifikasiUrl,
}: {
  sp: SPWithNasabah;
  penandaTangan: Approval | undefined;
  verifikasiUrl: string;
}) {
  const totalKewajiban =
    sp.tgkPokok + sp.tgkBunga + (sp.biayaAdministrasi ?? 0);

  return (
    <>
      <div className="grid grid-cols-[4.5rem_0.75rem_1fr] text-xs">
        <span>No</span>
        <span>:</span>
        <span>{sp.nomorSurat ?? "-"}</span>
        <span>Lamp</span>
        <span>:</span>
        <span>-</span>
        <span>Hal</span>
        <span>:</span>
        <span className="font-bold">{JENIS_LABEL[sp.jenis] ?? sp.jenis}</span>
      </div>

      <div className="w-fit text-xs">
        <p>Kepada Yth,</p>
        <p className="font-bold underline">{sp.nasabah.nama}</p>
        <p>{sp.nasabah.alamat ?? "-"}</p>
        <p>Wonosobo</p>
      </div>

      <p className="text-xs font-bold underline">
        Surat Perjanjian Kredit No {sp.noPjm}
        {sp.tanggalAkadKredit && ` Tanggal ${formatDate(sp.tanggalAkadKredit)}`}
      </p>

      <p className="text-justify text-xs leading-snug">
        Menunjuk surat perjanjian kredit tersebut di atas, berdasarkan catatan
        administrasi PT BPR Bank Wonosobo (PERSERODA), berikut kewajiban kredit
        Saudara posisi tanggal {formatDate(sp.tanggalSurat)} untuk segera
        diselesaikan, dengan rincian sebagai berikut :
      </p>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <StatBlock label="Jenis Fasilitas" value={sp.jenisFasilitas ?? "-"} />
        <StatBlock
          label="Tanggal Akad Kredit"
          value={sp.tanggalAkadKredit ? formatDate(sp.tanggalAkadKredit) : "-"}
        />
        <StatBlock
          label="Suku Bunga"
          value={sp.sukuBunga != null ? `${sp.sukuBunga}%` : "-"}
        />
        <StatBlock
          label="Kolektibilitas"
          value={
            KOLEKTIBILITAS_LABEL[sp.kolektibilitas] ?? String(sp.kolektibilitas)
          }
        />
        <StatBlock label="Plafond" value={formatCurrency(sp.plafond)} />
        <StatBlock label="Baki Debet" value={formatCurrency(sp.saldo)} />
        <StatBlock
          label="Tunggakan Pokok"
          value={`${formatCurrency(sp.tgkPokok)} (${sp.tgkPokokHari} hari)`}
        />
        <StatBlock
          label="Tunggakan Bunga"
          value={`${formatCurrency(sp.tgkBunga)} (${sp.tgkBungaHari} hari)`}
        />
        <StatBlock
          label="Biaya Administrasi"
          value={formatCurrency(sp.biayaAdministrasi ?? 0)}
        />
        <StatBlock
          label="Total Kewajiban"
          value={formatCurrency(totalKewajiban)}
          bold
        />
      </div>

      <p className="text-[10px] italic">
        Catatan : Kewajiban di atas belum termasuk bunga, denda, dan biaya lain
        yang timbul kemudian.
      </p>

      <p className="text-justify text-xs leading-snug">
        Mengingat sampai saat ini kami belum mendapatkan kepastian penyelesaian
        kewajiban tersebut, kami harap Saudara segera menyelesaikan/melunasi
        kewajiban selambat-lambatnya tanggal {formatDate(sp.tanggalJatuhTempo)}.
      </p>

      <p className="text-xs">
        Demikian, atas perhatian dan kerjasama Saudara kami sampaikan
        terimakasih.
      </p>

      <div className="ml-auto w-fit">
        <TandaTanganBank
          penandaTangan={penandaTangan}
          verifikasiUrl={verifikasiUrl}
        />
      </div>
    </>
  );
}

// ─── Surat Kuasa Khusus (ke Kejaksaan Negeri) ───────────────────────────────

function SuratKuasaKhususBody({
  sp,
  penandaTangan,
  verifikasiUrl,
}: {
  sp: SPWithNasabah;
  penandaTangan: Approval | undefined;
  verifikasiUrl: string;
}) {
  return (
    <>
      <div className="text-center">
        <h1 className="tracking-[0.3em] font-bold">SURAT KUASA KHUSUS</h1>
        <p>Nomor : {sp.nomorSurat ?? "-"}</p>
      </div>

      <p>Yang bertanda tangan dibawah ini :</p>

      <div className="space-y-2">
        <p className="font-bold">I. PT. BPR BANK WONOSOBO (Perseroda)</p>
        <p className="text-justify leading-relaxed">
          Dalam hal ini diwakili oleh{" "}
          <span className="font-bold">
            {penandaTangan?.approver.nama ?? "____________________"}
          </span>{" "}
          yang bertindak dalam jabatannya selaku{" "}
          {penandaTangan?.approver.jabatan ?? "Direktur Utama"} PT. BPR Bank
          Wonosobo (Perseroda), berkedudukan di Jalan Ahmad Yani Nomor 160,
          Kelurahan Wonosobo Barat, Kecamatan Wonosobo, Kabupaten Wonosobo,
          Propinsi Jawa Tengah. Selanjutnya disebut sebagai{" "}
          <span className="font-bold">&ldquo;PEMBERI KUASA&rdquo;</span>
        </p>
      </div>

      <p>Dengan ini memberikan kuasa dengan hak substitusi kepada :</p>

      <div className="space-y-2">
        <p className="font-bold">
          II. {sp.kejaksaan?.nama ?? "____________________________________"}
        </p>
        <p className="text-justify leading-relaxed">
          {sp.kejaksaan?.jabatan ?? "Kepala Kejaksaan Negeri Wonosobo"}, yang
          beralamat di{" "}
          {sp.kejaksaan?.alamat ?? "____________________________________"} dalam
          hal ini bertindak untuk dan atas nama Kejaksaan Negeri Wonosobo yang
          selanjutnya disebut{" "}
          <span className="font-bold">&ldquo;PENERIMA KUASA&rdquo;</span>
        </p>
      </div>

      <p className="text-center font-bold tracking-widest">K H U S U S</p>

      <p className="text-justify leading-relaxed">
        Bertindak untuk dan atas nama serta mewakili PEMBERI KUASA dalam hal ini
        untuk melakukan penanganan atas pembiayaan kredit bermasalah terhadap
        Nasabah yang menunggak kewajiban (wanprestasi) pengembalian pembiayaan
        kepada PT. BPR Bank Wonosobo (Perseroda) dengan data sebagai berikut :
      </p>

      <div className="grid grid-cols-[8rem_0.75rem_1fr]">
        <span>Nama</span>
        <span>:</span>
        <span>{sp.nasabah.nama}</span>
        <span>Alamat</span>
        <span>:</span>
        <span>{sp.nasabah.alamat ?? "-"}</span>
        <span>Plafond</span>
        <span>:</span>
        <span>{formatCurrency(sp.plafond)}</span>
        <span>Baki Debet</span>
        <span>:</span>
        <span>{formatCurrency(sp.saldo)}</span>
        <span>No Pinjaman</span>
        <span>:</span>
        <span>{sp.noPjm}</span>
        <span>Kolektibilitas</span>
        <span>:</span>
        <span>
          {KOLEKTIBILITAS_LABEL[sp.kolektibilitas] ?? sp.kolektibilitas}
        </span>
      </div>

      <p className="text-justify leading-relaxed">
        Untuk tujuan dimaksud, PENERIMA KUASA berhak untuk bertindak mewakili
        PEMBERI KUASA melakukan hal-hal sebagai berikut :
      </p>

      <div className="space-y-2 text-justify leading-relaxed">
        <p>
          a. Memanggil, mengundang, menghadirkan, menghampiri, singkatnya
          melakukan upaya dalam rangka agar Nasabah melakukan pemenuhan
          kewajiban pembayaran dan/atau pelunasan Pembiayaan kepada PEMBERI
          KUASA.
        </p>
        <p>
          b. Menerbitkan, menandatangani dan menyampaikan surat-surat peringatan
          (somasi) serta dokumen-dokumen yang diperlukan untuk penanganan
          Nasabah yang menunggak pembayaran dan/atau pelunasan pembiayaan kepada
          PEMBERI KUASA.
        </p>
        <p>
          c. Untuk melakukan segala tindakan-tindakan hukum lainnya yang
          diperkenankan oleh peraturan perundang-undangan yang berlaku serta
          dipandang perlu/baik guna keperluan sebagaimana dimaksud dalam Surat
          Kuasa ini sehingga perihal yang dikuasakan tersebut dapat dilaksanakan
          secara baik serta sah menurut hukum dengan persetujuan terlebih dahulu
          dari PEMBERI KUASA.
        </p>
        <p>
          d. PEMBERI KUASA dengan ini mengesahkan dan menerima setiap dan semua
          tindakan PENERIMA KUASA yang dilakukan berdasarkan Kuasa ini dengan
          ketentuan bahwa dalam melaksanakan setiap kewenangannya, PENERIMA
          KUASA akan melaksanakannya berdasarkan Surat Kuasa ini dan peraturan
          perundang-undangan yang berlaku.
        </p>
      </div>

      <p className="text-justify leading-relaxed">
        Kuasa ini berlaku efektif sejak tanggal ditandatangani sampai dengan
        tanggal pencabutan dan/atau penerbitan Surat Kuasa baru sebagai
        pengganti dari Surat Kuasa ini dengan PEMBERI KUASA menyatakan menerima
        seluruh tindakan PENERIMA KUASA, sepanjang dalam menjalankan kuasa ini
        PENERIMA KUASA tunduk pada hukum dan peraturan perundang-undangan yang
        berlaku.
      </p>

      <p className="text-justify leading-relaxed">
        Demikian surat kuasa ini dibuat dalam rangkap 2 (dua) serta bermaterai
        cukup dengan kekuatan hukum yang sama dan untuk dapat dipergunakan
        sebagaimana mestinya.
      </p>

      <p>Wonosobo, {formatDate(sp.tanggalSurat)}</p>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <div className="space-y-1 text-center">
          <p>PEMBERI KUASA</p>
          <div className="mx-auto w-fit">
            <TandaTanganBank
              penandaTangan={penandaTangan}
              verifikasiUrl={verifikasiUrl}
            />
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p>PENERIMA KUASA</p>
          <p>KEJAKSAAN NEGERI WONOSOBO</p>
          <div className="h-24" />
          <p className="font-bold underline">
            {sp.kejaksaan?.nama ?? "____________________________________"}
          </p>
          {sp.kejaksaan && (
            <>
              <p>
                {[
                  sp.kejaksaan.pangkat,
                  sp.kejaksaan.nip && `NIP. ${sp.kejaksaan.nip}`,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p>{sp.kejaksaan.jabatan}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
