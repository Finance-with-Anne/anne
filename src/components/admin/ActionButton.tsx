"use client";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  onDropdown?: () => void;
  href?: string;
}

export default function ActionButton({ label, onClick, onDropdown }: ActionButtonProps) {
  return (
    <div
      className="inline-flex rounded-xl overflow-hidden"
      style={{
        boxShadow: "0 0 18px rgba(15, 31, 61, 0.6), 0 0 40px rgba(15, 31, 61, 0.25)",
      }}
    >
      {/* Main action */}
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 bg-brand hover:bg-brand-hover transition-colors px-4 py-2.5"
      >
        <span className="flex items-center justify-center h-5 w-5 rounded-md bg-white/15">
          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </button>

      {onDropdown && (
        <>
          <div className="w-px bg-white/20" />
          <button
            onClick={onDropdown}
            className="flex items-center justify-center px-3 bg-brand hover:bg-brand-hover transition-colors"
          >
            <svg className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
