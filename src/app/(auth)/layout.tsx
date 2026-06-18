import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg">USANA Store</div>
              <div className="text-xs text-gray-500">Philippines</div>
            </div>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
        <p className="text-xs text-gray-400 text-center mt-4">
          This website is operated by an Independent USANA Distributor.
        </p>
      </div>
    </div>
  );
}
