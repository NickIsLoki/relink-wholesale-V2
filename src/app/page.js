'use client';
import React, { useState, useMemo, useEffect } from 'react';

import {

  Search, MapPin, Package, Upload, Filter, Plus, Minus, X, Check,

  ShoppingCart, ChevronDown, ChevronRight, Building2,

  User, AlertCircle, Download, Trash2, Layers, Hash, ArrowRight,

  Clock, CheckCircle2, FileSpreadsheet, Settings, Image as ImageIcon,

  Camera, ChevronUp, FileText, Send, Mail, Calendar, Truck, Lock, Phone, CreditCard,

  Sparkles, RefreshCw, HelpCircle, XCircle, Circle, Activity, Droplet, ScanLine,

  Eye, Scissors, Wind, Stethoscope, Shield, LogOut, UserPlus, Users as UsersIcon,

  Percent, Edit2, Trash, EyeOff, ShieldCheck, MoreVertical, Plus as PlusIcon,

  ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, Save

} from 'lucide-react';

// ============================================================================

// BRAND TOKENS - reLink Medical Brand Guidelines v1.0

// ============================================================================

const C = {

  // Anchor & Neutrals

  espresso: '#2E2622',     // primary dark anchor (replaces black)

  cocoa: '#4A3E3A',        // body copy on light

  stone: '#6B615C',        // secondary text, captions, metadata

  cream: '#FAF7F1',        // PRIMARY BACKGROUND

  sand: '#EFE9DA',         // section variant (deeper than cream)

  taupe: '#E4DED0',        // hairlines, borders, dividers

  white: '#FFFFFF',        // cards on cream

  // Primary

  orange: '#F38637',       // Action Orange - single primary CTA per screen

  orangeDeep: '#D46A1E',   // hover state, eyebrow text

  // Secondary

  olive: '#90AD51',        // sustainability, On-Demand, biomed/HTM

  oliveDeep: '#6E8A36',    // olive text on light

  teal: '#0598A6',         // tech/platform, reLink360, patient-ready

  tealDeep: '#036E78',     // teal text on light

  // Tints

  orangeTint: '#FDECDC',

  oliveTint: '#EDF2DE',

  tealTint: '#DDF0F2',

  // Functional / system (not in guidelines but needed for status)

  red: '#C84141',          // form error red from guidelines S09

  redTint: '#FBE9E9',

  amber: '#C58A1F',        // warning - close to brand-acceptable warm tone

  amberTint: '#FAF1DA',

};

// ============================================================================

// INVENTORY DATA - loaded from inventory.json at startup

// ============================================================================

const HUBS = [

  { id: 'twb', name: 'Twinsburg, OH', code: 'TWB', zip: '44087-2277' },

  { id: 'cpk', name: 'College Park, GA', code: 'CPK', zip: '30349-2974' },

  { id: 'haz', name: 'Hazelwood, MO', code: 'HAZ', zip: '63042-2446' },

  { id: 'jef', name: 'Jefferson, LA', code: 'JEF', zip: '70121-1017' },

  { id: 'wmh', name: 'White Marsh, MD', code: 'WMH', zip: '21162-1207' },

  { id: 'lkl', name: 'Lakeland, FL', code: 'LKL', zip: '33815-1116' },

  { id: 'atl', name: 'Conyers, GA', code: 'ATL', zip: '30013' },

];

const FUNCTIONAL = ['New', 'Refurbished', 'Tested Working', 'Untested', 'Non-Functional'];

const COSMETIC = ['New in Box', 'Excellent', 'Good', 'Poor'];

const CATEGORIES = ['Patient Monitoring', 'Infusion', 'Imaging', 'Endoscopy', 'Surgical', 'Respiratory', 'Diagnostic', 'General'];

// Color-by-meaning per brand: teal = patient-ready/platform, olive = sustainability/biomed,

// orange = action only. So functional grades map: New/Refurb = teal (patient-ready),

// Tested Working = olive (biomed-validated), Untested/Non-Func = stone/amber (neutral status).

const fnTone = (f) => ({

  'New': 'teal',

  'Refurbished': 'teal',

  'Tested Working': 'olive',

  'Untested': 'stone',

  'Non-Functional': 'amber',

}[f] || 'stone');

const csmTone = (c) => ({

  'New in Box': 'teal',

  'Excellent': 'olive',

  'Good': 'stone',

  'Poor': 'amber',

}[c] || 'stone');

// Placeholder photo for items missing images

const PLACEHOLDER_PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#EFE9DA"/><rect x="20" y="20" width="160" height="120" rx="6" fill="#2E2622"/><rect x="32" y="32" width="136" height="80" rx="3" fill="#1a1310"/><text x="100" y="80" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B615C">No Photo</text></svg>');

// Mutable arrays - populated by hydrateInventory() on app load

let ALL_UNITS = [];

let MATERIALS = [];

// Price multipliers for condition-based pricing

const fnMult = (fn) => ({ 'New': 1.0, 'Refurbished': 0.85, 'Tested Working': 0.7, 'Untested': 0.45, 'Non-Functional': 0.2 }[fn] || 0.5);

const csMult = (cs) => ({ 'New in Box': 1.05, 'Excellent': 1.0, 'Good': 0.95, 'Poor': 0.85 }[cs] || 0.9);

// Transform compact inventory.json into the MATERIALS / ALL_UNITS format the UI expects

function hydrateInventory(data) {

  const prefix = data.photoPrefix || '';

  const mats = [];

  const allU = [];

  data.materials.forEach((m) => {

    const key = m.o + '::' + m.n;

    const units = m.u.map((u) => {

      const photoUrl = u.i ? (u.i.startsWith('http') ? u.i : prefix + u.i) : '';

      const unit = {

        invSku: u.s,

        serial: u.r || 'NONE',

        hub: u.h,

        functional: u.f,

        cosmetic: u.c,

        unitPrice: u.p,

        powersOn: u.f !== 'Non-Functional' && u.f !== 'Untested',

        photo: photoUrl || PLACEHOLDER_PHOTO,

        photos: photoUrl ? [photoUrl] : [],

        notes: u.n || '',

      };

      allU.push({ ...unit, materialKey: key });

      return unit;

    });

    mats.push({

      key: key,

      oem: m.o,

      material: m.d || m.n,

      commonName: m.n,

      fullName: m.n,

      category: m.g || 'General',

      basePrice: m.b,

      units: units,

    });

  });

  MATERIALS = mats;

  ALL_UNITS = allU;

  return { materials: mats, allUnits: allU };

}

// Font stack from brand guidelines S06

const FONT_STACK = "'Source Sans 3', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

// ============================================================================

// PRIMITIVES - all built to brand guideline S09

// ============================================================================

// Buttons - full pill (999px), 14px Semibold, 12x22px padding (per S09)

// Uses inline styles instead of dynamic Tailwind classes (which don't reliably compile)

// to guarantee proper text contrast on colored backgrounds

const Btn = ({ variant = 'outline', size = 'md', children, onClick, disabled, icon: Icon, className = '', dark = false }) => {

  const sizes = {

    sm: { px: 12, py: 4, fs: 12 },

    md: { px: 18, py: 8, fs: 13 },

    lg: { px: 22, py: 12, fs: 14 },

  };

  const s = sizes[size];

  const variants = {

    primary:     { bg: C.orange,     border: C.orange,     fg: '#FFFFFF', hoverBg: C.orangeDeep, hoverBorder: C.orangeDeep, hoverFg: '#FFFFFF', weight: 600 },

    teal:        { bg: C.teal,       border: C.teal,       fg: '#FFFFFF', hoverBg: C.tealDeep,   hoverBorder: C.tealDeep,   hoverFg: '#FFFFFF', weight: 600 },

    olive:       { bg: C.olive,      border: C.olive,      fg: '#FFFFFF', hoverBg: C.oliveDeep,  hoverBorder: C.oliveDeep,  hoverFg: '#FFFFFF', weight: 600 },

    espresso:    { bg: C.espresso,   border: C.espresso,   fg: '#FFFFFF', hoverBg: '#1A1410',    hoverBorder: '#1A1410',    hoverFg: '#FFFFFF', weight: 600 },

    outline:     { bg: 'transparent',border: C.cocoa,      fg: C.cocoa,   hoverBg: C.cocoa,      hoverBorder: C.cocoa,      hoverFg: '#FFFFFF', weight: 600 },

    outlineDark: { bg: 'transparent',border: 'rgba(255,255,255,0.30)', fg: '#FFFFFF', hoverBg: 'rgba(255,255,255,0.10)', hoverBorder: 'rgba(255,255,255,0.50)', hoverFg: '#FFFFFF', weight: 600 },

    ghost:       { bg: 'transparent',border: 'transparent',fg: C.cocoa,   hoverBg: C.taupe + '66', hoverBorder: 'transparent', hoverFg: C.cocoa,  weight: 500 },

  };

  const v = variants[variant] || variants.outline;

  const baseStyle = {

    display: 'inline-flex',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,

    transition: 'all 150ms',

    border: `1px solid ${v.border}`,

    background: v.bg,

    color: v.fg,

    fontWeight: v.weight,

    fontSize: s.fs,

    padding: `${s.py}px ${s.px}px`,

    borderRadius: 999,

    fontFamily: FONT_STACK,

    letterSpacing: '0.01em',

    cursor: disabled ? 'not-allowed' : 'pointer',

    opacity: disabled ? 0.4 : 1,

  };

  return (

    <button

      onClick={onClick}

      disabled={disabled}

      className={className}

      style={baseStyle}

      onMouseEnter={e => {

        if (disabled) return;

        e.currentTarget.style.background = v.hoverBg;

        e.currentTarget.style.borderColor = v.hoverBorder;

        e.currentTarget.style.color = v.hoverFg;

      }}

      onMouseLeave={e => {

        e.currentTarget.style.background = v.bg;

        e.currentTarget.style.borderColor = v.border;

        e.currentTarget.style.color = v.fg;

      }}

    >

      {Icon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 15 : 13} strokeWidth={2.25} />}

      {children}

    </button>

  );

};

// Eyebrow - 10-11px ALL CAPS Bold, letter-spacing 0.10-0.12em (S06)

const Eyebrow = ({ children, color = 'cocoa', dot = false, className = '' }) => {

  const colorMap = { orange: C.orangeDeep, olive: C.oliveDeep, teal: C.tealDeep, cocoa: C.cocoa, stone: C.stone, white: 'rgba(255,255,255,0.9)' };

  const dotColorMap = { orange: C.orange, olive: C.olive, teal: C.teal, cocoa: C.cocoa, stone: C.stone, white: 'white' };

  return (

    <span className={`inline-flex items-center gap-1.5 ${className}`}

      style={{ fontFamily: FONT_STACK, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.11em', textTransform: 'uppercase', color: colorMap[color] }}>

      {dot && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: dotColorMap[color] }} />}

      {children}

    </span>

  );

};

// Pill / Chip - fully rounded (border-radius 999px), small caps text inside (S08)

const Pill = ({ children, tone = 'stone', size = 'md', dot = false }) => {

  const tones = {

    teal: { bg: C.tealTint, fg: C.tealDeep, dot: C.teal },

    olive: { bg: C.oliveTint, fg: C.oliveDeep, dot: C.olive },

    orange: { bg: C.orangeTint, fg: C.orangeDeep, dot: C.orange },

    stone: { bg: C.taupe, fg: C.stone, dot: C.stone },

    amber: { bg: C.amberTint, fg: '#7A5510', dot: C.amber },

    red: { bg: C.redTint, fg: C.red, dot: C.red },

    espresso: { bg: 'rgba(46,38,34,0.08)', fg: C.espresso, dot: C.espresso },

  };

  const t = tones[tone];

  const sizes = {

    sm: { px: 7, py: 1, fs: 9.5 },

    md: { px: 9, py: 2, fs: 10 },

  };

  const s = sizes[size];

  return (

    <span className="inline-flex items-center gap-1"

      style={{

        background: t.bg, color: t.fg,

        padding: `${s.py}px ${s.px}px`,

        fontSize: s.fs, fontWeight: 700, letterSpacing: '0.08em',

        borderRadius: 999, fontFamily: FONT_STACK,

        textTransform: 'uppercase', whiteSpace: 'nowrap',

      }}>

      {dot && <span className="w-1 h-1 rounded-full" style={{ background: t.dot }} />}

      {children}

    </span>

  );

};

// ============================================================================

// MAIN

// ============================================================================

function WholesaleApp({ currentUser, users = [], tiers = [], onLogout, onOpenAdmin }) {

  // Customer roster - only resellers (i.e. accounts that buy through wholesale)

  const customerRoster = useMemo(() => users.filter(u => u.role === 'reseller'), [users]);

  // Active customer - for resellers, themselves; for PM/admin, default to first roster entry then editable

  const initialCustomerId = currentUser?.role === 'reseller'

    ? currentUser.id

    : (customerRoster[0]?.id || null);

  const [activeCustomerId, setActiveCustomerId] = useState(initialCustomerId);

  const activeCustomer = useMemo(

    () => users.find(u => u.id === activeCustomerId) || customerRoster[0] || null,

    [users, activeCustomerId, customerRoster]

  );

  const activeCustomerTier = useMemo(

    () => tiers.find(t => t.id === activeCustomer?.tier) || null,

    [tiers, activeCustomer]

  );

  // Assigned Product Manager for the active customer - drives buyer-flow microcopy

  const assignedPm = useMemo(

    () => activeCustomer?.assignedPmId

      ? users.find(u => u.id === activeCustomer.assignedPmId)

      : null,

    [activeCustomer, users]

  );

  const [mode, setMode] = useState(

    currentUser && (currentUser.role === 'admin' || currentUser.role === 'pm') ? 'internal' : 'external'

  );

  const [pmAction, setPmAction] = useState('quote'); // 'quote' | 'order' (PM-only)

  const [buyerAction, setBuyerAction] = useState('order'); // 'order' | 'requestCall' (buyer-only)

  const [selectionMethod, setSelectionMethod] = useState('browse');

  const [cart, setCart] = useState({});

  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState({ hubs: [], categories: [], functional: [], cosmetic: [] });

  const [expanded, setExpanded] = useState(new Set(MATERIALS.length ? [MATERIALS[0].key] : []));

  const [filterSectionsOpen, setFilterSectionsOpen] = useState({

    functional: false, cosmetic: false, hubs: false, categories: false,

  });

  const toggleFilterSection = (key) => setFilterSectionsOpen(s => ({ ...s, [key]: !s[key] }));

  const setAllFilterSections = (open) => setFilterSectionsOpen({

    functional: open, cosmetic: open, hubs: open, categories: open,

  });

  const [showQuoteSheet, setShowQuoteSheet] = useState(false);

  const [bulkInput, setBulkInput] = useState('');

  const [photoModal, setPhotoModal] = useState(null);

  const matchesUnit = (u) => {

    if (filters.hubs.length && !filters.hubs.includes(u.hub)) return false;

    if (filters.functional.length && !filters.functional.includes(u.functional)) return false;

    if (filters.cosmetic.length && !filters.cosmetic.includes(u.cosmetic)) return false;

    return true;

  };

  const visibleMaterials = useMemo(() => {

    return MATERIALS

      .filter(m => {

        if (search) {

          const s = search.toLowerCase();

          if (!`${m.oem} ${m.material} ${m.commonName}`.toLowerCase().includes(s)) return false;

        }

        if (filters.categories.length && !filters.categories.includes(m.category)) return false;

        return true;

      })

      .map(m => ({ ...m, visibleUnits: m.units.filter(matchesUnit) }))

      .filter(m => m.visibleUnits.length > 0);

  }, [search, filters]);

  const facetCount = (key, value) => {

    return ALL_UNITS.filter(u => {

      if (key !== 'hubs' && filters.hubs.length && !filters.hubs.includes(u.hub)) return false;

      if (key !== 'functional' && filters.functional.length && !filters.functional.includes(u.functional)) return false;

      if (key !== 'cosmetic' && filters.cosmetic.length && !filters.cosmetic.includes(u.cosmetic)) return false;

      const m = MATERIALS.find(x => x.key === u.materialKey);

      if (!m) return false;

      if (key !== 'categories' && filters.categories.length && !filters.categories.includes(m.category)) return false;

      if (key === 'hubs') return u.hub === value;

      if (key === 'functional') return u.functional === value;

      if (key === 'cosmetic') return u.cosmetic === value;

      if (key === 'categories') return m.category === value;

      return true;

    }).length;

  };

  const toggleFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

  const toggleExpanded = (key) => setExpanded(e => { const n = new Set(e); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const addUnit = (id) => setCart(c => ({ ...c, [id]: true }));

  const removeUnit = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  const toggleUnit = (id) => cart[id] ? removeUnit(id) : addUnit(id);

  const clearCart = () => setCart({});

  const addAllForMaterial = (mat) => setCart(c => { const n = { ...c }; mat.visibleUnits.forEach(u => n[u.invSku] = true); return n; });

  const removeAllForMaterial = (mat) => setCart(c => { const n = { ...c }; mat.visibleUnits.forEach(u => delete n[u.invSku]); return n; });

  const cartUnits = useMemo(() => Object.keys(cart).map(id => {

    const u = ALL_UNITS.find(x => x.invSku === id);

    if (!u) return null;

    const m = MATERIALS.find(x => x.key === u.materialKey);

    if (!m) return null;

    return { ...u, oem: m.oem, material: m.material, commonName: m.commonName };

  }).filter(Boolean), [cart]);

  const cartTotals = useMemo(() => ({

    unitCount: cartUnits.length,

    materialCount: new Set(cartUnits.map(u => u.materialKey)).size,

    hubCount: new Set(cartUnits.map(u => u.hub)).size,

    subtotal: cartUnits.reduce((a, c) => a + c.unitPrice, 0),

  }), [cartUnits]);

  const parseBulk = () => {

    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);

    setCart(c => {

      const next = { ...c };

      lines.forEach(line => {

        const [matName, qtyStr] = line.split(/[,\t]+/).map(p => p.trim());

        const qty = parseInt(qtyStr, 10) || 1;

        const mat = MATERIALS.find(m =>

          m.material.toLowerCase() === matName.toLowerCase() ||

          `${m.oem} ${m.material}`.toLowerCase().includes(matName.toLowerCase())

        );

        if (mat) {

          const ranked = [...mat.units]

            .filter(u => !next[u.invSku])

            .sort((a, b) => {

              const r = { 'New': 1, 'Refurbished': 2, 'Tested Working': 3, 'Untested': 4, 'Non-Functional': 5 };

              return (r[a.functional] - r[b.functional]) || (a.unitPrice - b.unitPrice);

            })

            .slice(0, qty);

          ranked.forEach(u => { next[u.invSku] = true; });

          if (!expanded.has(mat.key)) toggleExpanded(mat.key);

        }

      });

      return next;

    });

    setBulkInput('');

  };

  return (

    <div style={{ background: C.cream, minHeight: '100vh', color: C.cocoa, fontFamily: FONT_STACK, fontSize: 14, lineHeight: 1.55 }}>

      {/* Subtle radial accent in background - guideline S08 */}

      <div className="fixed inset-0 pointer-events-none" style={{

        background: `radial-gradient(ellipse 800px 600px at 90% -10%, ${C.orange}11, transparent 60%), radial-gradient(ellipse 600px 500px at -10% 110%, ${C.teal}0E, transparent 60%)`,

        zIndex: 0,

      }} />

      {/* ========== UTILITY BAR (Espresso, dark) ========== */}

      <div className="relative" style={{ background: C.espresso, color: 'white', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>

        <div className="px-6 py-1.5 flex items-center justify-between text-[11.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>

          <div className="flex items-center gap-4">

            <span>Need help with this quote? Call <span className="text-white font-semibold">216.762.0588</span></span>

          </div>

          <div className="flex items-center gap-4">

            <span>The medical equipment partner hospitals run on.</span>

          </div>

        </div>

      </div>

      {/* ========== HEADER ========== */}

      <header className="relative border-b" style={{ borderColor: C.taupe, background: C.cream }}>

        <div className="px-6 py-4 flex items-center gap-6">

          {/* Logo lockup - wordmark style, lowercase r + capital L per S10 */}

          <div className="flex items-center gap-3">

            <div className="flex items-baseline" style={{ fontFamily: FONT_STACK, letterSpacing: '-0.025em' }}>

              <span style={{ fontSize: 22, fontWeight: 300, color: C.espresso }}>re</span>

              <span style={{ fontSize: 22, fontWeight: 700, color: C.espresso }}>Link</span>

              <span style={{ fontSize: 22, fontWeight: 300, color: C.espresso, marginLeft: 4 }}>Wholesale</span>

              <span style={{ fontSize: 11, color: C.stone, marginLeft: 4, fontWeight: 400 }}>(TM)</span>

            </div>

          </div>

          <div className="h-6 w-px" style={{ background: C.taupe }} />

          {/* Mode switcher - only shown to staff (admin/pm); resellers see only their own buyer view */}

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'pm') && (

            <div className="flex items-center gap-0 p-0.5" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 999 }}>

              {[

                { id: 'external', label: 'Buyer view', icon: User },

                { id: 'internal', label: 'Product Manager view', icon: Building2 },

              ].map(m => {

                const active = mode === m.id;

                return (

                  <button key={m.id} onClick={() => setMode(m.id)}

                    className="flex items-center gap-1.5 px-3 py-1 transition-all"

                    style={{

                      background: active ? C.white : 'transparent',

                      color: active ? C.espresso : C.stone,

                      boxShadow: active ? '0 1px 2px rgba(46,38,34,0.06)' : 'none',

                      fontSize: 11.5, fontWeight: active ? 600 : 500,

                      borderRadius: 999, fontFamily: FONT_STACK,

                    }}>

                    <m.icon size={12} strokeWidth={2.25} />{m.label}

                  </button>

                );

              })}

            </div>

          )}

          <div className="ml-auto flex items-center gap-4">

            {mode === 'internal' && (

              <CustomerPicker

                roster={customerRoster}

                activeCustomer={activeCustomer}

                activeTier={activeCustomerTier}

                onSelect={setActiveCustomerId}

              />

            )}

            <UserMenu user={currentUser} onLogout={onLogout} onGoToAdmin={onOpenAdmin} />

          </div>

        </div>

      </header>

      {/* ========== TITLE STRIP - mode-aware; PM view exposes Quote/Order action choice ========== */}

      <div className="relative px-6 py-3 border-b" style={{ borderColor: C.taupe, background: C.cream }}>

        <div className="flex items-center justify-between gap-6">

          {mode === 'external' ? (

            // BUYER view - Submit Order vs Request PM Call selector

            <div className="flex items-center gap-4">

              <Eyebrow color="cocoa">Wholesale</Eyebrow>

              <div className="flex items-stretch p-0.5" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 10 }}>

                {[

                  { id: 'order', label: 'Submit order', sub: 'PO ready  -  ship now', icon: ShoppingCart, accent: C.orange },

                  { id: 'requestCall', label: 'Send to Product Manager', sub: 'Request a call first', icon: Phone, accent: C.teal },

                ].map(p => {

                  const active = buyerAction === p.id;

                  return (

                    <button key={p.id} onClick={() => setBuyerAction(p.id)}

                      className="flex items-center gap-2.5 px-3.5 py-1.5 transition-all"

                      style={{

                        background: active ? C.white : 'transparent',

                        boxShadow: active ? '0 1px 2px rgba(46,38,34,0.06)' : 'none',

                        borderRadius: 8,

                        borderTop: active ? `2px solid ${p.accent}` : '2px solid transparent',

                      }}>

                      <p.icon size={15} strokeWidth={active ? 2.25 : 1.75} style={{ color: active ? p.accent : C.stone }} />

                      <div className="text-left">

                        <div style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? C.espresso : C.cocoa, lineHeight: 1.1 }}>{p.label}</div>

                        <div style={{ fontSize: 10, color: C.stone, lineHeight: 1.1, marginTop: 1 }}>{p.sub}</div>

                      </div>

                    </button>

                  );

                })}

              </div>

            </div>

          ) : (

            // PM view - Quote vs Order action selector

            <div className="flex items-center gap-4">

              <Eyebrow color="cocoa">Product Manager Console</Eyebrow>

              <div className="flex items-stretch p-0.5" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 10 }}>

                {[

                  { id: 'quote', label: 'Build a quote', sub: 'Customer approval', icon: FileText, accent: C.teal },

                  { id: 'order', label: 'Process an order', sub: 'PO in hand', icon: ShoppingCart, accent: C.olive },

                ].map(p => {

                  const active = pmAction === p.id;

                  return (

                    <button key={p.id} onClick={() => setPmAction(p.id)}

                      className="flex items-center gap-2.5 px-3.5 py-1.5 transition-all"

                      style={{

                        background: active ? C.white : 'transparent',

                        boxShadow: active ? '0 1px 2px rgba(46,38,34,0.06)' : 'none',

                        borderRadius: 8,

                        borderTop: active ? `2px solid ${p.accent}` : '2px solid transparent',

                      }}>

                      <p.icon size={15} strokeWidth={active ? 2.25 : 1.75} style={{ color: active ? p.accent : C.stone }} />

                      <div className="text-left">

                        <div style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? C.espresso : C.cocoa, lineHeight: 1.1 }}>{p.label}</div>

                        <div style={{ fontSize: 10, color: C.stone, lineHeight: 1.1, marginTop: 1 }}>{p.sub}</div>

                      </div>

                    </button>

                  );

                })}

              </div>

            </div>

          )}

          {/* RIGHT SIDE - Reorder action with badge of past purchase count for active customer */}

          {(() => {

            const reorderCount = activeCustomer

              ? CUSTOMER_HISTORY.filter(h => h.customerId === activeCustomer.id).length

              : 0;

            const isActive = selectionMethod === 'reorder';

            return (

              <button

                onClick={() => setSelectionMethod(isActive ? 'browse' : 'reorder')}

                disabled={reorderCount === 0}

                className="inline-flex items-center gap-2 transition-all"

                style={{

                  background: isActive ? C.teal : (reorderCount === 0 ? C.sand : C.white),

                  border: `1px solid ${isActive ? C.teal : (reorderCount === 0 ? C.taupe : C.teal)}`,

                  color: isActive ? 'white' : (reorderCount === 0 ? C.stone : C.tealDeep),

                  fontSize: 12.5, fontWeight: 700,

                  padding: '8px 14px',

                  borderRadius: 999,

                  fontFamily: FONT_STACK,

                  letterSpacing: '0.01em',

                  cursor: reorderCount === 0 ? 'not-allowed' : 'pointer',

                  opacity: reorderCount === 0 ? 0.6 : 1,

                  boxShadow: isActive ? '0 1px 4px rgba(5,152,166,0.25)' : 'none',

                }}

                onMouseEnter={e => {

                  if (reorderCount === 0) return;

                  if (isActive) {

                    e.currentTarget.style.background = C.tealDeep;

                    e.currentTarget.style.borderColor = C.tealDeep;

                  } else {

                    e.currentTarget.style.background = C.teal;

                    e.currentTarget.style.color = 'white';

                  }

                }}

                onMouseLeave={e => {

                  if (reorderCount === 0) return;

                  if (isActive) {

                    e.currentTarget.style.background = C.teal;

                    e.currentTarget.style.borderColor = C.teal;

                  } else {

                    e.currentTarget.style.background = C.white;

                    e.currentTarget.style.color = C.tealDeep;

                  }

                }}

              >

                <RefreshCw size={13} strokeWidth={2.25} />

                {isActive ? 'Back to browse' : 'Reorder past purchases'}

                {reorderCount > 0 && !isActive && (

                  <span style={{

                    background: C.tealTint,

                    color: C.tealDeep,

                    padding: '1px 7px',

                    borderRadius: 999,

                    fontSize: 10.5,

                    fontFamily: 'ui-monospace, Menlo, monospace',

                    fontWeight: 700,

                  }}>{reorderCount}</span>

                )}

                {reorderCount === 0 && (

                  <span style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.85 }}> -  no history</span>

                )}

              </button>

            );

          })()}

        </div>

      </div>

      {/* ========== STICKY QUOTE BAR - two rows: (1) quote action context, (2) search + filter context ========== */}

      <div className="sticky top-0 z-30 border-b" style={{

        borderColor: C.taupe, background: C.espresso, color: 'white',

        boxShadow: '0 2px 8px rgba(46,38,34,0.12)',

        // Subtle accent stripe - teal for collaborative, olive for firm orders, orange for buyer firm submit

        borderTop: mode === 'internal'

          ? `2px solid ${pmAction === 'quote' ? C.teal : C.olive}`

          : `2px solid ${buyerAction === 'order' ? C.orange : C.teal}`,

      }}>

        {/* ROW 1 - quote/order action state */}

        <div className="px-6 py-2.5 flex items-center gap-5">

          {/* Doc ID - Q- for Quote/Request, SO- for Sales Order */}

          <div className="flex items-center gap-2.5 shrink-0">

            <Eyebrow color="white" dot>

              {((mode === 'internal' && pmAction === 'order') || (mode === 'external' && buyerAction === 'order')) ? 'Sales order' : 'Quote'}

            </Eyebrow>

            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '-0.01em' }}>

              {(((mode === 'internal' && pmAction === 'order') || (mode === 'external' && buyerAction === 'order')) ? 'SO-' : 'Q-')}

              {new Date().getFullYear()}-{(2347 + cartTotals.unitCount).toString().padStart(4, '0')}

            </span>

            {mode === 'internal' && (

              <span className="ml-1 px-1.5 py-0.5"

                style={{

                  background: 'rgba(255,255,255,0.10)',

                  color: pmAction === 'quote' ? '#7AD8E0' : '#C8DC97',

                  borderRadius: 4,

                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',

                }}>

                {pmAction === 'quote' ? 'Draft' : 'On behalf of'}

              </span>

            )}

            {mode === 'external' && buyerAction === 'requestCall' && (

              <span className="ml-1 px-1.5 py-0.5"

                style={{

                  background: 'rgba(255,255,255,0.10)',

                  color: '#7AD8E0',

                  borderRadius: 4,

                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',

                }}>

                Product Manager

              </span>

            )}

          </div>

          <div className="h-7 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

          {/* Customer context - only in PM view */}

          {mode === 'internal' && activeCustomer && (

            <>

              <div className="flex flex-col shrink-0">

                <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Customer</span>

                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white', lineHeight: 1.1 }}>

                  {activeCustomer.company}

                  {activeCustomerTier && (

                    <span style={{

                      marginLeft: 6, padding: '1px 5px',

                      background: 'rgba(255,255,255,0.10)',

                      borderRadius: 3,

                      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em',

                      color: 'rgba(255,255,255,0.85)',

                    }}>

                      {activeCustomerTier.name}  -  {activeCustomerTier.discountPct}%

                    </span>

                  )}

                </span>

              </div>

              <div className="h-7 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

            </>

          )}

          {/* Inline stats */}

          <div className="flex items-center gap-5">

            <InlineStat label="Materials" value={cartTotals.materialCount} />

            <InlineStat label="Units" value={cartTotals.unitCount} />

            <InlineStat label="Hubs" value={cartTotals.hubCount} accent={cartTotals.hubCount > 1 ? C.orange : null} />

            <div className="flex flex-col">

              <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Subtotal</span>

              <span style={{ fontSize: 17, fontWeight: 600, color: 'white', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '-0.015em', lineHeight: 1.1 }}>

                ${cartTotals.subtotal.toLocaleString()}

              </span>

            </div>

          </div>

          {/* Multi-hub warning chip */}

          {cartTotals.hubCount > 1 && (

            <span className="flex items-center gap-1.5 px-2.5 py-1"

              style={{ background: 'rgba(243,134,55,0.15)', color: '#FFC499', borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>

              <AlertCircle size={11} strokeWidth={2.5} />

              Multi-hub

            </span>

          )}

          {/* Spacer + actions */}

          <div className="ml-auto flex items-center gap-3">

            {cartUnits.length > 0 ? (

              <>

                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} className="hidden lg:inline">

                  {mode === 'internal'

                    ? (pmAction === 'quote' ? 'Customer must approve before order' : 'Inventory locks at submit')

                    : (buyerAction === 'order' ? 'Inventory locks at submit' : 'Product Manager responds within 4-6 business hours')}

                </span>

                <button onClick={clearCart}

                  className="flex items-center gap-1 px-2 py-1"

                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>

                  <Trash2 size={11} />Clear

                </button>

                <Btn variant="primary" size="md" icon={ArrowRight} onClick={() => setShowQuoteSheet(true)}>

                  {mode === 'internal'

                    ? (pmAction === 'quote' ? 'Send to customer' : 'Process order')

                    : (buyerAction === 'order' ? 'Submit order' : 'Send to Product Manager')}

                </Btn>

              </>

            ) : (

              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>

                {mode === 'internal'

                  ? (pmAction === 'quote' ? 'Select inventory to build the customer\'s quote.' : 'Select inventory to process the customer\'s order.')

                  : (buyerAction === 'order' ? 'Select inventory to submit your order.' : 'Select inventory to share with your Product Manager.')}

              </span>

            )}

          </div>

        </div>

        {/* ROW 2 - search + result counts (always-on inventory navigation) */}

        <div className="px-6 py-2 flex items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="relative flex-1 max-w-2xl">

            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.tealDeep }} strokeWidth={2.25} />

            <input value={search} onChange={e => setSearch(e.target.value)}

              placeholder="Search OEM, material, or common name (e.g. Carescape, Alaris, Endoscopy)..."

              className="w-full pl-9 pr-8 py-1.5 outline-none transition-all"

              style={{

                background: C.tealTint,

                border: `1px solid ${C.teal}55`,

                color: C.espresso, fontSize: 13,

                borderRadius: 8, fontFamily: FONT_STACK,

              }}

              onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.teal}40`; e.target.style.background = '#EAF7F8'; }}

              onBlur={e => { e.target.style.borderColor = `${C.teal}55`; e.target.style.boxShadow = 'none'; e.target.style.background = C.tealTint; }}

            />

            {search && (

              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors" style={{ color: C.tealDeep }}

                onMouseEnter={e => { e.currentTarget.style.background = `${C.teal}33`; }}

                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}

              >

                <X size={12} strokeWidth={2.5} />

              </button>

            )}

          </div>

          <div className="flex items-center gap-2 shrink-0" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>

            <span><span style={{ color: 'white', fontWeight: 600 }}>{visibleMaterials.length}</span> materials</span>

            <span style={{ color: 'rgba(255,255,255,0.3)' }}> - </span>

            <span><span style={{ color: 'white', fontWeight: 600 }}>{visibleMaterials.reduce((a, m) => a + m.visibleUnits.length, 0)}</span> units</span>

            <span style={{ color: 'rgba(255,255,255,0.3)' }}> - </span>

            <span><span style={{ color: 'white', fontWeight: 600 }}>{new Set(visibleMaterials.flatMap(m => m.visibleUnits.map(u => u.hub))).size}</span> hubs</span>

          </div>

          <div className="ml-auto flex items-center gap-1">

            <button onClick={() => setExpanded(new Set(visibleMaterials.map(m => m.key)))} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>

              <ChevronDown size={11} strokeWidth={2.25} />Expand all

            </button>

            <button onClick={() => setExpanded(new Set())} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>

              <ChevronUp size={11} strokeWidth={2.25} />Collapse

            </button>

            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>

              <Download size={11} strokeWidth={2.25} />Export

            </button>

          </div>

        </div>

      </div>

      {/* ========== MAIN GRID ========== */}

      <div className="relative grid grid-cols-[320px_1fr_400px]" style={{ minHeight: 'calc(100vh - 290px)' }}>

        {/* LEFT FILTERS */}

        <aside className="border-r p-4 space-y-3 overflow-y-auto" style={{ borderColor: C.taupe, background: C.cream, maxHeight: 'calc(100vh - 290px)' }}>

          {/* Header row: title + Expand/Collapse all + Clear all */}

          <div className="flex items-center justify-between pb-1">

            <Eyebrow color="cocoa">Filter inventory</Eyebrow>

            <div className="flex items-center gap-1">

              <button onClick={() => setAllFilterSections(true)}

                title="Expand all sections"

                className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-white transition-colors"

                style={{ fontSize: 10, color: C.cocoa, fontWeight: 600 }}>

                <ChevronDown size={11} strokeWidth={2.25} />

                Expand

              </button>

              <button onClick={() => setAllFilterSections(false)}

                title="Collapse all sections"

                className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-white transition-colors"

                style={{ fontSize: 10, color: C.cocoa, fontWeight: 600 }}>

                <ChevronUp size={11} strokeWidth={2.25} />

                Collapse

              </button>

            </div>

          </div>

          {/* Active filter chip strip - visible whenever filters are active */}

          {(filters.functional.length + filters.cosmetic.length + filters.hubs.length + filters.categories.length) > 0 && (

            <div className="flex items-center gap-1.5 flex-wrap p-2.5"

              style={{ background: C.orangeTint + '70', border: `1px solid ${C.orange}40`, borderRadius: 8 }}>

              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.orangeDeep, marginRight: 2 }}>

                Active

              </span>

              {filters.functional.map(f => (

                <ActiveChip key={`f-${f}`} label={f} onRemove={() => toggleFilter('functional', f)} />

              ))}

              {filters.cosmetic.map(c => (

                <ActiveChip key={`c-${c}`} label={c} onRemove={() => toggleFilter('cosmetic', c)} />

              ))}

              {filters.hubs.map(h => {

                const hub = HUBS.find(x => x.id === h);

                return <ActiveChip key={`h-${h}`} label={hub?.code || h} onRemove={() => toggleFilter('hubs', h)} />;

              })}

              {filters.categories.map(c => (

                <ActiveChip key={`cat-${c}`} label={c} onRemove={() => toggleFilter('categories', c)} />

              ))}

              <button onClick={() => setFilters({ hubs: [], categories: [], functional: [], cosmetic: [] })}

                className="ml-auto"

                style={{ fontSize: 10, fontWeight: 700, color: C.orangeDeep, letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: 2 }}>

                Clear all

              </button>

            </div>

          )}

          <FilterCardGroup label="Category" icon={Layers} columns={2}

            open={filterSectionsOpen.categories} onToggleOpen={() => toggleFilterSection('categories')}

            items={CATEGORIES.map(c => ({

              id: c, label: c,

              count: facetCount('categories', c),

              tone: ({

                'Patient Monitoring': 'teal', 'Imaging': 'teal', 'Endoscopy': 'teal',

                'Infusion': 'olive', 'Surgical': 'olive', 'Respiratory': 'olive', 'Diagnostic': 'olive',

              })[c] || 'stone',

              icon: ({

                'Patient Monitoring': Activity,

                'Infusion': Droplet,

                'Imaging': ScanLine,

                'Endoscopy': Eye,

                'Surgical': Scissors,

                'Respiratory': Wind,

                'Diagnostic': Stethoscope,

              })[c],

            }))}

            active={filters.categories} onToggle={(v) => toggleFilter('categories', v)} />

          <FilterCardGroup label="Hub / Location" icon={MapPin} columns={2}

            open={filterSectionsOpen.hubs} onToggleOpen={() => toggleFilterSection('hubs')}

            items={HUBS.map(h => ({

              id: h.id,

              label: h.name.split(',')[0],

              count: facetCount('hubs', h.id),

              code: h.code,

              tone: 'stone',

            }))}

            active={filters.hubs} onToggle={(v) => toggleFilter('hubs', v)} />

          <FilterCardGroup label="Cosmetic condition" icon={Camera} columns={2}

            open={filterSectionsOpen.cosmetic} onToggleOpen={() => toggleFilterSection('cosmetic')}

            items={COSMETIC.map(c => ({

              id: c, label: c,

              count: facetCount('cosmetic', c),

              tone: csmTone(c),

              icon: ({

                'New in Box': Package,

                'Excellent': Sparkles,

                'Good': Circle,

                'Poor': AlertCircle,

              })[c],

            }))}

            active={filters.cosmetic} onToggle={(v) => toggleFilter('cosmetic', v)} />

          <FilterCardGroup label="Functional condition" icon={Package} columns={2}

            open={filterSectionsOpen.functional} onToggleOpen={() => toggleFilterSection('functional')}

            items={FUNCTIONAL.map(f => ({

              id: f, label: f,

              count: facetCount('functional', f),

              tone: fnTone(f),

              icon: ({

                'New': Sparkles,

                'Refurbished': RefreshCw,

                'Tested Working': CheckCircle2,

                'Untested': HelpCircle,

                'Non-Functional': XCircle,

              })[f],

            }))}

            active={filters.functional} onToggle={(v) => toggleFilter('functional', v)} />

        </aside>

        {/* CENTER WORKBENCH */}

        <main className="overflow-hidden flex flex-col" style={{ background: C.sand }}>

          <div className="px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: C.taupe, background: C.cream }}>

            {/* Selection-method icon tabs */}

            <div className="flex items-center gap-0.5 p-0.5" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

              {[

                { id: 'browse', icon: Filter, title: 'Browse & filter' },

                { id: 'bulk', icon: Hash, title: 'Bulk add by material' },

                { id: 'upload', icon: Upload, title: 'Upload PO line items' },

              ].map(m => {

                const active = selectionMethod === m.id;

                return (

                  <button key={m.id} onClick={() => setSelectionMethod(m.id)}

                    title={m.title}

                    className="flex items-center justify-center transition-all"

                    style={{

                      width: 30, height: 30,

                      background: active ? C.white : 'transparent',

                      color: active ? C.espresso : C.stone,

                      boxShadow: active ? '0 1px 2px rgba(46,38,34,0.08)' : 'none',

                      borderRadius: 6,

                    }}>

                    <m.icon size={15} strokeWidth={active ? 2.5 : 2} />

                  </button>

                );

              })}

            </div>

            <div className="h-6 w-px" style={{ background: C.taupe }} />

            <div className="flex items-center gap-2" style={{ fontSize: 12, color: C.stone }}>

              <span><span style={{ color: C.espresso, fontWeight: 600 }}>{visibleMaterials.length}</span> materials</span>

              <span style={{ color: C.taupe }}> - </span>

              <span><span style={{ color: C.espresso, fontWeight: 600 }}>{visibleMaterials.reduce((a, m) => a + m.visibleUnits.length, 0)}</span> units</span>

              <span style={{ color: C.taupe }}> - </span>

              <span><span style={{ color: C.espresso, fontWeight: 600 }}>{new Set(visibleMaterials.flatMap(m => m.visibleUnits.map(u => u.hub))).size}</span> hubs</span>

            </div>

            <div className="ml-auto flex items-center gap-1.5">

              <Btn size="sm" variant="ghost" icon={ChevronDown} onClick={() => setExpanded(new Set(visibleMaterials.map(m => m.key)))}>Expand all</Btn>

              <Btn size="sm" variant="ghost" icon={ChevronUp} onClick={() => setExpanded(new Set())}>Collapse</Btn>

              <Btn size="sm" variant="ghost" icon={Download}>Export</Btn>

            </div>

          </div>

          {selectionMethod === 'bulk' && (

            <div className="px-6 py-4 border-b" style={{ borderColor: C.taupe, background: C.cream }}>

              <div className="flex items-start gap-4">

                <div className="flex-1">

                  <Eyebrow color="teal" dot>Bulk add by material</Eyebrow>

                  <p className="mt-1.5 mb-2" style={{ fontSize: 12, color: C.stone }}>

                    One line per material: <code style={{ background: C.sand, padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>Material name, qty</code> - we auto-pick the best-condition units. Try: <code style={{ background: C.sand, padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>Alaris PC Unit 8015, 12</code>

                  </p>

                  <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)}

                    placeholder={'Carescape B450, 6\nAlaris PC Unit 8015, 12\nOEV261H, 4'}

                    rows={4} className="w-full px-3 py-2 outline-none"

                    style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }} />

                </div>

                <div className="flex flex-col gap-2 pt-7">

                  <Btn variant="teal" icon={Plus} onClick={parseBulk} disabled={!bulkInput.trim()}>Match & add</Btn>

                  <Btn variant="ghost" size="sm" onClick={() => setBulkInput('')}>Clear</Btn>

                </div>

              </div>

            </div>

          )}

          {selectionMethod === 'upload' && (

            <div className="px-6 py-4 border-b" style={{ borderColor: C.taupe, background: C.cream }}>

              <Eyebrow color="teal" dot>Upload PO line items</Eyebrow>

              <div className="mt-2 border-2 border-dashed p-6 flex items-center justify-between"

                style={{ borderColor: C.taupe, background: C.sand, borderRadius: 10 }}>

                <div className="flex items-center gap-3">

                  <FileSpreadsheet size={22} style={{ color: C.stone }} strokeWidth={1.75} />

                  <div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>Drop a .csv or .xlsx file</div>

                    <div style={{ fontSize: 11.5, color: C.stone }}>Required: <code style={{ background: C.cream, padding: '1px 5px', borderRadius: 3 }}>oem</code>, <code style={{ background: C.cream, padding: '1px 5px', borderRadius: 3 }}>material</code>, <code style={{ background: C.cream, padding: '1px 5px', borderRadius: 3 }}>qty</code></div>

                  </div>

                </div>

                <Btn variant="teal" icon={Upload}>Browse files</Btn>

              </div>

            </div>

          )}

          {/* REORDER VIEW - past purchases with tiered match to current inventory */}

          {selectionMethod === 'reorder' ? (

            <ReorderView

              activeCustomer={activeCustomer}

              assignedPm={assignedPm}

              materials={MATERIALS}

              cart={cart}

              onAddUnits={(units) => setCart(c => {

                const next = { ...c };

                units.forEach(u => { next[u.invSku] = true; });

                return next;

              })}

              onToggleUnit={toggleUnit}

              onPhotoClick={(unit, material) => setPhotoModal({ unit, material })}

            />

          ) : (

            <div className="flex-1 overflow-auto p-5 space-y-3">

              {visibleMaterials.map(m => (

                <MaterialCard key={m.key} material={m}

                  expanded={expanded.has(m.key)}

                  onToggleExpanded={() => toggleExpanded(m.key)}

                  cart={cart}

                  onToggleUnit={toggleUnit}

                  onAddAll={() => addAllForMaterial(m)}

                  onRemoveAll={() => removeAllForMaterial(m)}

                  onPhotoClick={(unit) => setPhotoModal({ unit, material: m })} />

              ))}

              {visibleMaterials.length === 0 && (

                <div className="text-center py-16" style={{ fontSize: 13, color: C.stone }}>

                  No materials match those filters.

                </div>

              )}

            </div>

          )}

        </main>

        {/* RIGHT QUOTE BUILDER - line items only; stats + submit live in top sticky bar */}

        <aside className="border-l flex flex-col" style={{ borderColor: C.taupe, background: C.cream, maxHeight: 'calc(100vh - 290px)' }}>

          {/* PM contact card - persistent reference for buyers, always visible */}

          {mode === 'external' && (

            <div className="px-4 pt-4 pb-2">

              <PmCard pm={assignedPm} variant="rail" />

            </div>

          )}

          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: C.taupe, background: C.cream }}>

            <div className="flex items-center gap-2">

              <Eyebrow color="cocoa">Line items</Eyebrow>

              {cartUnits.length > 0 && (

                <span style={{ fontSize: 11, color: C.stone, fontFamily: 'ui-monospace, Menlo, monospace' }}>

                  {cartUnits.length}

                </span>

              )}

            </div>

            {cartTotals.hubCount > 1 && (

              <span className="flex items-center gap-1 px-2 py-0.5"

                style={{ background: C.orangeTint, color: C.orangeDeep, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>

                <AlertCircle size={10} strokeWidth={2.5} />

                {cartTotals.hubCount} hubs

              </span>

            )}

          </div>

          <div className="flex-1 overflow-auto">

            {cartUnits.length === 0 ? (

              <div className="p-8 text-center">

                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: C.sand }}>

                  <ShoppingCart size={20} style={{ color: C.stone }} strokeWidth={1.75} />

                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso, marginBottom: 4 }}>No units selected</div>

                <div style={{ fontSize: 12, color: C.stone, lineHeight: 1.5 }}>Select all of a material, pick individual units, or paste a list.</div>

              </div>

            ) : (

              <div>

                {Array.from(new Set(cartUnits.map(u => u.materialKey))).map(key => {

                  const unitsInGroup = cartUnits.filter(u => u.materialKey === key);

                  const m = MATERIALS.find(x => x.key === key);

                  if (!m) return null;

                  const sub = unitsInGroup.reduce((a, c) => a + c.unitPrice, 0);

                  return (

                    <div key={key} style={{ borderBottom: `1px solid ${C.taupe}` }}>

                      <div className="px-5 py-2.5 flex items-start justify-between" style={{ background: C.sand }}>

                        <div className="min-w-0">

                          <div style={{ fontSize: 12, fontWeight: 600, color: C.espresso }}>

                            {m.oem} <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{m.material}</span>

                          </div>

                          <div style={{ fontSize: 11, color: C.stone }}>{m.commonName}  -  {unitsInGroup.length} unit{unitsInGroup.length !== 1 ? 's' : ''}</div>

                        </div>

                        <div className="text-right shrink-0">

                          <div style={{ fontSize: 12, fontWeight: 600, color: C.espresso, fontFamily: 'ui-monospace, Menlo, monospace' }}>${sub.toLocaleString()}</div>

                          <button onClick={() => unitsInGroup.forEach(u => removeUnit(u.invSku))} style={{ fontSize: 10.5, color: C.stone }}>Remove all</button>

                        </div>

                      </div>

                      {unitsInGroup.map(u => {

                        const hub = HUBS.find(h => h.id === u.hub);

                        return (

                          <div key={u.invSku} className="px-5 py-2 flex items-center gap-2" style={{ borderTop: `1px solid ${C.taupe}` }}>

                            <img src={u.photo} className="w-10 h-7 object-cover rounded shrink-0" style={{ border: `1px solid ${C.taupe}` }} alt="" />

                            <div className="flex-1 min-w-0">

                              <div style={{ fontSize: 10.5, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace', color: C.espresso }} className="truncate">{u.invSku}</div>

                              <div style={{ fontSize: 9.5, fontFamily: 'ui-monospace, Menlo, monospace', color: C.stone, marginTop: 1 }} className="truncate">SN: {u.serial}</div>

                              <div className="flex items-center gap-1 mt-1">

                                <Pill tone={fnTone(u.functional)} size="sm" dot>{u.functional === 'Tested Working' ? 'Tested' : u.functional === 'Non-Functional' ? 'Non-F' : u.functional}</Pill>

                                <Pill tone={csmTone(u.cosmetic)} size="sm">{u.cosmetic === 'New in Box' ? 'NIB' : u.cosmetic}</Pill>

                                <span style={{ fontSize: 9.5, fontFamily: 'ui-monospace, Menlo, monospace', color: C.stone, fontWeight: 600 }}>{hub.code}</span>

                              </div>

                            </div>

                            <div className="text-right shrink-0">

                              <div style={{ fontSize: 11.5, fontWeight: 600, color: C.espresso, fontFamily: 'ui-monospace, Menlo, monospace' }}>${u.unitPrice.toLocaleString()}</div>

                              <button onClick={() => removeUnit(u.invSku)} className="mt-0.5 p-0.5 rounded hover:bg-[#FBE9E9]" style={{ color: C.stone }}>

                                <X size={11} />

                              </button>

                            </div>

                          </div>

                        );

                      })}

                    </div>

                  );

                })}

              </div>

            )}

          </div>

          {cartUnits.length > 0 && (

            <div className="border-t px-5 py-3" style={{ borderColor: C.taupe, background: C.sand }}>

              <div className="flex items-baseline justify-between">

                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone }}>Subtotal</span>

                <span style={{ fontSize: 16, fontWeight: 600, color: C.espresso, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '-0.015em' }}>

                  ${cartTotals.subtotal.toLocaleString()}

                </span>

              </div>

              <div className="flex items-center gap-1.5 mt-1.5" style={{ fontSize: 10.5, color: C.stone, lineHeight: 1.4 }}>

                <Clock size={10} strokeWidth={2.25} />

                <span>Final pricing confirmed in 4-6 business hours  -  use top bar to submit</span>

              </div>

              <button

                onClick={() => generateQuotePdf({

                  docType: (mode === 'internal' && pmAction === 'order') ? 'order' : 'quote',

                  cartUnits, totals: cartTotals, mode, pmAction, buyerAction,

                  customerName: activeCustomer?.company || 'Customer',

                })}

                className="w-full mt-3 flex items-center justify-center gap-1.5 transition-colors"

                style={{

                  background: 'transparent',

                  border: `1px solid ${C.cocoa}`,

                  color: C.cocoa,

                  fontSize: 12, fontWeight: 600,

                  padding: '7px 12px',

                  borderRadius: 999,

                  fontFamily: FONT_STACK,

                }}

                onMouseEnter={e => { e.currentTarget.style.background = C.cocoa; e.currentTarget.style.color = 'white'; }}

                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.cocoa; }}

              >

                <FileText size={13} strokeWidth={2.25} />

                Preview {(mode === 'internal' && pmAction === 'order') ? 'order' : 'quote'} PDF

              </button>

            </div>

          )}

        </aside>

      </div>

      {showQuoteSheet && <QuoteSheet mode={mode} pmAction={pmAction} buyerAction={buyerAction} cartUnits={cartUnits} totals={cartTotals} activeCustomer={activeCustomer} activeCustomerTier={activeCustomerTier} assignedPm={assignedPm} onClose={() => setShowQuoteSheet(false)} onSubmit={() => { setShowQuoteSheet(false); clearCart(); }} />}

      {photoModal && <PhotoModal {...photoModal} onClose={() => setPhotoModal(null)} />}

      {/* Brand footer */}

      <footer className="relative px-6 py-4 border-t" style={{ borderColor: C.taupe, background: C.cream, fontSize: 10.5, color: C.stone }}>

        <div className="flex items-center justify-between flex-wrap gap-2">

          <span>reLink Medical(R), reLink360(R), and reLink Ready(R) are registered trademarks of reLink Medical LLC. reLink Online(TM) and reLink Wholesale(TM) are trademarks of reLink Medical LLC.</span>

          <span>(C)2026 reLink Medical LLC  -  ISO 9001:2015  -  Veteran-Owned  -  Premier Inc. #COND-0210</span>

        </div>

      </footer>

    </div>

  );

}

// ============================================================================

// MATERIAL CARD

// ============================================================================

function MaterialCard({ material: m, expanded, onToggleExpanded, cart, onToggleUnit, onAddAll, onRemoveAll, onPhotoClick }) {

  const visibleUnits = m.visibleUnits;

  const inCartCount = visibleUnits.filter(u => cart[u.invSku]).length;

  const allInCart = inCartCount === visibleUnits.length && visibleUnits.length > 0;

  const someInCart = inCartCount > 0;

  const minPrice = Math.min(...visibleUnits.map(u => u.unitPrice));

  const maxPrice = Math.max(...visibleUnits.map(u => u.unitPrice));

  const hubsRep = new Set(visibleUnits.map(u => u.hub)).size;

  const fnMix = visibleUnits.reduce((acc, u) => { acc[u.functional] = (acc[u.functional] || 0) + 1; return acc; }, {});

  const hubMix = visibleUnits.reduce((acc, u) => { acc[u.hub] = (acc[u.hub] || 0) + 1; return acc; }, {});

  // Per-card sort state - null = use original order

  const [sortBy, setSortBy] = useState(null);     // 'invSku' | 'functional' | 'cosmetic' | 'hub' | 'serial' | 'unitPrice'

  const [sortDir, setSortDir] = useState('asc');  // 'asc' | 'desc'

  const handleSort = (col) => {

    if (sortBy !== col) { setSortBy(col); setSortDir('asc'); return; }

    if (sortDir === 'asc') { setSortDir('desc'); return; }

    // third click clears

    setSortBy(null); setSortDir('asc');

  };

  const sortedUnits = useMemo(() => {

    if (!sortBy) return visibleUnits;

    const dir = sortDir === 'asc' ? 1 : -1;

    const keyOf = (u) => {

      switch (sortBy) {

        case 'invSku':   return u.invSku;

        case 'serial':   return u.serial;

        case 'hub':      return (HUBS.find(h => h.id === u.hub)?.code || u.hub);

        case 'functional': return FUNCTIONAL.indexOf(u.functional); // best (0) -> worst (4)

        case 'cosmetic':   return COSMETIC.indexOf(u.cosmetic);

        case 'unitPrice':  return u.unitPrice;

        default: return 0;

      }

    };

    return [...visibleUnits].sort((a, b) => {

      const ka = keyOf(a), kb = keyOf(b);

      if (typeof ka === 'number' && typeof kb === 'number') return (ka - kb) * dir;

      return String(ka).localeCompare(String(kb)) * dir;

    });

  }, [visibleUnits, sortBy, sortDir]);

  // Top border by category - guideline S09: orange = featured, teal = patient-ready, olive = biomed/HTM

  const categoryAccent = ({

    'Endoscopy': C.teal,

    'Imaging': C.teal,

    'Patient Monitoring': C.teal,

    'Infusion': C.olive,

    'Surgical': C.olive,

    'Respiratory': C.olive,

    'Diagnostic': C.olive,

  })[m.category] || C.stone;

  const heroUnit = [...visibleUnits].sort((a, b) => {

    const cR = { 'New in Box': 0, 'Excellent': 1, 'Good': 2, 'Poor': 3 };

    const fR = { 'New': 0, 'Refurbished': 1, 'Tested Working': 2, 'Untested': 3, 'Non-Functional': 4 };

    return (cR[a.cosmetic] - cR[b.cosmetic]) || (fR[a.functional] - fR[b.functional]);

  })[0];

  return (

    <div className="overflow-hidden transition-all"

      style={{

        background: C.white,

        border: `1px solid ${someInCart ? C.teal : C.taupe}`,

        boxShadow: someInCart ? `0 0 0 1px ${C.teal}` : '0 1px 3px rgba(46,38,34,0.04)',

        borderRadius: 12,

        borderTop: `3px solid ${someInCart ? C.teal : categoryAccent}`,

      }}>

      <div className="flex items-stretch">

        {/* Hero photo */}

        <button onClick={() => onPhotoClick(heroUnit)} className="shrink-0 relative group" style={{ width: 110 }}>

          <img src={heroUnit.photo} className="w-full h-full object-cover" alt={`${m.oem} ${m.material}`} style={{ borderRight: `1px solid ${C.taupe}` }} />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(46,38,34,0.5)' }}>

            <ImageIcon size={18} color="white" />

          </div>

          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-white"

            style={{ background: 'rgba(46,38,34,0.85)', fontSize: 9.5, fontWeight: 700, borderRadius: 4, fontFamily: FONT_STACK, letterSpacing: '0.05em' }}>

            +{visibleUnits.length}

          </div>

        </button>

        <div className="flex-1 p-4 min-w-0">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2 flex-wrap">

                <Eyebrow color="cocoa">{m.oem}</Eyebrow>

                <Pill tone="stone" size="sm">{m.category}</Pill>

              </div>

              <div className="flex items-baseline gap-2.5 mt-1">

                <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', color: C.espresso, letterSpacing: '-0.01em' }}>{m.material}</span>

                <span style={{ fontSize: 13.5, color: C.cocoa, fontWeight: 400 }}>{m.commonName}</span>

              </div>

              {/* Summary row */}

              <div className="flex items-center gap-3 mt-2.5" style={{ fontSize: 12.5 }}>

                <span className="flex items-baseline gap-1">

                  <span style={{ color: C.espresso, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}>{visibleUnits.length}</span>

                  <span style={{ color: C.stone }}>units</span>

                </span>

                <span style={{ color: C.taupe }}> - </span>

                <span className="flex items-center gap-1" style={{ color: C.stone }}>

                  <MapPin size={11} strokeWidth={2.25} />

                  <span><span style={{ color: C.espresso, fontWeight: 600 }}>{hubsRep}</span> hub{hubsRep !== 1 ? 's' : ''}</span>

                </span>

                <span style={{ color: C.taupe }}> - </span>

                <span style={{ color: C.stone }}>

                  {minPrice === maxPrice ? (

                    <span style={{ color: C.espresso, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>${minPrice.toLocaleString()}</span>

                  ) : (

                    <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>

                      <span style={{ color: C.espresso, fontWeight: 600 }}>${minPrice.toLocaleString()}</span>

                      <span style={{ color: C.stone }}> - </span>

                      <span style={{ color: C.espresso, fontWeight: 600 }}>${maxPrice.toLocaleString()}</span>

                    </span>

                  )}

                  <span style={{ marginLeft: 4 }}>/ unit</span>

                </span>

              </div>

              {/* Condition mix */}

              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">

                {Object.entries(fnMix).map(([fn, count]) => (

                  <Pill key={fn} tone={fnTone(fn)} size="sm" dot>

                    <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', marginRight: 3 }}>{count}</span>{fn === 'Tested Working' ? 'Tested' : fn === 'Non-Functional' ? 'Non-F' : fn}

                  </Pill>

                ))}

              </div>

              {/* Hub breakdown */}

              <div className="flex items-center gap-3 mt-2 flex-wrap" style={{ fontSize: 11, color: C.stone }}>

                {Object.entries(hubMix).map(([hubId, count]) => {

                  const hub = HUBS.find(h => h.id === hubId);

                  return (

                    <span key={hubId} className="flex items-center gap-1">

                      <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa, fontWeight: 600 }}>{hub.code}</span>

                      <span>x{count}</span>

                    </span>

                  );

                })}

              </div>

            </div>

            {/* Actions */}

            <div className="flex flex-col items-end gap-2 shrink-0">

              <div className="flex items-center gap-2">

                {someInCart && (

                  <span style={{

                    fontSize: 10.5, fontWeight: 700, padding: '3px 9px',

                    background: C.tealTint, color: C.tealDeep,

                    borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase',

                    fontFamily: FONT_STACK,

                  }}>

                    {inCartCount} in cart

                  </span>

                )}

                {/* Bulk add - TEAL (platform action, not the primary CTA) */}

                {allInCart ? (

                  <Btn size="sm" variant="outline" icon={Minus} onClick={onRemoveAll}>Remove all</Btn>

                ) : (

                  <Btn size="sm" variant="teal" icon={Plus} onClick={onAddAll}>

                    Add all {visibleUnits.length}

                  </Btn>

                )}

              </div>

              <button onClick={onToggleExpanded} className="flex items-center gap-1 px-2 py-1"

                style={{ fontSize: 11.5, color: C.cocoa, fontWeight: 500 }}>

                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}

                {expanded ? 'Hide units' : 'Pick individual units'}

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Expanded unit table */}

      {expanded && (

        <div style={{ borderTop: `1px solid ${C.taupe}`, background: C.cream }}>

          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 12 }}>

            <thead>

              <tr style={{ borderBottom: `1px solid ${C.taupe}` }}>

                <th className="w-9"></th>

                <th className="w-12"></th>

                {[

                  { id: 'invSku',     label: 'Inv SKU',    align: 'left' },

                  { id: 'functional', label: 'Functional', align: 'left' },

                  { id: 'cosmetic',   label: 'Cosmetic',   align: 'left' },

                  { id: 'hub',        label: 'Hub',        align: 'left' },

                  { id: 'serial',     label: 'Serial',     align: 'left' },

                  { id: 'unitPrice',  label: 'Unit price', align: 'right' },

                ].map(col => {

                  const isActive = sortBy === col.id;

                  const Icon = !isActive ? ArrowUpDown : (sortDir === 'asc' ? ArrowUp : ArrowDown);

                  return (

                    <th key={col.id} className={col.align === 'right' ? 'text-right px-3 py-2' : 'text-left px-2 py-2'}>

                      <button

                        onClick={() => handleSort(col.id)}

                        className="inline-flex items-center gap-1 transition-colors"

                        style={{

                          fontSize: 9.5,

                          color: isActive ? C.tealDeep : C.stone,

                          fontWeight: 700,

                          letterSpacing: '0.10em',

                          textTransform: 'uppercase',

                          fontFamily: FONT_STACK,

                          padding: '2px 4px',

                          margin: '-2px -4px',

                          borderRadius: 4,

                          flexDirection: col.align === 'right' ? 'row-reverse' : 'row',

                        }}

                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.cocoa; }}

                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.stone; }}

                      >

                        {col.label}

                        <Icon size={10} strokeWidth={2.5} style={{ opacity: isActive ? 1 : 0.5 }} />

                      </button>

                    </th>

                  );

                })}

              </tr>

            </thead>

            <tbody>

              {sortedUnits.map(u => {

                const hub = HUBS.find(h => h.id === u.hub);

                const checked = !!cart[u.invSku];

                return (

                  <tr key={u.invSku} className="cursor-pointer transition-colors"

                    style={{ borderBottom: `1px solid ${C.taupe}`, background: checked ? C.tealTint : 'transparent' }}

                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = C.sand; }}

                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}

                    onClick={() => onToggleUnit(u.invSku)}>

                    <td className="px-2 py-2 text-center">

                      <span className="inline-flex w-3.5 h-3.5 items-center justify-center"

                        style={{ background: checked ? C.teal : C.white, border: `1px solid ${checked ? C.teal : C.taupe}`, borderRadius: 3 }}>

                        {checked && <Check size={9} color="white" strokeWidth={3} />}

                      </span>

                    </td>

                    <td className="px-1 py-1.5">

                      <button onClick={(e) => { e.stopPropagation(); onPhotoClick(u); }} className="block">

                        <img src={u.photo} className="w-10 h-7 object-cover rounded transition-colors hover:ring-2 hover:ring-[#0598A6]" style={{ border: `1px solid ${C.taupe}` }} alt="" />

                      </button>

                    </td>

                    <td className="px-2 py-2">

                      <button

                        onClick={(e) => { e.stopPropagation(); onPhotoClick(u); }}

                        title="View photo & details"

                        className="inline-flex items-center gap-1 transition-colors"

                        style={{

                          fontFamily: 'ui-monospace, Menlo, monospace',

                          fontSize: 11,

                          fontWeight: 600,

                          color: C.espresso,

                          background: 'transparent',

                          padding: '1px 4px',

                          margin: '-1px -4px',

                          borderRadius: 4,

                          textDecoration: 'underline',

                          textDecorationColor: C.taupe,

                          textUnderlineOffset: 2,

                        }}

                        onMouseEnter={e => {

                          e.currentTarget.style.background = C.tealTint;

                          e.currentTarget.style.color = C.tealDeep;

                          e.currentTarget.style.textDecorationColor = C.teal;

                        }}

                        onMouseLeave={e => {

                          e.currentTarget.style.background = 'transparent';

                          e.currentTarget.style.color = C.espresso;

                          e.currentTarget.style.textDecorationColor = C.taupe;

                        }}

                      >

                        {u.invSku}

                        <ImageIcon size={10} strokeWidth={2.25} style={{ opacity: 0.55 }} />

                      </button>

                    </td>

                    <td className="px-2 py-2"><Pill tone={fnTone(u.functional)} size="sm" dot>{u.functional}</Pill></td>

                    <td className="px-2 py-2"><Pill tone={csmTone(u.cosmetic)} size="sm">{u.cosmetic}</Pill></td>

                    <td className="px-2 py-2">

                      <div className="flex items-center gap-1.5">

                        <span style={{ fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace', padding: '1px 5px', background: C.sand, color: C.cocoa, border: `1px solid ${C.taupe}`, borderRadius: 3, fontWeight: 600 }}>{hub.code}</span>

                        <span style={{ color: C.stone, fontSize: 11 }}>{hub.name.split(',')[0]}</span>

                      </div>

                    </td>

                    <td className="px-2 py-2" style={{ color: C.stone, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10.5 }}>{u.serial}</td>

                    <td className="px-3 py-2 text-right" style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600, color: C.espresso }}>${u.unitPrice.toLocaleString()}</td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

// ============================================================================

// REORDER VIEW - past purchases with tiered match to current inventory.

// Each history record renders as a card showing what was bought before, what's

// available now, and a one-click action to add the suggested quantity to cart.

// ============================================================================

function ReorderView({ activeCustomer, assignedPm, materials, cart, onAddUnits, onToggleUnit, onPhotoClick }) {

  const customerHistory = useMemo(() => {

    if (!activeCustomer) return [];

    return CUSTOMER_HISTORY.filter(h => h.customerId === activeCustomer.id);

  }, [activeCustomer]);

  const matchedHistory = useMemo(() => {

    return customerHistory.map(h => ({

      history: h,

      ...matchHistoryToInventory(h, materials),

    })).sort((a, b) => {

      // In-stock first, then OOS, then discontinued. Within tier, most recent purchase first.

      const tierRank = { inStock: 0, outOfStock: 1, none: 2 };

      const ta = tierRank[a.matchTier], tb = tierRank[b.matchTier];

      if (ta !== tb) return ta - tb;

      return new Date(b.history.lastOrderDate) - new Date(a.history.lastOrderDate);

    });

  }, [customerHistory, materials]);

  // Aggregate stats for the header

  const stats = useMemo(() => {

    const inStock = matchedHistory.filter(m => m.matchTier === 'inStock');

    const outOfStock = matchedHistory.filter(m => m.matchTier === 'outOfStock').length;

    const totalAvailable = inStock.reduce((sum, m) => sum + m.suggestedQty, 0);

    const totalEstValue = inStock.reduce((sum, m) => sum + m.suggestedQty * (m.units[0]?.unitPrice || 0), 0);

    return { matched: inStock.length, outOfStock, totalAvailable, totalEstValue };

  }, [matchedHistory]);

  // No customer or empty history - clean empty state

  if (!activeCustomer) {

    return (

      <div className="flex-1 flex items-center justify-center p-12">

        <div className="text-center max-w-md">

          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: C.sand }}>

            <RefreshCw size={22} style={{ color: C.stone }} strokeWidth={1.75} />

          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: C.espresso, marginBottom: 6 }}>Pick a customer to see reorder suggestions</div>

          <div style={{ fontSize: 12.5, color: C.stone, lineHeight: 1.5 }}>

            Use the customer picker in the header to load past purchases and reorder the same equipment with one click.

          </div>

        </div>

      </div>

    );

  }

  if (customerHistory.length === 0) {

    return (

      <div className="flex-1 flex items-center justify-center p-12">

        <div className="text-center max-w-md">

          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: C.sand }}>

            <RefreshCw size={22} style={{ color: C.stone }} strokeWidth={1.75} />

          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: C.espresso, marginBottom: 6 }}>No purchase history yet</div>

          <div style={{ fontSize: 12.5, color: C.stone, lineHeight: 1.5 }}>

            <strong style={{ color: C.cocoa }}>{activeCustomer.company}</strong> doesn't have any past orders on file. Once they place their first order, future repurchases will appear here for one-click reorder.

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="flex-1 overflow-auto">

      {/* Header strip with summary stats */}

      <div className="px-6 py-4 border-b" style={{ background: C.cream, borderColor: C.taupe }}>

        <div className="flex items-start justify-between gap-4">

          <div className="flex-1">

            <Eyebrow color="teal" dot>Past purchases  -  {activeCustomer.company}</Eyebrow>

            <h2 style={{

              fontFamily: FONT_STACK, fontSize: 22, fontWeight: 300,

              color: C.espresso, letterSpacing: '-0.02em',

              marginTop: 6, marginBottom: 4,

            }}>

              Reorder what <span style={{ fontWeight: 700, color: C.teal }}>worked before.</span>

            </h2>

            <p style={{ fontSize: 12.5, color: C.stone, lineHeight: 1.5, maxWidth: 540 }}>

              Past orders are matched to current inventory. <strong style={{ color: C.cocoa }}>Exact matches</strong> mean same OEM, model, and condition.

              When the exact condition isn't available, we'll suggest the next closest grade.

            </p>

          </div>

          {stats.matched > 0 && (

            <button

              onClick={() => {

                // "Reorder all" - adds the suggested quantity for every available match

                const allUnits = matchedHistory

                  .filter(m => m.matchTier === 'inStock')

                  .flatMap(m => m.units.slice(0, m.suggestedQty));

                onAddUnits(allUnits);

              }}

              className="inline-flex items-center gap-2 transition-all shrink-0"

              style={{

                background: C.teal,

                color: 'white',

                border: `1px solid ${C.teal}`,

                fontSize: 13, fontWeight: 700,

                padding: '10px 18px',

                borderRadius: 999,

                fontFamily: FONT_STACK,

                letterSpacing: '0.01em',

              }}

              onMouseEnter={e => { e.currentTarget.style.background = C.tealDeep; e.currentTarget.style.borderColor = C.tealDeep; }}

              onMouseLeave={e => { e.currentTarget.style.background = C.teal; e.currentTarget.style.borderColor = C.teal; }}

            >

              <RefreshCw size={14} strokeWidth={2.25} />

              Rebuy everything available

              <span style={{

                background: 'rgba(255,255,255,0.20)',

                padding: '1px 7px', borderRadius: 999,

                fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace',

              }}>{stats.totalAvailable} units  -  ${stats.totalEstValue.toLocaleString()}</span>

            </button>

          )}

        </div>

        {/* Stats row */}

        <div className="flex items-center gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${C.taupe}` }}>

          <ReorderStat label="Past materials" value={customerHistory.length} accent={C.cocoa} />

          <div className="h-7 w-px" style={{ background: C.taupe }} />

          <ReorderStat label="Available now" value={stats.matched} accent={C.tealDeep} />

          <div className="h-7 w-px" style={{ background: C.taupe }} />

          <ReorderStat label="Out of stock" value={stats.outOfStock} accent={C.stone} />

        </div>

      </div>

      {/* Reorder cards */}

      <div className="p-5 space-y-3">

        {matchedHistory.map(item => (

          <ReorderCard

            key={item.history.id}

            item={item}

            cart={cart}

            assignedPm={assignedPm}

            onAdd={() => onAddUnits(item.units.slice(0, item.suggestedQty))}

            onToggleUnit={onToggleUnit}

            onPhotoClick={onPhotoClick}

          />

        ))}

      </div>

    </div>

  );

}

function ReorderStat({ label, value, accent }) {

  return (

    <div className="flex flex-col">

      <span style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{label}</span>

      <span style={{ fontSize: 18, fontWeight: 600, color: accent || C.espresso, fontFamily: 'ui-monospace, Menlo, monospace', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{value}</span>

    </div>

  );

}

// Single reorder card - past purchase matched to current inventory

function ReorderCard({ item, cart, assignedPm, onAdd, onToggleUnit, onPhotoClick }) {

  const { history, matchTier, material, units, availableQty, suggestedQty } = item;

  const [showItems, setShowItems] = useState(false);

  const [sortBy, setSortBy] = useState(null);

  const [sortDir, setSortDir] = useState('asc');

  // Restock-alert state - null (default), 'editing' (showing qty input), 'sent' (confirmation)

  const [notifyState, setNotifyState] = useState(null);

  const [notifyQty, setNotifyQty] = useState(history.quantity);

  const handleSort = (col) => {

    if (sortBy !== col) { setSortBy(col); setSortDir('asc'); return; }

    if (sortDir === 'asc') { setSortDir('desc'); return; }

    setSortBy(null); setSortDir('asc');

  };

  const sortedUnits = useMemo(() => {

    if (!sortBy) return units;

    const dir = sortDir === 'asc' ? 1 : -1;

    const keyOf = (u) => {

      switch (sortBy) {

        case 'invSku':     return u.invSku;

        case 'serial':     return u.serial;

        case 'hub':        return (HUBS.find(h => h.id === u.hub)?.code || u.hub);

        case 'functional': return FUNCTIONAL.indexOf(u.functional);

        case 'cosmetic':   return COSMETIC.indexOf(u.cosmetic);

        case 'unitPrice':  return u.unitPrice;

        default: return 0;

      }

    };

    return [...units].sort((a, b) => {

      const ka = keyOf(a), kb = keyOf(b);

      if (typeof ka === 'number' && typeof kb === 'number') return (ka - kb) * dir;

      return String(ka).localeCompare(String(kb)) * dir;

    });

  }, [units, sortBy, sortDir]);

  // How long ago was the last order?

  const lastOrderAge = useMemo(() => {

    const days = Math.floor((Date.now() - new Date(history.lastOrderDate)) / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} days ago`;

    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;

  }, [history.lastOrderDate]);

  // How many of these units are already in cart?

  const alreadyInCart = useMemo(() => {

    return units.filter(u => cart[u.invSku]).length;

  }, [units, cart]);

  // Aggregate the condition mix of in-stock units - purely informational

  const conditionMix = useMemo(() => {

    if (matchTier !== 'inStock') return { fnCounts: {}, csCounts: {} };

    const fnCounts = units.reduce((acc, u) => { acc[u.functional] = (acc[u.functional] || 0) + 1; return acc; }, {});

    const csCounts = units.reduce((acc, u) => { acc[u.cosmetic] = (acc[u.cosmetic] || 0) + 1; return acc; }, {});

    return { fnCounts, csCounts };

  }, [units, matchTier]);

  // Simplified badge config - three states

  const matchBadge = ({

    inStock:    { label: 'IN STOCK',          bg: C.tealTint,  fg: C.tealDeep, icon: Check },

    outOfStock: { label: 'OUT OF STOCK',      bg: C.sand,      fg: C.stone,    icon: XCircle },

    none:       { label: 'NO LONGER STOCKED', bg: C.sand,      fg: C.stone,    icon: XCircle },

  })[matchTier];

  const isAvailable = matchTier === 'inStock';

  const accentColor = isAvailable ? C.teal : C.stone;

  return (

    <div style={{

      background: C.white,

      border: `1px solid ${C.taupe}`,

      borderTop: `3px solid ${accentColor}`,

      borderRadius: 10,

      overflow: 'hidden',

    }}>

      <div className="flex items-stretch">

        {/* Hero photo if available - falls back to placeholder */}

        {material && units[0]?.photo ? (

          <div style={{

            width: 110,

            background: C.sand,

            backgroundImage: `url(${units[0].photo})`,

            backgroundSize: 'cover',

            backgroundPosition: 'center',

            flexShrink: 0,

          }} />

        ) : (

          <div className="flex items-center justify-center" style={{ width: 110, background: C.sand, flexShrink: 0 }}>

            <Package size={26} style={{ color: C.stone }} strokeWidth={1.5} />

          </div>

        )}

        <div className="flex-1 p-4 min-w-0">

          {/* Top row: product identity + status badge */}

          <div className="flex items-start justify-between gap-3 mb-2">

            <div className="min-w-0">

              <div className="flex items-center gap-2 mb-0.5">

                <span style={{ fontSize: 14, fontWeight: 700, color: C.espresso, lineHeight: 1.2 }}>{history.oem}</span>

                <span style={{ fontSize: 13, fontWeight: 600, color: C.cocoa, fontFamily: 'ui-monospace, Menlo, monospace' }}>{history.material}</span>

              </div>

              {material && (

                <div style={{ fontSize: 12, color: C.stone, lineHeight: 1.3 }}>{material.commonName}</div>

              )}

            </div>

            <span style={{

              padding: '3px 9px',

              background: matchBadge.bg,

              color: matchBadge.fg,

              fontSize: 10, fontWeight: 700,

              letterSpacing: '0.08em',

              borderRadius: 999,

              display: 'inline-flex',

              alignItems: 'center',

              gap: 4,

              flexShrink: 0,

            }}>

              <matchBadge.icon size={10} strokeWidth={2.5} />

              {matchBadge.label}

            </span>

          </div>

          {/* History meta */}

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-2.5" style={{ fontSize: 11.5 }}>

            <div className="flex items-center gap-1.5" style={{ color: C.cocoa }}>

              <span style={{ color: C.stone, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>You bought</span>

              <strong style={{ color: C.espresso, fontSize: 13 }}>{history.quantity}</strong>

              <span style={{ color: C.stone }}> - </span>

              <span>{lastOrderAge}</span>

              {history.orderCount > 1 && (

                <span style={{ color: C.stone }}> -  {history.orderCount} prior orders</span>

              )}

              <span style={{ color: C.stone }}> - </span>

              <span style={{ color: C.cocoa }}>at <strong style={{ color: C.cocoa, fontFamily: 'ui-monospace, Menlo, monospace' }}>${history.avgUnitPrice.toLocaleString()}</strong>/unit avg</span>

            </div>

          </div>

          {/* Available conditions - informational only, shows what's in stock right now */}

          {isAvailable && (

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">

              <span style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Available now</span>

              {Object.entries(conditionMix.fnCounts).map(([fn, n]) => (

                <Pill key={fn} tone={fnTone(fn)} size="sm" dot>

                  {fn} <span style={{ opacity: 0.7, marginLeft: 2 }}>x{n}</span>

                </Pill>

              ))}

            </div>

          )}

        </div>

        {/* Right action panel */}

        <div className="flex flex-col justify-between p-4 border-l" style={{ borderColor: C.taupe, background: C.cream, width: 230, flexShrink: 0 }}>

          {isAvailable ? (

            <>

              <div>

                <div style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>

                  Reorder

                </div>

                <div className="flex items-baseline gap-1.5">

                  <span style={{ fontSize: 22, fontWeight: 700, color: C.espresso, fontFamily: 'ui-monospace, Menlo, monospace', lineHeight: 1 }}>

                    {suggestedQty}

                  </span>

                  <span style={{ fontSize: 11.5, color: C.stone }}>of {availableQty} avail.</span>

                </div>

                {suggestedQty < history.quantity && (

                  <div style={{ fontSize: 10.5, color: '#7A5510', marginTop: 4, lineHeight: 1.4 }}>

                    Stock-limited from {history.quantity}

                  </div>

                )}

                {alreadyInCart > 0 && (

                  <div style={{ fontSize: 10.5, color: C.tealDeep, marginTop: 4, fontWeight: 600 }}>

                    {alreadyInCart} already in cart

                  </div>

                )}

              </div>

              <div className="mt-3 space-y-1.5">

                <button

                  onClick={onAdd}

                  disabled={alreadyInCart >= suggestedQty}

                  className="w-full inline-flex items-center justify-center gap-1.5 transition-all"

                  style={{

                    background: alreadyInCart >= suggestedQty ? C.sand : C.teal,

                    color: alreadyInCart >= suggestedQty ? C.stone : 'white',

                    border: `1px solid ${alreadyInCart >= suggestedQty ? C.taupe : C.teal}`,

                    fontSize: 12, fontWeight: 700,

                    padding: '8px 12px',

                    borderRadius: 999,

                    fontFamily: FONT_STACK,

                    letterSpacing: '0.01em',

                    cursor: alreadyInCart >= suggestedQty ? 'not-allowed' : 'pointer',

                  }}

                  onMouseEnter={e => { if (alreadyInCart < suggestedQty) { e.currentTarget.style.background = C.tealDeep; e.currentTarget.style.borderColor = C.tealDeep; } }}

                  onMouseLeave={e => { if (alreadyInCart < suggestedQty) { e.currentTarget.style.background = C.teal; e.currentTarget.style.borderColor = C.teal; } }}

                >

                  <RefreshCw size={12} strokeWidth={2.25} />

                  {alreadyInCart >= suggestedQty ? 'In cart' : `Add ${suggestedQty} to cart`}

                </button>

                <button

                  onClick={() => setShowItems(s => !s)}

                  className="w-full inline-flex items-center justify-center gap-1 transition-colors"

                  style={{

                    background: 'transparent',

                    color: C.cocoa,

                    fontSize: 11, fontWeight: 600,

                    padding: '4px 8px',

                    borderRadius: 6,

                    fontFamily: FONT_STACK,

                  }}

                  onMouseEnter={e => e.currentTarget.style.background = C.sand}

                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}

                >

                  {showItems ? <ChevronUp size={12} strokeWidth={2.25} /> : <ChevronDown size={12} strokeWidth={2.25} />}

                  {showItems ? 'Hide items' : 'Show items'}

                </button>

              </div>

            </>

          ) : matchTier === 'outOfStock' ? (

            <>

              {notifyState === 'sent' ? (

                // SENT - confirmation state with PM context

                <>

                  <div>

                    <div className="flex items-center gap-1.5 mb-1.5">

                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: C.tealDeep }}>

                        <Check size={10} color="white" strokeWidth={3} />

                      </div>

                      <div style={{ fontSize: 9.5, color: C.tealDeep, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>

                        Alert set

                      </div>

                    </div>

                    <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.4, marginBottom: 8 }}>

                      We'll email you when <strong style={{ color: C.espresso }}>{notifyQty}+ units</strong> arrive.

                    </div>

                    {assignedPm && (

                      <div className="px-2 py-1.5 flex items-center gap-1.5"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 6 }}>

                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[8.5px] font-bold"

                          style={{ background: C.teal, color: 'white' }}>

                          {(assignedPm.firstName?.[0] || '') + (assignedPm.lastName?.[0] || '')}

                        </div>

                        <div style={{ fontSize: 10, lineHeight: 1.2, minWidth: 0 }}>

                          <div style={{ fontWeight: 700, color: C.espresso }}>{assignedPm.firstName} {assignedPm.lastName}</div>

                          <div style={{ color: C.stone, fontFamily: 'ui-monospace, Menlo, monospace' }} className="truncate">notified</div>

                        </div>

                      </div>

                    )}

                  </div>

                  <button

                    onClick={() => { setNotifyState(null); setNotifyQty(history.quantity); }}

                    className="w-full transition-colors mt-2"

                    style={{

                      background: 'transparent',

                      color: C.stone,

                      fontSize: 11, fontWeight: 600,

                      padding: '4px 8px',

                      borderRadius: 6,

                      fontFamily: FONT_STACK,

                    }}

                    onMouseEnter={e => { e.currentTarget.style.background = C.sand; e.currentTarget.style.color = C.cocoa; }}

                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.stone; }}

                  >

                    Cancel alert

                  </button>

                </>

              ) : notifyState === 'editing' ? (

                // EDITING - qty input + confirm/cancel

                <>

                  <div>

                    <div style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>

                      Notify when ready

                    </div>

                    <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.4, marginBottom: 8 }}>

                      How many units do you need?

                    </div>

                    <div className="flex items-center gap-1">

                      <input

                        type="number"

                        min="1"

                        value={notifyQty}

                        onChange={e => setNotifyQty(Math.max(1, parseInt(e.target.value) || 1))}

                        autoFocus

                        className="outline-none transition-all flex-1"

                        style={{

                          width: '100%',

                          background: C.white,

                          border: `1px solid ${C.taupe}`,

                          fontSize: 14, fontWeight: 700,

                          padding: '6px 10px',

                          borderRadius: 6,

                          fontFamily: 'ui-monospace, Menlo, monospace',

                          color: C.espresso,

                        }}

                        onFocus={e => { e.target.style.borderColor = C.cocoa; e.target.style.boxShadow = `0 0 0 3px ${C.cocoa}26`; }}

                        onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }}

                      />

                      <span style={{ fontSize: 10.5, color: C.stone }}>units</span>

                    </div>

                    <div style={{ fontSize: 10, color: C.stone, marginTop: 4 }}>

                      Last bought {history.quantity}

                    </div>

                  </div>

                  <div className="space-y-1.5 mt-3">

                    <button

                      onClick={() => setNotifyState('sent')}

                      className="w-full inline-flex items-center justify-center gap-1.5 transition-colors"

                      style={{

                        background: C.cocoa,

                        color: 'white',

                        border: `1px solid ${C.cocoa}`,

                        fontSize: 12, fontWeight: 700,

                        padding: '8px 12px',

                        borderRadius: 999,

                        fontFamily: FONT_STACK,

                        letterSpacing: '0.01em',

                      }}

                      onMouseEnter={e => { e.currentTarget.style.background = C.espresso; e.currentTarget.style.borderColor = C.espresso; }}

                      onMouseLeave={e => { e.currentTarget.style.background = C.cocoa; e.currentTarget.style.borderColor = C.cocoa; }}

                    >

                      <Check size={12} strokeWidth={2.25} />

                      Set alert

                    </button>

                    <button

                      onClick={() => { setNotifyState(null); setNotifyQty(history.quantity); }}

                      className="w-full transition-colors"

                      style={{

                        background: 'transparent',

                        color: C.stone,

                        fontSize: 11, fontWeight: 600,

                        padding: '4px 8px',

                        borderRadius: 6,

                        fontFamily: FONT_STACK,

                      }}

                      onMouseEnter={e => { e.currentTarget.style.background = C.sand; e.currentTarget.style.color = C.cocoa; }}

                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.stone; }}

                    >

                      Cancel

                    </button>

                  </div>

                </>

              ) : (

                // DEFAULT - show OOS state with notify CTA

                <>

                  <div>

                    <div style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>

                      Out of stock

                    </div>

                    <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.4 }}>

                      Currently no units in inventory. Set an alert and your Product Manager will reach out when stock arrives.

                    </div>

                  </div>

                  <button

                    onClick={() => setNotifyState('editing')}

                    className="w-full inline-flex items-center justify-center gap-1.5 transition-colors mt-3"

                    style={{

                      background: 'transparent',

                      color: C.cocoa,

                      border: `1px solid ${C.cocoa}`,

                      fontSize: 12, fontWeight: 700,

                      padding: '8px 12px',

                      borderRadius: 999,

                      fontFamily: FONT_STACK,

                      letterSpacing: '0.01em',

                    }}

                    onMouseEnter={e => { e.currentTarget.style.background = C.cocoa; e.currentTarget.style.color = 'white'; }}

                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.cocoa; }}

                  >

                    <Mail size={12} strokeWidth={2.25} />

                    Notify when in stock

                  </button>

                </>

              )}

            </>

          ) : (

            // 'none' - material no longer carried at all

            <>

              <div>

                <div style={{ fontSize: 9.5, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>

                  Discontinued

                </div>

                <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.4 }}>

                  No longer carried. Your Product Manager can suggest equivalents.

                </div>

              </div>

              <button

                className="w-full inline-flex items-center justify-center gap-1.5 transition-colors mt-3"

                style={{

                  background: 'transparent',

                  color: C.cocoa,

                  border: `1px solid ${C.cocoa}`,

                  fontSize: 12, fontWeight: 700,

                  padding: '8px 12px',

                  borderRadius: 999,

                  fontFamily: FONT_STACK,

                  letterSpacing: '0.01em',

                }}

                onMouseEnter={e => { e.currentTarget.style.background = C.cocoa; e.currentTarget.style.color = 'white'; }}

                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.cocoa; }}

              >

                <Phone size={12} strokeWidth={2.25} />

                Ask PM for alternatives

              </button>

            </>

          )}

        </div>

      </div>

      {/* Expandable unit table - shows individual units like MaterialCard does */}

      {showItems && isAvailable && (

        <div style={{ borderTop: `1px solid ${C.taupe}`, background: C.cream }}>

          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 12 }}>

            <thead>

              <tr style={{ borderBottom: `1px solid ${C.taupe}` }}>

                <th className="w-9"></th>

                <th className="w-12"></th>

                {[

                  { id: 'invSku',     label: 'Inv SKU',    align: 'left' },

                  { id: 'functional', label: 'Functional', align: 'left' },

                  { id: 'cosmetic',   label: 'Cosmetic',   align: 'left' },

                  { id: 'hub',        label: 'Hub',        align: 'left' },

                  { id: 'serial',     label: 'Serial',     align: 'left' },

                  { id: 'unitPrice',  label: 'Unit price', align: 'right' },

                ].map(col => {

                  const isActive = sortBy === col.id;

                  const Icon = !isActive ? ArrowUpDown : (sortDir === 'asc' ? ArrowUp : ArrowDown);

                  return (

                    <th key={col.id} className={col.align === 'right' ? 'text-right px-3 py-2' : 'text-left px-2 py-2'}>

                      <button

                        onClick={() => handleSort(col.id)}

                        className="inline-flex items-center gap-1 transition-colors"

                        style={{

                          fontSize: 9.5,

                          color: isActive ? C.tealDeep : C.stone,

                          fontWeight: 700,

                          letterSpacing: '0.10em',

                          textTransform: 'uppercase',

                          fontFamily: FONT_STACK,

                          padding: '2px 4px',

                          margin: '-2px -4px',

                          borderRadius: 4,

                          flexDirection: col.align === 'right' ? 'row-reverse' : 'row',

                        }}

                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.cocoa; }}

                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.stone; }}

                      >

                        {col.label}

                        <Icon size={10} strokeWidth={2.5} style={{ opacity: isActive ? 1 : 0.5 }} />

                      </button>

                    </th>

                  );

                })}

              </tr>

            </thead>

            <tbody>

              {sortedUnits.map(u => {

                const hub = HUBS.find(h => h.id === u.hub);

                const checked = !!cart[u.invSku];

                return (

                  <tr key={u.invSku} className="cursor-pointer transition-colors"

                    style={{ borderBottom: `1px solid ${C.taupe}`, background: checked ? C.tealTint : 'transparent' }}

                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = C.sand; }}

                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}

                    onClick={() => onToggleUnit && onToggleUnit(u.invSku)}>

                    <td className="px-2 py-2 text-center">

                      <span className="inline-flex w-3.5 h-3.5 items-center justify-center"

                        style={{ background: checked ? C.teal : C.white, border: `1px solid ${checked ? C.teal : C.taupe}`, borderRadius: 3 }}>

                        {checked && <Check size={9} color="white" strokeWidth={3} />}

                      </span>

                    </td>

                    <td className="px-1 py-1.5">

                      <button onClick={(e) => { e.stopPropagation(); onPhotoClick && onPhotoClick(u, material); }} className="block">

                        <img src={u.photo} className="w-10 h-7 object-cover rounded transition-colors hover:ring-2 hover:ring-[#0598A6]" style={{ border: `1px solid ${C.taupe}` }} alt="" />

                      </button>

                    </td>

                    <td className="px-2 py-2">

                      <button

                        onClick={(e) => { e.stopPropagation(); onPhotoClick && onPhotoClick(u, material); }}

                        title="View photo & details"

                        className="inline-flex items-center gap-1 transition-colors"

                        style={{

                          fontFamily: 'ui-monospace, Menlo, monospace',

                          fontSize: 11,

                          fontWeight: 600,

                          color: C.espresso,

                          background: 'transparent',

                          padding: '1px 4px',

                          margin: '-1px -4px',

                          borderRadius: 4,

                          textDecoration: 'underline',

                          textDecorationColor: C.taupe,

                          textUnderlineOffset: 2,

                        }}

                        onMouseEnter={e => {

                          e.currentTarget.style.background = C.tealTint;

                          e.currentTarget.style.color = C.tealDeep;

                          e.currentTarget.style.textDecorationColor = C.teal;

                        }}

                        onMouseLeave={e => {

                          e.currentTarget.style.background = 'transparent';

                          e.currentTarget.style.color = C.espresso;

                          e.currentTarget.style.textDecorationColor = C.taupe;

                        }}

                      >

                        {u.invSku}

                        <ImageIcon size={10} strokeWidth={2.25} style={{ opacity: 0.55 }} />

                      </button>

                    </td>

                    <td className="px-2 py-2"><Pill tone={fnTone(u.functional)} size="sm" dot>{u.functional}</Pill></td>

                    <td className="px-2 py-2"><Pill tone={csmTone(u.cosmetic)} size="sm">{u.cosmetic}</Pill></td>

                    <td className="px-2 py-2">

                      <div className="flex items-center gap-1.5">

                        <span style={{ fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace', padding: '1px 5px', background: C.sand, color: C.cocoa, border: `1px solid ${C.taupe}`, borderRadius: 3, fontWeight: 600 }}>{hub?.code}</span>

                        <span style={{ color: C.stone, fontSize: 11 }}>{hub?.name.split(',')[0]}</span>

                      </div>

                    </td>

                    <td className="px-2 py-2" style={{ color: C.stone, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10.5 }}>{u.serial}</td>

                    <td className="px-3 py-2 text-right" style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600, color: C.espresso }}>${u.unitPrice.toLocaleString()}</td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

// ============================================================================

// SUBCOMPONENTS

// ============================================================================

// Visual card-style filter group: each option is a tappable card with icon, label, count.

// `tone` drives accent color (teal/olive/amber/red/stone). `code` shows hub code as the visual badge.

function FilterCardGroup({ label, items, active, onToggle, icon: Icon, columns = 2, open, onToggleOpen }) {

  const visibleItems = items.filter(it => it.count > 0 || active.includes(it.id));

  const totalCount = visibleItems.reduce((a, c) => a + c.count, 0);

  const isActive = active.length > 0;

  return (

    <div style={{ borderRadius: 10, overflow: 'hidden' }}>

      {/* Section header - espresso bar, strong visual anchor */}

      <button onClick={onToggleOpen} className="w-full flex items-center justify-between px-3 py-2 transition-colors"

        style={{

          background: C.espresso,

          color: 'white',

          borderTop: isActive ? `2px solid ${C.orange}` : '2px solid transparent',

          borderRadius: open ? '10px 10px 0 0' : '10px',

        }}

        onMouseEnter={e => { e.currentTarget.style.background = '#3A312B'; }}

        onMouseLeave={e => { e.currentTarget.style.background = C.espresso; }}

      >

        <div className="flex items-center gap-2">

          {Icon && (

            <span className="flex items-center justify-center shrink-0" style={{

              width: 22, height: 22,

              background: isActive ? C.orange : 'rgba(255,255,255,0.10)',

              borderRadius: 5,

            }}>

              <Icon size={12} strokeWidth={2.25} color={isActive ? 'white' : 'rgba(255,255,255,0.85)'} />

            </span>

          )}

          <span style={{

            fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',

            textTransform: 'uppercase',

            color: 'white',

          }}>{label}</span>

          {isActive && (

            <span style={{

              fontSize: 10, fontWeight: 700, padding: '2px 7px',

              background: C.orange, color: 'white',

              borderRadius: 999, fontFamily: 'ui-monospace, Menlo, monospace',

              letterSpacing: '0.04em',

              lineHeight: 1.2,

            }}>{active.length}</span>

          )}

        </div>

        <div className="flex items-center gap-2">

          {!open && !isActive && (

            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'ui-monospace, Menlo, monospace' }}>

              {visibleItems.length}

            </span>

          )}

          <span className="flex items-center justify-center" style={{

            width: 18, height: 18,

            color: 'rgba(255,255,255,0.7)',

            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',

            transition: 'transform 200ms',

          }}>

            <ChevronDown size={14} strokeWidth={2.25} />

          </span>

        </div>

      </button>

      {/* Card grid - sits directly on cream, no nested borders */}

      {open && (

        <div style={{

          padding: '8px 0 0 0',

          background: C.cream,

          display: 'grid',

          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,

          gap: 6,

        }}>

          {visibleItems.map(item => {

            const checked = active.includes(item.id);

            const ItemIcon = item.icon;

            const accent = ({

              teal: { bg: C.tealTint, fg: C.tealDeep, border: C.teal },

              olive: { bg: C.oliveTint, fg: C.oliveDeep, border: C.olive },

              amber: { bg: C.amberTint, fg: '#7A5510', border: C.amber },

              red: { bg: C.redTint, fg: C.red, border: C.red },

              stone: { bg: C.sand, fg: C.cocoa, border: C.stone },

              orange: { bg: C.orangeTint, fg: C.orangeDeep, border: C.orange },

            }[item.tone] || { bg: C.sand, fg: C.cocoa, border: C.stone });

            return (

              <button

                key={item.id}

                onClick={() => onToggle(item.id)}

                className="relative text-left transition-all"

                style={{

                  // Cards default to a subtle sand fill so they pop against cream - no more white-on-white

                  background: checked ? accent.bg : C.sand + '99',

                  border: `1px solid ${checked ? accent.border : 'transparent'}`,

                  borderRadius: 7,

                  padding: '8px 10px',

                  minWidth: 0,

                  boxShadow: checked ? `0 0 0 1px ${accent.border}` : 'none',

                }}

                onMouseEnter={e => {

                  if (!checked) {

                    e.currentTarget.style.background = accent.bg + 'AA';

                    e.currentTarget.style.borderColor = accent.border + '55';

                  }

                }}

                onMouseLeave={e => {

                  if (!checked) {

                    e.currentTarget.style.background = C.sand + '99';

                    e.currentTarget.style.borderColor = 'transparent';

                  }

                }}

              >

                {/* Icon row */}

                <div className="flex items-start justify-between gap-1.5">

                  {item.code ? (

                    <span style={{

                      fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace',

                      fontWeight: 700, letterSpacing: '0.05em',

                      padding: '2px 5px',

                      background: checked ? accent.border : C.espresso,

                      color: 'white',

                      borderRadius: 3,

                    }}>{item.code}</span>

                  ) : ItemIcon ? (

                    <span className="flex items-center justify-center shrink-0" style={{

                      width: 22, height: 22,

                      background: checked ? accent.border : C.white,

                      borderRadius: 5,

                      border: checked ? 'none' : `1px solid ${C.taupe}`,

                    }}>

                      <ItemIcon size={12} strokeWidth={2.25} color={checked ? 'white' : accent.fg} />

                    </span>

                  ) : (

                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: accent.border }} />

                  )}

                  <span style={{

                    fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace',

                    color: checked ? accent.fg : C.stone,

                    fontWeight: 600,

                    lineHeight: 1.2,

                  }}>{item.count}</span>

                </div>

                {/* Label row */}

                <div className="mt-1.5" style={{

                  fontSize: 11.5,

                  color: checked ? accent.fg : C.cocoa,

                  fontWeight: checked ? 700 : 500,

                  lineHeight: 1.25,

                  letterSpacing: '-0.005em',

                }}

                title={item.label}>

                  {item.label}

                </div>

                {/* Selected check mark - top right corner */}

                {checked && (

                  <span className="absolute" style={{

                    top: -5, right: -5,

                    width: 14, height: 14,

                    background: accent.border,

                    border: `2px solid ${C.cream}`,

                    borderRadius: 999,

                    display: 'flex', alignItems: 'center', justifyContent: 'center',

                  }}>

                    <Check size={8} color="white" strokeWidth={3.5} />

                  </span>

                )}

              </button>

            );

          })}

        </div>

      )}

    </div>

  );

}

// Compact removable chip for active filter selections

function ActiveChip({ label, onRemove }) {

  return (

    <span className="inline-flex items-center gap-1 group" style={{

      background: C.white,

      border: `1px solid ${C.orange}66`,

      borderRadius: 999,

      padding: '2px 3px 2px 8px',

      fontSize: 10.5,

      fontWeight: 600,

      color: C.cocoa,

    }}>

      {label}

      <button onClick={onRemove}

        className="flex items-center justify-center transition-colors"

        style={{

          width: 14, height: 14,

          background: C.orangeTint,

          color: C.orangeDeep,

          borderRadius: 999,

        }}

        onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = 'white'; }}

        onMouseLeave={e => { e.currentTarget.style.background = C.orangeTint; e.currentTarget.style.color = C.orangeDeep; }}

      >

        <X size={9} strokeWidth={2.75} />

      </button>

    </span>

  );

}

function StatBlock({ value, label, accent }) {

  return (

    <div className="flex items-baseline gap-2.5" style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 12 }}>

      <span style={{ fontSize: 22, fontWeight: 300, color: C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>

      <span style={{ fontSize: 10, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{label}</span>

    </div>

  );

}

function Stat({ label, value, accent }) {

  return (

    <div className="px-2.5 py-2" style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone }}>{label}</div>

      <div style={{ fontSize: 18, fontWeight: 300, color: accent || C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>

    </div>

  );

}

// Compact inline stat for the dark sticky quote bar

function InlineStat({ label, value, accent }) {

  return (

    <div className="flex flex-col">

      <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{label}</span>

      <span style={{ fontSize: 17, fontWeight: 600, color: accent || 'white', fontFamily: 'ui-monospace, Menlo, monospace', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{value}</span>

    </div>

  );

}

// Reusable PM contact card - shows assigned PM's name, email, phone.

// `variant` controls density:

//   'rail'   = right-rail compact, used as persistent reference on home screen

//   'modal'  = inside requestCall modal, more presence with avatar circle

//   'inline' = ultra-compact one-liner for small spaces

function PmCard({ pm, variant = 'rail' }) {

  if (!pm) {

    // Unassigned state - neutral copy so buyers know what to expect

    if (variant === 'rail') {

      return (

        <div className="px-3 py-2.5 flex items-start gap-2"

          style={{ background: C.amberTint, border: `1px solid ${C.amber}40`, borderRadius: 8 }}>

          <AlertCircle size={13} style={{ color: '#7A5510', marginTop: 1 }} strokeWidth={2.25} />

          <div style={{ fontSize: 11, color: '#7A5510', lineHeight: 1.4 }}>

            <div style={{ fontWeight: 700, marginBottom: 1 }}>No PM assigned yet</div>

            <div>Requests route to the next available PM. Contact your account team to assign one.</div>

          </div>

        </div>

      );

    }

    return null;

  }

  const initials = (pm.firstName?.[0] || '') + (pm.lastName?.[0] || '');

  if (variant === 'inline') {

    return (

      <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, color: C.cocoa }}>

        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0"

          style={{ background: C.teal, color: 'white' }}>{initials}</div>

        <span style={{ fontWeight: 600, color: C.espresso }}>{pm.firstName} {pm.lastName}</span>

      </span>

    );

  }

  if (variant === 'modal') {

    return (

      <div className="px-3 py-2.5 flex items-center gap-3"

        style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"

          style={{ background: C.teal, color: 'white' }}>{initials}</div>

        <div className="flex-1 min-w-0">

          <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>{pm.firstName} {pm.lastName}</div>

          <div className="flex items-center gap-3 mt-0.5" style={{ fontSize: 11.5, color: C.cocoa, fontFamily: 'ui-monospace, Menlo, monospace' }}>

            <a href={`mailto:${pm.email}`} className="inline-flex items-center gap-1 transition-colors"

              style={{ color: C.cocoa }}

              onMouseEnter={e => e.currentTarget.style.color = C.tealDeep}

              onMouseLeave={e => e.currentTarget.style.color = C.cocoa}>

              <Mail size={11} strokeWidth={2.25} />{pm.email}

            </a>

            {pm.phone && (

              <a href={`tel:${pm.phone}`} className="inline-flex items-center gap-1 transition-colors"

                style={{ color: C.cocoa }}

                onMouseEnter={e => e.currentTarget.style.color = C.tealDeep}

                onMouseLeave={e => e.currentTarget.style.color = C.cocoa}>

                <Phone size={11} strokeWidth={2.25} />{pm.phone}

              </a>

            )}

          </div>

        </div>

        <span style={{ fontSize: 10, color: C.tealDeep, fontWeight: 700, padding: '2px 7px', background: C.tealTint, borderRadius: 999, letterSpacing: '0.04em' }}>

          ASSIGNED PM

        </span>

      </div>

    );

  }

  // 'rail' variant - compact persistent reference for the right rail / home screen

  return (

    <div style={{

      background: C.white,

      border: `1px solid ${C.taupe}`,

      borderTop: `3px solid ${C.teal}`,

      borderRadius: 8,

      padding: 12,

    }}>

      <div className="flex items-center gap-2.5 mb-2.5">

        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-bold"

          style={{ background: C.teal, color: 'white' }}>{initials}</div>

        <div className="flex-1 min-w-0">

          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, lineHeight: 1 }}>

            Your Product Manager

          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.espresso, marginTop: 2, lineHeight: 1.2 }}>

            {pm.firstName} {pm.lastName}

          </div>

        </div>

      </div>

      <div className="space-y-1.5" style={{ fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace' }}>

        <a href={`mailto:${pm.email}`} className="flex items-center gap-1.5 transition-colors"

          style={{ color: C.cocoa }}

          onMouseEnter={e => e.currentTarget.style.color = C.tealDeep}

          onMouseLeave={e => e.currentTarget.style.color = C.cocoa}>

          <Mail size={11} strokeWidth={2.25} style={{ color: C.stone, flexShrink: 0 }} />

          <span className="truncate">{pm.email}</span>

        </a>

        {pm.phone && (

          <a href={`tel:${pm.phone}`} className="flex items-center gap-1.5 transition-colors"

            style={{ color: C.cocoa }}

            onMouseEnter={e => e.currentTarget.style.color = C.tealDeep}

            onMouseLeave={e => e.currentTarget.style.color = C.cocoa}>

            <Phone size={11} strokeWidth={2.25} style={{ color: C.stone, flexShrink: 0 }} />

            <span>{pm.phone}</span>

          </a>

        )}

      </div>

    </div>

  );

}

function PhotoModal({ unit, material, onClose }) {

  const hub = HUBS.find(h => h.id === unit.hub);

  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(46,38,34,0.65)' }} onClick={onClose}>

      <div className="shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"

        style={{ background: C.cream, border: `1px solid ${C.taupe}`, borderRadius: 14 }} onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.taupe }}>

          <div>

            <Eyebrow color="cocoa">{material.oem}</Eyebrow>

            <div className="mt-1" style={{ fontSize: 17, fontFamily: FONT_STACK, fontWeight: 300, color: C.espresso, letterSpacing: '-0.01em' }}>

              <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 16 }}>{material.material}</span>{' '}

              <span style={{ color: C.stone }}> -  {material.commonName}</span>

            </div>

          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-white"><X size={18} /></button>

        </div>

        <div className="grid grid-cols-[1fr_260px]">

          <div className="p-5 flex items-center justify-center" style={{ background: C.sand, minHeight: 320 }}>

            <img src={unit.photo} className="max-w-full max-h-80 shadow-lg" style={{ borderRadius: 8 }} alt="" />

          </div>

          <div className="p-5 space-y-3" style={{ borderLeft: `1px solid ${C.taupe}`, fontSize: 12.5 }}>

            <Detail label="Inv SKU" value={unit.invSku} mono />

            <Detail label="Serial" value={unit.serial} mono />

            <div>

              <Eyebrow color="cocoa">Functional</Eyebrow>

              <div className="mt-1.5"><Pill tone={fnTone(unit.functional)} dot>{unit.functional}</Pill></div>

            </div>

            <div>

              <Eyebrow color="cocoa">Cosmetic</Eyebrow>

              <div className="mt-1.5"><Pill tone={csmTone(unit.cosmetic)}>{unit.cosmetic}</Pill></div>

            </div>

            <Detail label="Powers on" value={unit.powersOn ? 'Yes' : 'No / Untested'} />

            <Detail label="Location" value={`${hub.name} (${hub.code})`} />

            <div className="pt-3 border-t" style={{ borderColor: C.taupe }}>

              <Eyebrow color="cocoa">Unit price</Eyebrow>

              <div className="mt-1" style={{ fontSize: 24, fontWeight: 300, color: C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.025em' }}>

                ${unit.unitPrice.toLocaleString()}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

function Detail({ label, value, mono }) {

  return (

    <div>

      <Eyebrow color="cocoa">{label}</Eyebrow>

      <div className="mt-0.5" style={{ color: C.espresso, fontFamily: mono ? 'ui-monospace, Menlo, monospace' : FONT_STACK, fontSize: mono ? 12 : 13, fontWeight: mono ? 600 : 500 }}>{value}</div>

    </div>

  );

}

function QuoteSheet({ mode, pmAction, buyerAction, cartUnits, totals, activeCustomer, activeCustomerTier, assignedPm, onClose, onSubmit }) {

  // Determine the flow: 'requestCall' | 'buyerOrder' | 'pmQuote' | 'pmOrder'

  const flow = mode === 'external'

    ? (buyerAction === 'order' ? 'buyerOrder' : 'requestCall')

    : (pmAction === 'order' ? 'pmOrder' : 'pmQuote');

  const [poNumber, setPoNumber] = useState('');

  const [shipDate, setShipDate] = useState('');

  const [freightMethod, setFreightMethod] = useState(totals.hubCount > 1 ? 'consolidate' : 'standard');

  const [notes, setNotes] = useState('');

  // PM Quote-specific

  const [deliveryMethod, setDeliveryMethod] = useState('account');

  const [recipientEmail, setRecipientEmail] = useState('m.reyes@surgspec.com');

  const [expiresInDays, setExpiresInDays] = useState(14);

  // Buyer order-specific - shipping account

  const [shippingAccountMode, setShippingAccountMode] = useState('onfile'); // 'onfile' | 'enter'

  const [shippingCarrier, setShippingCarrier] = useState('fedex');

  const [shippingAccountNumber, setShippingAccountNumber] = useState('');

  // Buyer requestCall-specific

  const [callTimePreference, setCallTimePreference] = useState('any');

  const [callerPhone, setCallerPhone] = useState('(216) 555-0142');

  const [submitted, setSubmitted] = useState(false);

  // Validation per flow

  const canSubmit = (() => {

    if (flow === 'requestCall') return callerPhone.trim().length > 0;

    if (flow === 'buyerOrder') {

      if (!poNumber.trim()) return false;

      if (shippingAccountMode === 'enter' && !shippingAccountNumber.trim()) return false;

      return true;

    }

    if (flow === 'pmOrder') {

      if (!poNumber.trim() || !shipDate || !freightMethod) return false;

      if (shippingAccountMode === 'enter' && !shippingAccountNumber.trim()) return false;

      return true;

    }

    if (flow === 'pmQuote') return recipientEmail.trim().length > 0 && deliveryMethod;

    return false;

  })();

  // Header config

  const headerConfig = {

    requestCall: { eyebrow: 'Send to Product Manager', eyebrowColor: 'teal', title: 'Quote request', docId: 'Q-2026-2347', accent: C.teal },

    buyerOrder: { eyebrow: 'Submit order', eyebrowColor: 'orange', title: 'Sales order', docId: 'SO-2026-2347', accent: C.orange },

    pmQuote: { eyebrow: 'Send quote to customer', eyebrowColor: 'teal', title: 'Quote', docId: 'Q-2026-2347', accent: C.teal },

    pmOrder: { eyebrow: 'Process order on behalf of customer', eyebrowColor: 'olive', title: 'Sales order', docId: 'SO-2026-2347', accent: C.olive },

  }[flow];

  const submitLabel = {

    requestCall: 'Send to Product Manager',

    buyerOrder: 'Submit order',

    pmQuote: deliveryMethod === 'pdf' ? 'Generate PDF'

      : deliveryMethod === 'emailLink' ? 'Send approval link'

      : 'Push to customer portal',

    pmOrder: 'Lock & process order',

  }[flow];

  const submitIcon = {

    requestCall: Phone,

    buyerOrder: Lock,

    pmQuote: deliveryMethod === 'pdf' ? Download

      : deliveryMethod === 'emailLink' ? Mail

      : Send,

    pmOrder: Lock,

  }[flow];

  if (submitted) {

    return <SubmittedConfirmation flow={flow} headerConfig={headerConfig} poNumber={poNumber} recipientEmail={recipientEmail} deliveryMethod={deliveryMethod} expiresInDays={expiresInDays} shipDate={shipDate} freightMethod={freightMethod} shippingAccountMode={shippingAccountMode} shippingCarrier={shippingCarrier} shippingAccountNumber={shippingAccountNumber} callTimePreference={callTimePreference} callerPhone={callerPhone} notes={notes} totals={totals} cartUnits={cartUnits} mode={mode} pmAction={pmAction} buyerAction={buyerAction} activeCustomer={activeCustomer} activeCustomerTier={activeCustomerTier} assignedPm={assignedPm} onClose={onClose} onSubmit={onSubmit} />;

  }

  return (

    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ background: 'rgba(46,38,34,0.55)' }} onClick={onClose}>

      <div className="min-h-full flex items-start justify-center p-4 sm:py-8">

        <div className="shadow-2xl max-w-3xl w-full my-auto"

          style={{ background: C.cream, border: `1px solid ${C.taupe}`, borderRadius: 14, borderTop: `3px solid ${headerConfig.accent}` }}

          onClick={e => e.stopPropagation()}>

          <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: `1px solid ${C.taupe}`, background: C.cream, borderRadius: '11px 11px 0 0' }}>

            <div>

              <Eyebrow color={headerConfig.eyebrowColor} dot>{headerConfig.eyebrow}</Eyebrow>

            <div className="mt-1.5" style={{ fontSize: 22, fontWeight: 300, color: C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.02em' }}>

              {headerConfig.title}{' '}

              <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>{headerConfig.docId}</span>

            </div>

          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-white"><X size={18} /></button>

        </div>

        <div className="grid grid-cols-[1fr_300px]">

          <div className="p-6 space-y-5">

            {/* Customer account is shown in both PM flows */}

            {(flow === 'pmQuote' || flow === 'pmOrder') && activeCustomer && (

              <Field label="Customer account">

                <div className="px-3 py-2.5 flex items-center gap-2"

                  style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 8, fontSize: 13 }}>

                  <Building2 size={14} style={{ color: C.cocoa }} />

                  <span style={{ fontWeight: 600, color: C.espresso }}>{activeCustomer.company}</span>

                  {activeCustomerTier && (

                    <Pill tone={activeCustomerTier.color === 'teal' ? 'teal' : activeCustomerTier.color === 'olive' ? 'olive' : 'stone'}>

                      {activeCustomerTier.name}

                    </Pill>

                  )}

                  <span className="ml-auto" style={{ fontSize: 11, color: C.stone }}>

                    {activeCustomerTier?.paymentTerms || 'Net-30'}  -  {activeCustomer.firstName} {activeCustomer.lastName}

                  </span>

                </div>

              </Field>

            )}

            {/* ============== PM QUOTE: Delivery method ============== */}

            {flow === 'pmQuote' && (

              <>

                <Field label="How should the customer receive this quote?" required>

                  <div className="space-y-2">

                    {[

                      {

                        id: 'account',

                        icon: User,

                        label: 'Push to customer\'s reLink Wholesale account',

                        sub: 'Reserve inventory  -  customer approves in their portal  -  auto-converts to order on PO submission',

                        recommended: true,

                      },

                      {

                        id: 'emailLink',

                        icon: Mail,

                        label: 'Send approval link via email',

                        sub: 'Customer clicks link, reviews quote, provides PO to approve',

                      },

                      {

                        id: 'pdf',

                        icon: Download,

                        label: 'Generate PDF quote',

                        sub: 'Download a branded quote PDF  -  email manually outside the platform',

                      },

                    ].map(opt => (

                      <label key={opt.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors"

                        style={{

                          border: `1px solid ${deliveryMethod === opt.id ? C.teal : C.taupe}`,

                          background: deliveryMethod === opt.id ? C.tealTint : C.white,

                          borderRadius: 8,

                        }}>

                        <input type="radio" checked={deliveryMethod === opt.id} onChange={() => setDeliveryMethod(opt.id)} className="mt-1 accent-[#0598A6]" />

                        <opt.icon size={15} strokeWidth={2.25} style={{ color: deliveryMethod === opt.id ? C.tealDeep : C.stone, marginTop: 2 }} />

                        <div className="flex-1">

                          <div className="flex items-center gap-2">

                            <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>{opt.label}</div>

                            {opt.recommended && <Pill tone="teal" size="sm">Recommended</Pill>}

                          </div>

                          <div style={{ fontSize: 11.5, color: C.stone, marginTop: 2, lineHeight: 1.45 }}>{opt.sub}</div>

                        </div>

                      </label>

                    ))}

                  </div>

                </Field>

                {(deliveryMethod === 'account' || deliveryMethod === 'emailLink') && (

                  <div className="grid grid-cols-2 gap-4">

                    <Field label="Recipient email" required>

                      <input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email"

                        className="w-full px-3 py-2.5 outline-none transition-all"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}

                        onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                        onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                    </Field>

                    <Field label="Quote expires in">

                      <select value={expiresInDays} onChange={e => setExpiresInDays(parseInt(e.target.value))}

                        className="w-full px-3 py-2.5 outline-none"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

                        <option value={7}>7 days</option>

                        <option value={14}>14 days</option>

                        <option value={30}>30 days</option>

                        <option value={60}>60 days</option>

                      </select>

                    </Field>

                  </div>

                )}

                {/* PDF preview - appears when 'Generate PDF' is the chosen delivery method.

                    Same Summary/Detailed pattern as the buyer workflow so PMs can match the document

                    format to the customer's audience (executive vs biomed/operations). */}

                {deliveryMethod === 'pdf' && (

                  <div className="px-4 py-3.5" style={{

                    background: C.tealTint,

                    border: `1px solid ${C.teal}40`,

                    borderRadius: 8,

                  }}>

                    <div className="flex items-start gap-3">

                      <FileText size={18} style={{ color: C.tealDeep, marginTop: 1 }} strokeWidth={2.25} />

                      <div className="flex-1">

                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.tealDeep, marginBottom: 2 }}>

                          Preview before generating

                        </div>

                        <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.45 }}>

                          Choose the level of detail to match the customer's audience. Open in a new window to verify pricing, line items, and customer details before delivering.

                        </div>

                      </div>

                    </div>

                    {/* Two format options - Summary for executives, Detailed for biomed/operations */}

                    <div className="grid grid-cols-2 gap-2 mt-3">

                      {[

                        {

                          id: 'summary',

                          label: 'Summary quote',

                          sub: 'One line per material  -  executive sign-off, budget approval',

                          icon: FileText,

                        },

                        {

                          id: 'detailed',

                          label: 'Detailed quote',

                          sub: 'Every unit listed with serial  -  biomed, operations, audit',

                          icon: Layers,

                        },

                      ].map(opt => (

                        <button

                          key={opt.id}

                          onClick={() => generateQuotePdf({

                            docType: 'quote',

                            cartUnits, totals, mode, pmAction, buyerAction,

                            customerName: activeCustomer?.company || 'Customer',

                            poNumber, shipDate, freightMethod, notes, expiresInDays,

                            detail: opt.id,

                          })}

                          className="flex flex-col items-start gap-1 px-3 py-2.5 transition-colors text-left"

                          style={{

                            background: C.white,

                            border: `1px solid ${C.teal}55`,

                            borderRadius: 8,

                            minWidth: 0,

                          }}

                          onMouseEnter={e => {

                            e.currentTarget.style.background = C.teal;

                            e.currentTarget.style.borderColor = C.teal;

                            e.currentTarget.querySelectorAll('[data-themed]').forEach(el => el.style.color = '#FFFFFF');

                          }}

                          onMouseLeave={e => {

                            e.currentTarget.style.background = C.white;

                            e.currentTarget.style.borderColor = `${C.teal}55`;

                            const labelEl = e.currentTarget.querySelector('[data-themed="label"]');

                            const subEl = e.currentTarget.querySelector('[data-themed="sub"]');

                            const iconEl = e.currentTarget.querySelector('[data-themed="icon"]');

                            if (labelEl) labelEl.style.color = C.espresso;

                            if (subEl) subEl.style.color = C.stone;

                            if (iconEl) iconEl.style.color = C.tealDeep;

                          }}

                        >

                          <div className="flex items-center gap-1.5 w-full">

                            <opt.icon size={13} strokeWidth={2.25} style={{ color: C.tealDeep }} data-themed="icon" />

                            <span style={{ fontSize: 12, fontWeight: 700, color: C.espresso }} data-themed="label">{opt.label}</span>

                            <Eye size={11} strokeWidth={2.25} style={{ color: C.tealDeep, marginLeft: 'auto' }} data-themed="icon" />

                          </div>

                          <div style={{ fontSize: 10.5, color: C.stone, lineHeight: 1.35 }} data-themed="sub">{opt.sub}</div>

                        </button>

                      ))}

                    </div>

                  </div>

                )}

                {/* Inventory reservation toggle */}

                <div className="px-3 py-2.5 flex items-start gap-2" style={{ background: C.tealTint, borderRadius: 8 }}>

                  <Lock size={13} style={{ color: C.tealDeep, marginTop: 2 }} strokeWidth={2.25} />

                  <div style={{ fontSize: 11.5, color: C.tealDeep, lineHeight: 1.45 }}>

                    <span style={{ fontWeight: 600 }}>Inventory reserved</span> for {expiresInDays} days while customer reviews. Other buyers will see these units as on-hold.

                  </div>

                </div>

              </>

            )}

            {/* ============== PM ORDER: mirrors Buyer Order - PO + Ship account + Ship date + Freight ============== */}

            {flow === 'pmOrder' && (

              <>

                <div className="grid grid-cols-2 gap-4">

                  <Field label="Customer PO number" required>

                    <input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="e.g. PO-58291-A"

                      className="w-full px-3 py-2.5 outline-none transition-all"

                      style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }}

                      onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                      onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                  </Field>

                  <Field label="Required ship date" required>

                    <div className="relative">

                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.stone }} strokeWidth={2.25} />

                      <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)}

                        className="w-full pl-9 pr-3 py-2.5 outline-none"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }} />

                    </div>

                  </Field>

                </div>

                {/* SHIPPING ACCOUNT - mirrors buyer order, but on customer's behalf */}

                <Field label="Shipping account (on customer's behalf)" required>

                  <div className="space-y-2">

                    {[

                      {

                        id: 'onfile',

                        icon: Building2,

                        label: 'Use shipping address on customer account',

                        sub: `${activeCustomer?.company || 'Customer'}  -  1234 Medical Pkwy, Cleveland, OH 44195`,

                      },

                      {

                        id: 'enter',

                        icon: CreditCard,

                        label: "Bill to customer's carrier shipping account",

                        sub: 'Use customer-provided FedEx, UPS, or DHL account number - freight billed directly to them',

                      },

                    ].map(opt => (

                      <label key={opt.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors"

                        style={{

                          border: `1px solid ${shippingAccountMode === opt.id ? C.olive : C.taupe}`,

                          background: shippingAccountMode === opt.id ? C.oliveTint : C.white,

                          borderRadius: 8,

                        }}>

                        <input type="radio" checked={shippingAccountMode === opt.id} onChange={() => setShippingAccountMode(opt.id)} className="mt-1 accent-[#90AD51]" />

                        <opt.icon size={15} strokeWidth={2.25} style={{ color: shippingAccountMode === opt.id ? C.oliveDeep : C.stone, marginTop: 2 }} />

                        <div className="flex-1">

                          <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>{opt.label}</div>

                          <div style={{ fontSize: 11.5, color: C.stone, marginTop: 2, lineHeight: 1.45 }}>{opt.sub}</div>

                        </div>

                      </label>

                    ))}

                  </div>

                </Field>

                {/* Carrier + account # - only shown when "enter" is selected */}

                {shippingAccountMode === 'enter' && (

                  <div className="grid grid-cols-[160px_1fr] gap-3 -mt-2 ml-8 pl-3"

                    style={{ borderLeft: `2px solid ${C.oliveTint}` }}>

                    <Field label="Carrier" required>

                      <select value={shippingCarrier} onChange={e => setShippingCarrier(e.target.value)}

                        className="w-full px-3 py-2.5 outline-none"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

                        <option value="fedex">FedEx</option>

                        <option value="ups">UPS</option>

                        <option value="dhl">DHL</option>

                        <option value="usps">USPS</option>

                        <option value="other">Other / freight</option>

                      </select>

                    </Field>

                    <Field label="Customer account number" required>

                      <input value={shippingAccountNumber} onChange={e => setShippingAccountNumber(e.target.value)} placeholder="e.g. 123456789"

                        className="w-full px-3 py-2.5 outline-none transition-all"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }}

                        onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                        onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                    </Field>

                  </div>

                )}

                <Field label={totals.hubCount > 1 ? `Freight method - order spans ${totals.hubCount} hubs` : 'Freight method'} required>

                  <div className="space-y-2">

                    {(totals.hubCount > 1 ? [

                      { id: 'consolidate', icon: Truck, label: 'Consolidate to one staging hub', sub: 'Adds 2-4 days  -  single freight charge  -  simpler receiving' },

                      { id: 'split', icon: MapPin, label: 'Split-ship from each origin hub', sub: 'Faster delivery  -  multiple freight charges  -  multiple receivings' },

                    ] : [

                      { id: 'standard', icon: Truck, label: 'Standard freight', sub: 'Single hub  -  single shipment' },

                      { id: 'expedited', icon: Truck, label: 'Expedited freight', sub: '2-3 day delivery  -  premium rate' },

                    ]).map(opt => (

                      <label key={opt.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors"

                        style={{

                          border: `1px solid ${freightMethod === opt.id ? C.olive : C.taupe}`,

                          background: freightMethod === opt.id ? C.oliveTint : C.white,

                          borderRadius: 8,

                        }}>

                        <input type="radio" checked={freightMethod === opt.id} onChange={() => setFreightMethod(opt.id)} className="mt-1 accent-[#90AD51]" />

                        <opt.icon size={15} strokeWidth={2.25} style={{ color: freightMethod === opt.id ? C.oliveDeep : C.stone, marginTop: 2 }} />

                        <div className="flex-1">

                          <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>{opt.label}</div>

                          <div style={{ fontSize: 11.5, color: C.stone, marginTop: 2, lineHeight: 1.45 }}>{opt.sub}</div>

                        </div>

                      </label>

                    ))}

                  </div>

                </Field>

                <div className="px-3 py-2.5 flex items-start gap-2" style={{ background: C.oliveTint, borderRadius: 8 }}>

                  <Lock size={13} style={{ color: C.oliveDeep, marginTop: 2 }} strokeWidth={2.25} />

                  <div style={{ fontSize: 11.5, color: C.oliveDeep, lineHeight: 1.45 }}>

                    <span style={{ fontWeight: 600 }}>Locks inventory immediately.</span> Selected units come off the marketplace and route to logistics for staging. Order proceeds without buyer approval - you are processing on their behalf.

                  </div>

                </div>

              </>

            )}

            {/* ============== BUYER: REQUEST CALL ============== */}

            {flow === 'requestCall' && (

              <>

                <div className="px-3 py-3 flex items-start gap-3" style={{ background: C.tealTint, borderRadius: 8 }}>

                  <Phone size={16} style={{ color: C.tealDeep, marginTop: 2 }} strokeWidth={2.25} />

                  <div style={{ fontSize: 12.5, color: C.tealDeep, lineHeight: 1.5 }}>

                    {assignedPm ? (

                      <>

                        <div style={{ fontWeight: 700, marginBottom: 2 }}>

                          Your selection will be sent to {assignedPm.firstName} {assignedPm.lastName}, your Product Manager.

                        </div>

                        <div>They'll reach out to discuss volume pricing, condition options, freight, and any substitutions before you commit.</div>

                      </>

                    ) : (

                      <>

                        <div style={{ fontWeight: 700, marginBottom: 2 }}>Your selection will be routed to the next available Product Manager.</div>

                        <div>You don't currently have a dedicated PM. The first available team member will reach out to discuss your selection before you commit.</div>

                      </>

                    )}

                  </div>

                </div>

                {/* PM contact card - shows name, email, and phone so buyer knows exactly who they'll hear from */}

                {assignedPm && <PmCard pm={assignedPm} variant="modal" />}

                <div className="grid grid-cols-2 gap-4">

                  <Field label="Best number to reach you" required>

                    <input value={callerPhone} onChange={e => setCallerPhone(e.target.value)} placeholder="(216) 555-0142"

                      className="w-full px-3 py-2.5 outline-none transition-all"

                      style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }}

                      onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                      onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                  </Field>

                  <Field label="When should they call?">

                    <select value={callTimePreference} onChange={e => setCallTimePreference(e.target.value)}

                      className="w-full px-3 py-2.5 outline-none"

                      style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

                      <option value="any">Any business hour</option>

                      <option value="morning">Mornings (8am-12pm ET)</option>

                      <option value="afternoon">Afternoons (12pm-5pm ET)</option>

                      <option value="urgent">Urgent - within 2 hours</option>

                    </select>

                  </Field>

                </div>

                <div className="px-3 py-2 flex items-center gap-2" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 8, fontSize: 12, color: C.cocoa }}>

                  <Lock size={12} style={{ color: C.stone }} strokeWidth={2.25} />

                  <span><span style={{ fontWeight: 600 }}>Inventory soft-held</span> on your selection for 48 hours while you talk with {assignedPm ? `${assignedPm.firstName}` : 'your Product Manager'}.</span>

                </div>

              </>

            )}

            {/* ============== BUYER: SUBMIT ORDER ============== */}

            {flow === 'buyerOrder' && (

              <>

                {/* Need-a-quote-first callout - for buyers whose procurement workflow requires a formal quote PDF

                    before they can issue a PO. Generates the same branded quote document with current cart state. */}

                <div className="px-4 py-3.5" style={{

                  background: C.tealTint,

                  border: `1px solid ${C.teal}40`,

                  borderRadius: 8,

                }}>

                  <div className="flex items-start gap-3">

                    <FileText size={18} style={{ color: C.tealDeep, marginTop: 1 }} strokeWidth={2.25} />

                    <div className="flex-1">

                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.tealDeep, marginBottom: 2 }}>

                        Need a formal quote first?

                      </div>

                      <div style={{ fontSize: 11.5, color: C.cocoa, lineHeight: 1.45 }}>

                        Generate a branded quote PDF for procurement, finance, or your buying committee. Choose the level of detail to match your audience. Your selection stays in the cart.

                      </div>

                    </div>

                  </div>

                  {/* Two format options - Summary for executives, Detailed for biomed/operations */}

                  <div className="grid grid-cols-2 gap-2 mt-3">

                    {[

                      {

                        id: 'summary',

                        label: 'Summary quote',

                        sub: 'One line per material  -  ideal for executive sign-off, budget approval',

                        icon: FileText,

                      },

                      {

                        id: 'detailed',

                        label: 'Detailed quote',

                        sub: 'Every unit listed with serial  -  for biomed, operations, audit',

                        icon: Layers,

                      },

                    ].map(opt => (

                      <button

                        key={opt.id}

                        onClick={() => generateQuotePdf({

                          docType: 'quote',

                          cartUnits, totals, mode, pmAction, buyerAction,

                          customerName: activeCustomer?.company || 'Customer',

                          notes,

                          expiresInDays: 14,

                          detail: opt.id,

                        })}

                        className="flex flex-col items-start gap-1 px-3 py-2.5 transition-colors text-left"

                        style={{

                          background: C.white,

                          border: `1px solid ${C.teal}55`,

                          borderRadius: 8,

                          minWidth: 0,

                        }}

                        onMouseEnter={e => {

                          e.currentTarget.style.background = C.teal;

                          e.currentTarget.style.borderColor = C.teal;

                          e.currentTarget.querySelectorAll('[data-themed]').forEach(el => el.style.color = '#FFFFFF');

                        }}

                        onMouseLeave={e => {

                          e.currentTarget.style.background = C.white;

                          e.currentTarget.style.borderColor = `${C.teal}55`;

                          const labelEl = e.currentTarget.querySelector('[data-themed="label"]');

                          const subEl = e.currentTarget.querySelector('[data-themed="sub"]');

                          const iconEl = e.currentTarget.querySelector('[data-themed="icon"]');

                          if (labelEl) labelEl.style.color = C.espresso;

                          if (subEl) subEl.style.color = C.stone;

                          if (iconEl) iconEl.style.color = C.tealDeep;

                        }}

                      >

                        <div className="flex items-center gap-1.5 w-full">

                          <opt.icon size={13} strokeWidth={2.25} style={{ color: C.tealDeep }} data-themed="icon" />

                          <span style={{ fontSize: 12, fontWeight: 700, color: C.espresso }} data-themed="label">{opt.label}</span>

                          <Download size={11} strokeWidth={2.25} style={{ color: C.tealDeep, marginLeft: 'auto' }} data-themed="icon" />

                        </div>

                        <div style={{ fontSize: 10.5, color: C.stone, lineHeight: 1.35 }} data-themed="sub">{opt.sub}</div>

                      </button>

                    ))}

                  </div>

                </div>

                {/* Subtle divider so the order form starts clean below the callout */}

                <div className="flex items-center gap-3" style={{ marginTop: 4 }}>

                  <div className="flex-1 h-px" style={{ background: C.taupe }} />

                  <span style={{ fontSize: 10, color: C.stone, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>

                    Or submit your order now

                  </span>

                  <div className="flex-1 h-px" style={{ background: C.taupe }} />

                </div>

                <Field label="PO number" required>

                  <input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="e.g. PO-58291-A"

                    className="w-full px-3 py-2.5 outline-none transition-all"

                    style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }}

                    onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                    onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                </Field>

                {/* SHIPPING - use account default vs enter shipping account # */}

                <Field label="Shipping account" required>

                  <div className="space-y-2">

                    {[

                      {

                        id: 'onfile',

                        icon: Building2,

                        label: 'Use shipping address on my account',

                        sub: `${activeCustomer?.company || 'My company'}  -  1234 Medical Pkwy, Cleveland, OH 44195`,

                      },

                      {

                        id: 'enter',

                        icon: CreditCard,

                        label: 'Bill to my carrier shipping account',

                        sub: 'Use my FedEx, UPS, or DHL account number - freight billed directly to me',

                      },

                    ].map(opt => (

                      <label key={opt.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors"

                        style={{

                          border: `1px solid ${shippingAccountMode === opt.id ? C.orange : C.taupe}`,

                          background: shippingAccountMode === opt.id ? C.orangeTint : C.white,

                          borderRadius: 8,

                        }}>

                        <input type="radio" checked={shippingAccountMode === opt.id} onChange={() => setShippingAccountMode(opt.id)} className="mt-1 accent-[#F38637]" />

                        <opt.icon size={15} strokeWidth={2.25} style={{ color: shippingAccountMode === opt.id ? C.orangeDeep : C.stone, marginTop: 2 }} />

                        <div className="flex-1">

                          <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>{opt.label}</div>

                          <div style={{ fontSize: 11.5, color: C.stone, marginTop: 2, lineHeight: 1.45 }}>{opt.sub}</div>

                        </div>

                      </label>

                    ))}

                  </div>

                </Field>

                {/* Carrier + account # - only shown when "enter" is selected */}

                {shippingAccountMode === 'enter' && (

                  <div className="grid grid-cols-[160px_1fr] gap-3 -mt-2 ml-8 pl-3"

                    style={{ borderLeft: `2px solid ${C.orangeTint}` }}>

                    <Field label="Carrier" required>

                      <select value={shippingCarrier} onChange={e => setShippingCarrier(e.target.value)}

                        className="w-full px-3 py-2.5 outline-none"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

                        <option value="fedex">FedEx</option>

                        <option value="ups">UPS</option>

                        <option value="dhl">DHL</option>

                        <option value="usps">USPS</option>

                        <option value="other">Other / freight</option>

                      </select>

                    </Field>

                    <Field label="Account number" required>

                      <input value={shippingAccountNumber} onChange={e => setShippingAccountNumber(e.target.value)} placeholder="e.g. 123456789"

                        className="w-full px-3 py-2.5 outline-none transition-all"

                        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa }}

                        onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                        onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                    </Field>

                  </div>

                )}

                {totals.hubCount > 1 && (

                  <Field label={`Freight method - order spans ${totals.hubCount} hubs`}>

                    <div className="space-y-2">

                      {[

                        { id: 'consolidate', label: 'Consolidate to one staging hub before shipment', sub: 'Adds 2-4 days, single freight charge' },

                        { id: 'split', label: 'Split-ship from each origin hub', sub: 'Faster delivery, multiple freight charges' },

                        { id: 'pm', label: 'Let Product Manager recommend', sub: 'Optimized for cost vs. timeline' },

                      ].map(opt => (

                        <label key={opt.id} className="flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors"

                          style={{

                            border: `1px solid ${freightMethod === opt.id ? C.teal : C.taupe}`,

                            background: freightMethod === opt.id ? C.tealTint : C.white,

                            borderRadius: 8,

                          }}>

                          <input type="radio" checked={freightMethod === opt.id} onChange={() => setFreightMethod(opt.id)} className="mt-0.5 accent-[#0598A6]" />

                          <div>

                            <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>{opt.label}</div>

                            <div style={{ fontSize: 11.5, color: C.stone }}>{opt.sub}</div>

                          </div>

                        </label>

                      ))}

                    </div>

                  </Field>

                )}

                <div className="px-3 py-2.5 flex items-start gap-2" style={{ background: C.orangeTint, borderRadius: 8 }}>

                  <Lock size={13} style={{ color: C.orangeDeep, marginTop: 2 }} strokeWidth={2.25} />

                  <div style={{ fontSize: 11.5, color: C.orangeDeep, lineHeight: 1.45 }}>

                    <span style={{ fontWeight: 600 }}>Inventory locks at submit.</span> Selected units come off the marketplace immediately and route to logistics for staging. Final pricing and freight confirmed in 4-6 business hours.

                  </div>

                </div>

              </>

            )}

            <Field label={

              flow === 'pmQuote' ? 'Notes for the customer'

              : flow === 'requestCall' ? 'Anything to share with your Product Manager?'

              : 'Notes for Product Manager'

            } optional>

              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}

                placeholder={

                  flow === 'pmQuote' ? 'Personalized message, payment terms, or context for the customer...'

                  : flow === 'requestCall' ? 'What you\'re trying to accomplish, target budget, alternatives you\'d consider...'

                  : 'Required-by date, biomed certification, special handling, etc.'

                }

                className="w-full px-3 py-2.5 outline-none"

                style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa, lineHeight: 1.5 }}

                onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

            </Field>

          </div>

          <aside className="p-5" style={{ background: C.sand, borderLeft: `1px solid ${C.taupe}` }}>

            <Eyebrow color="cocoa">Order summary</Eyebrow>

            <div className="space-y-2 mt-3" style={{ fontSize: 13 }}>

              <SummaryRow label="Materials" value={totals.materialCount} />

              <SummaryRow label="Units" value={totals.unitCount} />

              <SummaryRow label="Origin hubs" value={totals.hubCount} />

              <div className="h-px my-3" style={{ background: C.taupe }} />

              <SummaryRow label="Subtotal" value={`$${totals.subtotal.toLocaleString()}`} />

              <SummaryRow label="Freight" value={(flow === 'pmOrder' || flow === 'buyerOrder') ? 'Calculated at staging' : 'TBD'} muted={flow === 'requestCall' || flow === 'pmQuote'} />

              <SummaryRow label="Volume tier" value={(flow === 'pmOrder' || flow === 'buyerOrder') ? 'Tier 2 (-12%)' : 'TBD'} muted={flow === 'requestCall' || flow === 'pmQuote'} />

            </div>

            <div className="mt-4 px-3 py-2"

              style={{

                background: flow === 'pmOrder' ? C.oliveTint : flow === 'buyerOrder' ? C.orangeTint : C.amberTint,

                color: flow === 'pmOrder' ? C.oliveDeep : flow === 'buyerOrder' ? C.orangeDeep : '#7A5510',

                fontSize: 11.5, lineHeight: 1.5, borderRadius: 8,

              }}>

              {flow === 'pmOrder' && 'Tier discount applied. Inventory locks at submit.'}

              {flow === 'buyerOrder' && 'Tier discount applied. Inventory locks at submit.'}

              {flow === 'pmQuote' && 'Quote total is indicative. Final price set on customer approval.'}

              {flow === 'requestCall' && 'No commitment yet. Pricing and freight finalized during your call.'}

            </div>

          </aside>

        </div>

          <div className="px-6 py-4 flex items-center justify-between sticky bottom-0 z-10" style={{ borderTop: `1px solid ${C.taupe}`, background: C.sand, borderRadius: '0 0 11px 11px' }}>

            <div style={{ fontSize: 11.5, color: C.stone, lineHeight: 1.5 }} className="max-w-md">

              {flow === 'requestCall' && 'Your selection will be shared with your assigned Product Manager. They\'ll reach out before any commitment is made.'}

              {flow === 'buyerOrder' && 'By submitting, you authorize reLink to lock inventory and process this as an open order against your PO.'}

              {flow === 'pmQuote' && deliveryMethod === 'pdf' && 'PDF will be generated and ready to download. Inventory remains available until the customer responds.'}

              {flow === 'pmQuote' && deliveryMethod === 'emailLink' && `Approval link will be sent to ${recipientEmail || 'the customer'}. Inventory reserved for ${expiresInDays} days while they review.`}

              {flow === 'pmQuote' && deliveryMethod === 'account' && `Quote will appear in the customer's reLink Wholesale account. They'll get an in-app notification and email.`}

              {flow === 'pmOrder' && 'You are processing this order on behalf of the customer. Inventory locks immediately and routes to logistics.'}

            </div>

            <div className="flex gap-2">

              <Btn variant="outline" onClick={onClose}>Cancel</Btn>

              <Btn variant="primary" size="lg" icon={submitIcon} onClick={() => setSubmitted(true)} disabled={!canSubmit}>{submitLabel}</Btn>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

// ============================================================================

// SUBMITTED CONFIRMATION - branched per flow

// ============================================================================

function SubmittedConfirmation({ flow, headerConfig, poNumber, recipientEmail, deliveryMethod, expiresInDays, shipDate, freightMethod, shippingAccountMode, shippingCarrier, shippingAccountNumber, callTimePreference, callerPhone, notes, totals, cartUnits, mode, pmAction, buyerAction, activeCustomer, activeCustomerTier, assignedPm, onClose, onSubmit }) {

  const config = {

    requestCall: {

      icon: Phone, iconBg: C.tealTint, iconColor: C.tealDeep,

      eyebrow: assignedPm

        ? `Sent to ${assignedPm.firstName} ${assignedPm.lastName}`

        : 'Sent to PM team',

      eyebrowColor: 'teal',

      title: 'Quote request', titleAccent: 'on its way.',

      body: (() => {

        const who = assignedPm ? `${assignedPm.firstName}` : 'Your Product Manager';

        return callTimePreference === 'urgent'

          ? `${who} will call ${callerPhone} within 2 hours. Inventory soft-held for 48 hours.`

          : `${who} will call ${callerPhone} during ${callTimePreference === 'morning' ? 'morning hours' : callTimePreference === 'afternoon' ? 'afternoon hours' : 'business hours'}. Inventory soft-held for 48 hours.`;

      })(),

    },

    buyerOrder: {

      icon: Lock, iconBg: C.orangeTint, iconColor: C.orangeDeep,

      eyebrow: 'Order received', eyebrowColor: 'orange',

      title: 'Sales order', titleAccent: 'locked.',

      body: shippingAccountMode === 'enter'

        ? `Inventory locked. Freight will bill to your ${shippingCarrier.toUpperCase()} account ${shippingAccountNumber}. Tracking sent to your account email when shipped.`

        : `Inventory locked. We'll ship to the address on file. Final freight charges and tracking sent to your account email when shipped.`,

    },

    pmQuote: {

      icon: deliveryMethod === 'pdf' ? Download : Send, iconBg: C.tealTint, iconColor: C.tealDeep,

      eyebrow: 'Quote sent', eyebrowColor: 'teal',

      title: 'Quote', titleAccent: 'on its way.',

      body: deliveryMethod === 'pdf'

        ? 'PDF generated and ready for download. Inventory remains available until the customer responds.'

        : deliveryMethod === 'account'

        ? `Pushed to the customer's reLink Wholesale account. They'll get an in-app notification and email.`

        : `Approval link sent to ${recipientEmail}. Inventory reserved for ${expiresInDays} days.`,

    },

    pmOrder: {

      icon: Lock, iconBg: C.oliveTint, iconColor: C.oliveDeep,

      eyebrow: 'Order locked & processing', eyebrowColor: 'olive',

      title: 'Sales order', titleAccent: 'locked.',

      body: shippingAccountMode === 'enter'

        ? `Inventory locked and routed for staging. Ship date ${shipDate || 'TBD'} via ${freightMethod === 'consolidate' ? 'consolidated freight' : freightMethod === 'split' ? 'split shipment' : freightMethod}. Freight will bill to customer's ${shippingCarrier.toUpperCase()} account ${shippingAccountNumber}.`

        : `Inventory locked and routed for staging. Ship date ${shipDate || 'TBD'} via ${freightMethod === 'consolidate' ? 'consolidated freight' : freightMethod === 'split' ? 'split shipment' : freightMethod}. Shipping to address on customer account.`,

    },

  }[flow];

  const Icon = config.icon;

  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(46,38,34,0.55)' }} onClick={onClose}>

      <div className="shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" style={{ background: C.cream, border: `1px solid ${C.taupe}`, borderRadius: 14, borderTop: `3px solid ${headerConfig.accent}` }} onClick={e => e.stopPropagation()}>

        <div className="p-10 text-center">

          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: config.iconBg }}>

            <Icon size={26} style={{ color: config.iconColor }} strokeWidth={2.25} />

          </div>

          <Eyebrow color={config.eyebrowColor} dot>{config.eyebrow}</Eyebrow>

          <div className="mt-2" style={{ fontSize: 22, fontWeight: 300, color: C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.02em' }}>

            {config.title} <span style={{ fontWeight: 700, color: headerConfig.accent }}>{config.titleAccent}</span>

          </div>

          <div className="mt-3" style={{ fontSize: 13, color: C.cocoa }}>

            <code style={{ background: C.sand, padding: '2px 7px', borderRadius: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>{headerConfig.docId}</code>

            {(flow === 'buyerOrder' || flow === 'pmOrder') && poNumber && (

              <>

                {'  -  PO '}

                <code style={{ background: C.sand, padding: '2px 7px', borderRadius: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>{poNumber}</code>

              </>

            )}

            {'  -  '}

            <code style={{ background: C.sand, padding: '2px 7px', borderRadius: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>${totals.subtotal.toLocaleString()}</code>

          </div>

          <p className="mt-3 max-w-md mx-auto" style={{ fontSize: 12.5, color: C.stone, lineHeight: 1.55 }}>

            {config.body}

          </p>

          {/* Next steps for PM Quote */}

          {flow === 'pmQuote' && (

            <div className="mt-4 mx-auto max-w-sm text-left p-3" style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

              <Eyebrow color="cocoa">What happens next</Eyebrow>

              <ul className="mt-2 space-y-1.5" style={{ fontSize: 12, color: C.cocoa }}>

                <li className="flex gap-2"><span style={{ color: C.teal }}>1.</span><span>Customer reviews and approves quote</span></li>

                <li className="flex gap-2"><span style={{ color: C.teal }}>2.</span><span>They submit a PO; reserved inventory auto-converts to a sales order</span></li>

                <li className="flex gap-2"><span style={{ color: C.teal }}>3.</span><span>Logistics begins staging on the agreed ship date</span></li>

              </ul>

            </div>

          )}

          {/* Next steps for buyer requestCall */}

          {flow === 'requestCall' && (

            <>

              {assignedPm && (

                <div className="mt-4 mx-auto max-w-sm text-left">

                  <PmCard pm={assignedPm} variant="modal" />

                </div>

              )}

              <div className="mt-3 mx-auto max-w-sm text-left p-3" style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

                <Eyebrow color="cocoa">What happens next</Eyebrow>

                <ul className="mt-2 space-y-1.5" style={{ fontSize: 12, color: C.cocoa }}>

                  <li className="flex gap-2"><span style={{ color: C.teal }}>1.</span><span>{assignedPm ? assignedPm.firstName : 'Your Product Manager'} reviews your selection and pulls volume pricing</span></li>

                  <li className="flex gap-2"><span style={{ color: C.teal }}>2.</span><span>They call you to confirm specs, condition, and freight</span></li>

                  <li className="flex gap-2"><span style={{ color: C.teal }}>3.</span><span>You either submit the order or revise the selection together</span></li>

                </ul>

              </div>

            </>

          )}

          {/* Next steps for buyerOrder */}

          {flow === 'buyerOrder' && (

            <div className="mt-4 mx-auto max-w-sm text-left p-3" style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 8 }}>

              <Eyebrow color="cocoa">What happens next</Eyebrow>

              <ul className="mt-2 space-y-1.5" style={{ fontSize: 12, color: C.cocoa }}>

                <li className="flex gap-2"><span style={{ color: C.orange }}>1.</span><span>Product Manager confirms final pricing and freight within 4-6 business hours</span></li>

                <li className="flex gap-2"><span style={{ color: C.orange }}>2.</span><span>Logistics begins staging selected units</span></li>

                <li className="flex gap-2"><span style={{ color: C.orange }}>3.</span><span>Tracking sent when units ship</span></li>

              </ul>

            </div>

          )}

          <div className="mt-6 flex gap-2 justify-center">

            {flow === 'pmQuote' && deliveryMethod === 'pdf' && (

              <Btn variant="teal" size="lg" icon={Download}

                onClick={() => generateQuotePdf({

                  docType: 'quote',

                  cartUnits, totals, mode, pmAction, buyerAction,

                  customerName: activeCustomer?.company || 'Customer',

                  poNumber, shipDate, freightMethod, notes, expiresInDays,

                })}>

                Download PDF

              </Btn>

            )}

            <Btn variant="primary" size="lg" onClick={onSubmit}>Done</Btn>

          </div>

        </div>

      </div>

    </div>

  );

}

function Field({ label, required, optional, children }) {

  return (

    <div>

      <div className="flex items-baseline gap-2 mb-1.5">

        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone }}>{label}</span>

        {required && <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>*REQUIRED</span>}

        {optional && <span style={{ fontSize: 10, color: C.stone }}>optional</span>}

      </div>

      {children}

    </div>

  );

}

function SummaryRow({ label, value, muted }) {

  return (

    <div className="flex items-baseline justify-between">

      <span style={{ color: C.stone }}>{label}</span>

      <span style={{ color: muted ? C.stone : C.espresso, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace' }}>{value}</span>

    </div>

  );

}

// ============================================================================

// PDF GENERATOR - opens a print-optimized HTML window and triggers native print-to-PDF

// Mirrors the layout of relink_quote_pdf.py for visual consistency

// ============================================================================

function generateQuotePdf({ docType, cartUnits, totals, mode, pmAction, buyerAction, customerName, poNumber, shipDate, freightMethod, notes, expiresInDays = 14, detail = 'detailed' }) {

  // Determine output flavor: 'quote' or 'order'

  const isOrder = docType === 'order' ||

    (mode === 'internal' && pmAction === 'order') ||

    (mode === 'external' && buyerAction === 'order' && poNumber);

  const flavor = isOrder ? 'order' : 'quote';

  const docId = (isOrder ? 'SO-' : 'Q-') + new Date().getFullYear() + '-' + (2347 + cartUnits.length).toString().padStart(4, '0');

  const today = new Date();

  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const issued = formatDate(today);

  const expires = formatDate(new Date(today.getTime() + expiresInDays * 86400000));

  const ship = shipDate || formatDate(new Date(today.getTime() + 12 * 86400000));

  // Group cart units by material

  const byMaterial = {};

  cartUnits.forEach(u => {

    if (!byMaterial[u.materialKey]) {

      byMaterial[u.materialKey] = { oem: u.oem, material: u.material, common_name: u.commonName, units: [] };

    }

    byMaterial[u.materialKey].units.push(u);

  });

  const lineItems = Object.values(byMaterial);

  // Tier discount

  const tierPct = 12;

  const tierLabel = 'Tier 2';

  const subtotal = totals.subtotal;

  const discount = Math.round(subtotal * (tierPct / 100));

  const grandTotal = subtotal - discount;

  // Brand colors mirror C palette

  const accent = isOrder ? '#90AD51' : '#0598A6';

  const accentDeep = isOrder ? '#6E8A36' : '#036E78';

  const accentTint = isOrder ? '#EDF2DE' : '#DDF0F2';

  const espresso = '#2E2622';

  const cocoa = '#4A3E3A';

  const stone = '#6B615C';

  const cream = '#FAF7F1';

  const sand = '#EFE9DA';

  const taupe = '#E4DED0';

  const orangeDeep = '#D46A1E';

  // Condition tone helpers (mirror React app)

  const fnTone = (f) => ({

    'New': { bg: '#DDF0F2', fg: '#036E78' },

    'Refurbished': { bg: '#DDF0F2', fg: '#036E78' },

    'Tested Working': { bg: '#EDF2DE', fg: '#6E8A36' },

    'Untested': { bg: '#EFE9DA', fg: '#6B615C' },

    'Non-Functional': { bg: '#FAF1DA', fg: '#7A5510' },

  }[f] || { bg: '#EFE9DA', fg: '#6B615C' });

  const csTone = (c) => ({

    'New in Box': { bg: '#DDF0F2', fg: '#036E78' },

    'Excellent': { bg: '#EDF2DE', fg: '#6E8A36' },

    'Good': { bg: '#EFE9DA', fg: '#6B615C' },

    'Poor': { bg: '#FAF1DA', fg: '#7A5510' },

  }[c] || { bg: '#EFE9DA', fg: '#6B615C' });

  const fnShort = (f) => ({ 'Tested Working': 'Tested', 'Non-Functional': 'Non-Func' }[f] || f);

  const csShort = (c) => ({ 'New in Box': 'NIB' }[c] || c);

  const trunc = (s, n) => s.length <= n ? s : s.slice(0, n - 1) + '...';

  // Build HTML

  const isSummary = detail === 'summary';

  const lineItemRows = lineItems.map(li => {

    const matSubtotal = li.units.reduce((a, u) => a + u.unitPrice, 0);

    const minPrice = Math.min(...li.units.map(u => u.unitPrice));

    const maxPrice = Math.max(...li.units.map(u => u.unitPrice));

    const avgPrice = Math.round(matSubtotal / li.units.length);

    if (isSummary) {

      // SUMMARY MODE - one aggregated row per material, no unit-level detail

      // Show functional/cosmetic mix as small pills with counts

      const fnCounts = li.units.reduce((acc, u) => { acc[u.functional] = (acc[u.functional] || 0) + 1; return acc; }, {});

      const csCounts = li.units.reduce((acc, u) => { acc[u.cosmetic] = (acc[u.cosmetic] || 0) + 1; return acc; }, {});

      const hubs = [...new Set(li.units.map(u => HUBS.find(h => h.id === u.hub)?.code).filter(Boolean))];

      const fnPills = Object.entries(fnCounts).map(([k, n]) => {

        const t = fnTone(k);

        return `<span class="pill" style="background:${t.bg};color:${t.fg}">${fnShort(k)} <span style="opacity:0.7">x${n}</span></span>`;

      }).join(' ');

      const csPills = Object.entries(csCounts).map(([k, n]) => {

        const t = csTone(k);

        return `<span class="pill" style="background:${t.bg};color:${t.fg}">${csShort(k)} <span style="opacity:0.7">x${n}</span></span>`;

      }).join(' ');

      return `

        <tr class="summary-row">

          <td>

            <div class="sum-oem">${li.oem}</div>

            <div class="sum-material mono">${li.material}</div>

            <div class="sum-common">${li.common_name}</div>

          </td>

          <td class="mix-cell">

            <div class="mix-row">${fnPills}</div>

            <div class="mix-row" style="margin-top:3pt">${csPills}</div>

            <div class="hub-list">Hubs: ${hubs.join('  -  ')}</div>

          </td>

          <td class="mono right qty-cell"><strong>${li.units.length}</strong></td>

          <td class="mono right price-cell">

            ${minPrice === maxPrice

              ? `$${minPrice.toLocaleString()}`

              : `<div>$${minPrice.toLocaleString()}-$${maxPrice.toLocaleString()}</div><div style="font-size:6.5pt;color:${stone};margin-top:1pt">avg $${avgPrice.toLocaleString()}</div>`}

          </td>

          <td class="mono right line-cell"><strong>$${matSubtotal.toLocaleString()}</strong></td>

        </tr>`;

    }

    // DETAILED MODE - current behavior: material header + per-unit zebra rows

    const headerRow = `

      <tr class="material-header">

        <td></td>

        <td><strong>${li.oem}</strong></td>

        <td class="mono"><strong>${li.material}</strong></td>

        <td class="common-name" colspan="3">${li.common_name}</td>

        <td></td>

        <td class="mono right"><strong>${li.units.length}</strong></td>

        <td></td>

        <td class="mono right"><strong>$${matSubtotal.toLocaleString()}</strong></td>

      </tr>`;

    const unitRows = li.units.map((u, i) => {

      const fnt = fnTone(u.functional);

      const cst = csTone(u.cosmetic);

      return `

        <tr class="${i % 2 ? 'zebra' : ''}">

          <td class="mono dim">${u.invSku}</td>

          <td></td>

          <td></td>

          <td><span class="pill" style="background:${fnt.bg};color:${fnt.fg}">${fnShort(u.functional)}</span></td>

          <td><span class="pill" style="background:${cst.bg};color:${cst.fg}">${csShort(u.cosmetic)}</span></td>

          <td class="mono"><strong>${HUBS.find(h => h.id === u.hub)?.code || ''}</strong></td>

          <td class="mono dim">${u.serial}</td>

          <td class="mono right dim">1</td>

          <td class="mono right">$${u.unitPrice.toLocaleString()}</td>

          <td class="mono right"><strong>$${u.unitPrice.toLocaleString()}</strong></td>

        </tr>`;

    }).join('');

    return headerRow + unitRows;

  }).join('');

  const html = `<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8">

<title>reLink Medical ${isOrder ? 'Sales Order' : (isSummary ? 'Summary Quote' : 'Detailed Quote')} ${docId}</title>

<style>

  @page { size: letter; margin: 0.5in; }

  * { box-sizing: border-box; }

  body {

    font-family: 'Source Sans 3', -apple-system, system-ui, sans-serif;

    color: ${cocoa};

    background: white;

    margin: 0; padding: 0;

    font-size: 9.5pt;

    line-height: 1.4;

  }

  .page {

    width: 7.5in;

    margin: 0 auto;

    padding: 0;

    background: white;

    position: relative;

  }

  .accent-stripe {

    height: 4pt;

    background: ${accent};

    width: calc(100% + 1in);

    margin-left: -0.5in;

    margin-top: -0.5in;

    margin-bottom: 16pt;

  }

  /* Header */

  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14pt; border-bottom: 0.5pt solid ${taupe}; }

  .wordmark { font-size: 18pt; letter-spacing: -0.025em; color: ${espresso}; }

  .wordmark .re { font-weight: 300; }

  .wordmark .lk { font-weight: 700; }

  .wordmark .ws { font-weight: 300; color: ${cocoa}; margin-left: 4pt; }

  .wordmark .tm { font-size: 7pt; color: ${stone}; vertical-align: super; margin-left: 1pt; }

  .tagline { font-size: 7.5pt; color: ${stone}; margin-top: 2pt; }

  .doc-id { text-align: right; }

  .eyebrow {

    font-size: 7pt; font-weight: 700; letter-spacing: 0.11em;

    text-transform: uppercase; color: ${accentDeep};

    margin-bottom: 4pt;

  }

  .doc-id .id { font-size: 22pt; font-weight: 700; color: ${espresso}; line-height: 1; }

  .doc-id .issued { font-size: 8pt; color: ${stone}; margin-top: 4pt; }

  .doc-id .stamp { font-size: 8pt; font-weight: 700; margin-top: 2pt; color: ${isOrder ? accentDeep : orangeDeep}; }

  /* Parties */

  .parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18pt; padding: 16pt 0; border-bottom: 0.5pt solid ${taupe}; }

  .parties .label { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: ${stone}; margin-bottom: 6pt; }

  .parties .name { font-size: 10pt; font-weight: 700; color: ${espresso}; margin-bottom: 4pt; }

  .parties .line { font-size: 8.5pt; color: ${cocoa}; margin-bottom: 2pt; }

  .parties .meta { font-size: 8pt; color: ${stone}; }

  /* Line items header row */

  .items-header { display: flex; justify-content: space-between; align-items: baseline; padding: 14pt 0 6pt; }

  .items-header .label { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: ${cocoa}; }

  .items-header .summary { font-size: 8pt; color: ${stone}; }

  /* Items table */

  table.items { width: 100%; border-collapse: collapse; }

  table.items thead th {

    background: ${espresso}; color: white;

    font-size: 6.5pt; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;

    padding: 6pt 6pt; text-align: left;

  }

  table.items thead th.right { text-align: right; }

  table.items tbody tr td {

    padding: 5pt 6pt; font-size: 8pt; color: ${cocoa};

    border-bottom: 0.25pt solid ${taupe};

  }

  table.items tbody tr.zebra td { background: ${cream}; }

  table.items tbody tr.material-header td {

    background: ${sand}; padding-top: 6pt; padding-bottom: 6pt;

    border-top: 0.5pt solid ${taupe}; border-bottom: 0.25pt solid ${taupe};

  }

  table.items tbody tr.material-header td strong { color: ${espresso}; font-size: 9pt; }

  table.items tbody tr.material-header .common-name { color: ${cocoa}; font-style: italic; }

  table.items .mono { font-family: 'SF Mono', Menlo, monospace; }

  table.items .right { text-align: right; }

  table.items .dim { color: ${stone}; font-size: 7.5pt; }

  table.items strong { font-weight: 700; color: ${espresso}; }

  /* Summary mode - one row per material with condition mix pills */

  table.items-summary tbody tr.summary-row td {

    background: ${cream};

    padding: 10pt 8pt;

    border-bottom: 0.5pt solid ${taupe};

    vertical-align: top;

  }

  table.items-summary tbody tr.summary-row:hover td { background: ${sand}; }

  .sum-oem { font-size: 9pt; font-weight: 700; color: ${espresso}; line-height: 1.2; }

  .sum-material { font-size: 9pt; font-weight: 700; color: ${cocoa}; line-height: 1.2; margin-top: 1pt; }

  .sum-common { font-size: 7.5pt; color: ${stone}; font-style: italic; margin-top: 2pt; line-height: 1.2; }

  .mix-cell .mix-row { line-height: 1.6; }

  .mix-cell .hub-list { font-size: 7pt; color: ${stone}; margin-top: 4pt; font-family: 'SF Mono', Menlo, monospace; letter-spacing: 0.04em; }

  .qty-cell { font-size: 11pt; vertical-align: middle !important; }

  .qty-cell strong { font-size: 11pt; }

  .price-cell { font-size: 8.5pt; vertical-align: middle !important; }

  .line-cell { font-size: 10pt; vertical-align: middle !important; }

  .line-cell strong { font-size: 10pt; }

  .pill {

    display: inline-block;

    padding: 2pt 6pt;

    border-radius: 999pt;

    font-size: 6.5pt; font-weight: 700; letter-spacing: 0.06em;

    text-transform: uppercase; line-height: 1.2;

    white-space: nowrap;

  }

  /* Totals */

  .totals-row { display: flex; justify-content: space-between; padding: 16pt 0 8pt; }

  .totals-left { flex: 1; padding-right: 24pt; }

  .totals-left .label { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: ${cocoa}; margin-bottom: 6pt; }

  .totals-left .notes-body { font-size: 8.5pt; color: ${cocoa}; line-height: 1.5; max-width: 380pt; }

  .totals-right { width: 220pt; }

  .totals-right .row { display: flex; justify-content: space-between; padding: 3pt 0; font-size: 9pt; }

  .totals-right .row.discount { color: ${accentDeep === '#6E8A36' ? '#6E8A36' : accentDeep}; }

  .totals-right .row.discount span:last-child { font-family: 'SF Mono', Menlo, monospace; }

  .totals-right .row span:first-child { color: ${stone}; }

  .totals-right .row span:last-child { font-family: 'SF Mono', Menlo, monospace; color: ${cocoa}; }

  .totals-right hr { border: none; border-top: 0.5pt solid ${taupe}; margin: 6pt 0; }

  .totals-right .grand { display: flex; justify-content: space-between; align-items: baseline; padding: 6pt 0; }

  .totals-right .grand .glabel { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: ${cocoa}; }

  .totals-right .grand .gvalue { font-size: 17pt; font-weight: 700; color: ${espresso}; font-family: 'SF Mono', Menlo, monospace; }

  .totals-right .indicative { font-size: 7.5pt; color: ${stone}; text-align: right; margin-top: 4pt; }

  /* CTA */

  .cta {

    margin-top: 14pt;

    padding: 12pt 14pt;

    background: ${accentTint};

    border: 0.5pt solid ${accent};

    border-radius: 4pt;

  }

  .cta .ctitle { font-size: 10pt; font-weight: 700; color: ${espresso}; margin-bottom: 4pt; }

  .cta .cbody { font-size: 9pt; color: ${cocoa}; }

  /* Footer */

  .footer { margin-top: 22pt; padding-top: 12pt; border-top: 0.5pt solid ${taupe}; text-align: center; }

  .footer .creds { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.20em; color: ${cocoa}; margin-bottom: 6pt; }

  .footer .tm { font-size: 6pt; color: ${stone}; line-height: 1.5; margin-bottom: 4pt; }

  .footer .copy { font-size: 6pt; color: ${stone}; display: flex; justify-content: space-between; }

  /* Print actions - only visible on screen, hidden when printing */

  .print-controls {

    position: fixed; top: 12pt; right: 12pt;

    background: white; padding: 8pt 10pt;

    box-shadow: 0 2pt 8pt rgba(0,0,0,0.15);

    border-radius: 6pt;

    display: flex; gap: 8pt;

  }

  .print-controls button {

    font-family: inherit;

    font-size: 11pt; font-weight: 600;

    padding: 6pt 14pt;

    border: 1pt solid ${cocoa};

    border-radius: 999pt;

    background: white; color: ${cocoa};

    cursor: pointer;

  }

  .print-controls button.primary {

    background: #F38637; border-color: #F38637; color: white;

  }

  @media print {

    .print-controls { display: none !important; }

    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }

  }

</style>

</head>

<body>

<div class="print-controls">

  <button onclick="window.close()">Close</button>

  <button class="primary" onclick="window.print()">Save as PDF / Print</button>

</div>

<div class="page">

  <div class="accent-stripe"></div>

  <div class="header">

    <div>

      <div class="wordmark">

        <span class="re">re</span><span class="lk">Link</span><span class="ws">Wholesale</span><span class="tm">(TM)</span>

      </div>

      <div class="tagline">The medical equipment partner hospitals run on.</div>

    </div>

    <div class="doc-id">

      <div class="eyebrow">${isOrder ? 'Sales Order' : 'Quote'}</div>

      <div class="id">${docId}</div>

      <div class="issued">Issued ${issued}</div>

      <div class="stamp">${isOrder ? 'Ship date: ' + ship : 'Valid through ' + expires}</div>

    </div>

  </div>

  <div class="parties">

    <div>

      <div class="label">Prepared by</div>

      <div class="name">reLink Medical(R)</div>

      <div class="line">${mode === 'internal' ? 'Jeff Dalton' : 'Account Product Manager Team'}</div>

      <div class="meta">j.dalton@relinkmedical.com</div>

      <div class="meta">216.762.0588</div>

    </div>

    <div>

      <div class="label">Prepared for</div>

      <div class="name">${customerName || 'Surgical Specialists of NA'}</div>

      <div class="line">1234 Medical Pkwy, Suite 400</div>

      <div class="line">Cleveland, OH 44195</div>

      <div class="meta">${mode === 'internal' ? 'Maria Reyes  -  Procurement' : 'Account contact'}</div>

    </div>

    <div>

      <div class="label">${isOrder ? 'Order reference' : 'Quote reference'}</div>

      ${isOrder ? `

        <div class="name mono">PO ${poNumber || '-'}</div>

        <div class="line">${tierLabel} buyer  -  ${tierPct}% tier</div>

        <div class="line">Freight: ${trunc(freightMethod || 'Consolidate to staging hub', 32)}</div>

        <div class="meta">Net-30  -  Inventory locked</div>

      ` : `

        <div class="name">${tierLabel} buyer</div>

        <div class="line">${tierPct}% volume tier applied</div>

        <div class="line">Net-30 payment terms</div>

        <div class="meta">Awaiting customer acceptance</div>

      `}

    </div>

  </div>

  <div class="items-header">

    <div class="label">Line items</div>

    <div class="summary">${totals.materialCount} materials  -  ${totals.unitCount} units  -  ${totals.hubCount} hubs</div>

  </div>

  <table class="items ${isSummary ? 'items-summary' : ''}">

    <thead>

      <tr>

        ${isSummary ? `

          <th>Material</th>

          <th>Condition mix</th>

          <th class="right">Qty</th>

          <th class="right">Unit price</th>

          <th class="right">Line total</th>

        ` : `

          <th>Inv SKU</th>

          <th>OEM</th>

          <th>Material</th>

          <th>Fn</th>

          <th>Cos</th>

          <th>Hub</th>

          <th>Serial</th>

          <th class="right">Qty</th>

          <th class="right">Unit</th>

          <th class="right">Line</th>

        `}

      </tr>

    </thead>

    <tbody>

      ${lineItemRows}

    </tbody>

  </table>

  <div class="totals-row">

    <div class="totals-left">

      ${notes ? `

        <div class="label">Notes</div>

        <div class="notes-body">${notes}</div>

      ` : ''}

    </div>

    <div class="totals-right">

      <div class="row"><span>Subtotal</span><span>$${subtotal.toLocaleString()}</span></div>

      <div class="row discount"><span>${tierLabel} discount (${tierPct}%)</span><span>-$${discount.toLocaleString()}</span></div>

      <div class="row"><span>Freight</span><span style="color:${stone}">${isOrder ? 'Calculated at staging' : 'TBD'}</span></div>

      <hr>

      <div class="grand">

        <span class="glabel">${isOrder ? 'Order total' : 'Quote total'}</span>

        <span class="gvalue">$${grandTotal.toLocaleString()}</span>

      </div>

      ${!isOrder ? `<div class="indicative">Indicative - final pricing on PO acceptance</div>` : ''}

    </div>

  </div>

  <div class="cta">

    <div class="ctitle">${isOrder ? 'Order confirmed and locked.' : 'To accept this quote:'}</div>

    <div class="cbody">${isOrder

      ? 'Logistics will stage units and confirm tracking by ship date. Questions: j.dalton@relinkmedical.com  -  216.762.0588'

      : `Submit your PO to j.dalton@relinkmedical.com or accept directly at relinkmedical.com/wholesale/${docId.toLowerCase()}`

    }</div>

  </div>

  <div class="footer">

    <div class="creds">${'I S O   9 0 0 1 : 2 0 1 5      -      V E T E R A N - O W N E D      -      P R E M I E R   I N C .   # C O N D - 0 2 1 0      -      I N C .   5 0 0 0   ( 2 X )'}</div>

    <div class="tm">reLink Medical(R), reLink360(R), and reLink Ready(R) are registered trademarks of reLink Medical LLC. reLink Online(TM) and reLink Wholesale(TM) are trademarks of reLink Medical LLC.</div>

    <div class="copy">

      <span>(C)${new Date().getFullYear()} reLink Medical LLC  -  relinkmedical.com  -  216.762.0588</span>

      <span>Page 1 of 1  -  Generated ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>

    </div>

  </div>

</div>

</body>

</html>`;

  // Render in an in-page iframe modal - works regardless of popup blockers and sandbox restrictions

  // Remove any existing preview modal first

  const existing = document.getElementById('relink-pdf-preview-modal');

  if (existing) existing.remove();

  const overlay = document.createElement('div');

  overlay.id = 'relink-pdf-preview-modal';

  overlay.style.cssText = `

    position: fixed; inset: 0; z-index: 9999;

    background: rgba(46,38,34,0.65);

    display: flex; align-items: stretch; justify-content: center;

    padding: 20px;

  `;

  overlay.addEventListener('click', (e) => {

    if (e.target === overlay) overlay.remove();

  });

  const container = document.createElement('div');

  container.style.cssText = `

    background: white; border-radius: 12px; overflow: hidden;

    width: 100%; max-width: 920px;

    display: flex; flex-direction: column;

    box-shadow: 0 20px 60px rgba(0,0,0,0.4);

    max-height: calc(100vh - 40px);

  `;

  // Toolbar

  const toolbar = document.createElement('div');

  toolbar.style.cssText = `

    background: #2E2622; color: white;

    padding: 10px 16px;

    display: flex; align-items: center; justify-content: space-between;

    flex-shrink: 0;

  `;

  toolbar.innerHTML = `

    <div style="font-size: 13px; font-weight: 600; letter-spacing: -0.01em;">

      ${isOrder ? 'Sales Order' : (isSummary ? 'Summary Quote' : 'Detailed Quote')} preview  -  ${docId}

    </div>

    <div style="display: flex; gap: 8px;">

      <button id="relink-pdf-print" style="

        background: #F38637; border: none; color: white;

        padding: 6px 14px; border-radius: 999px;

        font-size: 12px; font-weight: 600; cursor: pointer;

        font-family: inherit; letter-spacing: 0.01em;

      ">Save as PDF / Print</button>

      <button id="relink-pdf-close" style="

        background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white;

        padding: 6px 14px; border-radius: 999px;

        font-size: 12px; font-weight: 600; cursor: pointer;

        font-family: inherit; letter-spacing: 0.01em;

      ">Close</button>

    </div>

  `;

  // iframe to render the PDF HTML - sandbox-safe, no script needed

  const iframe = document.createElement('iframe');

  iframe.style.cssText = `

    width: 100%; flex: 1; border: none;

    background: white;

    min-height: 600px;

  `;

  iframe.setAttribute('title', `${isOrder ? 'Sales Order' : (isSummary ? 'Summary Quote' : 'Detailed Quote')} preview ${docId}`);

  container.appendChild(toolbar);

  container.appendChild(iframe);

  overlay.appendChild(container);

  document.body.appendChild(overlay);

  // Write content into iframe via srcdoc (sandbox-safe; works without same-origin policy issues)

  iframe.srcdoc = html.replace(/<div class="print-controls">[\s\S]*?<\/div>\s*(?=<div class="page">)/, '');

  // Wire toolbar buttons

  document.getElementById('relink-pdf-close').addEventListener('click', () => overlay.remove());

  document.getElementById('relink-pdf-print').addEventListener('click', () => {

    try {

      iframe.contentWindow.focus();

      iframe.contentWindow.print();

    } catch (err) {

      // Fallback: open in new tab if iframe.print isn't available

      const w = window.open('', '_blank');

      if (w) {

        w.document.write(html);

        w.document.close();

        w.focus();

        setTimeout(() => w.print(), 250);

      }

    }

  });

}

// ============================================================================

// MOCK USER DATABASE - replaces server-side persistence for the prototype

// ============================================================================

const SEED_USERS = [

  { id: 'u-001', email: 'jeff@relinkmedical.com', phone: '216.762.0588', password: 'demo', firstName: 'Jeff', lastName: 'Dalton', role: 'admin', company: 'reLink Medical', tier: null, status: 'active', createdAt: '2024-03-12' },

  { id: 'u-002', email: 'sarah@relinkmedical.com', phone: '216.555.0142', password: 'demo', firstName: 'Sarah', lastName: 'Chen', role: 'pm', company: 'reLink Medical', tier: null, status: 'active', createdAt: '2024-04-08' },

  { id: 'u-008', email: 'devon@relinkmedical.com', phone: '216.555.0187', password: 'demo', firstName: 'Devon', lastName: 'Walker', role: 'pm', company: 'reLink Medical', tier: null, status: 'active', createdAt: '2024-06-14' },

  { id: 'u-009', email: 'amy@relinkmedical.com', phone: '216.555.0203', password: 'demo', firstName: 'Amy', lastName: 'Nguyen', role: 'pm', company: 'reLink Medical', tier: null, status: 'active', createdAt: '2024-07-22' },

  { id: 'u-003', email: 'maria@surgspec.com', password: 'demo', firstName: 'Maria', lastName: 'Reyes', role: 'reseller', company: 'Surgical Specialists of NA', tier: 'tier2', status: 'active', createdAt: '2024-05-21', assignedPmId: 'u-002' },

  { id: 'u-004', email: 'kevin@medparts.io', password: 'demo', firstName: 'Kevin', lastName: 'O\'Brien', role: 'reseller', company: 'MedParts Solutions', tier: 'tier1', status: 'active', createdAt: '2024-08-03', assignedPmId: 'u-008' },

  { id: 'u-005', email: 'lisa@biomedex.com', password: 'demo', firstName: 'Lisa', lastName: 'Park', role: 'reseller', company: 'BioMedex Distributors', tier: 'tier3', status: 'active', createdAt: '2024-09-15', assignedPmId: 'u-002' },

  { id: 'u-006', email: 'tom@dealercoop.com', password: 'demo', firstName: 'Tom', lastName: 'Reilly', role: 'reseller', company: 'Dealer Cooperative LLC', tier: 'tier2', status: 'pending', createdAt: '2026-04-22', assignedPmId: null },

  { id: 'u-007', email: 'priya@medtechresale.com', password: 'demo', firstName: 'Priya', lastName: 'Shah', role: 'reseller', company: 'MedTech Resale Group', tier: 'tier1', status: 'inactive', createdAt: '2024-11-10', assignedPmId: 'u-009' },

];

const SEED_TIERS = [

  { id: 'tier1', name: 'Tier 1', discountPct: 5, minOrderUsd: 0, paymentTerms: 'Net-15', label: 'Standard reseller', color: 'stone', description: 'Default tier for new resellers. No volume commitment required.' },

  { id: 'tier2', name: 'Tier 2', discountPct: 12, minOrderUsd: 25000, paymentTerms: 'Net-30', label: 'Volume reseller', color: 'teal', description: 'Active resellers with $25K+ quarterly run-rate. Net-30 terms.' },

  { id: 'tier3', name: 'Tier 3', discountPct: 18, minOrderUsd: 100000, paymentTerms: 'Net-30', label: 'Strategic partner', color: 'olive', description: 'Top-tier strategic accounts with $100K+ quarterly run-rate. Priority allocation, dedicated PM.' },

];

// ============================================================================

// CUSTOMER HISTORY - Past purchases per customer, used to power Reorder view.

// In production this comes from a "customer_history" CSV updated nightly.

// Each record represents one historical order for a specific material+condition combo.

// Materials referenced here mirror MATERIALS_DEF so reorder matching works.

// ============================================================================

const CUSTOMER_HISTORY = [

  // Surgical Specialists of NA (u-003) - Tier 2, frequent infusion + monitor buyer

  { id: 'h-001', customerId: 'u-003', oem: 'Baxter',         material: 'Sigma Spectrum',     functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 100, avgUnitPrice: 1145, lastOrderDate: '2026-02-14', orderCount: 4 },

  { id: 'h-002', customerId: 'u-003', oem: 'CareFusion',     material: 'Alaris PC Unit 8015',functional: 'Tested Working', cosmetic: 'Good',       quantity: 35,  avgUnitPrice: 820,  lastOrderDate: '2026-01-08', orderCount: 2 },

  { id: 'h-003', customerId: 'u-003', oem: 'GE Healthcare',  material: 'Carescape B450',     functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 12,  avgUnitPrice: 2280, lastOrderDate: '2025-11-22', orderCount: 3 },

  { id: 'h-004', customerId: 'u-003', oem: 'Welch Allyn',    material: 'Connex 6000',        functional: 'Tested Working', cosmetic: 'Good',       quantity: 24,  avgUnitPrice: 935,  lastOrderDate: '2025-10-05', orderCount: 5 },

  { id: 'h-005', customerId: 'u-003', oem: 'Zoll',           material: 'M Series',           functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 8,   avgUnitPrice: 1740, lastOrderDate: '2025-08-18', orderCount: 2 },

  { id: 'h-006', customerId: 'u-003', oem: 'Stryker',        material: 'InTouch IM2131',     functional: 'Tested Working', cosmetic: 'Good',       quantity: 6,   avgUnitPrice: 7820, lastOrderDate: '2025-07-02', orderCount: 1 },

  // OOS items - material exists in catalog but currently 0 in stock - demos restock alert flow

  { id: 'h-007', customerId: 'u-003', oem: 'Mindray',        material: 'BeneView T8',        functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 14,  avgUnitPrice: 3050, lastOrderDate: '2025-12-08', orderCount: 2 },

  { id: 'h-008', customerId: 'u-003', oem: 'Stryker',        material: 'Stretcher 1105',     functional: 'Tested Working', cosmetic: 'Good',       quantity: 4,   avgUnitPrice: 4520, lastOrderDate: '2025-11-15', orderCount: 1 },

  // MedParts Solutions (u-004) - Tier 1, mid-volume mixed buyer

  { id: 'h-010', customerId: 'u-004', oem: 'Baxter',         material: 'Sigma Spectrum',     functional: 'Tested Working', cosmetic: 'Good',       quantity: 50,  avgUnitPrice: 1080, lastOrderDate: '2026-03-01', orderCount: 3 },

  { id: 'h-011', customerId: 'u-004', oem: 'Philips',        material: 'IntelliVue MX450',   functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 8,   avgUnitPrice: 2710, lastOrderDate: '2026-01-15', orderCount: 2 },

  { id: 'h-012', customerId: 'u-004', oem: 'Olympus',        material: 'OEV261H',            functional: 'Tested Working', cosmetic: 'Good',       quantity: 4,   avgUnitPrice: 4050, lastOrderDate: '2025-12-10', orderCount: 1 },

  { id: 'h-013', customerId: 'u-004', oem: 'Welch Allyn',    material: 'Connex 6000',        functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 16,  avgUnitPrice: 940,  lastOrderDate: '2025-09-20', orderCount: 2 },

  // BioMedex Distributors (u-005) - Tier 3, strategic high-volume

  { id: 'h-020', customerId: 'u-005', oem: 'CareFusion',     material: 'Alaris PC Unit 8015',functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 120, avgUnitPrice: 815,  lastOrderDate: '2026-03-22', orderCount: 6 },

  { id: 'h-021', customerId: 'u-005', oem: 'Baxter',         material: 'Sigma Spectrum',     functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 80,  avgUnitPrice: 1135, lastOrderDate: '2026-02-28', orderCount: 4 },

  { id: 'h-022', customerId: 'u-005', oem: 'Puritan Bennett',material: '840 Ventilator',     functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 5,   avgUnitPrice: 5980, lastOrderDate: '2026-01-12', orderCount: 2 },

  { id: 'h-023', customerId: 'u-005', oem: 'GE OEC',         material: '9900 Elite',         functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 3,   avgUnitPrice: 36500,lastOrderDate: '2025-11-30', orderCount: 1 },

  { id: 'h-024', customerId: 'u-005', oem: 'Hill-Rom',       material: 'Progressa P7500',    functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 8,   avgUnitPrice: 12800,lastOrderDate: '2025-10-14', orderCount: 1 },

  { id: 'h-025', customerId: 'u-005', oem: 'Draeger Medical',material: 'Fabius GS Premium',  functional: 'Refurbished',    cosmetic: 'Excellent',  quantity: 4,   avgUnitPrice: 1490, lastOrderDate: '2025-09-08', orderCount: 1 },

  // Dealer Cooperative LLC (u-006) - pending account, no history yet

  // (intentionally empty - used to demo the empty state)

  // MedTech Resale Group (u-007) - inactive, has some old history

  { id: 'h-030', customerId: 'u-007', oem: 'Baxter',         material: 'Sigma Spectrum',     functional: 'Untested',       cosmetic: 'Good',       quantity: 25,  avgUnitPrice: 720,  lastOrderDate: '2024-08-15', orderCount: 1 },

  { id: 'h-031', customerId: 'u-007', oem: 'Welch Allyn',    material: 'Connex 6000',        functional: 'Tested Working', cosmetic: 'Good',       quantity: 10,  avgUnitPrice: 920,  lastOrderDate: '2024-06-22', orderCount: 1 },

];

// ============================================================================

// HISTORY -> INVENTORY MATCHING - simple match: same OEM + same material.

// Buyer who bought Sigma pumps before sees any Sigma pumps currently in stock.

// Condition (functional/cosmetic) is informational only, not a match constraint.

// ============================================================================

function matchHistoryToInventory(historyRecord, materials) {

  const material = materials.find(m =>

    m.oem === historyRecord.oem && m.material === historyRecord.material

  );

  // Material no longer in catalog

  if (!material) {

    return {

      matchTier: 'none',

      material: null,

      units: [],

      availableQty: 0,

      suggestedQty: 0,

      historicalQty: historyRecord.quantity,

    };

  }

  const allUnits = material.units;

  // Material exists in catalog but currently 0 in stock

  if (allUnits.length === 0) {

    return {

      matchTier: 'outOfStock',

      material,

      units: [],

      availableQty: 0,

      suggestedQty: 0,

      historicalQty: historyRecord.quantity,

    };

  }

  // In stock - suggest min(historical qty, available stock); units sorted best-condition first

  const sortedUnits = [...allUnits].sort((a, b) => {

    const fa = FUNCTIONAL.indexOf(a.functional);

    const fb = FUNCTIONAL.indexOf(b.functional);

    if (fa !== fb) return fa - fb;

    return COSMETIC.indexOf(a.cosmetic) - COSMETIC.indexOf(b.cosmetic);

  });

  const suggested = Math.min(historyRecord.quantity, sortedUnits.length);

  return {

    matchTier: 'inStock',

    material,

    units: sortedUnits,

    availableQty: sortedUnits.length,

    suggestedQty: suggested,

    historicalQty: historyRecord.quantity,

  };

}

// ============================================================================

// CUSTOMER PICKER - PM-only dropdown to switch which customer they're acting for

// ============================================================================

function CustomerPicker({ roster, activeCustomer, activeTier, onSelect }) {

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState('');

  if (!activeCustomer) {

    return (

      <span style={{ fontSize: 11.5, color: C.stone }}>

        No customers available

      </span>

    );

  }

  const filtered = roster.filter(c => {

    if (!search.trim()) return true;

    const q = search.toLowerCase();

    return c.company.toLowerCase().includes(q) ||

           `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||

           c.email.toLowerCase().includes(q);

  });

  const tierColor = (color) => ({ teal: C.teal, olive: C.olive, stone: C.stone })[color] || C.stone;

  return (

    <div className="relative">

      <button onClick={() => setOpen(o => !o)}

        className="flex items-center gap-2 px-2.5 py-1.5 transition-colors"

        style={{

          background: open ? C.sand : 'transparent',

          border: `1px solid ${open ? C.cocoa : C.taupe}`,

          borderRadius: 8,

          fontSize: 11.5,

          color: C.cocoa,

          cursor: 'pointer',

        }}

        onMouseEnter={e => { if (!open) e.currentTarget.style.background = C.sand; }}

        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}

      >

        <span style={{ color: C.stone, fontSize: 10.5 }}>Acting for</span>

        <span style={{ color: C.espresso, fontWeight: 600 }}>{activeCustomer.company}</span>

        {activeTier && (

          <span style={{

            padding: '1px 6px',

            background: tierColor(activeTier.color) + '22',

            color: tierColor(activeTier.color),

            borderRadius: 999,

            fontSize: 9.5, fontWeight: 700,

            letterSpacing: '0.04em',

          }}>

            {activeTier.name}

          </span>

        )}

        <ChevronDown size={11} strokeWidth={2.25} style={{

          color: C.stone, marginLeft: 2,

          transform: open ? 'rotate(180deg)' : 'none',

          transition: 'transform 150ms',

        }} />

      </button>

      {open && (

        <>

          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 z-50" style={{

            width: 320,

            background: C.cream,

            border: `1px solid ${C.taupe}`,

            borderRadius: 10,

            boxShadow: '0 8px 24px rgba(46,38,34,0.14)',

            overflow: 'hidden',

          }}>

            <div className="px-3 py-2.5" style={{ background: C.sand, borderBottom: `1px solid ${C.taupe}` }}>

              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Switch customer  -  {roster.length} accounts

              </div>

              <div className="relative">

                <Search size={12} strokeWidth={2.25} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.stone }} />

                <input

                  value={search}

                  onChange={e => setSearch(e.target.value)}

                  placeholder="Search by company, name, or email"

                  autoFocus

                  className="w-full pl-7 pr-3 py-1.5 outline-none"

                  style={{

                    background: C.white,

                    border: `1px solid ${C.taupe}`,

                    borderRadius: 6,

                    fontSize: 12,

                    fontFamily: FONT_STACK,

                    color: C.cocoa,

                  }}

                />

              </div>

            </div>

            <div className="max-h-80 overflow-y-auto">

              {filtered.length === 0 ? (

                <div className="px-3 py-6 text-center" style={{ fontSize: 12, color: C.stone }}>

                  No customers match "{search}"

                </div>

              ) : (

                filtered.map(c => {

                  const isActive = c.id === activeCustomer.id;

                  return (

                    <button

                      key={c.id}

                      onClick={() => { onSelect(c.id); setOpen(false); setSearch(''); }}

                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"

                      style={{

                        background: isActive ? C.tealTint : 'transparent',

                        borderBottom: `1px solid ${C.taupe}40`,

                      }}

                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.sand; }}

                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}

                    >

                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"

                        style={{ background: C.olive, color: 'white', fontSize: 10.5, fontWeight: 700 }}>

                        {(c.firstName?.[0] || '') + (c.lastName?.[0] || '')}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.espresso, lineHeight: 1.2 }} className="truncate">

                          {c.company}

                        </div>

                        <div style={{ fontSize: 10.5, color: C.stone, lineHeight: 1.3 }} className="truncate">

                          {c.firstName} {c.lastName}  -  {c.email}

                        </div>

                      </div>

                      {c.tier && (

                        <span style={{

                          padding: '2px 7px',

                          background: c.tier === 'tier1' ? C.sand : c.tier === 'tier2' ? C.tealTint : C.oliveTint,

                          color: c.tier === 'tier1' ? C.cocoa : c.tier === 'tier2' ? C.tealDeep : C.oliveDeep,

                          borderRadius: 999,

                          fontSize: 9.5, fontWeight: 700,

                          letterSpacing: '0.04em',

                          flexShrink: 0,

                        }}>

                          {c.tier === 'tier1' ? 'T1' : c.tier === 'tier2' ? 'T2' : 'T3'}

                        </span>

                      )}

                      {c.status === 'pending' && (

                        <span style={{

                          padding: '2px 7px',

                          background: C.amberTint,

                          color: '#7A5510',

                          borderRadius: 999,

                          fontSize: 9.5, fontWeight: 700,

                          letterSpacing: '0.04em',

                          flexShrink: 0,

                        }}>

                          PENDING

                        </span>

                      )}

                      {isActive && (

                        <Check size={12} strokeWidth={3} style={{ color: C.tealDeep, flexShrink: 0 }} />

                      )}

                    </button>

                  );

                })

              )}

            </div>

          </div>

        </>

      )}

    </div>

  );

}

// ============================================================================

// USER MENU - header dropdown with admin link + logout

// ============================================================================

function UserMenu({ user, onLogout, onGoToAdmin }) {

  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');

  const avatarColor = user.role === 'admin' ? C.orange : user.role === 'pm' ? C.teal : C.olive;

  const roleLabel = ({ admin: 'Administrator', pm: 'Product Manager', reseller: `Reseller  -  ${user.tier ? user.tier.replace('tier', 'Tier ') : 'Unassigned'}` })[user.role] || user.role;

  return (

    <div className="relative">

      <button onClick={() => setOpen(o => !o)}

        className="flex items-center gap-2 pl-4 border-l"

        style={{ borderColor: C.taupe, cursor: 'pointer' }}>

        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold"

          style={{ background: avatarColor, color: '#FFFFFF' }}>

          {initials}

        </div>

        <div style={{ fontSize: 11.5, textAlign: 'left' }}>

          <div style={{ color: C.espresso, fontWeight: 600 }}>{user.firstName} {user.lastName}</div>

          <div style={{ color: C.stone, fontSize: 10.5 }} className="-mt-0.5">{roleLabel}</div>

        </div>

        <ChevronDown size={11} style={{ color: C.stone, marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />

      </button>

      {open && (

        <>

          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 z-50" style={{

            width: 240, background: C.cream, border: `1px solid ${C.taupe}`,

            borderRadius: 10, boxShadow: '0 8px 24px rgba(46,38,34,0.14)', overflow: 'hidden',

          }}>

            <div className="px-4 py-3" style={{ background: C.sand, borderBottom: `1px solid ${C.taupe}` }}>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>{user.firstName} {user.lastName}</div>

              <div style={{ fontSize: 11, color: C.stone, marginTop: 1 }}>{user.email}</div>

              <div style={{ fontSize: 10.5, color: C.cocoa, marginTop: 4 }}>{user.company}</div>

            </div>

            <div className="py-1">

              {(user.role === 'admin') && (

                <button onClick={() => { setOpen(false); onGoToAdmin(); }}

                  className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"

                  style={{ fontSize: 12.5, color: C.cocoa }}

                  onMouseEnter={e => e.currentTarget.style.background = C.sand}

                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  <Shield size={13} strokeWidth={2.25} style={{ color: C.orange }} />

                  Admin Portal

                </button>

              )}

              <button className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"

                style={{ fontSize: 12.5, color: C.cocoa }}

                onMouseEnter={e => e.currentTarget.style.background = C.sand}

                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                <Settings size={13} strokeWidth={2.25} />

                Account settings

              </button>

              <div className="h-px my-1" style={{ background: C.taupe }} />

              <button onClick={() => { setOpen(false); onLogout(); }}

                className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"

                style={{ fontSize: 12.5, color: C.cocoa }}

                onMouseEnter={e => e.currentTarget.style.background = C.sand}

                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                <LogOut size={13} strokeWidth={2.25} />

                Sign out

              </button>

            </div>

          </div>

        </>

      )}

    </div>

  );

}

// ============================================================================

// AUTH SCREENS - shared shell

// ============================================================================

function AuthShell({ children }) {

  return (

    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: FONT_STACK, color: C.cocoa, position: 'relative' }}>

      {/* Subtle radial accents - same brand atmosphere as the main app */}

      <div className="fixed inset-0 pointer-events-none" style={{

        background: `radial-gradient(ellipse 800px 600px at 90% -10%, ${C.orange}11, transparent 60%), radial-gradient(ellipse 600px 500px at -10% 110%, ${C.teal}0E, transparent 60%)`,

      }} />

      {/* Top utility bar - keeps brand identity even at login */}

      <div style={{ background: C.espresso, color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="px-6 py-1.5 flex items-center justify-between text-[11.5px]">

          <span>Need help signing in? Call <span style={{ color: 'white', fontWeight: 600 }}>216.762.0588</span></span>

          <span>The medical equipment partner hospitals run on.</span>

        </div>

      </div>

      <div className="relative flex items-center justify-center px-4 py-12" style={{ minHeight: 'calc(100vh - 100px)' }}>

        {children}

      </div>

      {/* Brand footer - same trademark line as main app */}

      <footer className="relative px-6 py-4 border-t" style={{ borderColor: C.taupe, fontSize: 10.5, color: C.stone }}>

        <div className="flex items-center justify-between flex-wrap gap-2">

          <span>reLink Medical(R), reLink360(R), and reLink Ready(R) are registered trademarks of reLink Medical LLC. reLink Online(TM) and reLink Wholesale(TM) are trademarks of reLink Medical LLC.</span>

          <span>(C)2026 reLink Medical LLC  -  ISO 9001:2015  -  Veteran-Owned  -  Premier Inc. #COND-0210</span>

        </div>

      </footer>

    </div>

  );

}

function LoginScreen({ users, onLogin, onSwitchToSignup }) {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {

    if (e) e.preventDefault();

    setError('');

    setSubmitting(true);

    setTimeout(() => {

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);

      if (!user) {

        setError('Email or password not recognized. Try again or contact your account team.');

        setSubmitting(false);

        return;

      }

      if (user.status === 'pending') {

        setError('Your account is pending review. We\'ll email you once approved - typically within 1 business day.');

        setSubmitting(false);

        return;

      }

      if (user.status === 'inactive') {

        setError('This account has been deactivated. Contact your reLink account team to reinstate access.');

        setSubmitting(false);

        return;

      }

      onLogin(user);

    }, 350);

  };

  return (

    <AuthShell>

      <div style={{ width: '100%', maxWidth: 880, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>

        {/* LEFT - pitch / brand panel */}

        <div className="hidden lg:block">

          <div className="flex items-baseline mb-4" style={{ fontFamily: FONT_STACK, letterSpacing: '-0.025em' }}>

            <span style={{ fontSize: 26, fontWeight: 300, color: C.espresso }}>re</span>

            <span style={{ fontSize: 26, fontWeight: 700, color: C.espresso }}>Link</span>

            <span style={{ fontSize: 26, fontWeight: 300, color: C.espresso, marginLeft: 5 }}>Wholesale</span>

            <span style={{ fontSize: 12, color: C.stone, marginLeft: 4, fontWeight: 400 }}>(TM)</span>

          </div>

          <h1 style={{

            fontFamily: FONT_STACK, fontSize: 36, fontWeight: 300,

            color: C.espresso, letterSpacing: '-0.025em', lineHeight: 1.08,

            marginBottom: 16,

          }}>

            The wholesale platform{' '}

            <span style={{ fontWeight: 700, color: C.orange }}>resellers run on.</span>

          </h1>

          <p style={{ fontSize: 14, color: C.stone, lineHeight: 1.6, maxWidth: 380, marginBottom: 28 }}>

            Search, build quotes, and submit orders across reLink's national inventory - 23,000+ devices, 7 hubs, real-time visibility into every unit.

          </p>

          <div className="space-y-3">

            {[

              { icon: Search, text: 'Search 23,000+ devices across 7 distribution hubs' },

              { icon: FileText, text: 'Build quotes in minutes - share with your team for approval' },

              { icon: ShoppingCart, text: 'Submit orders directly with your PO and shipping account' },

              { icon: Phone, text: 'Send to your assigned Product Manager when you want a call first' },

            ].map((feat, i) => (

              <div key={i} className="flex items-start gap-2.5">

                <div className="flex items-center justify-center shrink-0" style={{

                  width: 26, height: 26, borderRadius: 6,

                  background: C.tealTint, color: C.tealDeep,

                }}>

                  <feat.icon size={13} strokeWidth={2.25} />

                </div>

                <span style={{ fontSize: 13, color: C.cocoa, lineHeight: 1.5, paddingTop: 4 }}>{feat.text}</span>

              </div>

            ))}

          </div>

        </div>

        {/* RIGHT - login form */}

        <div style={{

          background: C.white, border: `1px solid ${C.taupe}`,

          borderRadius: 14, padding: 32,

          boxShadow: '0 4px 16px rgba(46,38,34,0.06)',

          borderTop: `3px solid ${C.orange}`,

        }}>

          <Eyebrow color="orange" dot>Sign in</Eyebrow>

          <h2 style={{

            fontFamily: FONT_STACK, fontSize: 24, fontWeight: 300,

            color: C.espresso, letterSpacing: '-0.02em',

            marginTop: 8, marginBottom: 22,

          }}>

            Welcome <span style={{ fontWeight: 700, color: C.orange }}>back.</span>

          </h2>

          {error && (

            <div className="px-3 py-2.5 mb-4 flex items-start gap-2"

              style={{ background: C.redTint, color: C.red, fontSize: 12.5, lineHeight: 1.45, borderRadius: 8 }}>

              <AlertCircle size={13} strokeWidth={2.25} className="mt-0.5 shrink-0" />

              <span>{error}</span>

            </div>

          )}

          <div className="space-y-4">

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Email <span style={{ color: C.red, marginLeft: 2 }}>*</span>

              </div>

              <input type="email" value={email} onChange={e => setEmail(e.target.value)}

                onKeyDown={e => e.key === 'Enter' && handleSubmit()}

                placeholder="you@company.com"

                autoFocus

                className="w-full px-3 py-2.5 outline-none transition-all"

                style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}

                onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

            </div>

            <div>

              <div className="flex items-baseline justify-between mb-1.5">

                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone }}>

                  Password <span style={{ color: C.red, marginLeft: 2 }}>*</span>

                </span>

                <button style={{ fontSize: 11, color: C.orangeDeep, fontWeight: 600 }}>Forgot?</button>

              </div>

              <div className="relative">

                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}

                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}

                  placeholder="Enter your password"

                  className="w-full pl-3 pr-10 py-2.5 outline-none transition-all"

                  style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}

                  onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                  onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                <button type="button" onClick={() => setShowPassword(s => !s)}

                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-colors"

                  style={{ color: C.stone }}

                  onMouseEnter={e => e.currentTarget.style.background = C.sand}

                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {showPassword ? <EyeOff size={14} strokeWidth={2.25} /> : <Eye size={14} strokeWidth={2.25} />}

                </button>

              </div>

            </div>

            <Btn variant="primary" size="lg" icon={ArrowRight} onClick={handleSubmit}

              disabled={!email.trim() || !password || submitting} className="w-full">

              {submitting ? 'Signing in...' : 'Sign in'}

            </Btn>

          </div>

          <div className="my-5 flex items-center gap-3">

            <div className="flex-1 h-px" style={{ background: C.taupe }} />

            <span style={{ fontSize: 10.5, color: C.stone, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase' }}>or</span>

            <div className="flex-1 h-px" style={{ background: C.taupe }} />

          </div>

          <div className="text-center">

            <div style={{ fontSize: 13, color: C.cocoa, marginBottom: 4 }}>

              New to reLink Wholesale?

            </div>

            <button onClick={onSwitchToSignup}

              style={{ fontSize: 13, fontWeight: 700, color: C.orangeDeep, letterSpacing: '0.01em' }}>

              Apply for a reseller account &rarr;

            </button>

          </div>

          {/* Demo helper - show test credentials */}

          <div className="mt-6 px-3 py-2.5" style={{ background: C.sand, borderRadius: 8, fontSize: 10.5, color: C.stone, lineHeight: 1.5 }}>

            <div style={{ fontWeight: 700, color: C.cocoa, marginBottom: 3, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 9.5 }}>Demo accounts</div>

            <div><span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>jeff@relinkmedical.com</span>  -  admin  -  password: <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>demo</span></div>

            <div><span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>maria@surgspec.com</span>  -  reseller  -  password: <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>demo</span></div>

          </div>

        </div>

      </div>

    </AuthShell>

  );

}

function SignupScreen({ users, onSignup, onSwitchToLogin }) {

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({

    firstName: '', lastName: '', email: '', phone: '',

    company: '', companyType: 'reseller', taxId: '',

    address1: '', city: '', state: '', zip: '',

    password: '', passwordConfirm: '',

    monthlyVolume: '', referredBy: '',

  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {

    if (!form.firstName.trim() || !form.lastName.trim()) return 'First and last name required.';

    if (!form.email.includes('@')) return 'Valid email required.';

    if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase().trim())) return 'An account with that email already exists.';

    if (form.password.length < 6) return 'Password must be at least 6 characters.';

    if (form.password !== form.passwordConfirm) return 'Passwords don\'t match.';

    return null;

  };

  const validateStep2 = () => {

    if (!form.company.trim()) return 'Company name required.';

    if (!form.address1.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) return 'Complete business address required.';

    return null;

  };

  const handleNext = () => {

    const err = validateStep1();

    if (err) { setError(err); return; }

    setError('');

    setStep(2);

  };

  const handleBack = () => { setError(''); setStep(1); };

  const handleSubmit = () => {

    const err = validateStep2();

    if (err) { setError(err); return; }

    setError('');

    onSignup(form);

    setSubmitted(true);

  };

  if (submitted) {

    return (

      <AuthShell>

        <div style={{

          width: '100%', maxWidth: 520,

          background: C.white, border: `1px solid ${C.taupe}`,

          borderRadius: 14, padding: 40,

          boxShadow: '0 4px 16px rgba(46,38,34,0.06)',

          borderTop: `3px solid ${C.olive}`,

          textAlign: 'center',

        }}>

          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: C.oliveTint }}>

            <CheckCircle2 size={30} style={{ color: C.oliveDeep }} strokeWidth={2.25} />

          </div>

          <Eyebrow color="olive" dot>Application received</Eyebrow>

          <h2 style={{

            fontFamily: FONT_STACK, fontSize: 26, fontWeight: 300,

            color: C.espresso, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 12,

          }}>

            Welcome to reLink, <span style={{ fontWeight: 700, color: C.olive }}>{form.firstName}.</span>

          </h2>

          <p style={{ fontSize: 14, color: C.cocoa, lineHeight: 1.6, marginBottom: 22, maxWidth: 380, margin: '0 auto 22px' }}>

            We've received your application for <strong>{form.company}</strong>. A reLink team member will review your account and email approval to <strong>{form.email}</strong> - typically within 1 business day.

          </p>

          <div className="px-4 py-3 mx-auto" style={{ background: C.sand, borderRadius: 8, fontSize: 12, color: C.cocoa, textAlign: 'left', maxWidth: 380, lineHeight: 1.55 }}>

            <div style={{ fontWeight: 700, color: C.espresso, marginBottom: 4 }}>What happens next</div>

            <ol style={{ paddingLeft: 16 }}>

              <li>We verify your business credentials</li>

              <li>You're assigned a Product Manager</li>

              <li>You receive an approval email with login</li>

              <li>You start submitting quotes and orders</li>

            </ol>

          </div>

          <div className="mt-6">

            <Btn variant="outline" onClick={onSwitchToLogin}>Back to sign in</Btn>

          </div>

        </div>

      </AuthShell>

    );

  }

  return (

    <AuthShell>

      <div style={{

        width: '100%', maxWidth: 560,

        background: C.white, border: `1px solid ${C.taupe}`,

        borderRadius: 14, padding: 32,

        boxShadow: '0 4px 16px rgba(46,38,34,0.06)',

        borderTop: `3px solid ${C.orange}`,

      }}>

        {/* Step indicator */}

        <div className="flex items-center justify-between mb-5">

          <Eyebrow color="orange" dot>Reseller signup  -  Step {step} of 2</Eyebrow>

          <button onClick={onSwitchToLogin} style={{ fontSize: 11, color: C.stone, fontWeight: 600 }}>

            Already have an account? Sign in

          </button>

        </div>

        {/* Progress bar */}

        <div className="flex gap-1 mb-5">

          <div style={{ height: 3, flex: 1, background: C.orange, borderRadius: 999 }} />

          <div style={{ height: 3, flex: 1, background: step >= 2 ? C.orange : C.taupe, borderRadius: 999 }} />

        </div>

        <h2 style={{

          fontFamily: FONT_STACK, fontSize: 24, fontWeight: 300,

          color: C.espresso, letterSpacing: '-0.02em', marginBottom: 6,

        }}>

          {step === 1 ? <>Create your <span style={{ fontWeight: 700, color: C.orange }}>account.</span></>

                       : <>Tell us about your <span style={{ fontWeight: 700, color: C.orange }}>business.</span></>}

        </h2>

        <p style={{ fontSize: 12.5, color: C.stone, marginBottom: 22, lineHeight: 1.5 }}>

          {step === 1

            ? 'Personal contact info and login. Takes about 90 seconds.'

            : 'Business details so we can set up your account and assign a Product Manager.'}

        </p>

        {error && (

          <div className="px-3 py-2.5 mb-4 flex items-start gap-2"

            style={{ background: C.redTint, color: C.red, fontSize: 12.5, lineHeight: 1.45, borderRadius: 8 }}>

            <AlertCircle size={13} strokeWidth={2.25} className="mt-0.5 shrink-0" />

            <span>{error}</span>

          </div>

        )}

        {step === 1 ? (

          <div className="space-y-3.5">

            <div className="grid grid-cols-2 gap-3">

              <SignupField label="First name" required value={form.firstName} onChange={v => update('firstName', v)} placeholder="Maria" />

              <SignupField label="Last name" required value={form.lastName} onChange={v => update('lastName', v)} placeholder="Reyes" />

            </div>

            <SignupField label="Work email" required type="email" value={form.email} onChange={v => update('email', v)} placeholder="you@company.com" />

            <SignupField label="Phone" type="tel" value={form.phone} onChange={v => update('phone', v)} placeholder="(216) 555-0142" />

            <div className="grid grid-cols-2 gap-3">

              <div>

                <SignupField label="Password" required type={showPassword ? 'text' : 'password'} value={form.password} onChange={v => update('password', v)} placeholder="6+ characters" />

              </div>

              <div>

                <SignupField label="Confirm password" required type={showPassword ? 'text' : 'password'} value={form.passwordConfirm} onChange={v => update('passwordConfirm', v)} placeholder="Re-enter password" />

              </div>

            </div>

            <label className="flex items-center gap-2 cursor-pointer">

              <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} className="accent-[#F38637]" />

              <span style={{ fontSize: 11.5, color: C.stone }}>Show password</span>

            </label>

            <div className="pt-3">

              <Btn variant="primary" size="lg" icon={ArrowRight} onClick={handleNext} className="w-full">

                Continue to business details

              </Btn>

            </div>

          </div>

        ) : (

          <div className="space-y-3.5">

            <SignupField label="Company / Business name" required value={form.company} onChange={v => update('company', v)} placeholder="MedParts Solutions" />

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Business type <span style={{ color: C.red, marginLeft: 2 }}>*</span>

              </div>

              <div className="grid grid-cols-3 gap-2">

                {[

                  { id: 'reseller', label: 'Reseller / Dealer', sub: 'Resells equipment' },

                  { id: 'biomed', label: 'Biomed Shop', sub: 'Repairs & parts' },

                  { id: 'broker', label: 'Broker', sub: 'Sources for end users' },

                ].map(opt => (

                  <button key={opt.id} onClick={() => update('companyType', opt.id)}

                    className="text-left transition-all"

                    style={{

                      padding: '8px 10px',

                      background: form.companyType === opt.id ? C.orangeTint : C.sand,

                      border: `1px solid ${form.companyType === opt.id ? C.orange : C.taupe}`,

                      borderRadius: 8, minWidth: 0,

                    }}>

                    <div style={{ fontSize: 12, fontWeight: 700, color: C.espresso }}>{opt.label}</div>

                    <div style={{ fontSize: 10.5, color: C.stone, marginTop: 1 }}>{opt.sub}</div>

                  </button>

                ))}

              </div>

            </div>

            <SignupField label="Tax ID / EIN" value={form.taxId} onChange={v => update('taxId', v)} placeholder="00-0000000" />

            <SignupField label="Business address" required value={form.address1} onChange={v => update('address1', v)} placeholder="1234 Medical Pkwy, Suite 400" />

            <div className="grid grid-cols-[1fr_120px_120px] gap-3">

              <SignupField label="City" required value={form.city} onChange={v => update('city', v)} placeholder="Cleveland" />

              <SignupField label="State" required value={form.state} onChange={v => update('state', v)} placeholder="OH" maxLength={2} />

              <SignupField label="ZIP" required value={form.zip} onChange={v => update('zip', v)} placeholder="44195" />

            </div>

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Estimated monthly volume

              </div>

              <select value={form.monthlyVolume} onChange={e => update('monthlyVolume', e.target.value)}

                className="w-full px-3 py-2.5 outline-none"

                style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

                <option value="">Select range...</option>

                <option value="under-10k">Under $10K / month</option>

                <option value="10k-50k">$10K - $50K / month</option>

                <option value="50k-150k">$50K - $150K / month</option>

                <option value="over-150k">Over $150K / month</option>

              </select>

            </div>

            <SignupField label="Referred by" value={form.referredBy} onChange={v => update('referredBy', v)} placeholder="Optional - Product Manager name or partner" />

            <div className="pt-3 flex gap-2">

              <Btn variant="outline" icon={ArrowLeft} onClick={handleBack}>Back</Btn>

              <Btn variant="primary" size="lg" icon={CheckCircle2} onClick={handleSubmit} className="flex-1">

                Submit application

              </Btn>

            </div>

            <div className="px-3 py-2.5 mt-2" style={{ background: C.tealTint, color: C.tealDeep, fontSize: 11.5, lineHeight: 1.5, borderRadius: 8 }}>

              By submitting, you agree to reLink Medical's reseller terms. Your account will be reviewed and approved within 1 business day.

            </div>

          </div>

        )}

      </div>

    </AuthShell>

  );

}

function SignupField({ label, required, type = 'text', value, onChange, placeholder, maxLength }) {

  return (

    <div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

        {label} {required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}

      </div>

      <input type={type} value={value} onChange={e => onChange(e.target.value)}

        placeholder={placeholder} maxLength={maxLength}

        className="w-full px-3 py-2.5 outline-none transition-all"

        style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13.5, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}

        onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

        onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

    </div>

  );

}

// ============================================================================

// ADMIN PORTAL

// ============================================================================

function AdminPortal({ currentUser, users, setUsers, tiers, setTiers, onExit, onLogout }) {

  const [activeTab, setActiveTab] = useState('users');

  const [editingUser, setEditingUser] = useState(null);

  const [editingTier, setEditingTier] = useState(null);

  return (

    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: FONT_STACK, color: C.cocoa }}>

      {/* Subtle radial atmosphere */}

      <div className="fixed inset-0 pointer-events-none" style={{

        background: `radial-gradient(ellipse 800px 600px at 90% -10%, ${C.orange}11, transparent 60%)`,

      }} />

      {/* TOP UTILITY BAR */}

      <div className="relative" style={{ background: C.espresso, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="px-6 py-1.5 flex items-center justify-between text-[11.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>

          <div className="flex items-center gap-3">

            <Shield size={11} strokeWidth={2.25} style={{ color: C.orange }} />

            <span>Administrator console - internal only</span>

          </div>

          <span>The medical equipment partner hospitals run on.</span>

        </div>

      </div>

      {/* HEADER */}

      <header className="relative border-b" style={{ borderColor: C.taupe, background: C.cream }}>

        <div className="px-6 py-4 flex items-center gap-6">

          <button onClick={onExit}

            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors"

            style={{ fontSize: 11.5, color: C.cocoa, fontWeight: 600 }}

            onMouseEnter={e => e.currentTarget.style.background = C.sand}

            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <ArrowLeft size={13} strokeWidth={2.25} />

            Back to Wholesale

          </button>

          <div className="h-6 w-px" style={{ background: C.taupe }} />

          <div className="flex items-baseline" style={{ fontFamily: FONT_STACK, letterSpacing: '-0.025em' }}>

            <span style={{ fontSize: 22, fontWeight: 300, color: C.espresso }}>re</span>

            <span style={{ fontSize: 22, fontWeight: 700, color: C.espresso }}>Link</span>

            <span style={{ fontSize: 22, fontWeight: 300, color: C.espresso, marginLeft: 4 }}>Admin</span>

          </div>

          <div className="ml-auto">

            <UserMenu user={currentUser} onLogout={onLogout} onGoToAdmin={() => {}} />

          </div>

        </div>

      </header>

      {/* TITLE STRIP */}

      <div className="relative px-6 py-3 border-b" style={{ borderColor: C.taupe }}>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <Eyebrow color="cocoa">Admin Console</Eyebrow>

            <span style={{ fontFamily: FONT_STACK, fontSize: 17, fontWeight: 300, color: C.espresso, letterSpacing: '-0.01em' }}>

              Manage <span style={{ fontWeight: 700, color: C.orange }}>users & pricing</span>

              <span style={{ color: C.stone, fontWeight: 300 }}>  -  keep the platform running clean</span>

            </span>

          </div>

        </div>

      </div>

      {/* TAB BAR */}

      <div className="relative px-6 border-b" style={{ borderColor: C.taupe, background: C.cream }}>

        <div className="flex gap-1">

          {[

            { id: 'users', label: 'Users', icon: UsersIcon, count: users.length },

            { id: 'tiers', label: 'Tiers & discounts', icon: Percent, count: tiers.length },

          ].map(tab => {

            const active = activeTab === tab.id;

            return (

              <button key={tab.id} onClick={() => setActiveTab(tab.id)}

                className="flex items-center gap-2 px-4 py-3 transition-colors relative"

                style={{

                  fontSize: 13, fontWeight: active ? 700 : 500,

                  color: active ? C.espresso : C.stone,

                  borderBottom: active ? `2px solid ${C.orange}` : '2px solid transparent',

                  marginBottom: -1,

                }}>

                <tab.icon size={14} strokeWidth={2.25} />

                {tab.label}

                <span style={{

                  fontSize: 10.5, padding: '2px 6px', borderRadius: 999,

                  background: active ? C.orange : C.sand,

                  color: active ? 'white' : C.stone,

                  fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700,

                }}>{tab.count}</span>

              </button>

            );

          })}

        </div>

      </div>

      {/* CONTENT */}

      <main className="relative px-6 py-6" style={{ minHeight: 'calc(100vh - 240px)' }}>

        {activeTab === 'users' ? (

          <UsersAdmin users={users} setUsers={setUsers} tiers={tiers}

            editingUser={editingUser} setEditingUser={setEditingUser} />

        ) : (

          <TiersAdmin tiers={tiers} setTiers={setTiers} users={users}

            editingTier={editingTier} setEditingTier={setEditingTier} />

        )}

      </main>

      <footer className="relative px-6 py-4 border-t" style={{ borderColor: C.taupe, fontSize: 10.5, color: C.stone }}>

        <div className="flex items-center justify-between flex-wrap gap-2">

          <span>reLink Medical(R), reLink360(R), and reLink Ready(R) are registered trademarks of reLink Medical LLC.</span>

          <span>(C)2026 reLink Medical LLC  -  Internal admin  -  ISO 9001:2015  -  Premier Inc. #COND-0210</span>

        </div>

      </footer>

    </div>

  );

}

// ============================================================================

// USERS ADMIN - list + edit drawer

// ============================================================================

function UsersAdmin({ users, setUsers, tiers, editingUser, setEditingUser }) {

  const [search, setSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState('all');

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {

    return users.filter(u => {

      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      if (statusFilter !== 'all' && u.status !== statusFilter) return false;

      if (search) {

        const q = search.toLowerCase();

        if (!`${u.firstName} ${u.lastName} ${u.email} ${u.company}`.toLowerCase().includes(q)) return false;

      }

      return true;

    });

  }, [users, search, roleFilter, statusFilter]);

  const updateUser = (id, patch) => setUsers(us => us.map(u => u.id === id ? { ...u, ...patch } : u));

  const stats = useMemo(() => ({

    total: users.length,

    active: users.filter(u => u.status === 'active').length,

    pending: users.filter(u => u.status === 'pending').length,

    inactive: users.filter(u => u.status === 'inactive').length,

  }), [users]);

  return (

    <div className="max-w-[1400px] mx-auto">

      {/* Stats row */}

      <div className="grid grid-cols-4 gap-3 mb-5">

        <AdminStat label="Total users" value={stats.total} accent={C.espresso} />

        <AdminStat label="Active" value={stats.active} accent={C.olive} />

        <AdminStat label="Pending review" value={stats.pending} accent={C.orange} alert={stats.pending > 0} />

        <AdminStat label="Inactive" value={stats.inactive} accent={C.stone} />

      </div>

      {/* Filter bar */}

      <div className="flex items-center gap-3 mb-4 flex-wrap">

        <div className="relative flex-1 max-w-md">

          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.stone }} strokeWidth={2.25} />

          <input value={search} onChange={e => setSearch(e.target.value)}

            placeholder="Search by name, email, or company..."

            className="w-full pl-9 pr-3 py-2 outline-none transition-all"

            style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}

            onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

            onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

        </div>

        <AdminFilterPills label="Role" value={roleFilter} onChange={setRoleFilter}

          options={[

            { id: 'all', label: 'All' },

            { id: 'admin', label: 'Admin' },

            { id: 'pm', label: 'Product Manager' },

            { id: 'reseller', label: 'Reseller' },

          ]} />

        <AdminFilterPills label="Status" value={statusFilter} onChange={setStatusFilter}

          options={[

            { id: 'all', label: 'All' },

            { id: 'active', label: 'Active' },

            { id: 'pending', label: 'Pending' },

            { id: 'inactive', label: 'Inactive' },

          ]} />

        <div className="ml-auto">

          <Btn variant="primary" icon={UserPlus} onClick={() => setEditingUser({ isNew: true, firstName: '', lastName: '', email: '', company: '', role: 'reseller', tier: 'tier1', status: 'active' })}>

            Add user

          </Btn>

        </div>

      </div>

      {/* Users table */}

      <div style={{ background: C.white, border: `1px solid ${C.taupe}`, borderRadius: 10, overflow: 'hidden' }}>

        <table className="w-full" style={{ fontSize: 13, borderCollapse: 'collapse' }}>

          <thead>

            <tr style={{ background: C.espresso, color: 'white' }}>

              {['User', 'Email', 'Company', 'Role', 'Tier', 'Assigned PM', 'Status', 'Joined', ''].map((h, i) => (

                <th key={i} className="px-3 py-2.5 text-left"

                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{h}</th>

              ))}

            </tr>

          </thead>

          <tbody>

            {filtered.map((u, i) => {

              const initials = (u.firstName?.[0] || '') + (u.lastName?.[0] || '');

              const avColor = u.role === 'admin' ? C.orange : u.role === 'pm' ? C.teal : C.olive;

              const tier = tiers.find(t => t.id === u.tier);

              const assignedPm = u.assignedPmId ? users.find(usr => usr.id === u.assignedPmId) : null;

              return (

                <tr key={u.id} className="transition-colors"

                  style={{ borderTop: i > 0 ? `1px solid ${C.taupe}` : 'none', background: i % 2 ? C.cream : C.white, cursor: 'pointer' }}

                  onClick={() => setEditingUser({ ...u })}

                  onMouseEnter={e => e.currentTarget.style.background = C.sand + '99'}

                  onMouseLeave={e => e.currentTarget.style.background = i % 2 ? C.cream : C.white}>

                  <td className="px-3 py-2.5">

                    <div className="flex items-center gap-2.5">

                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold"

                        style={{ background: avColor, color: 'white' }}>{initials}</div>

                      <div>

                        <div style={{ fontWeight: 600, color: C.espresso }}>{u.firstName} {u.lastName}</div>

                      </div>

                    </div>

                  </td>

                  <td className="px-3 py-2.5" style={{ color: C.cocoa, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11.5 }}>{u.email}</td>

                  <td className="px-3 py-2.5" style={{ color: C.cocoa }}>{u.company}</td>

                  <td className="px-3 py-2.5">

                    <Pill tone={u.role === 'admin' ? 'orange' : u.role === 'pm' ? 'teal' : 'olive'} size="sm">

                      {u.role === 'pm' ? 'Product Mgr' : u.role}

                    </Pill>

                  </td>

                  <td className="px-3 py-2.5">

                    {u.tier ? (

                      <Pill tone={tier?.color || 'stone'} size="sm">{tier?.name || u.tier}</Pill>

                    ) : (

                      <span style={{ color: C.stone, fontSize: 11 }}>-</span>

                    )}

                  </td>

                  <td className="px-3 py-2.5">

                    {u.role !== 'reseller' ? (

                      <span style={{ color: C.stone, fontSize: 11 }}>-</span>

                    ) : assignedPm ? (

                      <div className="flex items-center gap-1.5">

                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0"

                          style={{ background: C.teal, color: 'white' }}>

                          {(assignedPm.firstName?.[0] || '') + (assignedPm.lastName?.[0] || '')}

                        </div>

                        <span style={{ fontSize: 11.5, color: C.cocoa }}>{assignedPm.firstName} {assignedPm.lastName}</span>

                      </div>

                    ) : (

                      <span style={{ fontSize: 10.5, color: '#7A5510', fontWeight: 600, padding: '2px 6px', background: C.amberTint, borderRadius: 4, letterSpacing: '0.04em' }}>

                        UNASSIGNED

                      </span>

                    )}

                  </td>

                  <td className="px-3 py-2.5">

                    <Pill tone={u.status === 'active' ? 'olive' : u.status === 'pending' ? 'orange' : 'stone'} size="sm" dot>

                      {u.status}

                    </Pill>

                  </td>

                  <td className="px-3 py-2.5" style={{ color: C.stone, fontSize: 11.5 }}>{u.createdAt}</td>

                  <td className="px-3 py-2.5 text-right">

                    <Edit2 size={13} style={{ color: C.stone }} strokeWidth={2.25} />

                  </td>

                </tr>

              );

            })}

            {filtered.length === 0 && (

              <tr><td colSpan={9} className="px-3 py-12 text-center" style={{ color: C.stone, fontSize: 13 }}>

                No users match those filters.

              </td></tr>

            )}

          </tbody>

        </table>

      </div>

      {editingUser && (

        <UserEditDrawer user={editingUser} tiers={tiers} allUsers={users}

          onSave={(patch) => {

            if (editingUser.isNew) {

              const newUser = {

                id: 'u-' + Date.now().toString(36),

                ...patch,

                password: 'demo',

                createdAt: new Date().toISOString().slice(0, 10),

              };

              setUsers(us => [...us, newUser]);

            } else {

              updateUser(editingUser.id, patch);

            }

            setEditingUser(null);

          }}

          onDelete={() => {

            if (!editingUser.isNew) {

              setUsers(us => us.filter(u => u.id !== editingUser.id));

            }

            setEditingUser(null);

          }}

          onClose={() => setEditingUser(null)} />

      )}

    </div>

  );

}

function UserEditDrawer({ user, tiers, allUsers = [], onSave, onDelete, onClose }) {

  const [form, setForm] = useState(user);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Eligible PMs - staff users who can be assigned (admin or pm role, active)

  const eligiblePms = useMemo(() => {

    return allUsers.filter(u =>

      (u.role === 'pm' || u.role === 'admin') &&

      u.status === 'active' &&

      u.id !== form.id  // can't assign self if editing a PM

    );

  }, [allUsers, form.id]);

  const assignedPm = eligiblePms.find(p => p.id === form.assignedPmId);

  return (

    <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(46,38,34,0.55)' }} onClick={onClose}>

      <div className="absolute right-0 top-0 bottom-0 overflow-y-auto"

        style={{ width: 480, background: C.cream, borderLeft: `1px solid ${C.taupe}`, boxShadow: '-8px 0 24px rgba(46,38,34,0.14)' }}

        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"

          style={{ background: C.cream, borderBottom: `1px solid ${C.taupe}` }}>

          <div>

            <Eyebrow color="cocoa">{form.isNew ? 'Add user' : 'Edit user'}</Eyebrow>

            <div className="mt-1" style={{ fontSize: 18, fontFamily: FONT_STACK, fontWeight: 300, color: C.espresso }}>

              {form.isNew ? 'New account' : `${form.firstName} ${form.lastName}`}

            </div>

          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-white"><X size={18} /></button>

        </div>

        <div className="p-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">

            <SignupField label="First name" required value={form.firstName} onChange={v => update('firstName', v)} />

            <SignupField label="Last name" required value={form.lastName} onChange={v => update('lastName', v)} />

          </div>

          <SignupField label="Email" required type="email" value={form.email} onChange={v => update('email', v)} />

          <SignupField label="Company" required value={form.company} onChange={v => update('company', v)} />

          <div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

              Role <span style={{ color: C.red }}>*</span>

            </div>

            <div className="grid grid-cols-3 gap-2">

              {[

                { id: 'admin', label: 'Admin', sub: 'Full access', color: 'orange' },

                { id: 'pm', label: 'Product Manager', sub: 'Internal staff', color: 'teal' },

                { id: 'reseller', label: 'Reseller', sub: 'External buyer', color: 'olive' },

              ].map(opt => (

                <button key={opt.id} onClick={() => update('role', opt.id)}

                  style={{

                    padding: '10px 8px',

                    background: form.role === opt.id ? ({ orange: C.orangeTint, teal: C.tealTint, olive: C.oliveTint })[opt.color] : C.white,

                    border: `1px solid ${form.role === opt.id ? ({ orange: C.orange, teal: C.teal, olive: C.olive })[opt.color] : C.taupe}`,

                    borderRadius: 8, textAlign: 'left',

                  }}>

                  <div style={{ fontSize: 12, fontWeight: 700, color: C.espresso }}>{opt.label}</div>

                  <div style={{ fontSize: 10, color: C.stone, marginTop: 1 }}>{opt.sub}</div>

                </button>

              ))}

            </div>

          </div>

          {form.role === 'reseller' && (

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Volume tier

              </div>

              <div className="space-y-2">

                {tiers.map(t => (

                  <button key={t.id} onClick={() => update('tier', t.id)}

                    style={{

                      width: '100%', padding: '10px 12px',

                      background: form.tier === t.id ? ({ teal: C.tealTint, olive: C.oliveTint, stone: C.sand })[t.color] : C.white,

                      border: `1px solid ${form.tier === t.id ? ({ teal: C.teal, olive: C.olive, stone: C.stone })[t.color] : C.taupe}`,

                      borderRadius: 8, textAlign: 'left',

                    }}>

                    <div className="flex items-center justify-between">

                      <div>

                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.espresso }}>{t.name}  -  {t.label}</div>

                        <div style={{ fontSize: 10.5, color: C.stone, marginTop: 1 }}>{t.paymentTerms}  -  ${t.minOrderUsd.toLocaleString()}+ minimum</div>

                      </div>

                      <span style={{

                        fontSize: 13, fontWeight: 700,

                        color: ({ teal: C.tealDeep, olive: C.oliveDeep, stone: C.cocoa })[t.color],

                        fontFamily: 'ui-monospace, Menlo, monospace',

                      }}>{t.discountPct}%</span>

                    </div>

                  </button>

                ))}

              </div>

            </div>

          )}

          {/* Assigned Product Manager - only for resellers; staff don't have one */}

          {form.role === 'reseller' && (

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Assigned Product Manager

              </div>

              <select

                value={form.assignedPmId || ''}

                onChange={e => update('assignedPmId', e.target.value || null)}

                className="w-full px-3 py-2.5 outline-none transition-all"

                style={{

                  background: C.white,

                  border: `1px solid ${C.taupe}`,

                  fontSize: 13,

                  borderRadius: 8,

                  fontFamily: FONT_STACK,

                  color: form.assignedPmId ? C.espresso : C.stone,

                  fontWeight: form.assignedPmId ? 600 : 400,

                }}

                onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.teal}26`; }}

                onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }}

              >

                <option value="">Unassigned - no PM yet</option>

                {eligiblePms.map(pm => (

                  <option key={pm.id} value={pm.id}>

                    {pm.firstName} {pm.lastName}  -  {pm.email} {pm.role === 'admin' ? '(admin)' : ''}

                  </option>

                ))}

              </select>

              {/* Echo selection so admin can confirm the contact info */}

              {assignedPm && (

                <div className="mt-2 px-3 py-2 flex items-start gap-2"

                  style={{ background: C.tealTint, border: `1px solid ${C.teal}40`, borderRadius: 6 }}>

                  <UserPlus size={12} style={{ color: C.tealDeep, marginTop: 2 }} strokeWidth={2.25} />

                  <div className="flex-1" style={{ fontSize: 11.5, lineHeight: 1.45 }}>

                    <div style={{ color: C.espresso, fontWeight: 600 }}>{assignedPm.firstName} {assignedPm.lastName}</div>

                    <div style={{ color: C.cocoa, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11 }}>{assignedPm.email}</div>

                  </div>

                </div>

              )}

              {!assignedPm && form.assignedPmId === null && eligiblePms.length > 0 && (

                <div className="mt-2 px-3 py-2 flex items-start gap-2"

                  style={{ background: C.amberTint, border: `1px solid ${C.amber}40`, borderRadius: 6 }}>

                  <AlertCircle size={12} style={{ color: '#7A5510', marginTop: 2 }} strokeWidth={2.25} />

                  <span style={{ fontSize: 11.5, color: '#7A5510', lineHeight: 1.4 }}>

                    No PM assigned. The customer's "Send to Product Manager" requests will route to the unassigned queue.

                  </span>

                </div>

              )}

            </div>

          )}

          <div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

              Status

            </div>

            <div className="grid grid-cols-3 gap-2">

              {[

                { id: 'active', label: 'Active', tone: 'olive' },

                { id: 'pending', label: 'Pending review', tone: 'orange' },

                { id: 'inactive', label: 'Deactivated', tone: 'stone' },

              ].map(s => (

                <button key={s.id} onClick={() => update('status', s.id)}

                  style={{

                    padding: '8px',

                    background: form.status === s.id ? ({ olive: C.oliveTint, orange: C.orangeTint, stone: C.sand })[s.tone] : C.white,

                    border: `1px solid ${form.status === s.id ? ({ olive: C.olive, orange: C.orange, stone: C.stone })[s.tone] : C.taupe}`,

                    borderRadius: 8,

                    fontSize: 12, fontWeight: form.status === s.id ? 700 : 500,

                    color: C.espresso,

                  }}>{s.label}</button>

              ))}

            </div>

          </div>

        </div>

        <div className="sticky bottom-0 px-5 py-4 flex items-center justify-between border-t" style={{ background: C.sand, borderColor: C.taupe }}>

          {!form.isNew ? (

            <button onClick={() => { if (confirm('Delete this user permanently?')) onDelete(); }}

              style={{ fontSize: 11.5, color: C.red, fontWeight: 600, letterSpacing: '0.04em' }}>

              <Trash2 size={11} className="inline mr-1" strokeWidth={2.25} />Delete user

            </button>

          ) : <span />}

          <div className="flex gap-2">

            <Btn variant="outline" onClick={onClose}>Cancel</Btn>

            <Btn variant="primary" icon={Save} onClick={() => onSave(form)}

              disabled={!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || !form.company?.trim()}>

              {form.isNew ? 'Create user' : 'Save changes'}

            </Btn>

          </div>

        </div>

      </div>

    </div>

  );

}

// ============================================================================

// TIERS ADMIN - discount rules

// ============================================================================

function TiersAdmin({ tiers, setTiers, users, editingTier, setEditingTier }) {

  const userCountForTier = (id) => users.filter(u => u.tier === id).length;

  const updateTier = (id, patch) => setTiers(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));

  return (

    <div className="max-w-[1200px] mx-auto">

      <div className="flex items-baseline justify-between mb-4">

        <div>

          <h2 style={{ fontSize: 18, fontWeight: 300, color: C.espresso, fontFamily: FONT_STACK, letterSpacing: '-0.01em', marginBottom: 4 }}>

            Reseller <span style={{ fontWeight: 700, color: C.orange }}>tiers & discounts</span>

          </h2>

          <p style={{ fontSize: 12.5, color: C.stone, lineHeight: 1.5, maxWidth: 540 }}>

            Define the volume tiers and percentage discounts that apply to reseller orders. Changes here affect future quotes and orders - existing open quotes use their original tier.

          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {tiers.map(t => {

          const tone = t.color;

          const accent = ({ teal: { bg: C.tealTint, fg: C.tealDeep, border: C.teal }, olive: { bg: C.oliveTint, fg: C.oliveDeep, border: C.olive }, stone: { bg: C.sand, fg: C.cocoa, border: C.stone } })[tone];

          return (

            <div key={t.id} style={{

              background: C.white, border: `1px solid ${C.taupe}`,

              borderRadius: 12, overflow: 'hidden',

              borderTop: `3px solid ${accent.border}`,

            }}>

              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.taupe}` }}>

                <div className="flex items-baseline justify-between mb-1">

                  <Eyebrow color={tone === 'olive' ? 'olive' : tone === 'teal' ? 'teal' : 'cocoa'}>{t.name}</Eyebrow>

                  <span style={{ fontSize: 11, color: C.stone, fontFamily: 'ui-monospace, Menlo, monospace' }}>

                    {userCountForTier(t.id)} {userCountForTier(t.id) === 1 ? 'user' : 'users'}

                  </span>

                </div>

                <div style={{ fontSize: 16, fontFamily: FONT_STACK, fontWeight: 700, color: C.espresso, marginBottom: 4 }}>

                  {t.label}

                </div>

                <div style={{ fontSize: 12, color: C.stone, lineHeight: 1.5 }}>{t.description}</div>

              </div>

              <div className="px-5 py-4 grid grid-cols-2 gap-4">

                <div>

                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 4 }}>

                    Discount

                  </div>

                  <div style={{ fontSize: 26, fontFamily: FONT_STACK, fontWeight: 300, color: C.espresso, letterSpacing: '-0.02em', lineHeight: 1 }}>

                    {t.discountPct}<span style={{ fontSize: 16, color: C.stone }}>%</span>

                  </div>

                </div>

                <div>

                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 4 }}>

                    Min order

                  </div>

                  <div style={{ fontSize: 18, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600, color: C.espresso, lineHeight: 1.1 }}>

                    ${(t.minOrderUsd / 1000).toFixed(0)}K

                  </div>

                </div>

              </div>

              <div className="px-5 pb-3">

                <div style={{ fontSize: 11.5, color: C.cocoa, padding: '6px 10px', background: accent.bg, color: accent.fg, borderRadius: 6, fontWeight: 600 }}>

                  {t.paymentTerms} payment terms

                </div>

              </div>

              <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: C.taupe, background: C.sand }}>

                <Btn variant="outline" size="sm" icon={Edit2} onClick={() => setEditingTier({ ...t })}>

                  Edit tier

                </Btn>

              </div>

            </div>

          );

        })}

      </div>

      <div className="mt-6 px-4 py-3" style={{ background: C.sand, borderRadius: 8 }}>

        <div className="flex items-start gap-2.5">

          <AlertCircle size={14} style={{ color: C.cocoa, marginTop: 2 }} strokeWidth={2.25} />

          <div style={{ fontSize: 12, color: C.cocoa, lineHeight: 1.55 }}>

            <span style={{ fontWeight: 700 }}>Tier assignment vs. tier definition.</span> Edit a user's tier from the Users tab. This page edits what each tier <em>means</em> - discount percentage, minimum order, payment terms.

          </div>

        </div>

      </div>

      {editingTier && (

        <TierEditDrawer tier={editingTier}

          onSave={(patch) => { updateTier(editingTier.id, patch); setEditingTier(null); }}

          onClose={() => setEditingTier(null)} />

      )}

    </div>

  );

}

function TierEditDrawer({ tier, onSave, onClose }) {

  const [form, setForm] = useState(tier);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (

    <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(46,38,34,0.55)' }} onClick={onClose}>

      <div className="absolute right-0 top-0 bottom-0 overflow-y-auto"

        style={{ width: 480, background: C.cream, borderLeft: `1px solid ${C.taupe}`, boxShadow: '-8px 0 24px rgba(46,38,34,0.14)' }}

        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"

          style={{ background: C.cream, borderBottom: `1px solid ${C.taupe}` }}>

          <div>

            <Eyebrow color="cocoa">Edit tier</Eyebrow>

            <div className="mt-1" style={{ fontSize: 18, fontFamily: FONT_STACK, fontWeight: 300, color: C.espresso }}>

              {form.name}

            </div>

          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-white"><X size={18} /></button>

        </div>

        <div className="p-5 space-y-4">

          <SignupField label="Tier name" required value={form.name} onChange={v => update('name', v)} />

          <SignupField label="Tier label" required value={form.label} onChange={v => update('label', v)} placeholder="e.g. Volume reseller" />

          <div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

              Description

            </div>

            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}

              className="w-full px-3 py-2.5 outline-none transition-all"

              style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa, lineHeight: 1.5 }}

              onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

              onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Discount % <span style={{ color: C.red }}>*</span>

              </div>

              <div className="relative">

                <input type="number" value={form.discountPct} onChange={e => update('discountPct', parseFloat(e.target.value) || 0)}

                  min={0} max={50} step={0.5}

                  className="w-full pl-3 pr-9 py-2.5 outline-none transition-all"

                  style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa, fontWeight: 600 }}

                  onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                  onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.stone }} strokeWidth={2.25} />

              </div>

            </div>

            <div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

                Min order USD

              </div>

              <div className="relative">

                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.stone, fontSize: 13 }}>$</span>

                <input type="number" value={form.minOrderUsd} onChange={e => update('minOrderUsd', parseInt(e.target.value) || 0)}

                  min={0} step={1000}

                  className="w-full pl-7 pr-3 py-2.5 outline-none transition-all"

                  style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 14, borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace', color: C.cocoa, fontWeight: 600 }}

                  onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}26`; }}

                  onBlur={e => { e.target.style.borderColor = C.taupe; e.target.style.boxShadow = 'none'; }} />

              </div>

            </div>

          </div>

          <div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

              Payment terms

            </div>

            <select value={form.paymentTerms} onChange={e => update('paymentTerms', e.target.value)}

              className="w-full px-3 py-2.5 outline-none"

              style={{ background: C.white, border: `1px solid ${C.taupe}`, fontSize: 13, borderRadius: 8, fontFamily: FONT_STACK, color: C.cocoa }}>

              <option value="Prepaid">Prepaid</option>

              <option value="Net-15">Net-15</option>

              <option value="Net-30">Net-30</option>

              <option value="Net-45">Net-45</option>

              <option value="Net-60">Net-60</option>

            </select>

          </div>

          <div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 6 }}>

              Tier color

            </div>

            <div className="grid grid-cols-3 gap-2">

              {[

                { id: 'stone', label: 'Stone', color: C.stone },

                { id: 'teal', label: 'Teal', color: C.teal },

                { id: 'olive', label: 'Olive', color: C.olive },

              ].map(c => (

                <button key={c.id} onClick={() => update('color', c.id)}

                  style={{

                    padding: '10px',

                    background: form.color === c.id ? c.color + '22' : C.white,

                    border: `1px solid ${form.color === c.id ? c.color : C.taupe}`,

                    borderRadius: 8,

                    display: 'flex', alignItems: 'center', gap: 8,

                  }}>

                  <span style={{ width: 14, height: 14, borderRadius: 999, background: c.color }} />

                  <span style={{ fontSize: 12, fontWeight: form.color === c.id ? 700 : 500, color: C.espresso }}>{c.label}</span>

                </button>

              ))}

            </div>

          </div>

        </div>

        <div className="sticky bottom-0 px-5 py-4 flex items-center justify-end gap-2 border-t" style={{ background: C.sand, borderColor: C.taupe }}>

          <Btn variant="outline" onClick={onClose}>Cancel</Btn>

          <Btn variant="primary" icon={Save} onClick={() => onSave(form)}>Save tier</Btn>

        </div>

      </div>

    </div>

  );

}

function AdminStat({ label, value, accent, alert }) {

  return (

    <div className="px-4 py-3" style={{

      background: C.white,

      border: `1px solid ${alert ? C.orange : C.taupe}`,

      borderRadius: 10,

      borderLeft: `3px solid ${accent}`,

      boxShadow: alert ? `0 0 0 1px ${C.orange}33` : 'none',

    }}>

      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.stone, marginBottom: 2 }}>{label}</div>

      <div style={{ fontSize: 24, fontWeight: 300, fontFamily: FONT_STACK, color: C.espresso, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>

    </div>

  );

}

function AdminFilterPills({ label, value, onChange, options }) {

  return (

    <div className="flex items-center gap-1.5">

      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.stone, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>{label}</span>

      <div className="flex items-center p-0.5" style={{ background: C.sand, border: `1px solid ${C.taupe}`, borderRadius: 999 }}>

        {options.map(opt => (

          <button key={opt.id} onClick={() => onChange(opt.id)}

            className="transition-all"

            style={{

              padding: '4px 10px',

              fontSize: 11.5,

              fontWeight: value === opt.id ? 700 : 500,

              color: value === opt.id ? C.espresso : C.stone,

              background: value === opt.id ? C.white : 'transparent',

              borderRadius: 999,

              boxShadow: value === opt.id ? '0 1px 2px rgba(46,38,34,0.06)' : 'none',

            }}>{opt.label}</button>

        ))}

      </div>

    </div>

  );

}

// ============================================================================

// TOP-LEVEL APP - auth router + state container

// ============================================================================

export default function App() {

  const [view, setView] = useState('login'); // 'login' | 'signup' | 'app' | 'admin'

  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState(SEED_USERS);

  const [tiers, setTiers] = useState(SEED_TIERS);

  const [inventoryReady, setInventoryReady] = useState(false);

  const [inventoryError, setInventoryError] = useState(null);

  // Load inventory data on mount

  useEffect(() => {

    fetch('/inventory.json')

      .then(res => {

        if (!res.ok) throw new Error('Failed to load inventory: ' + res.status);

        return res.json();

      })

      .then(data => {

        hydrateInventory(data);

        setInventoryReady(true);

      })

      .catch(err => {

        console.error('Inventory load error:', err);

        setInventoryError(err.message);

        setInventoryReady(true);

      });

  }, []);

  const handleLogin = (user) => {

    setCurrentUser(user);

    setView('app');

  };

  const handleSignup = (form) => {

    const newUser = {

      id: 'u-' + Date.now().toString(36),

      email: form.email,

      password: form.password,

      firstName: form.firstName,

      lastName: form.lastName,

      role: 'reseller',

      company: form.company,

      tier: 'tier1',

      status: 'pending',

      createdAt: new Date().toISOString().slice(0, 10),

    };

    setUsers(us => [...us, newUser]);

  };

  const handleLogout = () => {

    setCurrentUser(null);

    setView('login');

  };

  if (!inventoryReady) {

    return (

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1E1915', fontFamily: FONT_STACK }}>

        <div style={{ fontSize: 28, fontWeight: 700, color: '#EFE9DA', marginBottom: 12 }}>reLink Wholesale</div>

        <div style={{ fontSize: 14, color: '#A89F96' }}>Loading inventory data...</div>

        <div style={{ marginTop: 24, width: 200, height: 3, background: '#3a3026', borderRadius: 2, overflow: 'hidden' }}>

          <div style={{ width: '60%', height: '100%', background: '#0598A6', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />

        </div>

        {inventoryError && <div style={{ marginTop: 16, color: '#F38637', fontSize: 13 }}>{inventoryError}</div>}

      </div>

    );

  }

  if (view === 'login') {

    return <LoginScreen users={users} onLogin={handleLogin} onSwitchToSignup={() => setView('signup')} />;

  }

  if (view === 'signup') {

    return <SignupScreen users={users} onSignup={handleSignup} onSwitchToLogin={() => setView('login')} />;

  }

  if (view === 'admin') {

    return <AdminPortal currentUser={currentUser} users={users} setUsers={setUsers}

      tiers={tiers} setTiers={setTiers}

      onExit={() => setView('app')}

      onLogout={handleLogout} />;

  }

  // 'app' view

  return <WholesaleApp currentUser={currentUser} users={users} tiers={tiers}

    onLogout={handleLogout}

    onOpenAdmin={() => setView('admin')} />;

}