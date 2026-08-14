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

export const PIECES: PieceRecord[] = [
  {
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
    ps: "P2",
    ct: "24",
    wt: "1,840 lbs",
    grade: "A992",
    heat: "H-8831",
    loadNumber: "LD-4412",
    location: "Bay 2",
    bundled: "No",
    qty: "24",
    width: "—",
    route: "FABRICATION",
    lot: "L-09",
    finish: "Prime",
    createDate: "2026-07-12",
    onHold: "No",
    onHoldDate: "—",
    offHoldDate: "—",
    division: "SHOP",
    poNumber: "PO-8841",
    primaryLocation: "Bay 2",
    secondaryLocation: "—",
    reportQty: "24",
    remains: "0",
    qtyFound: "24",
    qtyMovedIn: "24",
    qtyMovedOut: "0",
    sweepComplete: "No",
    asn: "ASN-2201",
    lastQuantity: "24",
    ordered: "24",
    mill: "Nucor",
    country: "USA",
    bol: "BOL-4412",
    bundleNumber: "BND-1042",
    associatedCuts: "3",
    aLength: "24'-6\"",
    aWidth: "—",
    percentComplete: "40",
    heatSerial: "HS-8831",
  },
  {
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
    ps: "—",
    ct: "0",
    wt: "0.00 lbs",
    grade: "A36",
    heat: "H-1102",
    loadNumber: "—",
    location: "Hold rack",
    bundled: "No",
    qty: "0",
    width: "—",
    route: "STD",
    lot: "—",
    finish: "Unpainted",
    createDate: "2026-08-01",
    onHold: "Yes",
    onHoldDate: "2026-08-08",
    offHoldDate: "—",
    division: "SHOP",
    poNumber: "—",
    primaryLocation: "Hold rack",
    secondaryLocation: "—",
    reportQty: "0",
    remains: "0",
    qtyFound: "0",
    qtyMovedIn: "0",
    qtyMovedOut: "0",
    sweepComplete: "No",
    asn: "—",
    lastQuantity: "0",
    ordered: "0",
    mill: "—",
    country: "—",
    bol: "—",
    bundleNumber: "—",
    associatedCuts: "0",
    aLength: "8'-0\"",
    aWidth: "—",
    percentComplete: "0",
    heatSerial: "—",
  },
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
