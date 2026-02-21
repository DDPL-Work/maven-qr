import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f4f7ff] via-[#eef3ff] to-[#f9fbff]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
