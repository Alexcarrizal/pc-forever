import React from 'react';
import { View, Theme } from '../types';
import { HomeIcon, ShoppingCartIcon, ChartBarIcon, CashIcon, UsersIcon, CubeIcon, CogIcon, SunIcon, MoonIcon, DocumentTextIcon, WrenchScrewdriverIcon, ArrowDownOnSquareIcon, DevicePhoneMobileIcon, ClipboardDocumentListIcon } from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  viewName?: View;
  activeView?: View;
  onClick: (view?: View) => void;
  isInstallButton?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, viewName, activeView, onClick, isInstallButton = false }) => {
  const active = viewName === activeView;
  const baseClasses = "flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium";
  
  let dynamicClasses;
  if (isInstallButton) {
      dynamicClasses = "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/80";
  } else {
      dynamicClasses = active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700";
  }
  
  return (
    <li>
      <button onClick={() => onClick(viewName)} className={`${baseClasses} ${dynamicClasses}`}>
        <span className="mr-3 w-5 h-5">{icon}</span>
        <span>{label}</span>
      </button>
    </li>
  );
};

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  installPrompt: any;
  onInstallClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, theme, setTheme, installPrompt, onInstallClick }) => {
  
  const mainNavItems: { icon: React.ReactNode; label: string; viewName: View }[] = [
    { icon: <HomeIcon />, label: 'Dashboard', viewName: 'dashboard' },
    { icon: <ShoppingCartIcon />, label: 'Punto de Venta', viewName: 'pos' },
    { icon: <CubeIcon />, label: 'Productos', viewName: 'products' },
  ];

  const managementNavItems: { icon: React.ReactNode; label: string; viewName: View }[] = [
    { icon: <UsersIcon />, label: 'Clientes', viewName: 'clients' },
    { icon: <WrenchScrewdriverIcon />, label: 'Servicios', viewName: 'services' },
    { icon: <DevicePhoneMobileIcon />, label: 'Recargas', viewName: 'recharges' },
  ];
  
  const reportsNavItems: { icon: React.ReactNode; label: string; viewName: View }[] = [
    { icon: <DocumentTextIcon />, label: 'Reportes', viewName: 'reports' },
    { icon: <ArrowDownOnSquareIcon />, label: 'Depósitos Semanal', viewName: 'weeklyDeposits' },
    { icon: <ChartBarIcon />, label: 'Análisis de Ventas', viewName: 'salesAnalysis' },
    { icon: <CashIcon />, label: 'Caja', viewName: 'cashbox' },
  ];


  return (
    <aside className="w-52 bg-white dark:bg-slate-800 p-3 flex flex-col flex-shrink-0 border-r border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="text-slate-900 dark:text-white text-lg font-bold mb-4 px-2">
        Pc Forever
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {mainNavItems.map(item => (
            <NavItem key={item.viewName} {...item} activeView={activeView} onClick={setActiveView as any} />
          ))}
          <hr className="my-2 border-slate-200 dark:border-slate-700"/>
          {managementNavItems.map(item => (
            <NavItem key={item.viewName} {...item} activeView={activeView} onClick={setActiveView as any} />
          ))}
          <hr className="my-2 border-slate-200 dark:border-slate-700"/>
          {reportsNavItems.map(item => (
            <NavItem key={item.viewName} {...item} activeView={activeView} onClick={setActiveView as any} />
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <ul className="space-y-1.5">
          {installPrompt && (
              <NavItem 
                  icon={<ArrowDownOnSquareIcon />} 
                  label="Instalar Aplicación"
                  onClick={onInstallClick}
                  isInstallButton={true}
              />
          )}
          <NavItem icon={<CogIcon />} label="Configuración" viewName="settings" activeView={activeView} onClick={setActiveView as any} />
           <li className="px-3 py-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-full flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;