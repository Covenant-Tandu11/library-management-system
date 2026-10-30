
import type { ReactNode } from "react";
import { BookOpenText } from "lucide-react";
import Sidebar from "../reusableComponets/Sidebar";

interface SuccessModalProps {
  icon: ReactNode;
  primaryButtonText: string;
  secondaryButtonText?: string;
  title: string;
  subtitle: string;
  message?: string;
  children?: ReactNode;
  iconBackgroundColor: string;
  iconColor: string;
  showSidebar?: boolean;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const SuccessModal = ({
  icon,
  title,
  subtitle,
  message,
  primaryButtonText,
  secondaryButtonText,
  children,
  iconBackgroundColor,
  iconColor,
  showSidebar = true,
  onPrimaryClick,
  onSecondaryClick,
}: SuccessModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen overflow-y-auto bg-[#FAF8F2]">
      {showSidebar ? (
        <Sidebar variant="brand-only" />
      ) : (
        <aside className="hidden w-56 shrink-0 flex-col bg-[#18212B] p-5 md:flex">
          <header className="flex items-center gap-2">
            <BookOpenText className="text-[#FAF8F2]" size={22} />
            <div>
              <h1 className="text-sm font-semibold text-[#FAF8F2]">
                UniLibrary
              </h1>
              <p className="text-[10px] text-[#FAF8F2]">
                Management System
              </p>
            </div>
          </header>
        </aside>
      )}

      <main className="flex min-w-0 flex-1 items-center justify-center p-3 sm:p-5 md:p-10">
        <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-[#FAF8F2] px-4 py-7 text-center sm:px-7 sm:py-10 md:px-12">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24 ${iconBackgroundColor} ${iconColor}`}
          >
            {icon}
          </div>

          <h1 className="mt-5 text-lg font-bold text-[#20242B] sm:text-xl md:text-2xl">
            {title}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737780]">
            {subtitle}
          </p>

          {message && (
            <p className="mt-1 text-sm text-[#737780]">{message}</p>
          )}

          <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2">
            <button
              type="button"
              onClick={onPrimaryClick}
              className="w-full rounded-lg bg-[#18212B] px-4 py-2.5 text-sm font-medium text-[#FAF8F2] transition-colors hover:bg-[#293746]"
            >
              {primaryButtonText}
            </button>

            {secondaryButtonText && (
              <button
                type="button"
                onClick={onSecondaryClick}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-[#18212B] transition-colors hover:bg-gray-100"
              >
                {secondaryButtonText}
              </button>
            )}
          </div>

          {children && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-green-100 p-3 text-left text-sm text-green-800">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuccessModal;
