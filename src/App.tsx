/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Home as HomeIcon,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  BadgePercent,
  Plus,
  Minus
} from 'lucide-react';

// Pricing database preserving original specifications
const GST_RATE = 0.18;
const PHONE_NUMBER = "6380687876";
const PHONE_DISPLAY = "63806 87876";
const EMAIL_CONTACT = "fifopestcontrolservice@gmail.com";

interface ServiceDef {
  id: string;
  n: string;
  p: string;
  bhk?: (number | null)[];
  from?: number;
  fixed?: number;
  bed?: number;
  desc?: string;
}

const SERVICES_DATA: { home: ServiceDef[]; biz: ServiceDef[] } = {
  home: [
    {
      id: "cr",
      n: "Cockroach Control",
      p: "From ₹2,000",
      bhk: [2000, 2500, 3000],
      desc: "Gel baiting & spray targeting kitchen cabinets and drains"
    },
    {
      id: "ro",
      n: "Rodent & Rat Control",
      p: "From ₹1,500",
      bhk: [1500, 2000, 2500],
      desc: "Tamper-proof bait stations and entry seal tracking"
    },
    {
      id: "bb",
      n: "Bed Bugs Treatment",
      p: "From ₹1,200",
      bhk: [1200, null, null],
      desc: "Deep thermal mist and seam crack eradication"
    },
    {
      id: "gp",
      n: "General Pest Control",
      p: "₹3,000",
      fixed: 3000,
      desc: "Comprehensive perimeter coverage for common household crawling insects"
    },
    {
      id: "mo",
      n: "Mosquito Fogging & Larvicide",
      p: "Price on inspection",
      desc: "Thermal fogging and stagnant drain biological treatments"
    },
    {
      id: "fl",
      n: "House Flies Management",
      p: "Price on inspection",
      desc: "Food-grade UV trapping and organic baiting"
    },
    {
      id: "te",
      n: "Termite Defense (Drill-Fill-Seal)",
      p: "Quotation after inspection",
      desc: "Govt-approved odorless subterranean chemical barrier"
    }
  ],
  biz: [
    {
      id: "cr",
      n: "Cockroach Control",
      p: "From ₹1,500",
      from: 1500,
      desc: "Commercial food-safety compliant gel applications"
    },
    {
      id: "ro",
      n: "Rodent Management",
      p: "From ₹1,000",
      from: 1000,
      desc: "Industrial glue boards, rodent boxes & weekly logging"
    },
    {
      id: "bb",
      n: "Bed Bugs Treatment",
      p: "₹750/room + ₹250/bed",
      bed: 1,
      desc: "Specially tailored for hotels, hostels, and staff dormitories"
    },
    {
      id: "li",
      n: "Lizard & Wall Reptile Control",
      p: "From ₹750",
      from: 750,
      desc: "Non-lethal perimeter repellents and entry exclusion"
    },
    {
      id: "mo",
      n: "Commercial Mosquito Shield",
      p: "From ₹600",
      from: 600,
      desc: "Outdoor grounds fogging & water-treatment management"
    },
    {
      id: "fl",
      n: "Flies & Flying Insect Control",
      p: "From ₹500",
      from: 500,
      desc: "Kitchen fly-catchers and enzymatic surface treatments"
    },
    {
      id: "gp",
      n: "Comprehensive General Pest Control",
      p: "₹3,000",
      fixed: 3000,
      desc: "Facility-wide multi-pest preventive sanitation"
    },
    {
      id: "te",
      n: "Commercial Termite Treatment",
      p: "Quotation after inspection",
      desc: "Warehouse foundation protection with warranty certificate"
    }
  ]
};

const SERVICE_REGIONS = [
  { name: "Salem", areas: "Fairlands, Hasthampatti, Suramangalam, Ammapet, Omalur" },
  { name: "Namakkal", areas: "Tiruchengode, Rasipuram, Mohanur, Paramathi Velur" },
  { name: "Erode", areas: "Perundurai, Bhavani, Gobichettipalayam, Modakurichi" },
  { name: "Coimbatore", areas: "RS Puram, Gandhipuram, Peelamedu, Saravanampatti, Pollachi" }
];

export default function App() {
  const [mode, setMode] = useState<'home' | 'biz'>('home');
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({ cr: true });
  const [bhkIndex, setBhkIndex] = useState<number>(0); // 0 = 1 BHK, 1 = 2 BHK, 2 = 3 BHK
  const [rooms, setRooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [locationCoords, setLocationCoords] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Unique IDs for form labels
  const nameId = useId();
  const companyId = useId();
  const mobileId = useId();
  const addressId = useId();
  const pincodeId = useId();
  const dateId = useId();
  const gstId = useId();
  const notesId = useId();
  const roomsId = useId();
  const bedsId = useId();

  // Helper for INR currency formatting
  const formatINR = (amt: number) => "₹" + amt.toLocaleString("en-IN");

  // Determine line items
  const activeServices = SERVICES_DATA[mode];
  const calculatedLines = activeServices
    .filter(s => selectedServices[s.id])
    .map(s => {
      let displayName = s.n;
      let amt: number | null = null;
      let note = "";

      if (mode === 'home') {
        if (s.bhk) {
          const price = s.bhk[bhkIndex];
          displayName += `, ${bhkIndex + 1} BHK`;
          if (price !== null && price !== undefined) {
            amt = price;
          } else {
            note = "Price on confirmation";
          }
        } else if (s.fixed) {
          amt = s.fixed;
        } else {
          note = s.id === "te" ? "Quotation after inspection" : "Price on inspection";
        }
      } else {
        // Business
        if (s.bed) {
          amt = rooms * 750 + beds * 250;
          displayName += `, ${rooms} room${rooms > 1 ? 's' : ''}, ${beds} bed${beds === 1 ? '' : 's'}`;
        } else if (s.from) {
          amt = s.from;
          note = "Starting price";
        } else if (s.fixed) {
          amt = s.fixed;
        } else {
          note = "Quotation after inspection";
        }
      }

      return {
        id: s.id,
        name: displayName,
        amt,
        note
      };
    });

  // Totals
  const subtotal = calculatedLines.reduce((acc, l) => acc + (l.amt || 0), 0);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gstAmount;

  // Toggle service selection
  const toggleService = (id: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Switch between Home and Business
  const handleModeSwitch = (newMode: 'home' | 'biz') => {
    setMode(newMode);
    // keep default service cockroach selected or preserve
    setSelectedServices({ cr: true });
  };

  // Geolocation trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported on this browser. Please type your full address.");
      return;
    }
    setLocationStatus("Getting GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setLocationCoords(coords);
        setLocationStatus("Location pinned! Will be included in your WhatsApp quote.");
      },
      err => {
        console.warn("Geolocation warning:", err.message);
        setLocationStatus("Could not fetch location. Please allow GPS permissions or enter your address below.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Detect district hint from pincode
  const getDistrictFromPincode = (code: string) => {
    const clean = code.trim();
    if (clean.startsWith('636')) return 'Salem District';
    if (clean.startsWith('637')) return 'Namakkal District';
    if (clean.startsWith('638')) return 'Erode District';
    if (clean.startsWith('641')) return 'Coimbatore District';
    return null;
  };
  const districtHint = pincode ? getDistrictFromPincode(pincode) : null;

  // Build WhatsApp text
  const generateMessageText = () => {
    let msg = `Hello FIFO Pest Control, I would like a quotation.\n\n`;
    msg += `Service for: ${mode === 'home' ? 'Home' : 'Business'}\n`;

    calculatedLines.forEach(l => {
      if (l.amt) {
        msg += `- ${l.name}: ${formatINR(l.amt)}${l.note ? ` (${l.note})` : ''}\n`;
      } else {
        msg += `- ${l.name}: ${l.note}\n`;
      }
    });

    if (subtotal > 0) {
      msg += `\nSubtotal: ${formatINR(subtotal)}\n`;
      msg += `GST at 18%: ${formatINR(gstAmount)}\n`;
      msg += `Total: ${formatINR(grandTotal)}\n`;
    }

    msg += `\nName: ${name.trim()}`;
    if (company.trim()) msg += `\nCompany: ${company.trim()}`;
    msg += `\nMobile: ${mobile.trim()}`;
    msg += `\nAddress: ${address.trim()}`;
    if (pincode.trim()) msg += `\nPincode: ${pincode.trim()}${districtHint ? ` (${districtHint})` : ''}`;
    if (locationCoords) msg += `\nLocation: https://maps.google.com/?q=${locationCoords}`;
    if (preferredDate) msg += `\nPreferred date: ${preferredDate}`;
    if (gstNumber.trim()) msg += `\nGST number: ${gstNumber.trim().toUpperCase()}`;
    if (notes.trim()) msg += `\nNote: ${notes.trim()}`;

    return msg;
  };

  // Submit via WhatsApp
  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatedLines.length === 0) {
      setFormError("Please select at least one pest control service above.");
      return;
    }
    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      setFormError("Please provide your service address.");
      return;
    }

    setFormError("");
    const message = generateMessageText();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${PHONE_NUMBER}?text=${encoded}`;

    // Open WhatsApp in new tab safely
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy quote text to clipboard
  const handleCopyQuote = () => {
    const text = generateMessageText();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }).catch(() => {
      setFormError("Unable to copy to clipboard.");
    });
  };

  // Min date for service date
  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0c0a] text-[#f4f2ea] flex flex-col font-sans selection:bg-[#2fbf6b]/30 selection:text-[#f0d675]">
      
      {/* 1. TOP BAR CONTRACT: Brand Wordmark — Nav Links — Primary CTA */}
      <header className="sticky top-0 z-40 bg-[#0a0c0a]/90 backdrop-blur-md border-b border-[#2b342b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Brand Wordmark (Single text element) */}
          <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f0d675] to-[#d4af37] flex items-center justify-center text-[#0a0c0a] font-black text-sm tracking-tighter shadow-sm">
              F
            </div>
            <span className="font-brand text-lg font-bold tracking-wider text-[#f0d675] group-hover:text-white transition-colors">
              FIFO PEST CONTROL
            </span>
          </a>

          {/* Navigation Links (Single-line, unboxed, hover underline) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#a1aaa1]">
            <a href="#quote" className="hover:text-[#f4f2ea] transition-colors whitespace-nowrap shrink-0">
              Quotation Calculator
            </a>
            <a href="#services" className="hover:text-[#f4f2ea] transition-colors whitespace-nowrap shrink-0">
              Pest Solutions
            </a>
            <a href="#coverage" className="hover:text-[#f4f2ea] transition-colors whitespace-nowrap shrink-0">
              Service Areas
            </a>
            <a href="#why-fifo" className="hover:text-[#f4f2ea] transition-colors whitespace-nowrap shrink-0">
              Quality Assurance
            </a>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:+91${PHONE_NUMBER}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#1a201a] border border-[#2b342b] text-[#f0d675] hover:border-[#d4af37] transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#2fbf6b]" />
              <span>{PHONE_DISPLAY}</span>
            </a>
          </div>

        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#2b342b]/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Proposition */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                
                {/* Regional Trust Marker */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-[#2fbf6b] mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0 text-[#2fbf6b]" />
                    Salem
                  </span>
                  <span className="text-[#a1aaa1]/60" aria-hidden="true">·</span>
                  <span>Namakkal</span>
                  <span className="text-[#a1aaa1]/60" aria-hidden="true">·</span>
                  <span>Erode</span>
                  <span className="text-[#a1aaa1]/60" aria-hidden="true">·</span>
                  <span>Coimbatore</span>
                </div>

                <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f4f2ea] leading-[1.18] [text-wrap:balance]">
                  Professional Pest Control with <span className="text-[#f0d675]">Transparent Pricing</span> & Instant WhatsApp Booking.
                </h1>

                <p className="mt-5 text-base sm:text-lg text-[#a1aaa1] leading-relaxed max-w-xl">
                  Govt-approved odorless treatments for residential homes and commercial establishments across Western Tamil Nadu. Configure your space, view itemized rates including GST, and send your request straight to our dispatch team.
                </p>

                {/* Hero Feature Strip */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs text-[#a1aaa1]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2fbf6b] shrink-0" />
                    <span>Safe for Kids & Pets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f0d675] shrink-0" />
                    <span>Odorless Gel & Spray</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2fbf6b] shrink-0" />
                    <span>Same-Day Inspection</span>
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#quote"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-b from-[#f0d675] to-[#d4af37] text-[#131713] hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[#d4af37]/10"
                  >
                    <span>Calculate Your Quotation</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>

                  <a
                    href={`tel:+91${PHONE_NUMBER}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-xl bg-[#131713] border border-[#2b342b] text-[#f0d675] hover:border-[#d4af37] hover:bg-[#1a201a] active:scale-[0.98] transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#2fbf6b]" />
                    <span>Call Technician Now</span>
                  </a>
                </div>

              </div>

              {/* Right Column: Hero Visual Asset */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-[#2b342b] bg-[#131713] shadow-2xl">
                  <img
                    src="/src/assets/images/fifo_pest_expert_inspection_1792701363445.jpg"
                    alt="FIFO Pest Control Certified Technician inspecting home cabinet"
                    referrerPolicy="no-referrer"
                    className="w-full h-[320px] sm:h-[400px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0a] via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Trust Card */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#131713]/90 backdrop-blur-md border border-[#2b342b] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#f0d675]">FIFO Certified Technicians</div>
                      <div className="text-[11px] text-[#a1aaa1]">Salem · Namakkal · Erode · Coimbatore</div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#0f2417] text-[#2fbf6b] text-xs font-semibold border border-[#2fbf6b]/40">
                      100% Eco-Safe
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. THE INTERACTIVE QUOTATION & BOOKING CALCULATOR SECTION */}
        <section id="quote" className="py-12 sm:py-16 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2fbf6b]">
                Instant Cost Estimator
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f0d675] mt-1.5">
                Calculate Your Pest Control Quotation
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[#a1aaa1]">
                Select your premise type, choose services, and see the exact pricing including 18% GST before sending your enquiry.
              </p>
            </div>

            {/* CONTAINER 1: PROPERTY TYPE SELECTOR */}
            <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#f0d675]">
                  1. Service For
                </h3>
                <span className="text-xs text-[#a1aaa1]">Premise Category</span>
              </div>

              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Service category">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('home')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border font-semibold text-sm sm:text-base transition-all ${
                    mode === 'home'
                      ? 'bg-[#0f2417] border-[#2fbf6b] text-white shadow-[0_0_0_1px_rgba(47,191,107,1)]'
                      : 'bg-[#0d100d] border-[#2b342b] text-[#a1aaa1] hover:text-[#f4f2ea] hover:border-[#a1aaa1]/40'
                  }`}
                  aria-pressed={mode === 'home'}
                >
                  <HomeIcon className={`w-5 h-5 ${mode === 'home' ? 'text-[#2fbf6b]' : 'text-[#a1aaa1]'}`} />
                  <span>Residential Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeSwitch('biz')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border font-semibold text-sm sm:text-base transition-all ${
                    mode === 'biz'
                      ? 'bg-[#0f2417] border-[#2fbf6b] text-white shadow-[0_0_0_1px_rgba(47,191,107,1)]'
                      : 'bg-[#0d100d] border-[#2b342b] text-[#a1aaa1] hover:text-[#f4f2ea] hover:border-[#a1aaa1]/40'
                  }`}
                  aria-pressed={mode === 'biz'}
                >
                  <Building2 className={`w-5 h-5 ${mode === 'biz' ? 'text-[#2fbf6b]' : 'text-[#a1aaa1]'}`} />
                  <span>Commercial Business</span>
                </button>
              </div>

              {/* HOME SIZE SELECTOR (1 BHK, 2 BHK, 3 BHK) */}
              {mode === 'home' && (
                <div className="mt-6 pt-5 border-t border-[#2b342b]">
                  <label className="block text-xs font-semibold text-[#a1aaa1] uppercase tracking-wider mb-2.5">
                    Apartment / Villa Size
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["1 BHK", "2 BHK", "3 BHK"].map((bhkText, idx) => (
                      <button
                        key={bhkText}
                        type="button"
                        onClick={() => setBhkIndex(idx)}
                        className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                          bhkIndex === idx
                            ? 'bg-[#0f2417] border-[#2fbf6b] text-[#2fbf6b] shadow-[0_0_0_1px_rgba(47,191,107,1)]'
                            : 'bg-[#0d100d] border-[#2b342b] text-[#a1aaa1] hover:text-[#f4f2ea]'
                        }`}
                      >
                        {bhkText}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[#a1aaa1]">
                    Pricing dynamically adjusts for room layout and chemical volume needed.
                  </p>
                </div>
              )}

              {/* BUSINESS BED BUGS PARAMETERS */}
              {mode === 'biz' && selectedServices.bb && (
                <div className="mt-6 pt-5 border-t border-[#2b342b]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#f0d675]">
                      Bed Bugs Parameters (Hostel / Hotel / Dormitory)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-[#0d100d] p-3 rounded-xl border border-[#2b342b]">
                      <label htmlFor={roomsId} className="block text-xs text-[#a1aaa1] mb-1.5 font-medium">
                        Number of Rooms (₹750 / room)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-9 h-9 rounded-lg bg-[#1a201a] border border-[#2b342b] flex items-center justify-center text-[#f4f2ea] hover:border-[#2fbf6b]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          id={roomsId}
                          type="number"
                          min="1"
                          value={rooms}
                          onChange={e => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-center bg-transparent border-0 font-bold text-lg text-[#f4f2ea] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          className="w-9 h-9 rounded-lg bg-[#1a201a] border border-[#2b342b] flex items-center justify-center text-[#f4f2ea] hover:border-[#2fbf6b]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0d100d] p-3 rounded-xl border border-[#2b342b]">
                      <label htmlFor={bedsId} className="block text-xs text-[#a1aaa1] mb-1.5 font-medium">
                        Number of Beds (₹250 / bed)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBeds(Math.max(0, beds - 1))}
                          className="w-9 h-9 rounded-lg bg-[#1a201a] border border-[#2b342b] flex items-center justify-center text-[#f4f2ea] hover:border-[#2fbf6b]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          id={bedsId}
                          type="number"
                          min="0"
                          value={beds}
                          onChange={e => setBeds(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center bg-transparent border-0 font-bold text-lg text-[#f4f2ea] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setBeds(beds + 1)}
                          className="w-9 h-9 rounded-lg bg-[#1a201a] border border-[#2b342b] flex items-center justify-center text-[#f4f2ea] hover:border-[#2fbf6b]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* CONTAINER 2: SERVICE SELECTION GRID */}
            <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#f0d675]">
                  2. Choose Pest Treatments
                </h3>
                <span className="text-xs text-[#a1aaa1]">Select one or more services</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="cards">
                {activeServices.map(svc => {
                  const isSelected = !!selectedServices[svc.id];
                  
                  // Compute dynamic card price label
                  let livePriceLabel = svc.p;
                  if (mode === 'home' && svc.bhk) {
                    const currentBhkAmt = svc.bhk[bhkIndex];
                    if (currentBhkAmt) {
                      livePriceLabel = `₹${currentBhkAmt.toLocaleString("en-IN")}`;
                    } else {
                      livePriceLabel = "Price on confirmation";
                    }
                  } else if (mode === 'biz' && svc.bed) {
                    const bedCost = rooms * 750 + beds * 250;
                    livePriceLabel = `₹${bedCost.toLocaleString("en-IN")}`;
                  }

                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[96px] cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#0f2417] border-[#2fbf6b] shadow-[0_0_0_1px_rgba(47,191,107,1)]'
                          : 'bg-[#0d100d] border-[#2b342b] hover:border-[#a1aaa1]/40'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className={`font-bold text-sm sm:text-base ${isSelected ? 'text-[#f4f2ea]' : 'text-[#f4f2ea]'}`}>
                            {svc.n}
                          </div>
                          {svc.desc && (
                            <div className="text-[12px] text-[#a1aaa1] mt-0.5 line-clamp-1">
                              {svc.desc}
                            </div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
                          isSelected
                            ? 'bg-[#2fbf6b] border-[#2fbf6b] text-[#04210f]'
                            : 'border-[#2b342b] bg-[#1a201a] text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#2b342b]/60">
                        <span className="text-[11px] text-[#a1aaa1]">Standard Rate</span>
                        <span className={`text-xs font-semibold tabular-nums ${isSelected ? 'text-[#2fbf6b]' : 'text-[#f0d675]'}`}>
                          {livePriceLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* CONTAINER 3: ITEMIZED QUOTATION SUMMARY */}
            <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2b342b]">
                <div>
                  <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#f0d675]">
                    3. Your Quotation Summary
                  </h3>
                  <div className="text-xs text-[#a1aaa1]">
                    {mode === 'home' ? `Residential (${bhkIndex + 1} BHK)` : 'Commercial Facility'}
                  </div>
                </div>

                {calculatedLines.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1a201a] border border-[#2b342b] text-[#a1aaa1] hover:text-[#f0d675] hover:border-[#d4af37] transition-colors"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2fbf6b]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Quote</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {calculatedLines.length === 0 ? (
                <div className="py-8 text-center text-[#a1aaa1] text-sm">
                  <AlertCircle className="w-8 h-8 text-[#a1aaa1]/60 mx-auto mb-2" />
                  Please choose at least one pest control service above to view rates.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {calculatedLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-[#2b342b]/50 gap-4"
                    >
                      <div>
                        <span className="font-medium text-[#f4f2ea]">{line.name}</span>
                        {line.note && line.amt && (
                          <span className="block text-[11px] text-[#a1aaa1]">
                            {line.note} · Final amount confirmed after on-site check
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-right tabular-nums whitespace-nowrap text-[#f4f2ea]">
                        {line.amt ? formatINR(line.amt) : line.note}
                      </span>
                    </div>
                  ))}

                  {/* Calculations for Subtotal, GST 18%, and Grand Total */}
                  {subtotal > 0 && (
                    <div className="pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm text-[#a1aaa1]">
                        <span>Service Subtotal</span>
                        <span className="tabular-nums font-medium text-[#f4f2ea]">{formatINR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#a1aaa1]">
                        <span className="flex items-center gap-1">
                          GST at 18%
                          <span className="text-[10px] text-[#a1aaa1]/70">(CGST 9% + SGST 9%)</span>
                        </span>
                        <span className="tabular-nums font-medium text-[#f4f2ea]">{formatINR(gstAmount)}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-3 border-t border-[#2b342b] text-base sm:text-lg">
                        <span className="font-bold text-[#f0d675]">Estimated Total (with GST)</span>
                        <span className="font-bold text-[#f0d675] text-xl tabular-nums">{formatINR(grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#a1aaa1] pt-3 leading-relaxed">
                    * Note: Services marked as &ldquo;Price on inspection&rdquo; or starting prices are evaluated and confirmed transparently before work begins. Zero unexpected extra charges.
                  </p>
                </div>
              )}
            </div>

            {/* CONTAINER 4: CUSTOMER DETAILS & DIRECT WHATSAPP ACTION */}
            <form onSubmit={handleSendWhatsApp} className="bg-[#131713] border border-[#2b342b] rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="mb-5 pb-3 border-b border-[#2b342b]">
                <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#f0d675]">
                  4. Your Contact & Service Details
                </h3>
                <p className="text-xs text-[#a1aaa1] mt-0.5">
                  Information is shared directly with FIFO Pest Control technicians for quote dispatch.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor={nameId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    Full Name <span className="text-[#ff8c7a]">*</span>
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>

                {/* Company / Shop Name (Optional) */}
                <div>
                  <label htmlFor={companyId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    Company or Shop Name <span className="text-xs font-normal text-[#a1aaa1]">(Optional)</span>
                  </label>
                  <input
                    id={companyId}
                    type="text"
                    placeholder="e.g. Sri Krishna Sweets / Hotel Royal"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>

                {/* Mobile Number (10 digits) */}
                <div>
                  <label htmlFor={mobileId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    Mobile Number <span className="text-[#ff8c7a]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-[#a1aaa1] font-mono">+91</span>
                    <input
                      id={mobileId}
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl pl-12 pr-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  {mobile && mobile.length !== 10 && (
                    <span className="text-[11px] text-[#ff8c7a] mt-1 block">Please enter full 10-digit mobile number</span>
                  )}
                </div>

                {/* Service Address */}
                <div>
                  <label htmlFor={addressId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    Service Address <span className="text-[#ff8c7a]">*</span>
                  </label>
                  <textarea
                    id={addressId}
                    required
                    rows={2}
                    placeholder="Door no, street, area, nearest landmark (Salem / Namakkal / Erode / Coimbatore)"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>

                {/* Geolocation Button */}
                <div className="p-3.5 rounded-xl bg-[#0d100d] border border-[#2b342b]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#f4f2ea] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2fbf6b]" />
                        Share Current GPS Location (Optional)
                      </div>
                      <div className="text-[11px] text-[#a1aaa1] mt-0.5">
                        Helps our technician arrive directly at your doorstep without call delays.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1a201a] border border-[#2b342b] text-[#f0d675] hover:border-[#d4af37] transition-all whitespace-nowrap shrink-0"
                    >
                      {locationCoords ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2fbf6b]" />
                          <span>Location Shared</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-[#2fbf6b]" />
                          <span>Use My Current Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  {locationStatus && (
                    <div className="mt-2 text-[11px] text-[#2fbf6b] font-medium">
                      {locationStatus}
                    </div>
                  )}
                </div>

                {/* Pincode & Preferred Date in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={pincodeId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                      Pincode <span className="text-xs font-normal text-[#a1aaa1]">(6 digits)</span>
                    </label>
                    <input
                      id={pincodeId}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 636001"
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors font-mono"
                    />
                    {districtHint && (
                      <span className="text-[11px] text-[#2fbf6b] mt-1 block font-medium">
                        Identified: {districtHint}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor={dateId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                      Preferred Service Date
                    </label>
                    <div className="relative">
                      <input
                        id={dateId}
                        type="date"
                        min={todayDate}
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] focus:border-[#d4af37] focus:outline-none transition-colors scheme-dark"
                      />
                    </div>
                  </div>
                </div>

                {/* GST Number (Optional) */}
                <div>
                  <label htmlFor={gstId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    GST Number <span className="text-xs font-normal text-[#a1aaa1]">(Optional, for business tax invoice)</span>
                  </label>
                  <input
                    id={gstId}
                    type="text"
                    maxLength={15}
                    placeholder="33AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors uppercase font-mono"
                  />
                </div>

                {/* Special Notes / Best Time to Call */}
                <div>
                  <label htmlFor={notesId} className="block text-xs font-semibold text-[#f4f2ea] mb-1.5">
                    Anything else? <span className="text-xs font-normal text-[#a1aaa1]">(Problem details, preferred timing)</span>
                  </label>
                  <textarea
                    id={notesId}
                    rows={2}
                    placeholder="e.g. Infestation noticed under kitchen sink. Please call after 4 PM."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-[#0d100d] border border-[#2b342b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4f2ea] placeholder-[#a1aaa1]/40 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>

                {/* Form Error Feedback */}
                {formError && (
                  <div className="p-3 rounded-lg bg-[#2b1414] border border-[#ff8c7a]/40 text-[#ff8c7a] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* SUBMIT ON WHATSAPP BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-bold rounded-xl bg-[#2fbf6b] text-[#04210f] hover:bg-[#28ad60] active:scale-[0.99] transition-all shadow-lg shadow-[#2fbf6b]/20 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Send Enquiry on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-[#a1aaa1] mt-2.5">
                    Your details are used strictly for your pest service scheduling and GST invoicing.
                  </p>
                </div>

              </div>
            </form>

          </div>
        </section>

        {/* 3. SERVICE CATALOG & METHODOLOGY */}
        <section id="services" className="py-12 sm:py-16 bg-[#0e120e] border-y border-[#2b342b]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2fbf6b]">
                Targeted Pest Solutions
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f0d675] mt-1.5">
                Engineered for Safe, Long-Lasting Eradication
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[#a1aaa1]">
                Every treatment is performed by certified technicians adhering to Indian pest control safety standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0f2417] border border-[#2fbf6b]/40 flex items-center justify-center text-[#2fbf6b] mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-[#f4f2ea]">
                    Cockroach & Crawling Insects
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#a1aaa1] leading-relaxed">
                    Targeted micro-dot gel baiting inside kitchen cabinets, appliances, and drain seals. Non-disruptive, odorless, and no kitchen evacuation needed.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2b342b] text-xs font-semibold text-[#f0d675]">
                  From ₹2,000 for Residential
                </div>
              </div>

              <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0f2417] border border-[#2fbf6b]/40 flex items-center justify-center text-[#2fbf6b] mb-4">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-[#f4f2ea]">
                    Termite Drill-Fill-Seal
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#a1aaa1] leading-relaxed">
                    Subterranean chemical barrier defense for wooden wardrobes, door frames, and masonry joints with long-term prevention guarantee.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2b342b] text-xs font-semibold text-[#f0d675]">
                  On-site Inspection Required
                </div>
              </div>

              <div className="bg-[#131713] border border-[#2b342b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0f2417] border border-[#2fbf6b]/40 flex items-center justify-center text-[#2fbf6b] mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-[#f4f2ea]">
                    Commercial Food & Industrial
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#a1aaa1] leading-relaxed">
                    Designed for restaurants, bakeries, hostels, textile mills, and warehouses across Salem and Coimbatore with audit-ready logbooks and GST invoices.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2b342b] text-xs font-semibold text-[#f0d675]">
                  Custom AMC Contract Available
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. COVERAGE AREAS & DISTRICT HUBS */}
        <section id="coverage" className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2fbf6b]">
                Western Tamil Nadu Network
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f0d675] mt-1.5">
                Our Primary Service Hubs
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#a1aaa1]">
                Quick-response technicians based locally in each district center.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICE_REGIONS.map((hub) => (
                <div
                  key={hub.name}
                  className="p-5 rounded-2xl bg-[#131713] border border-[#2b342b] hover:border-[#2fbf6b]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#2fbf6b]" />
                    <h3 className="font-serif-heading text-lg font-bold text-[#f0d675]">
                      {hub.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#a1aaa1] leading-relaxed">
                    {hub.areas}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#2b342b]/60 flex items-center justify-between text-[11px] text-[#2fbf6b]">
                    <span>Active Team On Ground</span>
                    <span>Same-day Service</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 5. WHY FIFO: QUALITY & PEACE OF MIND */}
        <section id="why-fifo" className="py-12 sm:py-16 bg-[#0e120e] border-t border-[#2b342b]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#2fbf6b]">
                  Why Homeowners & Businesses Trust Us
                </span>
                <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f0d675] mt-2 leading-tight">
                  Guaranteed Results Without Disrupting Your Daily Routine.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#a1aaa1] leading-relaxed">
                  Unlike traditional pungent chemical sprays, FIFO utilizes specialized third-generation synthetic pyrethroids and bait matrices that eliminate pests at their nesting origin while being safe for humans and household pets.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2fbf6b] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[#f4f2ea]">Odorless & Non-Staining</div>
                      <div className="text-xs text-[#a1aaa1]">No need to empty utensils from cabinets or vacate your home overnight.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2fbf6b] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[#f4f2ea]">Transparent Fixed Price Promise</div>
                      <div className="text-xs text-[#a1aaa1]">The quote you see in our calculator is exact. No hidden &ldquo;chemical surcharges&rdquo;.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2fbf6b] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-[#f4f2ea]">GST Invoicing for Businesses</div>
                      <div className="text-xs text-[#a1aaa1]">Legitimate 18% GST tax invoices supplied for commercial tax compliance and audits.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="p-6 sm:p-8 rounded-2xl bg-[#131713] border border-[#2b342b]">
                  <h3 className="font-serif-heading text-xl font-bold text-[#f0d675] mb-4">
                    Frequently Asked Questions
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-semibold text-[#f4f2ea] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#2fbf6b]" />
                        Do I need to leave my house during cockroach treatment?
                      </div>
                      <div className="text-xs text-[#a1aaa1] mt-1 pl-6 leading-relaxed">
                        No. Our gel baiting technique is 100% odorless and safe for children and senior citizens. You can remain comfortably in your home.
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2b342b]">
                      <div className="font-semibold text-[#f4f2ea] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#2fbf6b]" />
                        How soon will a technician visit after I send the WhatsApp message?
                      </div>
                      <div className="text-xs text-[#a1aaa1] mt-1 pl-6 leading-relaxed">
                        Our local dispatch team responds immediately to confirm your preferred date and time slot. Same-day service is available for emergencies.
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2b342b]">
                      <div className="font-semibold text-[#f4f2ea] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#2fbf6b]" />
                        How does payment work?
                      </div>
                      <div className="text-xs text-[#a1aaa1] mt-1 pl-6 leading-relaxed">
                        Payment is made only upon completion of the service via UPI (GPay/PhonePe), Cash, or Bank Transfer with official GST receipt.
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* QUIET FOOTER */}
      <footer className="bg-[#0a0c0a] border-t border-[#2b342b] py-8 text-xs text-[#a1aaa1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-brand font-bold text-[#f0d675] text-sm">FIFO PEST CONTROL</div>
            <div className="mt-0.5 text-[#a1aaa1]">
              Professional pest management serving Salem, Namakkal, Erode, and Coimbatore.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href={`tel:+91${PHONE_NUMBER}`} className="hover:text-[#f0d675] transition-colors flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2fbf6b]" />
              <span>+91 {PHONE_DISPLAY}</span>
            </a>
            <a href={`mailto:${EMAIL_CONTACT}`} className="hover:text-[#f0d675] transition-colors">
              {EMAIL_CONTACT}
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA CAP (Height <= 15% of mobile viewport) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c0a]/95 backdrop-blur-md border-t border-[#2b342b] px-4 py-2.5 flex items-center gap-2">
        <a
          href={`tel:+91${PHONE_NUMBER}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#131713] border border-[#2b342b] text-[#f0d675] font-semibold text-xs active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5 text-[#2fbf6b]" />
          <span>Call Now</span>
        </a>
        <a
          href="#quote"
          className="flex-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#2fbf6b] text-[#04210f] font-bold text-xs active:scale-95 transition-transform shadow-md"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Get WhatsApp Quote</span>
        </a>
      </div>

    </div>
  );
}
