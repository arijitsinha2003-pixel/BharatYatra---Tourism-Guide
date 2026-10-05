import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import { 
  MapPin, 
  Search, 
  ArrowRight,
  Heart,
  Calendar,
  LogOut,
  Shield,
  Star,
  Compass,
  Phone,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Building2,
  Tag,
  Coffee,
  Sun,
  BedDouble,
  ChevronRight,
  Filter,
  X,
  Share2,
  IndianRupee,
  Navigation,
  Utensils,
  Car,
  UserCheck,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GuidesPage } from './components/GuidesSection.tsx';
import { RestaurantsPage } from './components/RestaurantsSection.tsx';
import { TransportPage } from './components/TransportSection.tsx';

// Format Indian Rupee Currency
const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// ==========================================
// 1. HOME PAGE
// ==========================================
const HomePage = ({ 
  onSelectDestination, 
  onBookHotel, 
  onBookPackage 
}: { 
  onSelectDestination: (dest: any) => void;
  onBookHotel: (hotel: any) => void;
  onBookPackage: (pkg: any) => void;
}) => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const regions = ['All', 'Kolkata', 'New Delhi', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir'];

  useEffect(() => {
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => setDestinations(data))
      .catch(console.error);

    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => setFeaturedHotels(data.filter((h: any) => h.featured).slice(0, 4)))
      .catch(console.error);

    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackagesList(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavorites(data.map((d: any) => d.id));
          }
        })
        .catch(console.error);
      });
    }
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, destId: number) => {
    e.stopPropagation();
    if (!user) {
      signIn();
      return;
    }
    const token = await user.getIdToken();
    const res = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ destinationId: destId })
    });
    const result = await res.json();
    if (result.favorited) {
      setFavorites(prev => [...prev, destId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== destId));
    }
  };

  const filteredDestinations = destinations.filter(d => {
    const matchesRegion = selectedRegion === 'All' || 
      d.name.toLowerCase().includes(selectedRegion.toLowerCase()) || 
      d.region.toLowerCase().includes(selectedRegion.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.famousFor && d.famousFor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85" 
            alt="Majestic Rajasthan Palace & Incredible India"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto pt-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" /> Incredible India Tourism Guide
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            Discover Timeless <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">Heritage & Wonders</span> of India
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-200 mb-10 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            From the grand colonial boulevards of <strong className="text-white">Kolkata</strong> and imperial monuments of <strong className="text-white">New Delhi</strong> to the royal forts of <strong className="text-white">Rajasthan</strong>, white desert of <strong className="text-white">Gujarat</strong>, and snow valleys of <strong className="text-white">Kashmir</strong>.
          </motion.p>
          
          {/* Main Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-3 border border-white/20 text-slate-900"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search Kolkata, Delhi, Rajasthan, Gujarat, Kashmir, hotels, guides, restaurants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => navigate('/destinations')}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4" /> Explore Sites
            </button>
          </motion.div>

          {/* Quick Region Selector Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedRegion === region
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Services Gateway */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Link to="/destinations" className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex items-center justify-center gap-3">
            <Compass className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-slate-900">Must-Visit Sites</span>
          </Link>
          <Link to="/hotels" className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex items-center justify-center gap-3">
            <BedDouble className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-bold text-slate-900">Regional Hotels</span>
          </Link>
          <Link to="/guides" className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex items-center justify-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900">Certified Guides</span>
          </Link>
          <Link to="/transport" className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex items-center justify-center gap-3">
            <Car className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">Vehicle & Transit Apps</span>
          </Link>
        </div>
      </section>

      {/* Featured Indian Destinations */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Prime Destinations</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Iconic Destinations of India</h2>
            <p className="text-slate-500 text-sm mt-1">Immerse in timeless heritage, vibrant cultures, and royal hospitality</p>
          </div>
          <Link 
            to="/destinations" 
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 group"
          >
            View all destinations <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.slice(0, 6).map((dest, i) => (
            <motion.div 
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              onClick={() => onSelectDestination(dest)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                
                {/* Region Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold rounded-md border border-white/15">
                    {dest.state}
                  </span>
                </div>

                {/* Favorite Button */}
                <button 
                  onClick={(e) => toggleFavorite(e, dest.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                    favorites.includes(dest.id) 
                      ? 'bg-rose-500 text-white shadow-md' 
                      : 'bg-black/30 text-white hover:bg-white hover:text-rose-500'
                  }`}
                  aria-label="Save to favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                {/* Bottom info on image */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{dest.name}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" /> {dest.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-300">Est. Budget</div>
                    <div className="text-sm font-bold text-amber-300">{formatINR(dest.budget)}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-2 line-clamp-1 italic">
                    "{dest.tagline}"
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Best: {dest.bestTime.split('(')[0]}</span>
                  </div>
                  <span className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Regional Hotels Showcase */}
      <section className="py-20 bg-slate-50/80 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Heritage & Luxury Stays</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Featured Regional Hotels</h2>
              <p className="text-slate-500 text-sm mt-1">World-renowned palace hotels, heritage havelis, luxury houseboats & eco-resorts</p>
            </div>
            <Link 
              to="/hotels" 
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 group"
            >
              Browse all regional hotels <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map((hotel) => (
              <div 
                key={hotel.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold rounded-md">
                      {hotel.category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800 shadow-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {hotel.rating}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                      {hotel.regionName}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1.5">{hotel.name}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">{hotel.description}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 mb-3">
                      <span className="text-xs text-slate-400">Nightly rate</span>
                      <span className="text-base font-bold text-slate-900">{formatINR(hotel.pricePerNight)}</span>
                    </div>

                    <button 
                      onClick={() => onBookHotel(hotel)}
                      className="w-full py-2 bg-slate-900 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <BedDouble className="w-3.5 h-3.5" /> Book Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Travel Packages */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Curated Journeys</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Handcrafted Tour Packages</h2>
            <p className="text-slate-500 text-sm mt-1">Complete all-inclusive travel packages with private chauffeured transfers and stays</p>
          </div>
          <Link 
            to="/packages" 
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 group"
          >
            View all packages <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packagesList.map((pkg) => (
            <div 
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={pkg.image} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-md">
                    {pkg.duration}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-sm">
                  {formatINR(pkg.price)} <span className="text-[10px] font-normal text-slate-300">/ person</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-1">{pkg.region}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">{pkg.description}</p>
                  
                  <div className="space-y-1.5 mb-6 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 font-medium">{pkg.placesCovered}</span>
                    </div>
                    {pkg.highlights && (
                      <div className="flex items-start gap-1.5 text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{pkg.highlights}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => onBookPackage(pkg)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Package Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ==========================================
// 2. DESTINATIONS DIRECTORY
// ==========================================
const DestinationsPage = ({ 
  onSelectDestination, 
  onBookHotel 
}: { 
  onSelectDestination: (dest: any) => void;
  onBookHotel: (hotel: any) => void;
}) => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const regionFilters = ['All', 'Kolkata', 'New Delhi', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir'];

  useEffect(() => {
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        setDestinations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = destinations.filter(d => {
    const matchesRegion = selectedRegion === 'All' || 
      d.name.toLowerCase().includes(selectedRegion.toLowerCase()) || 
      d.region.toLowerCase().includes(selectedRegion.toLowerCase());
    const matchesSearch = search === '' || 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.location.toLowerCase().includes(search.toLowerCase()) || 
      d.state.toLowerCase().includes(search.toLowerCase()) ||
      (d.famousFor && d.famousFor.toLowerCase().includes(search.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Explore India</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Tourist Destinations of India</h1>
        <p className="text-slate-500 text-sm">Discover majestic architectural wonders, cultural sanctuaries, and scenic landscapes across India’s premier travel circuits.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {regionFilters.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedRegion === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by city, monument, food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading destinations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest) => (
            <div 
              key={dest.id}
              onClick={() => onSelectDestination(dest)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold rounded-md border border-white/10">
                    {dest.state}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-amber-300 font-bold text-xs">
                  {formatINR(dest.budget)} <span className="text-[10px] text-slate-300 font-normal">est.</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{dest.name}</h3>
                  <p className="text-xs font-medium text-amber-700 italic mb-3 line-clamp-1">"{dest.tagline}"</p>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">{dest.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Duration: {dest.idealDuration}</span>
                  <span className="font-bold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Attractions & Hotels <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. REGIONAL HOTELS PAGE
// ==========================================
const HotelsPage = ({ onBookHotel }: { onBookHotel: (hotel: any) => void }) => {
  const [hotelsList, setHotelsList] = useState<any[]>([]);
  const [regionFilter, setRegionFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const regionTabs = ['All', 'Kolkata', 'New Delhi', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir'];

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        setHotelsList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredHotels = hotelsList.filter(h => {
    const matchesRegion = regionFilter === 'All' || h.regionName.toLowerCase().includes(regionFilter.toLowerCase());
    const matchesCat = categoryFilter === 'All' || h.category.toLowerCase().includes(categoryFilter.toLowerCase().replace(' / stay', ''));
    const matchesSearch = search === '' || 
      h.name.toLowerCase().includes(search.toLowerCase()) || 
      h.address.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesCat && matchesSearch;
  });

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Regional Accommodations</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Hotels & Heritage Stays</h1>
        <p className="text-slate-500 text-sm">Experience royal Rajput palaces, colonial Kolkata grand hotels, luxury houseboats on Dal Lake, and desert camps in Kutch.</p>
      </div>

      <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Region:
            </span>
            {regionTabs.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  regionFilter === r
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search hotel name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading regional hotels...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((hotel) => (
            <div 
              key={hotel.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-bold rounded-md">
                    {hotel.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {hotel.rating}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hotel.regionName}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{hotel.name}</h3>
                  <p className="text-slate-500 text-xs line-clamp-1 mb-2.5">{hotel.address}</p>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">{hotel.description}</p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 mb-3">
                    <span className="text-xs text-slate-400">Starting from</span>
                    <div>
                      <span className="text-lg font-bold text-slate-900">{formatINR(hotel.pricePerNight)}</span>
                      <span className="text-[10px] text-slate-400"> / night</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={`tel:${hotel.contactPhone}`} 
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" /> Inquire
                    </a>
                    <button 
                      onClick={() => onBookHotel(hotel)}
                      className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <BedDouble className="w-3.5 h-3.5" /> Book Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. ATTRACTIONS DIRECTORY
// ==========================================
const TouristPlacesPage = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tourist-places')
      .then(res => res.json())
      .then(data => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Attractions & Monuments</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Famous Tourist Attractions</h1>
        <p className="text-slate-500 text-sm">Detailed guide on opening hours, entry tickets, history, and expert travel tips for India’s top historical and scenic wonders.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading tourist places...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => (
            <div 
              key={place.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold rounded-md">
                    {place.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-md">
                  {place.entryFee}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{place.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {place.location}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{place.details}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{place.openingInfo}</span>
                  </div>
                  {place.travelTips && (
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 text-amber-900 text-[11px]">
                      <strong>Insider Tip:</strong> {place.travelTips}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. PACKAGES DIRECTORY
// ==========================================
const PackagesPage = ({ onBookPackage }: { onBookPackage: (pkg: any) => void }) => {
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        setPackagesList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Tailored Itineraries</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">India Travel Tour Packages</h1>
        <p className="text-slate-500 text-sm">All-inclusive packages covering royal heritage circuits, Himalayan retreats, desert glamping, and cultural food expeditions.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading tour packages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packagesList.map((pkg) => (
            <div 
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={pkg.image} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-md">
                    {pkg.duration}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-sm">
                  {formatINR(pkg.price)} <span className="text-[10px] font-normal text-slate-300">/ person</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-1">{pkg.region}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{pkg.description}</p>
                  
                  <div className="space-y-2 mb-6 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{pkg.placesCovered}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onBookPackage(pkg)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book This Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. CONTACT PAGE
// ==========================================
const ContactPage = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    destinationInterest: 'Rajasthan (Jaipur & Udaipur)', 
    subject: '', 
    message: '' 
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', destinationInterest: 'Rajasthan (Jaipur & Udaipur)', subject: '', message: '' });
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Connect With Us</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-4">India Tourism Helpdesk</h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            Planning a custom journey across Kolkata, Delhi, Rajasthan, Gujarat, or Kashmir? Our certified travel specialists are ready to tailor your flights, luxury heritage stays, and guided itineraries.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">24/7 Tourism Hotline</h3>
                <p className="text-slate-600 text-xs">+91 1800-258-3690 (Toll Free)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Namaste! Inquiry Received</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                Our India travel expert will call you back within 24 hours with customized options.
              </p>
              <button onClick={() => setStatus('idle')} className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Send Tour / Guide / Hotel Inquiry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  required
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name *"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
                <input 
                  required
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address *"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone / WhatsApp (+91...)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
                <select
                  value={form.destinationInterest}
                  onChange={(e) => setForm({ ...form, destinationInterest: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option>Kolkata & West Bengal</option>
                  <option>New Delhi & Capital Region</option>
                  <option>Rajasthan (Jaipur & Udaipur)</option>
                  <option>Gujarat (Kutch & Gir)</option>
                  <option>Jammu & Kashmir (Srinagar & Gulmarg)</option>
                </select>
              </div>
              <input 
                required
                type="text" 
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Subject *"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
              <textarea 
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Travel details, preferred dates, number of travelers, hotel/guide requests..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 resize-none"
              />
              <button 
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
              >
                {status === 'sending' ? 'Sending Inquiry...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. USER PROFILE
// ==========================================
const ProfilePage = () => {
  const { user, dbUser, logout, signIn } = useAuth();
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch('/api/my-bookings', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => setMyBookings(Array.isArray(data) ? data : []))
          .catch(console.error);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-24 px-6 text-center max-w-md mx-auto">
        <Compass className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to Access Your Profile</h2>
        <button onClick={signIn} className="mt-4 px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer">
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-8">
        <div className="h-28 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-700" />
        <div className="px-8 pb-8">
          <div className="relative -mt-14 mb-4 flex justify-between items-end">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt="Profile" 
              className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md bg-white"
            />
            <button onClick={logout} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{dbUser?.displayName || user.displayName || user.email}</h1>
          <p className="text-slate-500 text-xs">{user.email}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">My Confirmed Bookings ({myBookings.length})</h2>
      {myBookings.length === 0 ? (
        <div className="bg-slate-50 p-10 rounded-2xl text-center text-slate-500 text-xs">
          No bookings yet. Explore our destinations, hotels, or certified guides.
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                  {b.status} · {b.bookingType}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  {b.hotel?.name || b.package?.name || b.guide?.name || 'Reservation'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Date: {b.travelDate} · Travelers: {b.travelersCount}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Total Amount</span>
                <span className="font-bold text-slate-900 text-base">{formatINR(b.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. DESTINATION DETAIL MODAL
// ==========================================
const DestinationDetailModal = ({ 
  destination, 
  onClose, 
  onBookHotel 
}: { 
  destination: any; 
  onClose: () => void;
  onBookHotel: (hotel: any) => void;
}) => {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (destination?.id) {
      fetch(`/api/destinations/${destination.id}`)
        .then(res => res.json())
        .then(data => setDetails(data))
        .catch(console.error);
    }
  }, [destination]);

  if (!destination) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white hover:bg-black rounded-full backdrop-blur-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-60 bg-slate-900 shrink-0">
          <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-md">
              {destination.state}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{destination.name}</h2>
            <p className="text-xs text-slate-200 italic mt-0.5">"{destination.tagline}"</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Best Season</span>
              <strong>{destination.bestTime}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Budget</span>
              <strong className="text-amber-600">{formatINR(destination.budget)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Ideal Stay</span>
              <strong>{destination.idealDuration}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Famous For</span>
              <strong className="line-clamp-1">{destination.famousFor}</strong>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">About {destination.name}</h3>
            <p className="text-slate-600 leading-relaxed">{destination.description}</p>
          </div>

          {destination.localCuisine && (
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                <Coffee className="w-4 h-4 text-amber-700" /> Must-Try Regional Foods
              </h4>
              <p className="text-slate-700">{destination.localCuisine}</p>
            </div>
          )}

          {/* Tourist Places */}
          {details?.touristPlaces?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" /> Top Attractions in {destination.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.touristPlaces.map((place: any) => (
                  <div key={place.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-slate-900 text-xs">{place.name}</strong>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">{place.entryFee}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mb-2">{place.details}</p>
                    <div className="text-[10px] text-slate-500"><strong>Hours:</strong> {place.openingInfo}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Hotels */}
          {details?.hotels?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-amber-600" /> Stays in {destination.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.hotels.map((h: any) => (
                  <div key={h.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                    <div>
                      <strong className="text-slate-900 block text-xs">{h.name}</strong>
                      <span className="text-[11px] font-bold text-amber-600">{formatINR(h.pricePerNight)}/night</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onBookHotel(h);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-amber-600 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      Book Stay
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. BOOKING MODAL
// ==========================================
const BookingModal = ({ 
  item, 
  type, 
  onClose 
}: { 
  item: any; 
  type: 'hotel' | 'package'; 
  onClose: () => void;
}) => {
  const { user, signIn } = useAuth();
  const [travelers, setTravelers] = useState(2);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [nights, setNights] = useState(2);
  const [contactNumber, setContactNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed'>('idle');

  if (!item) return null;

  const totalAmount = type === 'hotel' 
    ? item.pricePerNight * nights 
    : item.price * travelers;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }
    setStatus('submitting');
    try {
      const token = await user.getIdToken();
      await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: type === 'package' ? item.id : null,
          hotelId: type === 'hotel' ? item.id : null,
          bookingType: type,
          travelersCount: travelers,
          travelDate,
          totalAmount,
          contactNumber
        })
      });
      setStatus('confirmed');
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {status === 'confirmed' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Reservation Confirmed!</h2>
            <p className="text-xs text-slate-500 mb-4">Saved to your profile. Details sent via SMS/Email.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase">Confirm {type === 'hotel' ? 'Hotel' : 'Tour'} Reservation</span>
              <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Date</label>
                <input 
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{type === 'hotel' ? 'Nights' : 'Travelers'}</label>
                <input 
                  type="number"
                  min={1}
                  value={type === 'hotel' ? nights : travelers}
                  onChange={(e) => type === 'hotel' ? setNights(Math.max(1, parseInt(e.target.value) || 1)) : setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <input 
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
              <span className="text-xs text-amber-900 font-semibold">Total Fare</span>
              <span className="text-base font-bold text-slate-900">{formatINR(totalAmount)}</span>
            </div>

            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {status === 'submitting' ? 'Confirming...' : 'Confirm & Reserve'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 10. MAIN APP & ROUTING
// ==========================================
export default function App() {
  const { user, signIn, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [bookingModalData, setBookingModalData] = useState<{ item: any; type: 'hotel' | 'package' } | null>(null);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <Compass className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Bharat Yatra</h2>
        <p className="text-xs text-slate-400 mt-1">Loading Incredible India Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span>Bharat</span><span className="text-amber-600">Yatra</span>
              <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">Incredible India</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
            <Link to="/" className={`py-1 ${location.pathname === '/' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Home</Link>
            <Link to="/destinations" className={`py-1 ${location.pathname === '/destinations' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Destinations</Link>
            <Link to="/hotels" className={`py-1 ${location.pathname === '/hotels' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Hotels</Link>
            <Link to="/guides" className={`py-1 ${location.pathname === '/guides' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Guides</Link>
            <Link to="/restaurants" className={`py-1 ${location.pathname === '/restaurants' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Food & Dining</Link>
            <Link to="/transport" className={`py-1 ${location.pathname === '/transport' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Vehicle Apps</Link>
            <Link to="/packages" className={`py-1 ${location.pathname === '/packages' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Packages</Link>
            <Link to="/contact" className={`py-1 ${location.pathname === '/contact' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>Contact</Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full">
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.displayName?.split(' ')[0] || 'My Account'}</span>
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
              </Link>
            ) : (
              <button onClick={signIn} className="px-5 py-2.5 bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold uppercase rounded-full cursor-pointer">
                Sign In
              </button>
            )}

            <button className="lg:hidden p-2 text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-white pt-24 px-6 lg:hidden flex flex-col justify-between pb-8 shadow-xl"
          >
            <div className="flex flex-col gap-4 text-sm font-bold">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Home</Link>
              <Link to="/destinations" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Destinations</Link>
              <Link to="/hotels" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Regional Hotels</Link>
              <Link to="/guides" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Tourism Guides</Link>
              <Link to="/restaurants" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Fooding & Famous Restaurants</Link>
              <Link to="/transport" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Vehicle & Transit Apps (Uber/RedBus)</Link>
              <Link to="/places" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Attractions</Link>
              <Link to="/packages" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Tour Packages</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-slate-100">Contact</Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="py-2">My Profile</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Routed Content */}
      <main className="pt-20 flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                onSelectDestination={setSelectedDestination}
                onBookHotel={(hotel) => setBookingModalData({ item: hotel, type: 'hotel' })}
                onBookPackage={(pkg) => setBookingModalData({ item: pkg, type: 'package' })}
              />
            } 
          />
          <Route 
            path="/destinations" 
            element={
              <DestinationsPage 
                onSelectDestination={setSelectedDestination}
                onBookHotel={(hotel) => setBookingModalData({ item: hotel, type: 'hotel' })}
              />
            } 
          />
          <Route 
            path="/hotels" 
            element={
              <HotelsPage 
                onBookHotel={(hotel) => setBookingModalData({ item: hotel, type: 'hotel' })}
              />
            } 
          />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/places" element={<TouristPlacesPage />} />
          <Route 
            path="/packages" 
            element={
              <PackagesPage 
                onBookPackage={(pkg) => setBookingModalData({ item: pkg, type: 'package' })}
              />
            } 
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* Modals */}
      {selectedDestination && (
        <DestinationDetailModal 
          destination={selectedDestination} 
          onClose={() => setSelectedDestination(null)}
          onBookHotel={(hotel) => setBookingModalData({ item: hotel, type: 'hotel' })}
        />
      )}

      {bookingModalData && (
        <BookingModal 
          item={bookingModalData.item} 
          type={bookingModalData.type} 
          onClose={() => setBookingModalData(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 px-6 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-2xl font-black">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span>Bharat<span className="text-amber-500">Yatra</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Complete guide to Kolkata, New Delhi, Rajasthan, Gujarat, and Kashmir. Certified tourist guides, iconic eateries, regional hotels, and transit app recommendations.
            </p>
            <div className="text-xs text-amber-400 font-semibold pt-2">
              Toll Free 24/7 Helpline: 1800-258-3690
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200 mb-4">Travel Services</h4>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li><Link to="/destinations" className="hover:text-amber-400">Must-Visit Indian Destinations</Link></li>
              <li><Link to="/hotels" className="hover:text-amber-400">Palace & Heritage Hotels</Link></li>
              <li><Link to="/guides" className="hover:text-amber-400">Hire Certified Tourist Guides</Link></li>
              <li><Link to="/restaurants" className="hover:text-amber-400">Famous Restaurants & Fooding</Link></li>
              <li><Link to="/transport" className="hover:text-amber-400">Vehicle & Transit Apps (Uber/RedBus)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li><Link to="/places" className="hover:text-amber-400">Famous Monuments & Attractions</Link></li>
              <li><Link to="/packages" className="hover:text-amber-400">All-Inclusive Tour Packages</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400">Contact Travel Specialists</Link></li>
              <li><Link to="/profile" className="hover:text-amber-400">My Bookings & Saved Stays</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© 2026 Bharat Yatra - Incredible India Tourism Guide. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
