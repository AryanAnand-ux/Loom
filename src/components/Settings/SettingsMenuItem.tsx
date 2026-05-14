import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import React from "react";

interface SettingsMenuItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  description?: string;
}

export default function SettingsMenuItem({ to, icon: Icon, label, description }: SettingsMenuItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group block relative overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${
          isActive
            ? "border-black bg-black text-white shadow-lg"
            : "border-gray-200 bg-white text-gray-900 hover:border-black hover:shadow-md"
        }`
      }
    >
      {({ isActive }) => (
        <motion.div
          initial={false}
          animate={{ scale: isActive ? 1.02 : 1 }}
          className="flex items-center justify-between px-6 py-5 md:py-6"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive ? "bg-white text-black" : "bg-gray-100 text-gray-600 group-hover:bg-black group-hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <div className="min-w-0">
              <p className="font-medium text-sm md:text-base leading-tight">{label}</p>
              {description && (
                <p className={`text-xs truncate ${isActive ? "text-gray-200" : "text-gray-500"}`}>{description}</p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ x: isActive ? 2 : 0 }}
            className="text-gray-400 shrink-0 ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </NavLink>
  );
}
