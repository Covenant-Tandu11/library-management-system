
import {
  BookOpenText,
  BookOpen,
  ArrowLeftRight,
  Users,
} from "lucide-react";
import { NavLink } from "react-router";

type SidebarProps = {
  variant?: "navigation" | "brand-only";
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const Sidebar = ({
  variant = "navigation",
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: BookOpenText },
    { to: "/catalogue", label: "Book Catalogue", icon: BookOpen },
    { to: "/borrowreturn", label: "Borrow / Return", icon: ArrowLeftRight },
    { to: "/records", label: "Borrowing Records", icon: Users },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      <header className="flex items-center gap-2">
        <BookOpenText className="text-[#FAF8F2]" size={22} />
        <div>
          <h1 className="text-sm font-semibold text-[#FAF8F2]">UniLibrary</h1>
          <p className="text-[10px] text-[#FAF8F2]">Management System</p>
        </div>
      </header>
      {variant === "navigation" && (
        <nav className="flex-1 py-8">
          <ul className="flex flex-col gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={isMobile ? onMobileClose : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-[#FAF8F2] font-semibold text-[#18212B]"
                        : "text-[#FAF8F2] hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );

  return (
    <>
      <aside className="hidden h-screen w-56 shrink-0 flex-col bg-[#18212B] p-5 md:flex">
        {renderSidebarContent()}
      </aside>
      {mobileOpen && variant === "navigation" && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="absolute inset-0 h-full w-full bg-black/50"
          />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-[#18212B] p-5 shadow-xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
