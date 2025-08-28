import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return(
        <div className="min-h-screen bg-gray-50">
            <Navbar></Navbar>
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    )
} 