"use client";

import { PDFViewer } from "@react-pdf/renderer";
import React from "react";
import { SanctionLetter, type SanctionData } from "./SanctionLetter";

export default function PDFViewerClient({ data }: { data: SanctionData }) {
  return (
    <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
      <SanctionLetter data={data} />
    </PDFViewer>
  );
}
