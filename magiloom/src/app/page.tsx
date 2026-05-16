import Link from 'next/link'

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#07070f]/80 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-2.5">
        <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-6 h-6" />
        <span className="text-sm font-semibold tracking-tight text-white">Magiloom</span>
      </Link>
      <div className="flex items-center gap-6">
        <a href="#how-it-works" className="text-sm text-white/40 hover:text-white/80 transition-colors hidden sm:block">
          How it works
        </a>
        <a href="#features" className="text-sm text-white/40 hover:text-white/80 transition-colors hidden sm:block">
          Features
        </a>
        <a
          href="https://crystarium.magiloom.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-4 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 hover:border-indigo-400 hover:text-indigo-200 transition-colors"
        >
          To Crystarium &rarr;
        </a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/6 rounded-full blur-[80px] pointer-events-none" />

      

      <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto gap-8">
        {/* Hero logo */}
        <div className="relative mt-16 md:mt-20">
          <div className="absolute inset-0 bg-indigo-500/15 blur-[80px] rounded-full" />
          <div className="animate-float" style={{ filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.5))' }}>
            <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-28 h-28 md:w-36 md:h-36 mx-auto" />
          </div>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-glow-pulse" />
          <span className="text-xs text-indigo-300 font-medium tracking-wide">Coming soon</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white">
          Clip the web.{' '}
          <span className="bg-gradient-to-br from-indigo-300 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            Crystallize
          </span>{' '}
          your knowledge.
        </h1>

        <p className="text-lg md:text-xl text-white/45 leading-relaxed max-w-xl">
          Magiloom transforms the pages you read into a living knowledge graph — automatically summarized, tagged, and connected by AI. Your second brain, alive.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href="https://github.com/jackfperryjr/aetherneedle/releases/latest/download/aetherneedle.zip"
            download
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Aetherneedle
          </a>
          <a
            href="https://buy.stripe.com/aFafZj7YI6n06d3fxG0Fi00"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            ♥ Support the project
          </a>
        </div>
      </div>

    </section>
  )
}

function PoweredBy() {
  const partners = ['Claude by Anthropic', 'Voyage AI', 'Supabase']
  return (
    <section className="border-y border-white/5 py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <span className="text-xs text-white/20 uppercase tracking-widest whitespace-nowrap">Powered by</span>
        <div className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center">
          {partners.map(p => (
            <span key={p} className="text-sm text-white/30 font-medium">{p}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Clip with Aetherneedle',
      description:
        'Install our Chrome extension and browse naturally. When you find something worth keeping, click once. Aetherneedle extracts the content and sends it to your Crystarium instantly.',
    },
    {
      number: '02',
      title: 'AI reads and understands',
      description:
        'Magicite, our AI engine, reads every clip you save. Claude by Anthropic extracts key people, places, technologies, and topics. Voyage AI encodes the meaning into a semantic embedding.',
    },
    {
      number: '03',
      title: 'Your knowledge crystallizes',
      description:
        'Open Crystarium to see your knowledge as a living force graph. Clips cluster by meaning, not by folder. Lines form between ideas that share semantic space — connections you didn\'t know existed.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-indigo-400/70 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Three steps. One second brain.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-2xl bg-white/[0.03] border border-white/8 p-7 flex flex-col gap-5 hover:border-indigo-500/25 transition-colors"
            >
              <span className="text-3xl font-bold text-white/8 tracking-tighter select-none">{step.number}</span>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: '◈',
      title: 'One-click clipping',
      description: 'Save any page from Chrome in a single click. Aetherneedle handles extraction, processing, and storage — no copy-pasting.',
    },
    {
      icon: '◎',
      title: 'AI summaries & tags',
      description: 'Every clip is automatically read, summarized, and tagged with entities — keywords, people, places, technologies, and topics.',
    },
    {
      icon: '⬡',
      title: 'Semantic connections',
      description: 'Voyage AI embeddings group your clips by meaning, not keywords. Similar ideas connect even when they use completely different words.',
    },
    {
      icon: '✦',
      title: 'Visual knowledge graph',
      description: 'Crystarium renders your second brain as a force-directed graph. Navigate your knowledge spatially and discover hidden clusters.',
    },
    {
      icon: '◻',
      title: 'Private by default',
      description: 'Your clips belong to you. We don\'t sell your data, show ads, or train models on your content. Row-level security enforces it in the database.',
    },
    {
      icon: '◑',
      title: 'Dark & light mode',
      description: 'Crystarium adapts to your preference and persists it across sessions. Because good tools respect how you like to work.',
    },
  ]

  return (
    <section id="features" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-indigo-400/70 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Everything your second brain needs.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.03] border border-white/8 p-6 flex flex-col gap-3 hover:border-white/12 hover:bg-white/[0.05] transition-all"
            >
              <span className="text-xl text-indigo-400/80">{f.icon}</span>
              <h3 className="text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-5 h-5 opacity-60" />
          <span className="text-sm text-white/30 font-medium">Magiloom</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://buy.stripe.com/aFafZj7YI6n06d3fxG0Fi00"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            ♥ Support
          </a>
          <Link href="/privacy" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-xs text-white/15">© 2026 Magiloom. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#07070f]">
      <Nav />
      <Hero />
      <PoweredBy />
      <HowItWorks />
      <Features />
      <Footer />
    </main>
  )
}
