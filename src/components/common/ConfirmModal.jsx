import React, { useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * Props:
 * - open: boolean
 * - title: string (optional)
 * - children: node (content body)
 * - onConfirm: () => void
 * - onCancel: () => void
 * - confirmText: string (default "Tôi đồng ý")
 * - cancelText: string (default "Hủy")
 * - showCancel: boolean (default true)
 * - confirmClassName: string (extra classes for confirm button)
 * - isLoading: boolean (disable confirm while true)
 * - footer: node (optional override footer)
 */
export default function ConfirmModal({
  open,
  title = "Xác nhận",
  children,
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = "Tôi đồng ý",
  cancelText = "Hủy",
  showCancel = true,
  confirmClassName = "",
  isLoading = false,
  footer = null,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onCancel();
      if (e.key === "Enter" && open && !isLoading) onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm, isLoading]);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onCancel} // click backdrop to cancel
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* modal panel */}
      <div
        className="relative z-10 w-[min(92%,720px)] bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="document"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header with thin blue horizontal line + diagonal accent */}
        <div className="relative">
          {/* thin horizontal line */}
          <div className="h-[8px] w-full bg-gradient-to-r from-blue-200 to-blue-300" />

          <div className="px-6 py-4 border-b border-gray-100">
            <h3 id="confirm-modal-title" className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-gray-700">{children}</div>

        {/* Footer (customizable) */}
        {footer ? (
          <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                disabled={isLoading}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={
                "px-5 py-2 rounded-md text-white font-medium shadow-sm transition " +
                (confirmClassName ||
                  "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800")
              }
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
