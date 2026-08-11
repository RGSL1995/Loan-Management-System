import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Define generic styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  companyDetails: {
    fontSize: 9,
    color: "#666",
    textAlign: "right",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textDecoration: "underline",
  },
  section: {
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    padding: 5,
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  signatureBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

export interface SanctionData {
  loanId: string;
  date: string;
  borrowerName: string;
  borrowerAddress: string;
  borrowerPan: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  emiAmount: string;
}

export const SanctionLetter = ({ data }: { data: SanctionData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>FINBYX FINANCE LTD.</Text>
        </View>
        <View style={styles.companyDetails}>
          <Text>123 Financial District, Mumbai, India</Text>
          <Text>Email: support@finbyx.com | Phone: +91 1800-123-4567</Text>
          <Text>CIN: L65922MH2026PLC123456</Text>
        </View>
      </View>

      <Text style={styles.title}>LOAN SANCTION LETTER</Text>

      {/* Intro */}
      <View style={styles.section}>
        <Text style={{ marginBottom: 5 }}>Date: {data.date}</Text>
        <Text style={{ marginBottom: 15 }}>Ref: SANCTION/{data.loanId}</Text>
        
        <Text style={styles.bold}>To,</Text>
        <Text>{data.borrowerName}</Text>
        <Text>{data.borrowerAddress}</Text>
        <Text>PAN: {data.borrowerPan}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ marginBottom: 10, lineHeight: 1.5 }}>
          Dear {data.borrowerName},
        </Text>
        <Text style={{ marginBottom: 10, lineHeight: 1.5 }}>
          We are pleased to inform you that your application for a financial facility has been approved. 
          The facility is sanctioned subject to the following terms and conditions:
        </Text>
      </View>

      {/* Loan Details Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.bold}>Facility Type</Text></View>
          <View style={styles.tableCol}><Text>Term Loan</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.bold}>Sanctioned Amount</Text></View>
          <View style={styles.tableCol}><Text>₹ {data.loanAmount}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.bold}>Interest Rate</Text></View>
          <View style={styles.tableCol}><Text>{data.interestRate}% p.a. (Fixed)</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.bold}>Tenure</Text></View>
          <View style={styles.tableCol}><Text>{data.loanTerm} Months</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.bold}>EMI Amount</Text></View>
          <View style={styles.tableCol}><Text>₹ {data.emiAmount}</Text></View>
        </View>
      </View>

      {/* Terms */}
      <View style={styles.section}>
        <Text style={[styles.bold, { marginBottom: 5 }]}>Key Conditions:</Text>
        <Text style={{ marginBottom: 5, lineHeight: 1.5 }}>1. This sanction is valid for 30 days from the date of issue.</Text>
        <Text style={{ marginBottom: 5, lineHeight: 1.5 }}>2. Disbursement is subject to successful execution of the loan agreement and submission of required post-dated cheques/NACH mandate.</Text>
        <Text style={{ marginBottom: 5, lineHeight: 1.5 }}>3. The company reserves the right to cancel the sanction without assigning any reason prior to disbursement.</Text>
      </View>

      {/* Signatures */}
      <View style={styles.signatureBlock}>
        <View>
          <Text style={styles.signatureLine}>For Finbyx Finance Ltd.</Text>
          <Text style={{ textAlign: "center", marginTop: 5, color: "#666" }}>Authorized Signatory</Text>
        </View>
        <View>
          <Text style={styles.signatureLine}>Accepted By Borrower</Text>
          <Text style={{ textAlign: "center", marginTop: 5, color: "#666" }}>Signature</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer} fixed>
        This is a computer generated document. For verification, contact support@finbyx.com. Page 1 of 1.
      </Text>
    </Page>
  </Document>
);
