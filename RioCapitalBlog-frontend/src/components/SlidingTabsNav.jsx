// src/components/SlidingTabsNav.jsx

import React from 'react';

const SlidingTabsNav = ({ activeTab, onTabChange, tabs }) => {
  const getActiveIndex = () => tabs.findIndex(tab => tab.value === activeTab);

  return (
    <div className="relative border bg-white/10 p-1 rounded-full h-14 grid grid-cols-4"> {/* Modificato a 4 colonne */}
      {/* Capsula scorrevole */}
      <div
        className="absolute top-1 bottom-1 bg-[#0071e3] rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{
          left: `calc(${getActiveIndex() * 25}% + 4px)`, // Modificato a 25% per 4 tab
          width: 'calc(25% - 8px)' // Modificato a 25% per 4 tab
        }}
      />

      {/* Pulsanti delle schede */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <span
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`relative z-10 cursor-pointer transition-all duration-300 ease-in-out font-medium flex items-center justify-center text-sm md:text-base ${
              activeTab === tab.value
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {tab.title} {/* Ho usato 'title' per coerenza con il tuo array */}
          </span>
        );
      })}
    </div>
  );
};

export default SlidingTabsNav;