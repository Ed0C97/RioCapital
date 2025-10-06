import React from 'react';

const SlidingTabsNav = ({ activeTab, onTabChange, tabs }) => {
  // Questa funzione ora gestirà anche il caso in cui nessuna tab è attiva (es. 'custom' quando non è nei tabs)
  // Per sicurezza, se non trova l'indice, lo imposta a 4 (la posizione di 'Custom')
  const getActiveIndex = () => {
    const index = tabs.findIndex(tab => tab.value === activeTab);
    // Se l'utente sta inserendo un importo a mano, activeTab potrebbe non essere nei tabs.
    // In quel caso, vogliamo che la selezione visiva sia su 'Custom'.
    if (index === -1 && activeTab === 'custom') {
      return tabs.findIndex(tab => tab.value === 'custom');
    }
    return index;
  };

  const activeIndex = getActiveIndex();
  const totalTabs = tabs.length; // Calcoliamo dinamicamente il numero di tab
  const percentageWidth = 100 / totalTabs; // Calcoliamo la larghezza percentuale

  return (
    // --- RIGA MODIFICATA ---
    // La griglia ora è dinamica in base al numero di tab
    <div className={`relative border bg-white/10 p-1 rounded-full h-14 grid grid-cols-${totalTabs}`}>
      {/* Capsula scorrevole */}
      <div
        className="absolute top-1 bottom-1 bg-[#0071e3] rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{
          // --- BLOCCO MODIFICATO ---
          // La posizione e la larghezza sono ora calcolate dinamicamente
          // Se nessuna tab è attiva (activeIndex === -1), nascondiamo la capsula
          opacity: activeIndex === -1 ? 0 : 1,
          left: `calc(${activeIndex * percentageWidth}% + 4px)`,
          width: `calc(${percentageWidth}% - 8px)`
        }}
      />

      {/* Pulsanti delle schede */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.value;

        return (
          <span
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            // --- RIGA MODIFICATA ---
            // La classe "text-white" viene applicata solo se la tab è selezionata
            className={`relative z-10 cursor-pointer transition-all duration-300 ease-in-out font-medium flex items-center justify-center text-sm md:text-base ${
              isSelected
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {tab.title}
          </span>
        );
      })}
    </div>
  );
};

export default SlidingTabsNav;