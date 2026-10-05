import React, { useState, useEffect } from 'react';
import { Award, Star, Phone, CheckCircle2, UserCheck, Calendar, X, Compass, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const GuidesPage = ({ onHireGuide }: { onHireGuide?: (guide: any) => void }) => {
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [hireModalGuide, setHireModalGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const regions = ['All', 'Kolkata', 'New Delhi', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir'];

  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = guides.filter(g => 
    selectedRegion === 'All' || g.regionName.toLowerCase().includes(selectedRegion.toLowerCase())
  );

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Certified Local Experts</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Tourism Guides of India</h1>
        <p className="text-slate-500 text-sm">Government-certified historians, naturalists, and cultural specialists for personalized heritage walks and immersive journeys.</p>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
        {regions.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedRegion === r
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading certified guides...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(guide => (
            <div 
              key={guide.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={guide.photo} 
                    alt={guide.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/40 shrink-0 shadow-sm"
                  />
                  <div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md uppercase">
                      {guide.badge}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{guide.name}</h3>
                    <p className="text-xs text-slate-500">{guide.regionName}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{guide.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({guide.reviewCount} tours)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800 block text-[11px] mb-0.5">Specialty:</strong>
                    <span className="text-slate-600 line-clamp-2">{guide.specialty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Languages: <strong>{guide.languages}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Experience: <strong>{guide.experienceYears} Years</strong></span>
                  </div>
                </div>

                <p className="text-slate-500 text-xs line-clamp-2">{guide.bio}</p>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 mb-3">
                  <span className="text-xs text-slate-400">Daily Fee</span>
                  <span className="text-lg font-bold text-slate-900">{formatINR(guide.pricePerDay)} <span className="text-[10px] text-slate-400 font-normal">/ day</span></span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSelectedGuide(guide)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    View Bio
                  </button>
                  <button 
                    onClick={() => setHireModalGuide(guide)}
                    className="py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Hire Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl">
            <button 
              onClick={() => setSelectedGuide(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img src={selectedGuide.photo} alt={selectedGuide.name} className="w-20 h-20 rounded-2xl object-cover" />
              <div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                  {selectedGuide.badge}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedGuide.name}</h2>
                <p className="text-xs text-slate-500">{selectedGuide.regionName} · {selectedGuide.experienceYears} Years Exp</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{selectedGuide.bio}</p>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 mb-6">
              <div><strong>Certified By:</strong> {selectedGuide.certifiedBy}</div>
              <div><strong>Spoken Languages:</strong> {selectedGuide.languages}</div>
              <div><strong>Daily Fee:</strong> {formatINR(selectedGuide.pricePerDay)}</div>
              <div><strong>Direct Contact:</strong> {selectedGuide.contactPhone}</div>
            </div>

            <button 
              onClick={() => {
                const g = selectedGuide;
                setSelectedGuide(null);
                setHireModalGuide(g);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Proceed to Hire {selectedGuide.name}
            </button>
          </div>
        </div>
      )}

      {/* Hire Guide Modal */}
      {hireModalGuide && (
        <HireGuideModal 
          guide={hireModalGuide} 
          onClose={() => setHireModalGuide(null)} 
        />
      )}
    </div>
  );
};

const HireGuideModal = ({ guide, onClose }: { guide: any; onClose: () => void }) => {
  const { user, signIn } = useAuth();
  const [days, setDays] = useState(1);
  const [tourDate, setTourDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed'>('idle');

  const total = guide.pricePerDay * days;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }
    setStatus('submitting');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guideId: guide.id,
          bookingType: 'guide',
          travelersCount: 2,
          travelDate: tourDate,
          totalAmount: total,
          contactNumber: phone,
          specialRequests: `Guide booking for ${days} days with ${guide.name}`
        })
      });
      if (res.ok) {
        setStatus('confirmed');
      } else {
        alert('Booking failed.');
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {status === 'confirmed' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Guide Hired Successfully!</h2>
            <p className="text-xs text-slate-500 mb-4">
              <strong>{guide.name}</strong> will connect with you via WhatsApp/Call to finalize your daily itinerary.
            </p>
            <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase">Personal Guide Booking</span>
              <h2 className="text-lg font-bold text-slate-900">{guide.name}</h2>
              <p className="text-xs text-slate-500">{guide.specialty}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tour Date</label>
                <input 
                  type="date"
                  required
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Duration (Days)</label>
                <input 
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Your Phone / WhatsApp</label>
              <input 
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
              <span className="text-xs text-amber-900 font-semibold">Total Guide Fee ({days} days)</span>
              <span className="text-base font-bold text-slate-900">{formatINR(total)}</span>
            </div>

            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {status === 'submitting' ? 'Reserving...' : 'Confirm Guide Reservation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
