import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { ArrowRight, Zap, BarChart3, Shield, Code2, CheckCircle, ShieldCheck, Lock, Globe } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-sm z-10">
        <Logo className="h-7 w-auto" />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-[#888] hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] bg-blue-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full px-4 py-1.5 text-xs text-[#6366f1] mb-8">
            <ShieldCheck className="w-3 h-3" />
            Now with Meta Verified Sender — trusted delivery
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Email for
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              developers
            </span>
          </h1>

          <p className="text-lg text-[#888] mb-10 max-w-xl mx-auto leading-relaxed">
            The best way to reach humans instead of spam folders. LEGSEND is the email platform
            developers love — simple API, powerful analytics, and{' '}
            <span className="text-white">Meta Verified</span> delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f52d4] text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://legsend-api.hexaponnaya.workers.dev/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#3a3a3a] font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              API Status
            </a>
          </div>
        </div>
      </section>

      {/* Meta Verified Banner */}
      <section className="px-6 py-12 border-t border-[#1a1a1a] bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#6366f1]/10 via-[#6366f1]/5 to-transparent border border-[#6366f1]/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#6366f1]/15 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#6366f1]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-white">Meta Verified Sender</h2>
                  <span className="text-[10px] font-bold tracking-widest bg-[#6366f1]/20 text-[#818cf8] px-2 py-0.5 rounded uppercase">New</span>
                </div>
                <p className="text-sm text-[#888] leading-relaxed max-w-xl">
                  Authenticate your domains with SPF, DKIM, and DMARC through LEGSEND's verification system.
                  Verified senders get a blue shield badge that displays in recipient mail clients —
                  boosting trust and open rates.
                </p>
              </div>
              <div className="flex-shrink-0 grid grid-cols-3 gap-3">
                {['SPF', 'DKIM', 'DMARC'].map(proto => (
                  <div key={proto} className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="w-4 h-4 text-[#6366f1]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#555]">{proto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code snippet */}
      <section className="px-6 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Simple by design</h2>
            <p className="text-sm text-[#555]">Send your first email in under 5 minutes</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-[#555]">HTTP Request</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-[#6366f1]">
                <ShieldCheck className="w-3 h-3" /> Verified Sender
              </span>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code>
                <span className="text-[#888]">POST </span>
                <span className="text-green-400">https://legsend-api.hexaponnaya.workers.dev/v1/emails</span>{'\n'}
                <span className="text-[#888]">Authorization: </span>
                <span className="text-yellow-400">Bearer lg_xxxxxxxxxxxxxxxxxxxx</span>{'\n'}
                <span className="text-[#888]">Content-Type: </span>
                <span className="text-blue-400">application/json</span>{'\n\n'}
                <span className="text-[#333]">{'{'}</span>{'\n'}
                {'  '}<span className="text-indigo-400">"from"</span><span className="text-[#888]">: </span><span className="text-green-300">"hello@yourapp.com"</span><span className="text-[#555]">,</span>{'\n'}
                {'  '}<span className="text-indigo-400">"to"</span><span className="text-[#888]">: </span><span className="text-green-300">"user@example.com"</span><span className="text-[#555]">,</span>{'\n'}
                {'  '}<span className="text-indigo-400">"subject"</span><span className="text-[#888]">: </span><span className="text-green-300">"Welcome to our app!"</span><span className="text-[#555]">,</span>{'\n'}
                {'  '}<span className="text-indigo-400">"html"</span><span className="text-[#888]">: </span><span className="text-green-300">"{'<p>Hello, World!</p>'}"</span>{'\n'}
                <span className="text-[#333]">{'}'}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white mb-2">Everything you need</h2>
            <p className="text-sm text-[#555]">Built for teams that ship fast</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: 'Meta Verified Mail',
                desc: 'SPF, DKIM, and DMARC authentication with blue shield badge for verified senders.',
                color: 'text-[#6366f1]',
                bg: 'bg-[#6366f1]/10',
                highlight: true,
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: 'API Logs',
                desc: 'Every API call is logged. Debug issues in seconds with full request & response inspection.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Domain Auth',
                desc: 'SPF, DKIM, and DMARC verification out of the box. Your emails land in the inbox, not spam.',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
              },
              {
                icon: <Code2 className="w-5 h-5" />,
                title: 'Developer First',
                desc: 'Clean REST API, typed SDKs, webhooks for every event. Integrate in minutes.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: 'Global Delivery',
                desc: 'Powered by Cloudflare Workers — sub-50ms sends from over 300 edge locations worldwide.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
              },
              {
                icon: <Lock className="w-5 h-5" />,
                title: 'Anti-Spoofing',
                desc: 'DMARC policy enforcement prevents phishers from impersonating your domain.',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
            ].map(f => (
              <div
                key={f.title}
                className={`bg-[#0a0a0a] border rounded-xl p-6 hover:border-[#2a2a2a] transition-colors ${
                  f.highlight ? 'border-[#6366f1]/30' : 'border-[#1a1a1a]'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <span className={f.color}>{f.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  {f.title}
                  {f.highlight && (
                    <span className="text-[9px] font-bold tracking-widest bg-[#6366f1]/20 text-[#818cf8] px-1.5 py-0.5 rounded uppercase">
                      New
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#6366f1]" />
            <span className="text-sm text-[#6366f1] font-medium">Meta Verified — Trusted by developers</span>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to ship?</h2>
          <p className="text-[#555] mb-8">Start sending verified emails in minutes. No credit card required.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f52d4] text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="h-5 w-auto opacity-60" />
          <span className="text-xs text-[#333]">·</span>
          <span className="inline-flex items-center gap-1 text-xs text-[#6366f1]/60">
            <ShieldCheck className="w-3 h-3" /> Meta Verified
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#555]">
          <a href="https://legsend-api.hexaponnaya.workers.dev/health" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" /> API Status
          </a>
          <span>© 2025 LEGSEND</span>
        </div>
      </footer>
    </div>
  )
}
