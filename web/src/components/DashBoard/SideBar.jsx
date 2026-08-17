import React from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export function Sidebar({ tabs, activeTab, onSelect, collapsed, onToggleCollapsed }) {
  return (
    <aside
      className={`hidden md:flex flex-col flex-shrink-0 border-r border-gray-100 bg-white h-[calc(100vh-64px)] sticky top-16 transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-[232px]"
      }`}
    >
      <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              title={collapsed ? label : undefined}
              className={`group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-[#fdf2f2] text-[#E8473F]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* Active indicator bar */}
              <span
                className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundColor: "#E8473F" }}
              />
              <Icon
                size={18}
                strokeWidth={isActive ? 2.25 : 1.875}
                className="flex-shrink-0"
              />
              {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}

              {!!badge && (
                <span
                  className={`flex-shrink-0 text-[10px] font-semibold rounded-full flex items-center justify-center text-white ${
                    collapsed
                      ? "absolute -top-0.5 left-6 w-4 h-4"
                      : "ml-auto min-w-[18px] h-[18px] px-1"
                  }`}
                  style={{ backgroundColor: "#E8473F" }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-gray-100">
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
