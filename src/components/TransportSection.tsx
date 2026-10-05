import React, { useState } from 'react';
import { 
  Car, 
  Bus, 
  Train, 
  Navigation, 
  Smartphone, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Info,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export const TransportPage = () => {
  const [selectedMode, setSelectedMode] = useState<'all' | 'cabs' | 'buses' | 'trains' | 'rentals'>('all');

  const apps = [
    {
      name: 'Uber India',
      category: 'cabs',
      type: 'City & Outstation Cabs',
      tagline: 'Reliable on-demand cabs, autos & outstation rides across all Indian metro cities.',
      icon: Car,
      color: 'bg-black text-white',
      badge: 'Uber Premier & Uber Auto',
      features: ['24/7 Available in Delhi, Kolkata, Jaipur, Ahmedabad', 'Cashless UPI / Credit Card payment', 'Live GPS Tracking & Safety PIN'],
      appUrl: 'https://www.uber.com/in/en/',
      playStore: 'Uber: Driver & Rider App'
    },
    {
      name: 'Ola Cabs',
      category: 'cabs',
      type: 'Cabs, Prime & Rentals',
      tagline: 'India’s homegrown ride-hailing app with Micro, Mini, Prime Sedan, and Hourly Rentals.',
      icon: Car,
      color: 'bg-lime-500 text-slate-950',
      badge: 'Ola Prime & Auto',
      features: ['Hourly car rentals with driver for city tours', 'Outstation one-way and round trips', 'Multi-lingual driver support'],
      appUrl: 'https://www.olacabs.com/',
      playStore: 'Ola Cabs App'
    },
    {
      name: 'BluSmart EV',
      category: 'cabs',
      type: '100% Electric Premium Cabs',
      tagline: 'Zero cancellation, 100% electric premium fleet operating in Delhi NCR & Bengaluru.',
      icon: Zap,
      color: 'bg-blue-600 text-white',
      badge: 'Zero Cancellation Guarantee',
      features: ['Scheduled airport drop & pickups', 'Spotless silent electric sedans', 'Professional verified chauffeurs'],
      appUrl: 'https://blu-smart.com/',
      playStore: 'BluSmart Mobility'
    },
    {
      name: 'RedBus',
      category: 'buses',
      type: 'Intercity Bus Booking',
      tagline: 'India’s largest bus ticket booking app connecting 3,500+ private & state RTC operators.',
      icon: Bus,
      color: 'bg-red-600 text-white',
      badge: 'AC Sleeper & Volvo Multi-Axle',
      features: ['Delhi to Jaipur / Agra / Shimla Volvo buses', 'Ahmedabad to Kutch & Sasan Gir sleeper coaches', 'Live bus tracking & boarding alerts'],
      appUrl: 'https://www.redbus.in/',
      playStore: 'redBus: Bus Booking App'
    },
    {
      name: 'IRCTC Rail Connect',
      category: 'trains',
      type: 'Indian Railways Official App',
      tagline: 'Official Indian Railways portal for Vande Bharat Express, Rajdhani, and Shatabdi tickets.',
      icon: Train,
      color: 'bg-orange-600 text-white',
      badge: 'Vande Bharat & Rajdhani Express',
      features: ['Fast Vande Bharat connections (Delhi-Varanasi, Delhi-Katra/Kashmir, Howrah-Puri)', 'Live train running status & PNR check', 'E-catering meal booking on seats'],
      appUrl: 'https://www.irctc.co.in/',
      playStore: 'IRCTC Rail Connect'
    },
    {
      name: 'Zoomcar & Savaari',
      category: 'rentals',
      type: 'Self-Drive & Chauffeur Rentals',
      tagline: 'Flexible self-drive SUVs or private chauffeur-driven tourist cars for customized circuits.',
      icon: Navigation,
      color: 'bg-emerald-600 text-white',
      badge: 'Self Drive & Chauffeur Outstation',
      features: ['SUVs for Kashmir & Leh Ladakh road trips', 'Heritage circuit chauffeured Innova Crystas in Rajasthan', 'Keyless doorstep car delivery'],
      appUrl: 'https://www.zoomcar.com/',
      playStore: 'Zoomcar / Savaari Cabs'
    }
  ];

  const localTransitTips = [
    {
      region: 'Kolkata',
      tip: 'Use iconic Yellow Ambassador Taxis with meter or book Uber. Don\'t miss the scenic Hooghly ferry (Princep Ghat to Howrah) and the historic AC Kolkata Metro.'
    },
    {
      region: 'New Delhi',
      tip: 'The Delhi Metro (DMRC) is the fastest way to avoid traffic. For short hops around monuments, use BluSmart EV cabs or CNG Auto-rickshaws with Uber Auto.'
    },
    {
      region: 'Rajasthan (Jaipur/Udaipur)',
      tip: 'Hire dedicated private AC cabs (Innova) for fort circuits (Amer, Jaigarh, Nahargarh). In Udaipur, government prepaid auto stands or pre-booked lake boats are ideal.'
    },
    {
      region: 'Gujarat (Kutch/Gir)',
      tip: 'Pre-book Gujarat State Road Transport (GSRTC) Volvo buses or private self-drive Zoomcar SUVs for the long scenic highways of Kutch and Gir National Park.'
    },
    {
      region: 'Jammu & Kashmir',
      tip: 'Pre-negotiate Shikara boat rides at Dal Lake Ghats (Government fixed rate: ₹700–₹1,000/hr). For Gulmarg/Pahalgam, use pre-booked tourist taxi union registered cabs.'
    }
  ];

  const filteredApps = apps.filter(a => selectedMode === 'all' || a.category === selectedMode);

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Travel Smart & Transit</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Vehicle & Travel Apps for India</h1>
        <p className="text-slate-500 text-sm">Recommended verified apps for booking on-demand cabs (Uber/Ola), luxury Volvo intercity buses (RedBus), high-speed Vande Bharat trains, and car rentals.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {[
          { id: 'all', label: 'All Travel Apps' },
          { id: 'cabs', label: 'Cabs & Rides (Uber / Ola / BluSmart)' },
          { id: 'buses', label: 'Intercity Buses (RedBus)' },
          { id: 'trains', label: 'Railways (IRCTC / Vande Bharat)' },
          { id: 'rentals', label: 'Car Rentals (Zoomcar / Savaari)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedMode(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedMode === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {filteredApps.map((app, i) => {
          const IconComponent = app.icon;
          return (
            <div 
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${app.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200/60 uppercase">
                    {app.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">{app.name}</h3>
                <p className="text-xs font-medium text-amber-700 mb-2">{app.type}</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">{app.tagline}</p>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 mb-6">
                  {app.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a 
                href={app.appUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Open {app.name} <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Regional Local Transit Advice */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
          <Info className="w-4 h-4" /> Regional Transportation Tips
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">How to Commute in Each Region</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localTransitTips.map((tip, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h3 className="text-amber-400 font-bold text-sm mb-1.5">{tip.region}</h3>
              <p className="text-slate-300 text-xs leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
