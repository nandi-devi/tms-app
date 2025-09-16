import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { LorryReceipt, CompanyInfo } from '../types';
import { formatDate, numberToWords } from '../services/utils';

// Register fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});
Font.register({
  family: 'Roboto Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
    // A default placeholder color
    backgroundColor: '#f0f0f0',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto Bold',
    color: '#333',
  },
  headerRight: {
    textAlign: 'right',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    padding: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Roboto Bold',
    marginBottom: 8,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'Roboto Bold',
    color: '#555',
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'Roboto Bold',
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
});

interface LorryReceiptDocumentProps {
  lorryReceipt: LorryReceipt;
  companyInfo: CompanyInfo;
  copyType?: string;
  hideCharges?: boolean;
}

export const LorryReceiptDocument: React.FC<LorryReceiptDocumentProps> = ({
  lorryReceipt,
  companyInfo,
  copyType = 'PREVIEW',
}) => {
  const { consignor, consignee, vehicle } = lorryReceipt;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image style={styles.logo} src="https://i.ibb.co/38362fy/LOGOGGOGOGO.png" />
            <View>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text>{companyInfo.address}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={{...styles.title, color: '#e67e22'}}>{copyType.toUpperCase()}</Text>
            <Text><Text style={styles.label}>LR No:</Text> {lorryReceipt.lrNumber}</Text>
            <Text><Text style={styles.label}>Date:</Text> {formatDate(lorryReceipt.date)}</Text>
          </View>
        </View>

        <View style={{...styles.row, marginBottom: 15}}>
          <View style={{...styles.box, width: '48%'}}>
            <Text style={styles.title}>Consignor</Text>
            <Text>{consignor?.name}</Text>
            <Text>{consignor?.address}</Text>
            <Text><Text style={styles.label}>GSTIN:</Text> {consignor?.gstin}</Text>
          </View>
          <View style={{...styles.box, width: '48%'}}>
            <Text style={styles.title}>Consignee</Text>
            <Text>{consignee?.name}</Text>
            <Text>{consignee?.address}</Text>
            <Text><Text style={styles.label}>GSTIN:</Text> {consignee?.gstin}</Text>
          </View>
        </View>

        <View style={{...styles.box, ...styles.row, marginBottom: 15}}>
            <Text><Text style={styles.label}>From:</Text> {lorryReceipt.from}</Text>
            <Text><Text style={styles.label}>To:</Text> {lorryReceipt.to}</Text>
            <Text><Text style={styles.label}>Vehicle No:</Text> {vehicle?.number}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Packages</Text>
          <View style={styles.table}>
            <View style={{...styles.tableRow, ...styles.tableHeader}}>
              <View style={{...styles.tableCol, width: '15%'}}><Text>Count</Text></View>
              <View style={{...styles.tableCol, width: '25%'}}><Text>Packing</Text></View>
              <View style={{...styles.tableCol, width: '35%'}}><Text>Description</Text></View>
              <View style={{...styles.tableCol, width: '25%', borderRightWidth: 0}}><Text>Weight (Act/Chg)</Text></View>
            </View>
            {lorryReceipt.packages.map((pkg, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={{...styles.tableCol, width: '15%'}}><Text>{pkg.count}</Text></View>
                <View style={{...styles.tableCol, width: '25%'}}><Text>{pkg.packingMethod}</Text></View>
                <View style={{...styles.tableCol, width: '35%'}}><Text>{pkg.description}</Text></View>
                <View style={{...styles.tableCol, width: '25%', borderRightWidth: 0}}><Text>{pkg.actualWeight} / {pkg.chargedWeight}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.row}>
            <View style={{...styles.box, width: '55%'}}>
                <Text><Text style={styles.label}>E-Way Bill No:</Text> {lorryReceipt.eWayBillNo}</Text>
                <Text><Text style={styles.label}>Value of Goods:</Text> {lorryReceipt.valueGoods.toLocaleString('en-IN')}</Text>
                {lorryReceipt.valueGoods > 0 && <Text style={{fontSize: 8, fontStyle: 'italic'}}>({numberToWords(lorryReceipt.valueGoods)} Rupees Only)</Text>}
            </View>
            <View style={{...styles.box, width: '40%'}}>
                <Text style={styles.title}>Charges</Text>
                <View style={styles.row}><Text>Freight:</Text><Text>₹{lorryReceipt.charges.freight.toFixed(2)}</Text></View>
                <View style={styles.row}><Text>Other Charges:</Text><Text>₹{(lorryReceipt.totalAmount - lorryReceipt.charges.freight).toFixed(2)}</Text></View>
                <View style={{...styles.row, borderTopWidth: 1, marginTop: 5, paddingTop: 5}}>
                    <Text style={{fontFamily: 'Roboto Bold'}}>Total:</Text>
                    <Text style={{fontFamily: 'Roboto Bold'}}>₹{lorryReceipt.totalAmount.toFixed(2)}</Text>
                </View>
            </View>
        </View>

        <View style={{...styles.footer, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <View style={{textAlign: 'left'}}>
                <Text style={{marginBottom: 20}}>Receiver's Signature</Text>
                <Text>_________________________</Text>
            </View>
            <View style={{textAlign: 'right'}}>
                <Text style={{marginBottom: 20}}>For {companyInfo.name}</Text>
                <Text>_________________________</Text>
                <Text>Authorised Signatory</Text>
            </View>
        </View>
      </Page>
    </Document>
  );
};
