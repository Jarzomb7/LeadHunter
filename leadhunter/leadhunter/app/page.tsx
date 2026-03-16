import Link from 'next/link'
import { Target, Zap, Bell, Shield, ArrowRight, Check, Globe, Users, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">LeadHunter</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/signup" className="bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-1.5 text-sm text-accent-light mb-8">
          <Zap size={12} className="fill-accent-light" />
          AI-powered lead discovery
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="gradient-text">Find Freelance</span>
          <br />
          <span className="text-white">Opportunities</span>
          <br />
          <span className="text-gray-500">Before Anyone Else</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitor Facebook groups, job boards, and social media for leads. 
          Get instant alerts. Close more deals with AI-crafted messages.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="bg-accent-blue hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 glow-blue-sm">
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login" className="bg-bg-secondary border border-border-default hover:border-accent-blue/30 text-white font-medium px-8 py-4 rounded-xl text-base transition-all">
            See Demo Dashboard
          </Link>
        </div>
        
        <p className="text-gray-600 text-sm mt-4">No credit card required · 14-day free trial</p>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '2,400+', label: 'Active Users', icon: Users },
            { value: '18k+', label: 'Leads Found Daily', icon: Target },
            { value: '94%', label: 'Match Accuracy', icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-secondary border border-border-default rounded-2xl p-6 text-center card-hover">
              <stat.icon className="w-6 h-6 text-accent-blue mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need to <span className="gradient-text">close more deals</span></h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Monitor dozens of sources, get instant alerts, and use AI to craft the perfect pitch.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Globe,
              title: 'Multi-Platform Monitoring',
              desc: 'Track Facebook groups, LinkedIn, Useme, Freelancer.com, Reddit and more from one dashboard.',
              color: '#2e6cff',
            },
            {
              icon: Bell,
              title: 'Instant Alerts',
              desc: 'Get notified via Telegram and email the moment a new lead matching your keywords appears.',
              color: '#22c55e',
            },
            {
              icon: Zap,
              title: 'AI Message Generator',
              desc: 'Generate personalized outreach messages with one click. Stand out from the competition.',
              color: '#f59e0b',
            },
            {
              icon: Target,
              title: 'Lead Scoring',
              desc: 'AI analyzes each post and assigns a score so you know which leads are worth pursuing first.',
              color: '#a855f7',
            },
            {
              icon: Shield,
              title: 'Lead CRM',
              desc: 'Track every lead from NEW to WON. Add notes, update status, and never lose track.',
              color: '#ef4444',
            },
            {
              icon: TrendingUp,
              title: 'Website Analyzer',
              desc: 'Analyze any client website for issues — use as a conversation opener to get hired.',
              color: '#5aa2ff',
            },
          ].map((f, i) => (
            <div key={i} className="bg-bg-secondary border border-border-default rounded-2xl p-6 card-hover">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.color + '22' }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Simple pricing</h2>
          <p className="text-gray-500 text-lg">Start free, scale as you grow.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              features: ['5 keywords', '2 groups', '50 leads/month', 'Email alerts', 'Basic CRM'],
              cta: 'Get Started',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$29',
              period: 'per month',
              features: ['Unlimited keywords', '20 groups', 'Unlimited leads', 'Telegram + Email', 'AI messages', 'Website analyzer', 'Priority support'],
              cta: 'Start Free Trial',
              highlight: true,
            },
            {
              name: 'Agency',
              price: '$79',
              period: 'per month',
              features: ['Everything in Pro', '5 team members', 'White-label reports', 'API access', 'Custom integrations', 'Dedicated support'],
              cta: 'Contact Sales',
              highlight: false,
            },
          ].map((plan, i) => (
            <div key={i} className={`rounded-2xl p-6 border ${plan.highlight ? 'bg-accent-blue border-accent-blue glow-blue' : 'bg-bg-secondary border-border-default card-hover'}`}>
              {plan.highlight && (
                <div className="text-xs font-semibold text-blue-200 bg-white/10 rounded-full px-3 py-1 mb-4 inline-block">Most Popular</div>
              )}
              <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </div>
              <div className="text-sm text-gray-400 mb-6">{plan.period}</div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className={plan.highlight ? 'text-blue-200' : 'text-accent-blue'} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className={`block text-center font-medium py-2.5 rounded-xl text-sm transition-all ${plan.highlight ? 'bg-white text-accent-blue hover:bg-gray-100' : 'bg-bg-tertiary text-white hover:bg-gray-700 border border-border-default'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-r from-accent-blue/20 via-bg-secondary to-accent-blue/20 border border-accent-blue/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next client?</h2>
          <p className="text-gray-400 mb-8">Join 2,400+ freelancers who use LeadHunter to find clients every day.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all glow-blue-sm">
            Start Hunting for Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-default px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-blue rounded-md flex items-center justify-center">
              <Target size={12} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">LeadHunter</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 LeadHunter. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Privacy</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Terms</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
