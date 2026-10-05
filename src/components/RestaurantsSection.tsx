import React, { useState, useEffect } from 'react';
import { Utensils, Star, MapPin, Clock, Flame, Coffee, Sparkles } from 'lucide-react';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loading, setLoading] = useState(true);

  const regions = ['All', 'Kolkata', 'New Delhi', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir'];

  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r => 
    selectedRegion === 'All' || r.regionName.toLowerCase().includes(selectedRegion.toLowerCase())
  );

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Culinary Heritage & Fooding</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Famous Restaurants & Must-Try Foods</h1>
        <p className="text-slate-500 text-sm">A gastronomic journey across 100-year-old historic eateries, royal Rajput thalis, Kolkata biryani, and Kashmiri wazwan banquets.</p>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
        {regions.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedRegion === r
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Must Try Iconic Dishes Spotlight Banner */}
      <div className="mb-12 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-100 mb-2">
          <Flame className="w-4 h-4" /> Quintessential Indian Flavors
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Must-Try Iconic Dishes by Region</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-slate-950 text-xs">
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl">
            <strong className="text-amber-800 block text-sm mb-1 font-bold">Kolkata</strong>
            <p className="text-slate-600">Kolkata Mutton Biryani with Aloo, Chelo Kebab, Kosha Mangsho, Warm Rosogolla & Mishti Doi.</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl">
            <strong className="text-amber-800 block text-sm mb-1 font-bold">New Delhi</strong>
            <p className="text-slate-600">Dal Bukhara, Chandni Chowk Stuffed Parathas, Karim's Mutton Nihari, Butter Chicken.</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl">
            <strong className="text-amber-800 block text-sm mb-1 font-bold">Rajasthan</strong>
            <p className="text-slate-600">Royal Dal Baati Churma, Spicy Laal Maas, Ker Sangri, Pyaaz Kachori, Malpua & Ghevar.</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl">
            <strong className="text-amber-800 block text-sm mb-1 font-bold">Gujarat</strong>
            <p className="text-slate-600">Agashiye Royal Thali, Winter Undhiyu, Khaman Dhokla, Ringna No Oro with Bajra Rotla & Jaggery.</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl">
            <strong className="text-amber-800 block text-sm mb-1 font-bold">Jammu & Kashmir</strong>
            <p className="text-slate-600">36-Course Kashmiri Wazwan (Rogan Josh, Rista, Gushtaba), Pink Noon Chai, Saffron Kahwa.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading iconic restaurants...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(rest => (
            <div 
              key={rest.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img 
                    src={rest.image} 
                    alt={rest.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[11px] font-bold rounded-md">
                      {rest.regionName}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {rest.rating}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    {rest.cuisineType}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{rest.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {rest.address}
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{rest.description}</p>

                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 mb-3">
                    <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Must-Try Signature Dishes:
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{rest.mustTryDishes}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg. Price for Two</span>
                    <span className="font-bold text-slate-900">{formatINR(rest.priceForTwo)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Operating Hours</span>
                    <span className="font-medium text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {rest.timing}
                    </span>
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
