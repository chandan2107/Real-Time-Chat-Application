import React from "react";
import formatTimestamp from "../../utils/formatTime";

const StatusList = ({ contact, onPreview, theme }) => {
  return (
    <div
      className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition ${
        theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-[#f5f6f6]"
      }`}
      onClick={onPreview}
    >
      <div className="relative shrink-0">
        <img
          src={contact?.avatar || "/placeholder.svg"}
          alt={contact?.name}
          className="w-12 h-12 rounded-full object-cover"
        />

        <svg
          className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
          viewBox="0 0 100 100"
        >
          {contact.statuses.map((_, index) => {
            const total = contact.statuses.length;
            const circumference = 2 * Math.PI * 48;
            const segmentLength = circumference / total;
            const offset = index * segmentLength;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="#25d366"
                strokeWidth="4"
                strokeDasharray={`${segmentLength - (total > 1 ? 4 : 0)} ${total > 1 ? 4 : 0}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex-1 min-w-0 border-b border-[#e9edef] dark:border-[#222e35] pb-2">
        <p className="font-normal text-[16px] text-[#111b21] dark:text-[#e9edef] truncate">
          {contact.name}
        </p>
        <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate mt-0.5">
          {contact.statuses.length > 0 &&
            formatTimestamp(
              contact.statuses[contact.statuses.length - 1].timestamp
            )}
        </p>
      </div>
    </div>
  );
};

export default StatusList;