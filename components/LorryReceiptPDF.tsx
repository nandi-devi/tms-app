import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import type { LorryReceipt, CompanyInfo } from '../types';
import { LorryReceiptDocument } from './LorryReceiptDocument';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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
