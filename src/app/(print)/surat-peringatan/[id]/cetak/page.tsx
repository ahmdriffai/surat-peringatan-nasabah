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

import {
  useGetAllSP,
  useGetDetailSP,
  useSetKejaksaanSP,
} from "@/features/sp/hook";

import {
  formatCurrency,
  formatDate,
  JENIS_LABEL,
  KOLEKTIBILITAS_LABEL,
} from "@/features/sp/label";

import { SPWithNasabah } from "@/features/sp/schema";
import { cn } from "@/lib/utils";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

import { Loader2, Printer } from "lucide-react";

import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

type Approval = SPWithNasabah["approvals"][number];

/**
 * Status SP yang diperbolehkan untuk download PDF.
 */
/**
 * Level masing-masing surat peringatan.
 *
 * Digunakan untuk mencari history SP sebelumnya.
 */
const LEVEL_PERINGATAN: Partial<Record<SPWithNasabah["jenis"], number>> = {
  SP1: 1,
  SP2: 2,
  SP3: 3,
};

export default function CetakSPPage() {
  const params = useParams<{ id: string }>();

  const { data: sp, isLoading } = useGetDetailSP(params.id);

  /**
   * Semua SP digunakan untuk mengambil
   * history surat peringatan sebelumnya.
   */
  const { data: allSP } = useGetAllSP();

  const { data: kejaksaanList } = useGetAllKepalaKejaksaan();

  const { mutate: setKejaksaan } = useSetKejaksaanSP();

  const printRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableCellElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [isPrinting, setIsPrinting] = useState(false);

  /**
   * Membuka pratinjau surat sebagai PDF.
   */
  const handlePrint = async () => {
    if (!printRef.current || !sp) {
      return;
    }

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      return;
    }

    setIsPrinting(true);

    try {
      await Promise.all(
        Array.from(printRef.current.querySelectorAll("img")).map(
          async (image) => {
            if (!image.complete) {
              await new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), {
                  once: true,
                });
                image.addEventListener("error", () => resolve(), {
                  once: true,
                });
              });
            }

            await image.decode().catch(() => undefined);
          },
        ),
      );

      const [headerCanvas, bodyCanvas, footerCanvas] = await Promise.all([
        html2canvas(headerRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
        html2canvas(bodyRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
        html2canvas(footerRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
      ]);

      const pdf = new jsPDF({
        unit: "mm",
        format: [215, 330],
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 25;
      const marginY = 15;
      const contentWidth = pageWidth - marginX * 2;

      const headerHeight =
        (headerCanvas.height * contentWidth) / headerCanvas.width;
      const footerHeight =
        (footerCanvas.height * contentWidth) / footerCanvas.width;
      const bodyPageHeight =
        pageHeight - marginY * 2 - headerHeight - footerHeight;
      const bodyPixelsPerMm = bodyCanvas.width / contentWidth;
      const bodyPagePixels = Math.max(
        1,
        Math.floor(bodyPageHeight * bodyPixelsPerMm),
      );
      const pageCount = Math.max(
        1,
        Math.ceil(bodyCanvas.height / bodyPagePixels),
      );

      const headerData = headerCanvas.toDataURL("image/png");
      const footerData = footerCanvas.toDataURL("image/png");

      for (let page = 0; page < pageCount; page += 1) {
        if (page > 0) {
          pdf.addPage();
        }

        const sourceY = page * bodyPagePixels;
        const sourceHeight = Math.min(
          bodyPagePixels,
          bodyCanvas.height - sourceY,
        );
        const pageBodyCanvas = document.createElement("canvas");
        pageBodyCanvas.width = bodyCanvas.width;
        pageBodyCanvas.height = sourceHeight;
        pageBodyCanvas
          .getContext("2d")!
          .drawImage(
            bodyCanvas,
            0,
            sourceY,
            bodyCanvas.width,
            sourceHeight,
            0,
            0,
            pageBodyCanvas.width,
            pageBodyCanvas.height,
          );

        const bodyHeight = sourceHeight / bodyPixelsPerMm;

        pdf.addImage(
          headerData,
          "PNG",
          marginX,
          marginY,
          contentWidth,
          headerHeight,
        );
        pdf.addImage(
          pageBodyCanvas.toDataURL("image/png"),
          "PNG",
          marginX,
          marginY + headerHeight,
          contentWidth,
          bodyHeight,
        );
        pdf.addImage(
          footerData,
          "PNG",
          marginX,
          pageHeight - marginY - footerHeight,
          contentWidth,
          footerHeight,
        );
      }

      const filename = `${(sp.nomorSurat ?? sp.id).replace(
        /[^a-zA-Z0-9._-]/g,
        "-",
      )}.pdf`;
      const pdfUrl = URL.createObjectURL(pdf.output("blob"));

      previewWindow.document.title = `Pratinjau ${filename}`;
      previewWindow.document.body.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;height:48px;padding:0 16px;font-family:Arial,sans-serif">
          <a href="${pdfUrl}" download="${filename}">Download PDF</a>
          <span>${filename}</span>
        </div>
        <iframe src="${pdfUrl}" style="width:100%;height:calc(100vh - 48px);border:0"></iframe>
      `;
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Memuat...</p>;
  }

  if (!sp) {
    return (
      <p className="p-8 text-sm text-muted-foreground">
        Surat tidak ditemukan.
      </p>
    );
  }

  /**
   * URL untuk QR Code verifikasi surat.
   */
  const verifikasiUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verifikasi/${sp.id}`
      : "";

  /**
   * Approval terakhir yang disetujui.
   */
  const penandaTangan = sp.approvals
    .filter((a) => a.status === "DISETUJUI")
    .at(-1);

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-0">
      <style>{`
        @page {
          size: 215mm 330mm;
          margin: 15mm 25mm;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .print-page {
            width: 100%;
            margin: 0;
            padding: 0;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* =========================================================
          TOOLBAR
      ========================================================= */}
      <div className="mb-6 flex items-center justify-end gap-2 print:hidden">
        {sp.jenis === "PEMBERITAHUAN_SKK" && (
          <Select
            value={sp.kejaksaanId ?? undefined}
            onValueChange={(value) =>
              setKejaksaan({
                id: sp.id,
                kejaksaanId: value,
              })
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

        <Button disabled={isPrinting} onClick={handlePrint}>
          {isPrinting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
          {isPrinting ? "Menyiapkan pratinjau..." : "Cetak"}
        </Button>
      </div>

      {/* =========================================================
          SURAT
      ========================================================= */}
      <div
        ref={printRef}
        className={cn(
          "print-page",
          "relative",
          "rounded-lg",
          "border",
          "bg-white",
          "p-10",
          "text-sm",
          "text-black",
          "print:border-none",
          "print:p-0",
        )}
      >
        <table className="relative z-10 w-full border-collapse">
          {/* =================================================
              KOP
          ================================================= */}
          <thead>
            <tr>
              <td className="p-0 pb-5">
                <div ref={headerRef}>
                  <KopSurat tanggalSurat={sp.tanggalSurat} />
                </div>
              </td>
            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================= */}
          <tbody>
            <tr>
              <td
                ref={bodyRef}
                className="relative space-y-4 p-8 py-2 align-top"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-icon.png"
                  alt=""
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    z-0
                    w-72
                    -translate-x-1/2
                    -translate-y-1/2
                    opacity-[0.08]
                    print:opacity-[0.08]
                  "
                />

                <div className="relative z-10">
                  {sp.jenis === "PEMBERITAHUAN_SKK" ? (
                    <SuratKuasaKhususBody
                      sp={sp}
                      penandaTangan={penandaTangan}
                      verifikasiUrl={verifikasiUrl}
                    />
                  ) : sp.jenis === "SOMASI_1" ||
                    sp.jenis === "SOMASI_2" ||
                    sp.jenis === "SOMASI_3" ? (
                    <SuratSomasiBody
                      sp={sp}
                      penandaTangan={penandaTangan}
                      verifikasiUrl={verifikasiUrl}
                    />
                  ) : sp.jenis === "PEMBERITAHUAN_LELANG" ? (
                    <SuratPemberitahuanLelangBody
                      sp={sp}
                      penandaTangan={penandaTangan}
                      verifikasiUrl={verifikasiUrl}
                    />
                  ) : (
                    <SuratPeringatanBody
                      sp={sp}
                      riwayatSP={getRiwayatPeringatan(sp, allSP)}
                      penandaTangan={penandaTangan}
                      verifikasiUrl={verifikasiUrl}
                    />
                  )}
                </div>
              </td>
            </tr>
          </tbody>

          {/* =================================================
              FOOTER
          ================================================= */}
          <tfoot>
            <tr>
              <td className="p-0 pt-5">
                <div ref={footerRef}>
                  <FooterKopSurat />
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* =============================================================
   HISTORY SURAT PERINGATAN
============================================================= */

/**
 * Mengambil history SP sebelumnya
 * untuk nasabah yang sama.
 *
 * Contoh SP II:
 *
 * Surat Perjanjian Kredit...
 * Surat Peringatan I...
 *
 * Contoh SP III:
 *
 * Surat Perjanjian Kredit...
 * Surat Peringatan I...
 * Surat Peringatan II...
 */
function getRiwayatPeringatan(
  sp: SPWithNasabah,
  allSP: SPWithNasabah[] | undefined,
): SPWithNasabah[] {
  const levelSaatIni = LEVEL_PERINGATAN[sp.jenis];

  if (!levelSaatIni || !allSP) {
    return [];
  }

  return allSP
    .filter((riwayat) => {
      const levelRiwayat = LEVEL_PERINGATAN[riwayat.jenis];

      return (
        riwayat.id !== sp.id &&
        riwayat.nasabahId === sp.nasabahId &&
        levelRiwayat != null &&
        levelRiwayat < levelSaatIni &&
        riwayat.nomorSurat != null
      );
    })
    .sort(
      (a, b) =>
        (LEVEL_PERINGATAN[a.jenis] ?? 0) - (LEVEL_PERINGATAN[b.jenis] ?? 0),
    );
}

/* =============================================================
   KOP SURAT
============================================================= */

function KopSurat({ tanggalSurat }: { tanggalSurat: Date }) {
  return (
    <div className="border-b-2 border-black pb-2">
      <div className="flex items-start justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-bawon.svg" alt="Bank Wonosobo" className="h-10" />

        <p className="text-xs">Wonosobo, {formatDate(tanggalSurat)}</p>
      </div>
    </div>
  );
}

/* =============================================================
   FOOTER
============================================================= */

function FooterKopSurat() {
  return (
    <div className="border-t pt-2 text-center text-[9px] text-neutral-500">
      <p className="font-bold">KANTOR PUSAT</p>

      <p>
        Jl. Ahmad Yani No. 160 Wonosobo Telp. (0286) 322575, 321293, Fax. (0286)
        325067
      </p>

      <p>Email: bank.wonosobo@yahoo.com, www.bankwonosobo.co.id</p>
    </div>
  );
}

/* =============================================================
   TANDA TANGAN
============================================================= */

function TandaTanganBank({
  penandaTangan,
  verifikasiUrl,
}: {
  penandaTangan: Approval | undefined;

  verifikasiUrl: string;
}) {
  if (!penandaTangan) {
    return null;
  }

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
          <div className="relative size-16">
            <QRCodeSVG
              value={verifikasiUrl}
              size={64}
              level="H"
              className="size-16"
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt=""
              aria-hidden
              className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 bg-white object-contain p-0.5"
            />
          </div>
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

/* =============================================================
   STAT BLOCK
============================================================= */

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
    <div className="min-w-0">
      <p className="text-neutral-500">{label}</p>

      <p className={cn("break-words", bold && "font-bold")}>{value}</p>
    </div>
  );
}

/* =============================================================
   SURAT PERINGATAN
============================================================= */

function SuratPeringatanBody({
  sp,
  riwayatSP,
  penandaTangan,
  verifikasiUrl,
}: {
  sp: SPWithNasabah;

  riwayatSP: SPWithNasabah[];

  penandaTangan: Approval | undefined;

  verifikasiUrl: string;
}) {
  const totalKewajiban =
    sp.tgkPokok + sp.tgkBunga + (sp.denda ?? 0) + (sp.biayaAdministrasi ?? 0);

  /**
   * Class khusus paragraf surat.
   *
   * indent-8:
   * paragraf pertama menjorok ke dalam.
   */
  const paragraphClass = "indent-8 text-justify text-xs leading-relaxed";

  return (
    <>
      {/* =======================================================
          NOMOR / LAMPIRAN / HAL
      ======================================================= */}
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

      {/* =======================================================
          ALAMAT PENERIMA
      ======================================================= */}
      <div className="mt-5 w-fit text-xs">
        <p>Kepada Yth,</p>

        <p className="font-bold underline">Sdr. {sp.nasabah.nama}</p>

        <p>{sp.nasabah.alamat ?? "-"}</p>

        <p>Wonosobo</p>

        <p>Di -</p>

        <p className="font-bold">WONOSOBO</p>
      </div>

      {/* =======================================================
          REFERENSI SURAT
      ======================================================= */}
      <div className="mt-5 space-y-0.5 text-xs">
        {/* PERJANJIAN KREDIT */}
        <p className="font-bold">
          Surat Perjanjian Kredit No. {sp.noPjm}
          {sp.tanggalAkadKredit &&
            ` Tanggal ${formatDateNumeric(sp.tanggalAkadKredit)}`}
        </p>

        {/* ===================================================
            HISTORY SP SEBELUMNYA

            Ini otomatis mengambil:
            SP I untuk SP II
            SP I + SP II untuk SP III
        =================================================== */}
        {riwayatSP.map((riwayat) => (
          <p className="font-bold" key={riwayat.id}>
            Surat {labelPeringatan(riwayat.jenis)} No. {riwayat.nomorSurat}{" "}
            Tanggal {formatDateNumeric(riwayat.tanggalSurat)}
          </p>
        ))}
      </div>

      {/* =======================================================
          PARAGRAF PEMBUKA
      ======================================================= */}
      <p className={cn("mt-5", paragraphClass)}>
        Menunjuk surat perjanjian kredit tersebut di atas, berdasarkan catatan
        administrasi PT BPR Bank Wonosobo (PERSERODA), berikut kewajiban kredit
        Saudara posisi tanggal {formatDate(sp.tanggalSurat)} untuk segera
        diselesaikan, dengan rincian sebagai berikut :
      </p>

      {/* =======================================================
          RINCIAN KEWAJIBAN
      ======================================================= */}
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
        <StatBlock label="Nama Debitur" value={sp.nasabah.nama} />

        <StatBlock
          label="Nomor Rekening"
          value={sp.nasabah.nomorRekening ?? sp.noPjm ?? "-"}
        />

        <StatBlock
          label="Plafond Pinjaman"
          value={formatCurrency(sp.plafond)}
        />

        <StatBlock label="Baki Debet" value={formatCurrency(sp.saldo)} />

        <StatBlock
          label="Tunggakan Pokok"
          value={`${formatCurrency(sp.tgkPokok)}`}
        />

        <StatBlock
          label="Tunggakan Bunga"
          value={`${formatCurrency(sp.tgkBunga)}`}
        />

        {sp.denda != null && sp.denda > 0 && (
          <StatBlock label="Denda" value={formatCurrency(sp.denda)} />
        )}

        {sp.biayaAdministrasi != null && sp.biayaAdministrasi > 0 && (
          <StatBlock
            label="Biaya Administrasi"
            value={formatCurrency(sp.biayaAdministrasi)}
          />
        )}

        <StatBlock
          label="TOTAL KEWAJIBAN"
          value={formatCurrency(totalKewajiban)}
          bold
        />
      </div>

      {/* =======================================================
          CATATAN
      ======================================================= */}
      <p className="mt-3 text-[10px] italic">
        Catatan : Kewajiban tersebut di atas belum termasuk bunga, denda dan
        biaya lain yang akan timbul kemudian hari.
      </p>

      {/* =======================================================
          PARAGRAF PENAGIHAN
      ======================================================= */}
      <p className={cn("mt-4", paragraphClass)}>
        Mengingat sampai saat ini kami belum mendapatkan kepastian penyelesaian
        / pembayaran kewajiban sebagaimana tercatat di atas, maka diharap
        Saudara/i untuk segera menyelesaikan/melunasi kewajiban tersebut
        selambat- lambatnya tanggal {formatDate(sp.tanggalJatuhTempo)}.
      </p>

      {/* =======================================================
          KETERANGAN
      ======================================================= */}
      {/* {sp.alasan && (
        <p className={cn("mt-3", paragraphClass)}>Keterangan: {sp.alasan}</p>
      )} */}

      {/* =======================================================
          PENUTUP
      ======================================================= */}
      <p className="mt-5 text-xs">
        Demikian, atas perhatian dan kerjasama Saudara kami sampaikan terima
        kasih.
      </p>

      {/* =======================================================
          TANDA TANGAN
      ======================================================= */}
      <div className="ml-auto mt-7 w-fit">
        <TandaTanganBank
          penandaTangan={penandaTangan}
          verifikasiUrl={verifikasiUrl}
        />
      </div>
    </>
  );
}

/* =============================================================
   LABEL PERINGATAN
============================================================= */

function labelPeringatan(jenis: SPWithNasabah["jenis"]): string {
  const label: Partial<Record<SPWithNasabah["jenis"], string>> = {
    SP1: "Peringatan I",
    SP2: "Peringatan II",
    SP3: "Peringatan III",
  };

  return label[jenis] ?? "Peringatan";
}

/* =============================================================
   FORMAT DATE DD/MM/YYYY
============================================================= */

function formatDateNumeric(date: Date): string {
  const value = new Date(date);

  const day = String(value.getDate()).padStart(2, "0");

  const month = String(value.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${value.getFullYear()}`;
}

/* =============================================================
   SURAT SOMASI
============================================================= */

function SuratSomasiBody({
  sp,
  penandaTangan,
  verifikasiUrl,
}: {
  sp: SPWithNasabah;

  penandaTangan: Approval | undefined;

  verifikasiUrl: string;
}) {
  const totalKewajiban =
    sp.tgkPokok + sp.tgkBunga + (sp.denda ?? 0) + (sp.biayaAdministrasi ?? 0);

  const batasHari = sp.batasWaktuHari ?? 7;

  const paragraphClass = "indent-8 text-justify text-xs leading-relaxed";

  return (
    <>
      <div className="grid grid-cols-[4.5rem_0.75rem_1fr] text-xs">
        <span>No</span>
        <span>:</span>
        <span>{sp.nomorSurat ?? "-"}</span>

        <span>Sifat</span>
        <span>:</span>
        <span className="font-bold">PENTING / RAHASIA</span>

        <span>Lamp</span>
        <span>:</span>
        <span>-</span>

        <span>Hal</span>
        <span>:</span>
        <span className="font-bold uppercase underline">
          {JENIS_LABEL[sp.jenis] ?? sp.jenis} (TEGURAN HUKUM)
        </span>
      </div>

      <div className="mt-5 ms-auto w-fit text-xs">
        <p>Kepada Yth,</p>

        <p className="font-bold underline">{sp.nasabah.nama}</p>

        <p>{sp.nasabah.alamat ?? "-"}</p>

        <p className="ms-2">Wonosobo</p>
      </div>

      <p className="mt-5 text-xs font-bold underline">
        Perihal: Surat Perjanjian Kredit No. {sp.noPjm}
        {sp.tanggalAkadKredit && ` Tanggal ${formatDate(sp.tanggalAkadKredit)}`}
      </p>

      <p className={cn("mt-5", paragraphClass)}>
        Dengan hormat, menunjuk Surat Perjanjian Kredit tersebut di atas,
        bersama ini kami sampaikan bahwa berdasarkan catatan administrasi dan
        pembukuan PT BPR Bank Wonosobo (PERSERODA), fasilitas kredit Saudara
        saat ini berada dalam status <strong>Wanprestasi (Cidera Janji)</strong>{" "}
        karena tidak melaksanakan kewajiban pembayaran angsuran sebagaimana yang
        telah diperjanjikan.
      </p>

      <p className={cn("mt-4", paragraphClass)}>
        Adapun rincian kewajiban kredit Saudara yang telah menunggak posisi per
        tanggal {formatDate(sp.tanggalSurat)} adalah sebagai berikut:
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <StatBlock
          label="No. Rekening / CIF"
          value={`${sp.nasabah.nomorRekening} / ${sp.nasabah.cif ?? "-"}`}
        />

        <StatBlock
          label="Kolektibilitas Kredit"
          value={
            KOLEKTIBILITAS_LABEL[sp.kolektibilitas] ?? String(sp.kolektibilitas)
          }
        />

        <StatBlock
          label="Plafond Pinjaman"
          value={formatCurrency(sp.plafond)}
        />

        <StatBlock label="Baki Debet Pokok" value={formatCurrency(sp.saldo)} />

        <StatBlock
          label="Tunggakan Pokok"
          value={`${formatCurrency(sp.tgkPokok)} (${sp.tgkPokokHari} hari)`}
        />

        <StatBlock
          label="Tunggakan Bunga"
          value={`${formatCurrency(sp.tgkBunga)} (${sp.tgkBungaHari} hari)`}
        />

        {sp.denda != null && sp.denda > 0 && (
          <StatBlock
            label="Denda Keterlambatan"
            value={formatCurrency(sp.denda)}
          />
        )}

        <StatBlock
          label="Biaya Administrasi"
          value={formatCurrency(sp.biayaAdministrasi ?? 0)}
        />

        <StatBlock
          label="TOTAL KEWAJIBAN TERTUNGGAK"
          value={formatCurrency(totalKewajiban)}
          bold
        />
      </div>

      <p className="mt-3 text-[10px] italic">
        * Catatan: Jumlah kewajiban di atas belum termasuk bunga berjalan,
        denda, dan biaya-biaya penagihan/hukum lainnya yang akan terus bertambah
        selama belum dilunasi.
      </p>

      <div className="mt-4 rounded border border-neutral-300 p-3 text-justify text-xs leading-relaxed">
        <p className="font-semibold">
          Berdasarkan ketentuan Pasal 1238 Kitab Undang-Undang Hukum Perdata
          (KUHPerdata) serta Perjanjian Kredit yang telah disepakati:
        </p>

        <p className="mt-2">
          Melalui surat ini kami memberikan{" "}
          <strong>SOMASI (TEGURAN HUKUM)</strong> kepada Saudara untuk segera
          menyelesaikan dan melunasi seluruh total kewajiban tertunggak di atas
          selambat-lambatnya dalam waktu{" "}
          <strong>
            {batasHari} ({batasHari === 7 ? "tujuh" : batasHari} ) hari kalender
          </strong>{" "}
          sejak tanggal surat ini, atau paling lambat tanggal{" "}
          <strong className="underline">
            {formatDate(sp.tanggalJatuhTempo)}
          </strong>
          .
        </p>
      </div>

      {sp.alasan && (
        <p className="mt-4 text-justify text-xs leading-relaxed">
          <strong>Keterangan Khusus:</strong> {sp.alasan}
        </p>
      )}

      <p className={cn("mt-4", paragraphClass)}>
        Apabila sampai dengan batas waktu tersebut Saudara tidak melakukan
        penyelesaian atau tidak menunjukkan itikad baik dalam penyelesaian
        kewajiban, maka PT BPR Bank Wonosobo (PERSERODA) tanpa pemberitahuan
        lagi akan menempuh langkah-langkah hukum, antara lain:
      </p>

      <ol className="mt-2 list-decimal space-y-1 pl-8 text-xs">
        <li>
          Pelaksanaan eksekusi dan pelelangan umum atas agunan/jaminan kredit
          melalui KPKNL sesuai UU Hak Tanggungan No. 4/1996 dan/atau UU Jaminan
          Fidusia No. 42/1999.
        </li>

        <li>
          Gugatan perdata dan/atau laporan hukum melalui instansi penegak hukum
          yang berwenang.
        </li>

        <li>
          Pelaporan status kolektibilitas macet pada Sistem Layanan Informasi
          Keuangan (SLIK) Otoritas Jasa Keuangan (OJK).
        </li>
      </ol>

      <p className="mt-4 text-xs">
        Demikian Surat Somasi ini kami sampaikan agar menjadi perhatian penuh
        dan segera diselesaikan sebagaimana mestinya.
      </p>

      <div className="ml-auto mt-7 w-fit">
        <TandaTanganBank
          penandaTangan={penandaTangan}
          verifikasiUrl={verifikasiUrl}
        />
      </div>
    </>
  );
}

/* =============================================================
   SURAT PEMBERITAHUAN LELANG
============================================================= */

function SuratPemberitahuanLelangBody({
  sp,
  penandaTangan,
  verifikasiUrl,
}: {
  sp: SPWithNasabah;

  penandaTangan: Approval | undefined;

  verifikasiUrl: string;
}) {
  const totalKewajiban =
    sp.tgkPokok + sp.tgkBunga + (sp.denda ?? 0) + (sp.biayaAdministrasi ?? 0);

  const paragraphClass = "indent-8 text-justify text-xs leading-relaxed";

  return (
    <>
      <div className="grid grid-cols-[4.5rem_0.75rem_1fr] text-xs">
        <span>No</span>
        <span>:</span>
        <span>{sp.nomorSurat ?? "-"}</span>

        <span>Sifat</span>
        <span>:</span>
        <span className="font-bold">PENTING</span>

        <span>Lamp</span>
        <span>:</span>
        <span>-</span>

        <span>Hal</span>
        <span>:</span>
        <span className="font-bold uppercase underline">
          PEMBERITAHUAN RENCANA PELAKSANAAN LELANG EKSEKUSI
        </span>
      </div>

      <div className="mt-5 w-fit text-xs ">
        <p>Kepada Yth,</p>

        <p className="font-bold underline">{sp.nasabah.nama}</p>

        <p>{sp.nasabah.alamat ?? "-"}</p>

        <p>Wonosobo</p>
      </div>

      <div className="mt-5 text-xs">
        <p className="font-bold underline">Dasar Hukum & Dokumen Rujukan:</p>

        <ol className="list-decimal pl-5">
          <li>
            Surat Perjanjian Kredit No. {sp.noPjm}
            {sp.tanggalAkadKredit &&
              ` Tanggal ${formatDate(sp.tanggalAkadKredit)}`}
          </li>

          <li>
            Surat-surat Peringatan dan Surat Somasi yang telah diterbitkan
            sebelumnya.
          </li>

          <li>
            Pasal 6 Undang-Undang No. 4 Tahun 1996 tentang Hak Tanggungan atas
            Tanah Beserta Benda-Benda yang Berkaitan dengan Tanah / UU No. 42
            Tahun 1999 tentang Jaminan Fidusia.
          </li>
        </ol>
      </div>

      <p className={cn("mt-5", paragraphClass)}>
        Dengan hormat, menunjuk dasar rujukan di atas, diberitahukan bahwa
        hingga saat ini Saudara belum juga melunasi kewajiban kredit Saudara
        pada PT BPR Bank Wonosobo (PERSERODA) yang telah jatuh tempo dan
        menunggak sebesar:
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <StatBlock
          label="Plafond Pinjaman"
          value={formatCurrency(sp.plafond)}
        />

        <StatBlock label="Baki Debet Pokok" value={formatCurrency(sp.saldo)} />

        <StatBlock
          label="Tunggakan Pokok"
          value={`${formatCurrency(sp.tgkPokok)} (${sp.tgkPokokHari} hari)`}
        />

        <StatBlock
          label="Tunggakan Bunga"
          value={`${formatCurrency(sp.tgkBunga)} (${sp.tgkBungaHari} hari)`}
        />

        {sp.denda != null && sp.denda > 0 && (
          <StatBlock
            label="Denda Keterlambatan"
            value={formatCurrency(sp.denda)}
          />
        )}

        <StatBlock
          label="Biaya Administrasi"
          value={formatCurrency(sp.biayaAdministrasi ?? 0)}
        />

        <StatBlock
          label="TOTAL KEWAJIBAN"
          value={formatCurrency(totalKewajiban)}
          bold
        />
      </div>

      <p className="mt-3 text-[10px] italic">
        * Catatan: Jumlah kewajiban di atas belum termasuk bunga berjalan,
        denda, dan biaya-biaya penagihan/hukum lainnya yang akan terus bertambah
        selama belum dilunasi.
      </p>

      <p className={cn("mt-4", paragraphClass)}>
        Oleh karena upaya pembinaan dan somasi yang kami berikan tidak
        membuahkan hasil, bersama ini kami sampaikan pemberitahuan resmi bahwa
        PT BPR Bank Wonosobo (PERSERODA) akan melaksanakan{" "}
        <strong>Lelang Eksekusi</strong> melalui{" "}
        <strong>
          {sp.kpknl ?? "Kantor Pelayanan Kekayaan Negara dan Lelang (KPKNL)"}
        </strong>{" "}
        terhadap objek agunan/jaminan kredit sebagai berikut:
      </p>

      <div className="mt-4 rounded border border-neutral-300 p-3 text-xs">
        <div className="grid grid-cols-[9rem_0.75rem_1fr] gap-y-1">
          <span className="text-neutral-600">Jenis Agunan</span>
          <span>:</span>
          <span className="font-semibold">
            {sp.jenisAgunan ?? "Tanah & Bangunan"}
          </span>

          <span className="text-neutral-600">Bukti Kepemilikan</span>
          <span>:</span>
          <span className="font-semibold">{sp.dokumenAgunan ?? "-"}</span>

          <span className="text-neutral-600">Atas Nama</span>
          <span>:</span>
          <span>{sp.atasNamaAgunan ?? sp.nasabah.nama}</span>

          <span className="text-neutral-600">Lokasi Objek Agunan</span>
          <span>:</span>
          <span>{sp.lokasiAgunan ?? sp.nasabah.alamat ?? "-"}</span>

          <span className="text-neutral-600">Nilai Limit Lelang</span>
          <span>:</span>
          <span>
            {sp.nilaiLimitLelang != null && sp.nilaiLimitLelang > 0
              ? formatCurrency(sp.nilaiLimitLelang)
              : "Sesuai Penilaian Taksiran / Nilai Limit KPKNL"}
          </span>

          <span className="text-neutral-600">Kantor Pelaksana</span>
          <span>:</span>
          <span>{sp.kpknl ?? "KPKNL Purwokerto"}</span>

          <span className="text-neutral-600">Rencana Tanggal Lelang</span>
          <span>:</span>
          <span>
            {sp.tanggalLelang
              ? formatDate(sp.tanggalLelang)
              : "Akan diumumkan melalui Pengumuman Lelang resmi"}
          </span>
        </div>
      </div>

      <p className={cn("mt-4", paragraphClass)}>
        Kami masih memberikan kesempatan terakhir kepada Saudara untuk melunasi
        seluruh kewajiban pinjaman selambat-lambatnya pada tanggal{" "}
        <strong className="underline">
          {formatDate(sp.tanggalJatuhTempo)}
        </strong>{" "}
        sebelum proses lelang dan pengumuman lelang ditayangkan. Seluruh biaya
        yang timbul dalam proses lelang ini sepenuhnya dibebankan kepada
        Saudara.
      </p>

      <p className="mt-4 text-xs">
        Demikian Surat Pemberitahuan Lelang ini kami sampaikan untuk diketahui
        dan dipergunakan sebagaimana mestinya.
      </p>

      <div className="ml-auto mt-7 w-fit">
        <TandaTanganBank
          penandaTangan={penandaTangan}
          verifikasiUrl={verifikasiUrl}
        />
      </div>
    </>
  );
}

/* =============================================================
   SURAT KUASA KHUSUS
============================================================= */

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
        <h1 className="font-bold tracking-[0.3em]">SURAT KUASA KHUSUS</h1>

        <p>Nomor : {sp.nomorSurat ?? "-"}</p>
      </div>

      <p className="mt-5">Yang bertanda tangan dibawah ini :</p>

      <div className="space-y-2">
        <p className="font-bold">I. PT. BPR BANK WONOSOBO (Perseroda)</p>

        <p className="indent-8 text-justify leading-relaxed">
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

      <p className="mt-4">
        Dengan ini memberikan kuasa dengan hak substitusi kepada :
      </p>

      <div className="space-y-2">
        <p className="font-bold">
          II. {sp.kejaksaan?.nama ?? "____________________________________"}
        </p>

        <p className="indent-8 text-justify leading-relaxed">
          {sp.kejaksaan?.jabatan ?? "Kepala Kejaksaan Negeri Wonosobo"}, yang
          beralamat di{" "}
          {sp.kejaksaan?.alamat ?? "____________________________________"} dalam
          hal ini bertindak untuk dan atas nama Kejaksaan Negeri Wonosobo yang
          selanjutnya disebut{" "}
          <span className="font-bold">&ldquo;PENERIMA KUASA&rdquo;</span>
        </p>
      </div>

      <p className="mt-4 text-center font-bold tracking-widest">K H U S U S</p>

      <p className="indent-8 text-justify leading-relaxed">
        Bertindak untuk dan atas nama serta mewakili PEMBERI KUASA dalam hal ini
        untuk melakukan penanganan atas pembiayaan kredit bermasalah terhadap
        Nasabah yang menunggak kewajiban (wanprestasi) pengembalian pembiayaan
        kepada PT. BPR Bank Wonosobo (Perseroda) dengan data sebagai berikut :
      </p>

      <div className="grid grid-cols-[8rem_0.75rem_1fr] text-xs">
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

      <p className="mt-4 indent-8 text-justify leading-relaxed">
        Untuk tujuan dimaksud, PENERIMA KUASA berhak untuk bertindak mewakili
        PEMBERI KUASA melakukan hal-hal sebagai berikut :
      </p>

      <div className="space-y-2 text-justify leading-relaxed">
        <p className="indent-8">
          a. Memanggil, mengundang, menghadirkan, menghampiri, singkatnya
          melakukan upaya dalam rangka agar Nasabah melakukan pemenuhan
          kewajiban pembayaran dan/atau pelunasan Pembiayaan kepada PEMBERI
          KUASA.
        </p>

        <p className="indent-8">
          b. Menerbitkan, menandatangani dan menyampaikan surat-surat peringatan
          (somasi) serta dokumen-dokumen yang diperlukan untuk penanganan
          Nasabah yang menunggak pembayaran dan/atau pelunasan pembiayaan kepada
          PEMBERI KUASA.
        </p>

        <p className="indent-8">
          c. Untuk melakukan segala tindakan-tindakan hukum lainnya yang
          diperkenankan oleh peraturan perundang-undangan yang berlaku serta
          dipandang perlu/baik guna keperluan sebagaimana dimaksud dalam Surat
          Kuasa ini sehingga perihal yang dikuasakan tersebut dapat dilaksanakan
          secara baik serta sah menurut hukum dengan persetujuan terlebih dahulu
          dari PEMBERI KUASA.
        </p>

        <p className="indent-8">
          d. PEMBERI KUASA dengan ini mengesahkan dan menerima setiap dan semua
          tindakan PENERIMA KUASA yang dilakukan berdasarkan Kuasa ini dengan
          ketentuan bahwa dalam melaksanakan setiap kewenangannya, PENERIMA
          KUASA akan melaksanakannya berdasarkan Surat Kuasa ini dan peraturan
          perundang-undangan yang berlaku.
        </p>
      </div>

      <p className="mt-4 indent-8 text-justify leading-relaxed">
        Kuasa ini berlaku efektif sejak tanggal ditandatangani sampai dengan
        tanggal pencabutan dan/atau penerbitan Surat Kuasa baru sebagai
        pengganti dari Surat Kuasa ini dengan PEMBERI KUASA menyatakan menerima
        seluruh tindakan PENERIMA KUASA, sepanjang dalam menjalankan kuasa ini
        PENERIMA KUASA tunduk pada hukum dan peraturan perundang-undangan yang
        berlaku.
      </p>

      <p className="mt-4 indent-8 text-justify leading-relaxed">
        Demikian surat kuasa ini dibuat dalam rangkap 2 (dua) serta bermaterai
        cukup dengan kekuatan hukum yang sama dan untuk dapat dipergunakan
        sebagaimana mestinya.
      </p>

      <p className="mt-4">Wonosobo, {formatDate(sp.tanggalSurat)}</p>

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
