import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router'
import Sidebar from '../reusableComponets/Sidebar'
import Header from '../reusableComponets/Header'
import { useLocation } from 'react-router'

const DashboardLayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const location = useLocation()
    const headerVariant =
        location.pathname === "/catalogue"
        ? "catalogue"
        : "dashboard";

    return (
        <div className='flex h-screen min-h-0 overflow-hidden bg-[#F7F7F5]'>
            <Sidebar
                mobileOpen={mobileNavOpen}
                onMobileClose={() => setMobileNavOpen(false)}
            />
            <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
                <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        aria-expanded={mobileNavOpen}
                        onClick={() => setMobileNavOpen(true)}
                        className="rounded-lg p-2 text-[#18212B] hover:bg-gray-100"
                    >
                        <Menu size={21} />
                    </button>
                    <span className="text-sm font-semibold text-[#18212B]">
                        UniLibrary
                    </span>
                </div>
                <Header variant={headerVariant}/>
                <main className='min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6'>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
