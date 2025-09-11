



import React, { useState, useRef } from 'react';
import { RateType, BusinessInfo, TieredServicePricing } from '../types';
import RatesConfigModal from './RatesConfigModal';
import ChangePinModal from './ChangePinModal';
import { BusinessIcon, PriceTagIcon, ShieldCheckIcon, WarningIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons';

// @ts-ignore
const XLSX = window.XLSX;

interface SettingsProps {
  rates: RateType[];
  setRates: React.Dispatch<React.SetStateAction<RateType[]>>;
  businessInfo: BusinessInfo;
  onSaveBusinessInfo: (info: BusinessInfo) => void;
  onResetWeeklyReport: () => void;
  allData: Record<string, any>;
  onRestoreAllData: (data: Record<string, any>) => void;
  onBackupComplete: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    rates, setRates, businessInfo, onSaveBusinessInfo, 
    onResetWeeklyReport, allData, onRestoreAllData, onBackupComplete 
}) => {
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  
  const [localBusinessInfo, setLocalBusinessInfo] = useState<BusinessInfo>(businessInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBusinessInfo({ ...localBusinessInfo, [e.target.name]: e.target.value });
  };
  
  const handleSaveInfo = () => {
    onSaveBusinessInfo(localBusinessInfo);
    alert('Información del negocio guardada.');
  }

  const sheetMap: Record<string, string> = {
    'Info Negocio': 'businessInfo',
    'Credenciales Admin': 'admin',
    'Módulos': 'modules',
    'Clientes': 'clients',
    'Productos': 'products',
    'Categorías': 'categories',
    'Tarifas Renta': 'rates',
    'Flujo de Caja': 'cashFlow',
    'Tarjetas de Crédito': 'creditCards',
    'Tarjetas de Débito': 'debitCards',
    'Historial de Ventas': 'salesHistory',
    'Apartados': 'apartados',
    'Servicios Generales': 'services',
    'Recargas Electrónicas': 'electronicRecharges',
    'Ordenes de Servicio': 'serviceOrders',
    'Catalogo de Reparaciones': 'repairCatalog',
  };

  const handleBackup = () => {
      try {
          const wb = XLSX.utils.book_new();

          // Handle special tieredPricing object
          const { tieredPricing, ...otherData } = allData;
          if (tieredPricing && tieredPricing.fixedPrintServices && tieredPricing.fixedPrintServices.length > 0) {
              const ws = XLSX.utils.json_to_sheet(tieredPricing.fixedPrintServices);
              XLSX.utils.book_append_sheet(wb, ws, "Servicios Impresión Fijos");
          }
          if (tieredPricing && tieredPricing.procedures && tieredPricing.procedures.length > 0) {
              const ws = XLSX.utils.json_to_sheet(tieredPricing.procedures);
              XLSX.utils.book_append_sheet(wb, ws, "Tramites");
          }

          for (const sheetName in sheetMap) {
              const key = sheetMap[sheetName as keyof typeof sheetMap];
              let dataToSheet = otherData[key];

              if (!dataToSheet) continue;

              if (!Array.isArray(dataToSheet)) {
                  dataToSheet = [dataToSheet];
              }

              if (dataToSheet.length === 0) continue;

              const ws = XLSX.utils.json_to_sheet(dataToSheet);
              XLSX.utils.book_append_sheet(wb, ws, sheetName);
          }

          const today = new Date().toISOString().split('T')[0];
          XLSX.writeFile(wb, `Respaldo_PcForever_${today}.xlsx`);
          
          // Notify App component that backup is complete
          onBackupComplete();

      } catch (error) {
          console.error("Error al crear el respaldo:", error);
          alert("Ocurrió un error al crear el respaldo. Revisa la consola para más detalles.");
      }
  };
  
  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const isConfirmed = window.confirm(
          "ADVERTENCIA: Vas a restaurar los datos desde un archivo. Esta acción reemplazará TODOS los datos actuales de la aplicación y es irreversible.\n\n¿Estás seguro de que deseas continuar?"
      );

      if (!isConfirmed) {
          if(fileInputRef.current) fileInputRef.current.value = "";
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = e.target?.result;
              const wb = XLSX.read(data, { type: 'array' });
              const restoredData: Record<string, any> = {};

              // Restore from main sheet map
              for (const sheetName in sheetMap) {
                  if (wb.SheetNames.includes(sheetName)) {
                      const ws = wb.Sheets[sheetName];
                      const jsonData = XLSX.utils.sheet_to_json(ws);
                      const key = sheetMap[sheetName as keyof typeof sheetMap];
                      
                      if (key === 'businessInfo' || key === 'admin') {
                          restoredData[key] = jsonData[0] || null;
                      } else {
                          restoredData[key] = jsonData;
                      }
                  }
              }

              // Restore printing services
              const tieredPricing: Partial<TieredServicePricing> = { fixedPrintServices: [], procedures: [] };
              if (wb.SheetNames.includes("Servicios Impresión Fijos")) {
                  tieredPricing.fixedPrintServices = XLSX.utils.sheet_to_json(wb.Sheets["Servicios Impresión Fijos"]);
              }
              if (wb.SheetNames.includes("Tramites")) {
                  tieredPricing.procedures = XLSX.utils.sheet_to_json(wb.Sheets["Tramites"]);
              }
              restoredData['tieredPricing'] = tieredPricing;
              
              onRestoreAllData(restoredData);

          } catch (error) {
              console.error("Error al leer el archivo de respaldo:", error);
              alert("Ocurrió un error al leer el archivo. Asegúrate de que es un respaldo válido y no está corrupto.");
          } finally {
              if(fileInputRef.current) fileInputRef.current.value = "";
          }
      };
      reader.readAsArrayBuffer(file);
  };


  return (
    <div className="text-slate-800 dark:text-slate-200">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Configuración General</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Business Data */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <BusinessIcon className="w-6 h-6" /> Datos del Negocio
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Nombre del Negocio</label>
              <input type="text" name="name" value={localBusinessInfo.name} onChange={handleInfoChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
             <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Página Web / Facebook</label>
              <input type="text" name="website" value={localBusinessInfo.website} onChange={handleInfoChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
             <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">WhatsApp</label>
              <input type="text" name="whatsapp" value={localBusinessInfo.whatsapp} onChange={handleInfoChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
            <div className="pt-2">
              <button onClick={handleSaveInfo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Guardar Información</button>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white"><PriceTagIcon /> Tarifas de Renta</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Gestiona las tarifas por tiempo para PCs y consolas.</p>
             <button onClick={() => setIsRatesModalOpen(true)} className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold">Configurar Tarifas</button>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white"><ShieldCheckIcon /> Seguridad</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Cambia tu PIN de administrador para acceder al sistema.</p>
             <button onClick={() => setIsPinModalOpen(true)} className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold">Cambiar PIN</button>
          </div>
        </div>
      </div>
      
      {/* Backup & Restore */}
      <div className="mt-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Respaldo y Restauración</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Guarda todos los datos de tu aplicación en un archivo de Excel o restaura desde un respaldo previo. Es recomendable hacer respaldos frecuentes.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                  onClick={handleBackup}
                  className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-colors"
              >
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  Respaldar Datos
              </button>
              <button
                  onClick={handleRestoreClick}
                  className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-md transition-colors"
              >
                  <ArrowUpTrayIcon className="w-6 h-6" />
                  Restaurar Datos
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx, .xls" className="hidden"/>
          </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 bg-red-100/50 dark:bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-3">
              <WarningIcon className="w-6 h-6" />
              Zona de Peligro
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              La siguiente acción reiniciará los datos del reporte semanal. Esto es útil para pruebas o para forzar un nuevo comienzo de semana. Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 text-right">
              <button
                  onClick={onResetWeeklyReport}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
              >
                  Reiniciar Reporte Semanal Ahora
              </button>
          </div>
      </div>

      <RatesConfigModal 
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        rates={rates}
        setRates={setRates}
      />
      <ChangePinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
};

export default Settings;