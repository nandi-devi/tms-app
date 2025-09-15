import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import type { LorryReceipt, CompanyInfo } from '../types';
import { LorryReceiptDocument } from './LorryReceiptDocument';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatDate, numberToWords } from '../services/utils';

interface LorryReceiptViewProps {
  lorryReceipt: LorryReceipt;
  companyInfo: CompanyInfo;
}

export const LorryReceiptView: React.FC<LorryReceiptViewProps> = ({ lorryReceipt, companyInfo }) => {
  const { consignor, consignee, vehicle } = lorryReceipt;

  // Using inline styles for simplicity, but could be moved to a CSS file or a style object
  return (
    <div className="bg-white p-8 text-xs font-sans shadow-lg" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="flex justify-between items-start mb-5 pb-2 border-b-2 border-black">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
          <p className="text-gray-600">{companyInfo.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-orange-600">PREVIEW COPY</h2>
          <p><span className="font-bold">LR No:</span> {lorryReceipt.lrNumber}</p>
          <p><span className="font-bold">Date:</span> {formatDate(lorryReceipt.date)}</p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="border border-gray-300 rounded p-3 w-[48%]">
          <h3 className="text-sm font-bold mb-2">Consignor</h3>
          <p>{consignor?.name}</p>
          <p className="text-gray-600">{consignor?.address}</p>
          <p><span className="font-bold">GSTIN:</span> {consignor?.gstin}</p>
        </div>
        <div className="border border-gray-300 rounded p-3 w-[48%]">
          <h3 className="text-sm font-bold mb-2">Consignee</h3>
          <p>{consignee?.name}</p>
          <p className="text-gray-600">{consignee?.address}</p>
          <p><span className="font-bold">GSTIN:</span> {consignee?.gstin}</p>
        </div>
      </div>

      <div className="border border-gray-300 rounded p-3 flex justify-between mb-4">
        <p><span className="font-bold">From:</span> {lorryReceipt.from}</p>
        <p><span className="font-bold">To:</span> {lorryReceipt.to}</p>
        <p><span className="font-bold">Vehicle No:</span> {vehicle?.number}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">Packages</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-r">Count</th>
              <th className="p-2 border-r">Packing</th>
              <th className="p-2 border-r">Description</th>
              <th className="p-2">Weight (Act/Chg)</th>
            </tr>
          </thead>
          <tbody>
            {lorryReceipt.packages.map((pkg, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 border-r">{pkg.count}</td>
                <td className="p-2 border-r">{pkg.packingMethod}</td>
                <td className="p-2 border-r">{pkg.description}</td>
                <td className="p-2">{pkg.actualWeight} / {pkg.chargedWeight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <div className="border border-gray-300 rounded p-3 w-[55%]">
            <p><span className="font-bold">E-Way Bill No:</span> {lorryReceipt.eWayBillNo}</p>
            <p><span className="font-bold">Value of Goods:</span> ₹{lorryReceipt.valueGoods.toLocaleString('en-IN')}</p>
            {lorryReceipt.valueGoods > 0 && <p className="text-xs italic">({numberToWords(lorryReceipt.valueGoods)} Rupees Only)</p>}
        </div>
        <div className="border border-gray-300 rounded p-3 w-[40%]">
            <h3 className="text-sm font-bold mb-2">Charges</h3>
            <div className="flex justify-between"><p>Freight:</p><p>₹{lorryReceipt.charges.freight.toFixed(2)}</p></div>
            <div className="flex justify-between"><p>Other Charges:</p><p>₹{(lorryReceipt.totalAmount - lorryReceipt.charges.freight).toFixed(2)}</p></div>
            <div className="flex justify-between border-t mt-1 pt-1">
                <p className="font-bold">Total:</p>
                <p className="font-bold">₹{lorryReceipt.totalAmount.toFixed(2)}</p>
            </div>
        </div>
      </div>

      <div className="flex justify-between mt-20 pt-5 border-t text-xs">
        <div>
            <p className="mb-10">Receiver's Signature</p>
            <p>_________________________</p>
        </div>
        <div className="text-right">
            <p className="mb-10">For {companyInfo.name}</p>
            <p>_________________________</p>
            <p>Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
};

interface LorryReceiptPDFProps {
  lorryReceipt: LorryReceipt;
  companyInfo: CompanyInfo;
  onBack: () => void;
}

const copyTypes = [
  'Original for Consignor',
  'Duplicate for Transporter',
  'Triplicate for Consignee',
  'Office Copy'
];

export const LorryReceiptPDF: React.FC<LorryReceiptPDFProps> = ({ lorryReceipt, companyInfo, onBack }) => {
  const [selections, setSelections] = useState(
    copyTypes.map(type => ({
      copyType: type,
      selected: true,
      hideCharges: false,
    }))
  );

  const handleSelectionChange = (index: number) => {
    setSelections(prev => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item));
  };

  const handleHideChargesChange = (index: number) => {
    setSelections(prev => prev.map((item, i) => i === index ? { ...item, hideCharges: !item.hideCharges } : item));
  }

  const selectedCopies = selections.filter(s => s.selected);

  const [selectedTab, setSelectedTab] = useState(selectedCopies.length > 0 ? selectedCopies[0].copyType : '');

  React.useEffect(() => {
    const newSelectedCopies = selections.filter(s => s.selected);
    if (!newSelectedCopies.find(c => c.copyType === selectedTab)) {
      setSelectedTab(newSelectedCopies.length > 0 ? newSelectedCopies[0].copyType : '');
    }
  }, [selections, selectedTab]);

  return (
    <div>
      <Card className="mb-4 sticky top-20 z-10">
        <h3 className="text-xl font-semibold mb-4">Generate Lorry Receipt Copies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {selections.map((item, index) => (
            <div key={item.copyType} className="border p-4 rounded-lg bg-slate-50">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`select-${index}`}
                  checked={item.selected}
                  onChange={() => handleSelectionChange(index)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`select-${index}`} className="ml-3 font-medium text-sm text-gray-700">{item.copyType}</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`hide-${index}`}
                  checked={item.hideCharges}
                  onChange={() => handleHideChargesChange(index)}
                  disabled={!item.selected}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor={`hide-${index}`} className="ml-3 text-sm text-gray-600">Hide Charges</label>
              </div>
            </div>
          ))}
        </div>
        <div>
          {selectedCopies.length > 0 && (
            <PDFDownloadLink
              document={
                <Document>
                  {selectedCopies.map(({ copyType, hideCharges }) => (
                    <LorryReceiptDocument
                      key={copyType}
                      lorryReceipt={lorryReceipt}
                      companyInfo={companyInfo}
                      copyType={copyType}
                      hideCharges={hideCharges}
                    />
                  ))}
                </Document>
              }
              fileName={`LR-${lorryReceipt.lrNumber}-Copies.pdf`}
            >
              {({ blob, url, loading, error }) =>
                <Button disabled={loading}>
                  {loading ? 'Generating PDF...' : `Download ${selectedCopies.length} ${selectedCopies.length === 1 ? 'Copy' : 'Copies'}`}
                </Button>
              }
            </PDFDownloadLink>
          )}
          <Button variant="secondary" onClick={onBack} className="ml-4">Back</Button>
        </div>
      </Card>

      <div className="mt-4">
          <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {selectedCopies.map((copy) => (
                      <button
                          key={copy.copyType}
                          onClick={() => setSelectedTab(copy.copyType)}
                          className={`${
                            selectedTab === copy.copyType
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                          {copy.copyType}
                      </button>
                  ))}
              </nav>
          </div>
      </div>

      <div className="mt-4" style={{ height: '100vh' }}>
        {selectedCopies.map(({ copyType, hideCharges }) => (
          <div key={copyType} style={{ display: selectedTab === copyType ? 'block' : 'none', height: '100%' }}>
            <PDFViewer width="100%" height="100%">
              <LorryReceiptDocument
                lorryReceipt={lorryReceipt}
                companyInfo={companyInfo}
                copyType={copyType}
                hideCharges={hideCharges}
              />
            </PDFViewer>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dummy Document for PDFDownloadLink typing
const Document: React.FC<{children: React.ReactNode}> = ({ children }) => <>{children}</>;
