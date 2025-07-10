import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameIcon } from "@/components/ui/game-icon";
import {
  Bot,
  Play,
  Monitor,
  Users,
  MessageSquare,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Real-time Chat Processing",
      desc: "Monitor dan filter chat 50-200 pesan/menit untuk streamer besar.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: "Cost Optimization",
      desc: "Hanya 15-25 API calls per jam dengan template response yang efisien.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "High-Volume Support",
      desc: "Handle 6-10k concurrent viewers untuk streamer top Indonesia.",
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: "Indonesian Gaming Culture",
      desc: "Paham slang Jakarta, regional dialects, dan gaming terminology lokal.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-0">
        <div className="container mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center mb-6">
              <Bot className="h-10 w-10 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-slate-900">
                StreamBuddy
              </span>
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              AI Co-Host untuk{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Streamer Gaming Indonesia
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Monitor chat real-time, berikan respons cerdas tentang game, dan
              tingkatkan engagement sambil streamer fokus pada gameplay.
            </p>
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" /> Mulai Gratis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
              >
                <Monitor className="mr-2 h-5 w-5" /> Lihat Demo
              </Button>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-xl font-bold text-blue-700">50-200</div>
                <div className="text-sm text-slate-500">Pesan/Menit</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-700">6-10k</div>
                <div className="text-sm text-slate-500">Concurrent Viewers</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-700">3s</div>
                <div className="text-sm text-slate-500">Response Time</div>
              </div>
            </div>
          </div>
          {/* Right: Illustration */}
          <div className="flex-1 flex justify-center items-center relative min-h-[340px]">
            {/* SVG Illustration Placeholder */}
            <svg
              width="340"
              height="340"
              viewBox="0 0 340 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="170"
                cy="170"
                rx="170"
                ry="170"
                fill="url(#paint0_radial)"
              />
              <rect
                x="60"
                y="110"
                width="220"
                height="120"
                rx="24"
                fill="#fff"
                stroke="#e0e7ff"
                strokeWidth="4"
              />
              <rect
                x="90"
                y="140"
                width="60"
                height="20"
                rx="6"
                fill="#6366f1"
              />
              <rect
                x="170"
                y="140"
                width="70"
                height="20"
                rx="6"
                fill="#a5b4fc"
              />
              <rect
                x="90"
                y="180"
                width="150"
                height="20"
                rx="6"
                fill="#c7d2fe"
              />
              <circle cx="250" cy="200" r="18" fill="#6366f1" />
              <circle cx="250" cy="200" r="10" fill="#fff" />
              <rect
                x="120"
                y="210"
                width="60"
                height="12"
                rx="6"
                fill="#6366f1"
              />
              <defs>
                <radialGradient
                  id="paint0_radial"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientTransform="translate(170 170) scale(170)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#a5b4fc" />
                  <stop offset="1" stopColor="#6366f1" stopOpacity="0.2" />
                </radialGradient>
              </defs>
            </svg>
            {/* Decorative leaves or shapes can be added here for more playfulness */}
          </div>
        </div>
      </section>

      {/* Why StreamBuddy Section */}
      <section className="relative bg-white pb-24 pt-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why StreamBuddy?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dirancang khusus untuk kebutuhan streamer gaming Indonesia dengan
              teknologi AI terdepan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow hover:shadow-lg transition-all border border-slate-100 flex flex-col items-start"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Games Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Games yang Didukung
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              StreamBuddy paham deep knowledge tentang game-game favorit
              Indonesia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              "Mobile Legends: Bang Bang",
              "Free Fire",
              "Valorant",
              "GTA V",
              "PUBG Mobile",
              "Horror Games",
              "Minecraft",
              "Genshin Impact",
              "Ragnarok X: Next Generation",
              "Call of Duty: Mobile",
            ].map((game, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <GameIcon game={game} size="lg" className="text-white" />
                </div>
                <div className="font-semibold text-sm text-slate-900 mb-1">
                  {game}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Cara Kerja StreamBuddy
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Mulai mudah, hasil maksimal. Hanya 3 langkah untuk streaming lebih
              interaktif!
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Monitor className="w-10 h-10 text-blue-600 mb-4" />,
                title: "Integrasi Mudah",
                desc: "Hubungkan StreamBuddy ke OBS atau platform streaming favorit Anda. Tidak perlu setup rumit!",
              },
              {
                icon: (
                  <MessageSquare className="w-10 h-10 text-purple-600 mb-4" />
                ),
                title: "AI Chat Processing",
                desc: "AI kami memproses chat secara real-time, memfilter spam, dan memberikan respons cerdas sesuai konteks game.",
              },
              {
                icon: <Users className="w-10 h-10 text-blue-500 mb-4" />,
                title: "Engagement Meningkat",
                desc: "Viewers merasa lebih diperhatikan, engagement dan loyalitas penonton pun naik!",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-2xl p-8 shadow hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center"
              >
                {step.icon}
                <div className="font-semibold text-lg text-slate-900 mb-2">
                  {step.title}
                </div>
                <div className="text-slate-600 text-sm">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Apa Kata Streamer?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Streamer top Indonesia sudah percaya dengan StreamBuddy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "DeanKT",
                role: "Mobile Legends Streamer",
                content:
                  "StreamBuddy beneran paham gaming Indonesia. Chat jadi lebih hidup!",
                avatar: "DK",
                followers: "45.2K",
              },
              {
                name: "Reza Arap",
                role: "Free Fire Streamer",
                content:
                  "AI yang responsive dan cost-effective. Perfect untuk stream harian.",
                avatar: "RA",
                followers: "32.1K",
              },
              {
                name: "MiawAug",
                role: "Valorant Streamer",
                content:
                  "StreamBuddy jadi teman setia stream. Viewers suka banget!",
                avatar: "MA",
                followers: "28.7K",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold text-white">
                  {t.avatar}
                </div>
                <div className="font-semibold text-lg text-slate-900 mb-1">
                  {t.name}
                </div>
                <div className="text-sm text-slate-500 mb-2">
                  {t.role} • {t.followers} followers
                </div>
                <div className="text-slate-700 italic mb-2">"{t.content}"</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Paket & Harga
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Gratis untuk 30 hari pertama. Pilih paket sesuai kebutuhan
              streaming Anda!
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-10 shadow border border-slate-100 flex flex-col items-center text-center">
              <div className="text-blue-700 font-bold text-lg mb-2">
                Starter
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-2">
                Gratis
              </div>
              <div className="text-slate-600 mb-6">30 hari pertama</div>
              <ul className="text-slate-700 text-sm mb-8 space-y-2 text-left">
                <li>✔️ Semua fitur utama</li>
                <li>✔️ 1 Channel Streaming</li>
                <li>✔️ 5.000 pesan chat/bulan</li>
                <li>✔️ Dukungan komunitas</li>
              </ul>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg font-semibold w-full"
              >
                Mulai Gratis
              </Button>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-10 shadow border border-slate-100 flex flex-col items-center text-center">
              <div className="text-purple-700 font-bold text-lg mb-2">Pro</div>
              <div className="text-4xl font-extrabold text-slate-900 mb-2">
                Rp 99.000
              </div>
              <div className="text-slate-600 mb-6">per bulan</div>
              <ul className="text-slate-700 text-sm mb-8 space-y-2 text-left">
                <li>✔️ Semua fitur Starter</li>
                <li>✔️ Unlimited channel</li>
                <li>✔️ 100.000+ pesan chat/bulan</li>
                <li>✔️ Dukungan prioritas</li>
              </ul>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50 px-8 py-3 text-lg font-semibold w-full"
              >
                Upgrade ke Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">FAQ</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Pertanyaan yang sering ditanyakan tentang StreamBuddy.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              {
                q: "Apakah StreamBuddy benar-benar gratis?",
                a: "Ya, Anda bisa menggunakan semua fitur utama secara gratis selama 30 hari pertama. Setelah itu, Anda bisa memilih untuk tetap di paket gratis dengan batasan tertentu atau upgrade ke Pro.",
              },
              {
                q: "Bagaimana cara integrasi dengan OBS?",
                a: "Cukup copy-paste URL overlay StreamBuddy ke OBS sebagai browser source. Tidak perlu install plugin tambahan!",
              },
              {
                q: "Apakah StreamBuddy bisa filter spam dan toxic chat?",
                a: "Bisa! AI kami secara otomatis memfilter spam, toxic, dan pesan tidak pantas dari chat Anda.",
              },
              {
                q: "Apakah data chat saya aman?",
                a: "Sangat aman. Data chat Anda dienkripsi dan tidak dibagikan ke pihak ketiga.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-white rounded-xl p-6 shadow border border-slate-100 group"
                open={i === 0}
              >
                <summary className="font-semibold text-slate-900 cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="ml-2 text-blue-600 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="text-slate-700 mt-4 text-sm">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">
            Siap Tingkatkan Stream Anda?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Bergabung dengan streamer Indonesia yang sudah menggunakan
            StreamBuddy. Gratis untuk 30 hari pertama!
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Mulai Sekarang
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 mt-0">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Bot className="h-8 w-8 mr-3 text-blue-400" />
              <span className="text-2xl font-bold">StreamBuddy</span>
            </div>
            <div className="flex flex-wrap gap-8 text-slate-300 text-sm">
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/overlay"
                className="hover:text-white transition-colors"
              >
                Overlay
              </Link>
              <Link
                href="/analytics"
                className="hover:text-white transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="hover:text-white transition-colors"
              >
                Settings
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Community
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 StreamBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
