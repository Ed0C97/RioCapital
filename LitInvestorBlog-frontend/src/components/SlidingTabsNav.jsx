// LitInvestorBlog-frontend/src/components/SlidingTabsNav.jsx

import React from 'react';

const SlidingTabsNav = ({ activeTab, onTabChange, tabs }) => {

  const getActiveIndex = () => {
    const index = tabs.findIndex((tab) => tab.value === activeTab);

    if (index === -1 && activeTab === 'custom') {
      return tabs.findIndex((tab) => tab.value === 'custom');
    }
    return index;
  };

  const activeIndex = getActiveIndex();
  const totalTabs = tabs.length;
  const percentageWidth = 100 / totalTabs;

  return (

    <div
      className={`relative border bg-white/10 p-1 rounded-full h-14 grid grid-cols-${totalTabs}`}
    >
      {}
      <div
        className="absolute top-1 bottom-1 bg-[#0071e3] rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{

          opacity: activeIndex === -1 ? 0 : 1,
          left: `calc(${activeIndex * percentageWidth}% + 4px)`,
          width: `calc(${percentageWidth}% - 8px)`,
        }}
      />

      {}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.value;

        return (
          <span
            key={tab.value}
            onClick={() => onTabChange(tab.value)}

            className={`relative z-10 cursor-pointer transition-all duration-300 ease-in-out font-medium flex items-center justify-center text-sm md:text-base ${
              isSelected ? 'text-white' : 'text-gray-300 hover:text-white'
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
