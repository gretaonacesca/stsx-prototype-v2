export const MOCK_SCAN_ID = "SC-2847";

export type PieceRecord = {
  entry: string;
  piecemark: string;
  jobNumber: string;
  sequence: string;
  locnPcs: string;
  locnWt: string;
  prevStatus: string;
  prevLocation: string;
  pcsWStatus: string;
  itemWeight: string;
  itemLength: string;
  material: string;
  sheet: string;
  shopOrder: string;
  ps: string;
  ct: string;
  wt: string;
  grade: string;
  heat: string;
  loadNumber: string;
  location: string;
  bundled: string;
  qty: string;
  width: string;
  route: string;
  lot: string;
  finish: string;
  createDate: string;
  onHold: string;
  onHoldDate: string;
  offHoldDate: string;
  division: string;
  poNumber: string;
  primaryLocation: string;
  secondaryLocation: string;
  reportQty: string;
  remains: string;
  qtyFound: string;
  qtyMovedIn: string;
  qtyMovedOut: string;
  sweepComplete: string;
  asn: string;
  lastQuantity: string;
  ordered: string;
  mill: string;
  country: string;
  bol: string;
  bundleNumber: string;
  associatedCuts: string;
  aLength: string;
  aWidth: string;
  percentComplete: string;
  heatSerial: string;
};

type PieceSeed = Partial<PieceRecord> & Pick<PieceRecord, "entry" | "piecemark" | "jobNumber">;

function piece(seed: PieceSeed): PieceRecord {
  const qty = seed.qty ?? "12";
  const status = seed.prevStatus ?? "FIT";
  const loc = seed.location ?? seed.prevLocation ?? "Bay 2";
  return {
    entry: seed.entry,
    piecemark: seed.piecemark,
    jobNumber: seed.jobNumber,
    sequence: seed.sequence ?? "1",
    locnPcs: seed.locnPcs ?? qty,
    locnWt: seed.locnWt ?? "1,200 lbs",
    prevStatus: status,
    prevLocation: seed.prevLocation ?? loc,
    pcsWStatus: seed.pcsWStatus ?? `${qty} / ${status}`,
    itemWeight: seed.itemWeight ?? "50.0 lbs",
    itemLength: seed.itemLength ?? "20'-0\"",
    material: seed.material ?? "W12×58",
    sheet: seed.sheet ?? "S-10",
    shopOrder: seed.shopOrder ?? `SO-${seed.jobNumber}`,
    ps: seed.ps ?? "P2",
    ct: seed.ct ?? qty,
    wt: seed.wt ?? seed.locnWt ?? "1,200 lbs",
    grade: seed.grade ?? "A992",
    heat: seed.heat ?? "H-8800",
    loadNumber: seed.loadNumber ?? "—",
    location: loc,
    bundled: seed.bundled ?? "No",
    qty,
    width: seed.width ?? "—",
    route: seed.route ?? "FABRICATION",
    lot: seed.lot ?? "L-01",
    finish: seed.finish ?? "Prime",
    createDate: seed.createDate ?? "2026-07-01",
    onHold: seed.onHold ?? "No",
    onHoldDate: seed.onHoldDate ?? "—",
    offHoldDate: seed.offHoldDate ?? "—",
    division: seed.division ?? "SHOP",
    poNumber: seed.poNumber ?? "PO-8000",
    primaryLocation: seed.primaryLocation ?? loc,
    secondaryLocation: seed.secondaryLocation ?? "—",
    reportQty: seed.reportQty ?? qty,
    remains: seed.remains ?? "0",
    qtyFound: seed.qtyFound ?? qty,
    qtyMovedIn: seed.qtyMovedIn ?? qty,
    qtyMovedOut: seed.qtyMovedOut ?? "0",
    sweepComplete: seed.sweepComplete ?? "No",
    asn: seed.asn ?? "—",
    lastQuantity: seed.lastQuantity ?? qty,
    ordered: seed.ordered ?? qty,
    mill: seed.mill ?? "Nucor",
    country: seed.country ?? "USA",
    bol: seed.bol ?? "—",
    bundleNumber: seed.bundleNumber ?? "—",
    associatedCuts: seed.associatedCuts ?? "0",
    aLength: seed.aLength ?? seed.itemLength ?? "20'-0\"",
    aWidth: seed.aWidth ?? "—",
    percentComplete: seed.percentComplete ?? "25",
    heatSerial: seed.heatSerial ?? seed.heat ?? "HS-8800",
  };
}

/** Demo barcodes / marks for Maze — keep Lookup empty-state examples in sync. */
export const DEMO_LOOKUP_HINTS =
  "Try SC-2847, SC-2850, job 092356 / 2401, or piecemark B-1042-A / TR-210.";

export const PIECES: PieceRecord[] = [
  piece({
    entry: "SC-2847",
    piecemark: "B-1042-A",
    jobNumber: "092356",
    sequence: "12",
    locnPcs: "24",
    locnWt: "1,840 lbs",
    prevStatus: "FIT",
    prevLocation: "Bay 2",
    pcsWStatus: "24 / WELD",
    itemWeight: "76.7 lbs",
    itemLength: "24'-6\"",
    material: "W12×58",
    sheet: "S-14",
    shopOrder: "SO-4412",
    qty: "24",
    grade: "A992",
    heat: "H-8831",
    loadNumber: "LD-4412",
    location: "Bay 2",
    route: "FABRICATION",
    lot: "L-09",
    finish: "Prime",
    createDate: "2026-07-12",
    poNumber: "PO-8841",
    asn: "ASN-2201",
    bol: "BOL-4412",
    bundleNumber: "BND-1042",
    associatedCuts: "3",
    aLength: "24'-6\"",
    percentComplete: "40",
    heatSerial: "HS-8831",
  }),
  piece({
    entry: "SC-2841",
    piecemark: "PT-3301",
    jobNumber: "1234A",
    sequence: "3",
    locnPcs: "0",
    locnWt: "0.00 lbs",
    prevStatus: "CUT",
    prevLocation: "Cut line",
    pcsWStatus: "0 / HOLD",
    itemWeight: "12.4 lbs",
    itemLength: "8'-0\"",
    material: "Purlin Z200",
    sheet: "S-02",
    shopOrder: "SO-2201",
    qty: "0",
    grade: "A36",
    heat: "H-1102",
    location: "Hold rack",
    route: "STD",
    finish: "Unpainted",
    createDate: "2026-08-01",
    onHold: "Yes",
    onHoldDate: "2026-08-08",
    poNumber: "—",
    mill: "—",
    country: "—",
    percentComplete: "0",
  }),
  piece({
    entry: "SC-2846",
    piecemark: "W-0837-B",
    jobNumber: "092356",
    sequence: "8",
    qty: "12",
    prevStatus: "WELD",
    location: "Bay 5",
    material: "Plate 12 mm",
    itemLength: "10'-4\"",
    grade: "A572",
    heat: "H-7710",
    loadNumber: "LD-4412",
    percentComplete: "65",
    finish: "Prime",
  }),
  piece({
    entry: "SC-2850",
    piecemark: "COL-C1",
    jobNumber: "2401",
    sequence: "1",
    qty: "8",
    prevStatus: "QC",
    location: "Inspect",
    material: "W14×90",
    itemLength: "32'-0\"",
    itemWeight: "288.0 lbs",
    locnWt: "2,304 lbs",
    grade: "A992",
    heat: "H-9022",
    loadNumber: "LD-4421",
    route: "FABRICATION",
    finish: "Prime",
    percentComplete: "90",
    associatedCuts: "2",
  }),
  piece({
    entry: "SC-2851",
    piecemark: "TR-210",
    jobNumber: "2401",
    sequence: "4",
    qty: "8",
    prevStatus: "PAINT",
    location: "Paint booth",
    material: "W10×45",
    itemLength: "28'-6\"",
    loadNumber: "LD-4430",
    finish: "Painted",
    percentComplete: "85",
    heat: "H-9022",
  }),
  piece({
    entry: "SC-2852",
    piecemark: "STA-15",
    jobNumber: "2418",
    sequence: "2",
    qty: "2",
    prevStatus: "FIT",
    location: "Bay 4",
    material: "C12×20.7",
    itemLength: "14'-0\"",
    loadNumber: "LD-4438",
    route: "5- PARTS-FAB-PRIME",
    percentComplete: "35",
    heat: "H-5540",
  }),
  piece({
    entry: "SC-2853",
    piecemark: "HB-1001",
    jobNumber: "2511",
    sequence: "6",
    qty: "10",
    prevStatus: "CUT",
    location: "Cut line",
    material: "HSS 6×6×⅜",
    itemLength: "22'-0\"",
    grade: "A500",
    heat: "H-3311",
    loadNumber: "LD-4441",
    percentComplete: "15",
  }),
  piece({
    entry: "SC-2854",
    piecemark: "RAIL-3",
    jobNumber: "2502",
    sequence: "1",
    qty: "4",
    prevStatus: "SHIP",
    location: "Final ship",
    material: "Rail seat fab",
    itemLength: "6'-0\"",
    loadNumber: "LD-4433",
    finish: "Galvanize",
    percentComplete: "100",
    bol: "BOL-4433",
  }),
  piece({
    entry: "SC-2855",
    piecemark: "GRT-01",
    jobNumber: "2418",
    sequence: "9",
    qty: "9",
    prevStatus: "WELD",
    location: "Bay 3",
    material: "Grating frame",
    itemLength: "4'-0\"",
    aWidth: "3'-0\"",
    width: "3'-0\"",
    loadNumber: "LD-4438",
    bundled: "Yes",
    bundleNumber: "BND-GRT",
    percentComplete: "55",
  }),
  piece({
    entry: "SC-2856",
    piecemark: "CL-5510",
    jobNumber: "2247",
    sequence: "14",
    qty: "60",
    prevStatus: "ANGLELINE",
    location: "Angle line",
    material: "L4×4×⅜",
    itemLength: "1'-6\"",
    grade: "A36",
    heat: "H-2208",
    loadNumber: "LD-4418",
    route: "2- PARTS-NO FAB-BLACK",
    finish: "Unpainted",
    percentComplete: "20",
  }),
  piece({
    entry: "SC-2857",
    piecemark: "BR-8821",
    jobNumber: "2511",
    sequence: "11",
    qty: "18",
    prevStatus: "BANDSAW",
    location: "Bandsaw",
    material: "Ø1\" rod",
    itemLength: "12'-0\"",
    grade: "A36",
    heat: "H-1188",
    loadNumber: "LD-4441",
    percentComplete: "10",
  }),
  piece({
    entry: "SC-2858",
    piecemark: "EP-0442",
    jobNumber: "092356",
    sequence: "5",
    qty: "16",
    prevStatus: "QC",
    location: "Inspect",
    material: "Plate 20 mm",
    itemLength: "1'-2\"",
    aWidth: "0'-10\"",
    width: "0'-10\"",
    grade: "A36",
    heat: "H-8831",
    loadNumber: "LD-4412",
    percentComplete: "95",
    associatedCuts: "1",
  }),
  piece({
    entry: "SC-2859",
    piecemark: "HAN-02",
    jobNumber: "2520",
    sequence: "20",
    qty: "36",
    prevStatus: "PAINT",
    location: "Paint booth",
    material: "Pipe 1½\"",
    itemLength: "3'-6\"",
    loadNumber: "LD-4430",
    finish: "Painted",
    route: "PAINTED",
    percentComplete: "80",
  }),
  piece({
    entry: "SC-2860",
    piecemark: "SP-2890",
    jobNumber: "2520",
    sequence: "7",
    qty: "20",
    prevStatus: "FIT",
    location: "Bay 2",
    material: "Plate 16 mm",
    itemLength: "2'-0\"",
    loadNumber: "LD-4450",
    percentComplete: "45",
  }),
  piece({
    entry: "SC-2861",
    piecemark: "C-1199",
    jobNumber: "2520",
    sequence: "3",
    qty: "4",
    prevStatus: "WELD",
    location: "Bay 5",
    material: "Plate 25 mm",
    itemLength: "2'-6\"",
    loadNumber: "LD-4450",
    percentComplete: "70",
  }),
  piece({
    entry: "SC-2862",
    piecemark: "W16-67",
    jobNumber: "2401",
    sequence: "2",
    qty: "6",
    prevStatus: "SHIP",
    location: "Yard Bay 1",
    material: "W16×67",
    itemLength: "40'-0\"",
    locnWt: "16,080 lbs",
    itemWeight: "2,680 lbs",
    loadNumber: "LD-4421",
    bol: "BOL-4421",
    percentComplete: "100",
  }),
  piece({
    entry: "SC-2863",
    piecemark: "LUG-88",
    jobNumber: "2502",
    sequence: "8",
    qty: "16",
    prevStatus: "COMPLETED",
    location: "Ship dock",
    material: "Lift lug fab",
    itemLength: "0'-8\"",
    finish: "Prime",
    percentComplete: "100",
    loadNumber: "LD-4433",
  }),
  piece({
    entry: "SC-2864",
    piecemark: "FB-330",
    jobNumber: "2310",
    sequence: "1",
    qty: "0",
    prevStatus: "HOLD",
    location: "Hold rack",
    material: "Flat Bar ½×4",
    itemLength: "20'-0\"",
    onHold: "Yes",
    onHoldDate: "2026-08-18",
    grade: "A36",
    heat: "H-0099",
    percentComplete: "5",
    pcsWStatus: "0 / HOLD",
  }),
  piece({
    entry: "SC-2865",
    piecemark: "IN-HEAT",
    jobNumber: "2533",
    sequence: "1",
    qty: "32",
    prevStatus: "RECV",
    location: "Receiving",
    material: "Plate pack inbound",
    itemLength: "—",
    asn: "ASN-2290",
    heat: "H-9901",
    mill: "Nucor",
    loadNumber: "LD-4445",
    route: "1- TFS",
    percentComplete: "0",
    sweepComplete: "No",
  }),
  piece({
    entry: "SC-2866",
    piecemark: "CAP-09",
    jobNumber: "1234B",
    sequence: "15",
    qty: "12",
    prevStatus: "ERECT",
    location: "Staging",
    material: "Cap Plate ¾\"",
    itemLength: "1'-0\"",
    finish: "Unpainted",
    percentComplete: "100",
    route: "UNPAINTED",
  }),
];

export function findPiece(q: {
  entry?: string;
  jobNumber?: string;
  piecemark?: string;
}): PieceRecord | null {
  const entry = q.entry?.trim().toLowerCase();
  const job = q.jobNumber?.trim().toLowerCase();
  const mark = q.piecemark?.trim().toLowerCase();
  if (!entry && !job && !mark) return null;
  return (
    PIECES.find((p) => {
      const hitEntry = entry ? p.entry.toLowerCase() === entry || p.piecemark.toLowerCase() === entry : true;
      const hitJob = job ? p.jobNumber.toLowerCase() === job : true;
      const hitMark = mark ? p.piecemark.toLowerCase() === mark : true;
      return hitEntry && hitJob && hitMark;
    }) ?? null
  );
}

export function lookupByEntry(entry: string): PieceRecord {
  const id = entry.trim();
  return PIECES.find((p) => p.entry === id || p.piecemark === id) ?? PIECES[0];
}

/** List piecemarks for a job (desktop Find Piecemark / demos). */
export function piecesForJob(jobNumber: string): PieceRecord[] {
  const job = jobNumber.trim().toLowerCase();
  if (!job) return [];
  return PIECES.filter((p) => p.jobNumber.toLowerCase() === job);
}
