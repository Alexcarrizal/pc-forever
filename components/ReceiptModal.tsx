import React, { useRef } from 'react';
// @ts-ignore
const { jsPDF } = window.jspdf;
// @ts-ignore
const html2canvas = window.html2canvas;

import { SaleRecord, BusinessInfo } from '../types';
import { ArrowDownTrayIcon, XIcon } from './icons';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleData: SaleRecord;
    businessInfo: BusinessInfo;
}

// This component represents one half of the page (one receipt copy)
const SingleReceiptView: React.FC<{ saleData: SaleRecord; businessInfo: BusinessInfo; copyLabel: string }> = ({ saleData, businessInfo, copyLabel }) => {
    return (
        // Use flex-col and h-full to structure the receipt vertically
        <div className="p-4 text-black flex flex-col h-full font-sans text-sm">
            {/* Header */}
            <header className="flex justify-between items-start pb-2 border-b border-gray-300 relative">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{businessInfo.name}</h1>
                    <p className="text-xs text-gray-500">{businessInfo.website}</p>
                    <p className="text-xs text-gray-500">WhatsApp: {businessInfo.whatsapp}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">Nota de Remisión</h2>
                    <p className="text-xs mt-1">Folio: <span className="font-mono">{saleData.folio}</span></p>
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 text-xs font-bold text-gray-400 uppercase">{copyLabel}</div>
            </header>

            {/* Client/Sale Info */}
            <section className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                    <h3 className="font-semibold text-gray-600 uppercase tracking-wider mb-1">Cliente</h3>
                    <p className="text-gray-800">{saleData.client}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                    <h3 className="font-semibold text-gray-600 uppercase tracking-wider mb-1">Detalles</h3>
                    <p className="text-gray-800"><strong>Fecha:</strong> {new Date(saleData.date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-gray-800"><strong>Pago:</strong> {saleData.paymentMethod}</p>
                </div>
            </section>

            {/* Items Table - flex-grow to take up available space */}
            <section className="flex-grow">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-2 font-semibold w-[55%]">Descripción</th>
                            <th className="p-2 text-center font-semibold">Cant.</th>
                            <th className="p-2 text-right font-semibold">P. Unit.</th>
                            <th className="p-2 text-right font-semibold">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleData.items.map(item => (
                            <tr key={item.id} className="odd:bg-gray-50 border-b border-gray-100 last:border-0">
                                <td className="p-2 font-medium text-gray-800 align-top">
                                    {item.name}
                                    {item.barcode && <span className="block text-gray-500 font-normal font-mono">No. de serie: {item.barcode}</span>}
                                    {item.warranty && <span className="block text-gray-500 font-normal">Garantía: {item.warranty}</span>}
                                </td>
                                <td className="p-2 text-center text-gray-600 align-top">{item.quantity}</td>
                                <td className="p-2 text-right font-mono text-gray-600 align-top">${item.price.toFixed(2)}</td>
                                <td className="p-2 text-right font-mono font-semibold text-gray-800 align-top">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Totals Section */}
            <section className="mt-2 pt-2">
                <div className="w-full sm:w-1/2 ml-auto text-sm">
                    <div className="flex justify-between p-1 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Subtotal:</span>
                        <span className="font-mono text-gray-800">${saleData.subtotal.toFixed(2)}</span>
                    </div>
                    {saleData.commission && saleData.commission > 0 && (
                        <div className="flex justify-between p-1 border-b border-gray-200">
                            <span className="font-medium text-red-600">Comisión:</span>
                            <span className="font-mono text-red-600">${saleData.commission.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between p-2 mt-1 bg-gray-800 text-white rounded-md">
                        <span className="font-bold text-base">TOTAL:</span>
                        <span className="font-mono font-bold text-base">${saleData.total.toFixed(2)}</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center pt-3 text-xs text-gray-500">
                <p>¡Gracias por su compra!</p>
            </footer>
        </div>
    );
};


const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, saleData, businessInfo }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;
    
    const handleGeneratePdf = () => {
        const input = receiptRef.current;
        if (input) {
            // Using a higher scale for better PDF quality
            html2canvas(input, { scale: 3, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'letter' // [width, height] = [215.9, 279.4]
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`nota_${saleData.folio}.pdf`);
            });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4" onClick={onClose}>
            <div className="bg-slate-200 dark:bg-slate-900 rounded-xl w-full max-w-4xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-slate-300 dark:border-slate-700">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Vista Previa de Nota de Remisión</span>
                    <div className="flex gap-2">
                        <button onClick={handleGeneratePdf} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                            <ArrowDownTrayIcon className="w-5 h-5"/> Generar PDF
                        </button>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 font-semibold">
                           <XIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 flex justify-center">
                    {/* This is the container that will be converted to PDF, styled to be exactly letter size */}
                    <div 
                        ref={receiptRef} 
                        className="bg-white shadow-lg"
                        style={{ width: '215.9mm', height: '279.4mm' }}
                    >
                        {/* Use a flex container to split the page into two halves */}
                        <div className="flex flex-col h-full">
                            {/* Top half (Client Copy) */}
                            <div className="flex-1 border-b-2 border-dashed border-gray-400 overflow-hidden">
                                <SingleReceiptView saleData={saleData} businessInfo={businessInfo} copyLabel="Copia Cliente" />
                            </div>
                            {/* Bottom half (Business Copy) */}
                            <div className="flex-1 overflow-hidden">
                                <SingleReceiptView saleData={saleData} businessInfo={businessInfo} copyLabel="Copia Negocio" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;