
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Fallen Helper Dashboard
                </h1>
                <div className="flex gap-4">
                    <Link href="/create" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition">
                        Create Event
                    </Link>
                    <div className="flex items-center gap-2">
                        <img src={session.user?.image || ''} alt="User" className="w-8 h-8 rounded-full" />
                        <span>{session.user?.name}</span>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for Events List */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Raids</h2>
                    <p className="text-gray-400">No events found. Create one to get started!</p>
                </div>

                {/* Placeholder for Stats/Logs */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <p className="text-gray-400">System initialization complete.</p>
                </div>
            </main>
        </div>
    );
}
