import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #03080F;
      --bg2:       #060F1C;
      --surface:   #0A1628;
      --glass:     rgba(10,22,40,0.75);
      --border:    rgba(0,200,255,0.15);
      --accent:    #00C8FF;
      --accent2:   #0076FF;
      --gold:      #F5C518;
      --red:       #FF3D5A;
      --green:     #00E676;
      --text:      #E8F4FC;
      --muted:     #6B8BA4;
      --card-glow: 0 0 30px rgba(0,200,255,0.08);
    }

    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 3px; }

    .cinzel { font-family: 'Cinzel', serif; }
    .mono   { font-family: 'Share Tech Mono', monospace; }

    /* OCEAN BACKGROUND */
    .ocean-bg {
      background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,120,255,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,200,255,0.07) 0%, transparent 50%),
        radial-gradient(ellipse 60% 50% at 20% 100%, rgba(0,40,120,0.25) 0%, transparent 60%),
        var(--bg);
    }

    /* GLASS CARD */
    .glass {
      background: var(--glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 16px;
    }

    /* GLOW BUTTON */
    .btn-primary {
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      border: none; border-radius: 8px; color: #fff;
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 14px; letter-spacing: 1px; text-transform: uppercase;
      padding: 10px 22px; cursor: pointer;
      box-shadow: 0 0 20px rgba(0,200,255,0.35);
      transition: all 0.2s ease; white-space: nowrap;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 35px rgba(0,200,255,0.6); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent; border: 1px solid var(--border);
      border-radius: 8px; color: var(--muted); cursor: pointer;
      font-family: 'Rajdhani', sans-serif; font-weight: 600;
      font-size: 13px; letter-spacing: 1px; text-transform: uppercase;
      padding: 9px 20px; transition: all 0.2s ease;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-ghost.active { border-color: var(--accent); color: var(--accent); background: rgba(0,200,255,0.08); }

    /* INPUT */
    .input-field {
      background: rgba(6,15,28,0.9); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-family: 'Rajdhani', sans-serif;
      font-size: 15px; padding: 12px 16px; width: 100%;
      transition: border-color 0.2s ease; outline: none;
    }
    .input-field:focus { border-color: var(--accent); box-shadow: 0 0 15px rgba(0,200,255,0.15); }
    .input-field::placeholder { color: var(--muted); }

    /* CARD */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      transition: all 0.2s ease;
      overflow: hidden;
    }
    .card:hover { border-color: rgba(0,200,255,0.35); box-shadow: var(--card-glow); transform: translateY(-2px); }

    /* TIER COLORS */
    .tier-s { background: linear-gradient(135deg,#ff4b6e,#ff8c42); }
    .tier-a { background: linear-gradient(135deg,#ff8c42,#f5c518); }
    .tier-b { background: linear-gradient(135deg,#4caf50,#00c8ff); }
    .tier-c { background: linear-gradient(135deg,#0076ff,#7c4dff); }
    .tier-d { background: linear-gradient(135deg,#455a64,#607d8b); }

    /* ANIMATIONS */
    @keyframes fadeInUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse-glow { 0%,100% { box-shadow:0 0 20px rgba(0,200,255,0.3); } 50% { box-shadow:0 0 45px rgba(0,200,255,0.7); } }
    @keyframes float      { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
    @keyframes shimmer    { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes orbit      { from { transform:rotate(0deg) translateX(120px) rotate(0deg); } to { transform:rotate(360deg) translateX(120px) rotate(-360deg); } }
    @keyframes wave       { 0%,100% { transform:scaleY(1); } 50% { transform:scaleY(1.4); } }
    @keyframes spin       { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes typing     { 0%,100% { opacity:1; } 50% { opacity:0; } }

    .anim-fade-up { animation: fadeInUp 0.6s ease forwards; }
    .anim-fade    { animation: fadeIn 0.4s ease forwards; }
    .anim-float   { animation: float 4s ease-in-out infinite; }
    .anim-pulse   { animation: pulse-glow 3s ease infinite; }

    /* CHAT BUBBLES */
    .bubble-user {
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      border-radius: 18px 18px 4px 18px; padding: 12px 16px;
      max-width: 75%; margin-left: auto; font-size: 15px; line-height: 1.6;
    }
    .bubble-ai {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px 18px 18px 4px; padding: 14px 18px;
      max-width: 85%; font-size: 15px; line-height: 1.7;
      white-space: pre-wrap;
    }
    .bubble-ai strong { color: var(--accent); }

    /* LOADING DOTS */
    .dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent); animation: wave 1s ease infinite; }
    .dot:nth-child(2) { animation-delay:.15s; }
    .dot:nth-child(3) { animation-delay:.3s; }

    /* NAVBAR */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      background: rgba(3,8,15,0.85);
      border-bottom: 1px solid var(--border);
      padding: 0 24px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }

    /* HERO */
    .hero-grid {
      display: grid;
      background-image:
        linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* TAG */
    .tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.25);
      border-radius: 999px; padding: 4px 12px;
      font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* STAT BAR */
    .stat-fill { height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--accent2), var(--accent)); transition: width 1s ease; }

    /* SCROLLABLE CONTENT */
    .content-area {
      padding-top: 64px; min-height: 100vh;
    }

    /* GRID LAYOUTS */
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }

    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
      .hide-mobile { display: none; }
    }
    @media (max-width: 480px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }

    /* SECTION */
    .section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }

    /* RARITY BADGES */
    .rarity-mythical { color:#ff4b6e; text-shadow:0 0 8px rgba(255,75,110,0.6); }
    .rarity-legendary { color:#f5c518; text-shadow:0 0 8px rgba(245,197,24,0.6); }
    .rarity-rare      { color:#00c8ff; text-shadow:0 0 8px rgba(0,200,255,0.6); }
    .rarity-uncommon  { color:#00e676; text-shadow:0 0 8px rgba(0,230,118,0.5); }
    .rarity-common    { color:#78909c; }

    /* SEARCH HIGHLIGHT */
    .search-container { position: relative; }
    .search-container::after {
      content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
      width: 0; height: 2px; background: linear-gradient(90deg, var(--accent2), var(--accent));
      transition: width 0.3s ease; border-radius: 2px;
    }
    .search-container:focus-within::after { width: 100%; }

    /* PARTICLE CANVAS */
    canvas.particles { position: absolute; inset: 0; pointer-events: none; opacity: 0.4; }

    /* MOBILE NAV */
    .mobile-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
      background: rgba(3,8,15,0.95); border-top: 1px solid var(--border);
      display: none; padding: 8px 0 4px;
    }
    @media (max-width: 768px) {
      .mobile-nav { display: flex; justify-content: space-around; }
      .desktop-nav { display: none; }
      .content-area { padding-bottom: 72px; }
    }
  `}</style>
);

// ─── DATA ────────────────────────────────────────────────────────────────────
const FRUITS = [
  { id:1, name:"Leopard",   type:"Beast",   rarity:"mythical", tier:"S", pvp:10, pve:9,  price:"N/A",     img:"🐆", desc:"The rarest and most powerful beast fruit. Incredible mobility and AoE damage.", abilities:["Leopard Awakening","Claw Slash","Pounce","Frenzy"] },
  { id:2, name:"Dragon",    type:"Beast",   rarity:"mythical", tier:"S", pvp:9,  pve:10, price:"N/A",     img:"🐉", desc:"Massive transformation fruit. Best boss killer in the game.", abilities:["Dragon Breath","Talon Slash","Dragon Scale","Ancient Dragon"] },
  { id:3, name:"Dough",     type:"Paramecia",rarity:"legendary",tier:"S", pvp:10, pve:8,  price:"2,800,000",img:"🍩", desc:"Top-tier PvP fruit with excellent stuns and hitboxes.", abilities:["Dough Fist","Massive Dough","Torque Snail","Fermentation"] },
  { id:4, name:"Spirit",    type:"Natural", rarity:"legendary",tier:"S", pvp:9,  pve:9,  price:"3,400,000",img:"👻", desc:"Versatile S-tier with great ranged and close combat.", abilities:["Soul Guitar","Wrath","Astral Projection","Haunting"] },
  { id:5, name:"Venom",     type:"Paramecia",rarity:"legendary",tier:"S", pvp:8,  pve:9,  price:"3,000,000",img:"☠️", desc:"Excellent DoT damage and zone control for PvE.", abilities:["Venom Hunt","Venom Spit","Toxic Cloud","Cobra Strike"] },
  { id:6, name:"Kitsune",   type:"Beast",   rarity:"mythical", tier:"S", pvp:8,  pve:10, price:"N/A",     img:"🦊", desc:"New mythical fox fruit with incredible grinding capability.", abilities:["Fox Fire","Nine Tails","Illusion Dance","Fox Leap"] },
  { id:7, name:"Blizzard",  type:"Natural", rarity:"legendary",tier:"A", pvp:7,  pve:8,  price:"2,500,000",img:"❄️", desc:"Great AoE freezing abilities, excellent for clearing mobs.", abilities:["Snowball","Blizzard Storm","Ice Age","Arctic Blast"] },
  { id:8, name:"Shadow",    type:"Paramecia",rarity:"legendary",tier:"A", pvp:7,  pve:8,  price:"2,900,000",img:"🌑", desc:"Unique mechanics with multiple shadow moves. Solid A-tier.", abilities:["Shadow Clone","Umbra","Dark Vortex","Nightmare"] },
  { id:9, name:"Phoenix",   type:"Zoan",    rarity:"legendary",tier:"A", pvp:7,  pve:8,  price:"1,800,000",img:"🔥", desc:"Healing and blue fire combos. Excellent sustain.", abilities:["Blue Flames","Fly","Rebirth","Inferno"] },
  { id:10,name:"Light",     type:"Natural", rarity:"legendary",tier:"A", pvp:6,  pve:9,  price:"650,000",  img:"✨", desc:"Classic speed king. Amazing for traveling and grinding.", abilities:["Laser","Light Speed Kick","Reflection","Flash"] },
  { id:11,name:"Portal",    type:"Paramecia",rarity:"rare",     tier:"B", pvp:5,  pve:7,  price:"1,400,000",img:"🌀", desc:"Good utility and escape. Fun mechanics but limited damage.", abilities:["Portal Strike","Portal Warp","Dimension","Void"] },
  { id:12,name:"Buddha",    type:"Zoan",    rarity:"legendary",tier:"A", pvp:4,  pve:10, price:"1,500,000",img:"🧘", desc:"The ultimate grinding fruit. Massive hitbox in transformed state.", abilities:["Buddha Beam","Giant Transformation","Enlightened","Holy Light"] },
  { id:13,name:"Gravity",   type:"Paramecia",rarity:"legendary",tier:"B", pvp:6,  pve:7,  price:"2,500,000",img:"🌍", desc:"Interesting zoning but needs setup. Decent PvP with mastery.", abilities:["Gravity Push","Meteor","Black Hole","Gravity Shift"] },
  { id:14,name:"Rumble",    type:"Natural", rarity:"legendary",tier:"B", pvp:6,  pve:7,  price:"2,100,000",img:"⚡", desc:"Electric moves with great range, but lacks burst damage.", abilities:["Thor Elephant Gun","Thunderstorm","Lighting Leap","Eye of the Storm"] },
  { id:15,name:"Magma",     type:"Natural", rarity:"rare",     tier:"B", pvp:5,  pve:8,  price:"850,000",  img:"🌋", desc:"Solid PvE fruit. Magma floor shreds bosses.",           abilities:["Magma Fist","Magma Meteor","Floor Magma","Volcano"] },
];

const SWORDS = [
  { id:1, name:"Hallow Scythe",   rarity:"mythical", dmg:10, type:"Sword",  img:"⚔️",  desc:"Drops from Death King. Insane reach and L-click combo potential." },
  { id:2, name:"Cursed Dual Katana",rarity:"mythical",dmg:10, type:"Sword",  img:"⚔️",  desc:"Combination of Yama + Tushita. Best sword in the game overall." },
  { id:3, name:"Tushita",         rarity:"legendary",dmg:9,  type:"Katana", img:"🗡️",  desc:"Elite sword from the third sea. Extremely powerful moveset." },
  { id:4, name:"Yama",            rarity:"legendary",dmg:9,  type:"Katana", img:"🗡️",  desc:"Third sea boss drop. Required for CDK combination." },
  { id:5, name:"Dark Blade",      rarity:"legendary",dmg:8,  type:"Sword",  img:"⚔️",  desc:"Game-pass sword. Classic look with solid damage output." },
  { id:6, name:"Soul Cane",       rarity:"legendary",dmg:8,  type:"Cane",   img:"🪄",  desc:"Spirit-infused cane from Cursed Captain. Long range moves." },
  { id:7, name:"Shisui",          rarity:"rare",     dmg:7,  type:"Katana", img:"🗡️",  desc:"Sleek katana from the second sea. Good for combos." },
  { id:8, name:"Triple Katana",   rarity:"uncommon", dmg:6,  type:"Katana", img:"🗡️",  desc:"Classic triple slash. Great starter sword for new players." },
];

const BOSSES = [
  { id:1, name:"Rip_Indra",     sea:"Third Sea",  lvl:5000, reward:"Dark Fragment, Hallow Scythe",          img:"👿", hp:"huge" },
  { id:2, name:"Soul Reaper",   sea:"Third Sea",  lvl:5750, reward:"Hallow Scythe (low %)",                img:"💀", hp:"high" },
  { id:3, name:"Longma",        sea:"Third Sea",  lvl:5000, reward:"Dragon Trident, Pole V2",              img:"🐉", hp:"high" },
  { id:4, name:"God of Destroy",sea:"Second Sea", lvl:3000, reward:"Dark Coat, Gura Buddy",               img:"🔱", hp:"medium" },
  { id:5, name:"Sea Beast",     sea:"All Seas",   lvl:"Any",reward:"Sea Beast Drops",                     img:"🦑", hp:"varies" },
  { id:6, name:"Darkbeard",     sea:"Second Sea", lvl:1000, reward:"Dark Fragment",                       img:"🧔", hp:"medium" },
  { id:7, name:"Cake Prince",   sea:"Second Sea", lvl:1500, reward:"Saber, Canvander",                    img:"🎂", hp:"medium" },
  { id:8, name:"King Legacy",   sea:"Third Sea",  lvl:4800, reward:"Tushita, 3x EXP",                    img:"👑", hp:"high" },
];

const FIGHTING_STYLES = [
  { id:1, name:"Death Step",     rarity:"legendary",img:"💀", desc:"Mastered form of Dark Step. Incredible damage and combos." },
  { id:2, name:"Godhuman",       rarity:"mythical", img:"✊", desc:"Ultimate fighting style combining all 5 styles. Best in game." },
  { id:3, name:"Superhuman",     rarity:"rare",     img:"💪", desc:"Classic Superhuman. Strong reliable moves, easy to master." },
  { id:4, name:"Sharkman Karate",rarity:"legendary",img:"🦈", desc:"Water-based style. Amazing AoE and ranged attacks." },
  { id:5, name:"Electric Claw",  rarity:"legendary",img:"⚡", desc:"Fast electric combos. Excellent for PvP burst damage." },
  { id:6, name:"Dragon Talon",   rarity:"legendary",img:"🐲", desc:"Dragon-inspired kicks with fire. High damage ceiling." },
];

const MAPS = [
  { id:1, sea:"First Sea",  name:"Starter Island",    lvl:"1-30",   img:"🏝️", desc:"Tutorial island. Learn the basics here." },
  { id:2, sea:"First Sea",  name:"Marine Fortress",   lvl:"30-70",  img:"⚓", desc:"First real challenge. Marine NPCs." },
  { id:3, sea:"First Sea",  name:"Jungle",            lvl:"70-100", img:"🌴", desc:"Hidden fruit spawns. Beginner grinding zone." },
  { id:4, sea:"Second Sea", name:"Kingdom of Rose",   lvl:"700-900",img:"🌹", desc:"Hub island of the Second Sea. Many NPCs." },
  { id:5, sea:"Second Sea", name:"Green Zone",        lvl:"875-925",img:"🌿", desc:"Great for leveling from 875-925." },
  { id:6, sea:"Second Sea", name:"Snow Mountain",     lvl:"925-975",img:"🗻", desc:"Snow Raiders and yetis. Cold but valuable." },
  { id:7, sea:"Third Sea",  name:"Port Town",         lvl:"1500+",  img:"🏰", desc:"First stop in the Third Sea." },
  { id:8, sea:"Third Sea",  name:"Floating Turtle",   lvl:"1875+",  img:"🐢", desc:"Giant turtle island. Amazing for late game." },
  { id:9, sea:"Third Sea",  name:"Sea of Treats",     lvl:"2100+",  img:"🍭", desc:"Cake theme. Best XP zones in third sea." },
];

const NEWS = [
  { id:1, date:"Mar 2025", title:"Update 21 — Kitsune Fruit Released",  tag:"Update",  desc:"New mythical beast fruit Kitsune added with 4 unique moves. New island: Fox Grove. Balance patches for Dragon and Dough." },
  { id:2, date:"Feb 2025", title:"Valentine's Event 2025",              tag:"Event",   desc:"Limited-time Valentine items, exclusive accessories and title. Sea beast event giving double rewards." },
  { id:3, date:"Jan 2025", title:"Balance Patch 20.2 — Tier Shifts",   tag:"Patch",   desc:"Leopard nerfed, Spirit buffed. Godhuman now requires higher stats. Death Step combos adjusted." },
  { id:4, date:"Dec 2024", title:"Update 20 — Sea of Treats Expansion", tag:"Update",  desc:"Third Sea expansion with new grinding zones. Cake Island bosses. New boss: Cursed Captain added." },
  { id:5, date:"Nov 2024", title:"Halloween 2024 Event",                tag:"Event",   desc:"Reaper's Night limited-time mode. Hallow Scythe permanent addition. Ghost NPC questlines." },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

// Particle Background
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${p.alpha})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particles" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />;
}

// Stat Bar
function StatBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? "#00E676" : pct >= 60 ? "#F5C518" : pct >= 40 ? "#FF8C42" : "#FF3D5A";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4, color:"var(--muted)" }}>
        <span>{label}</span><span style={{ color, fontWeight:700 }}>{value}/{max}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg, #0076FF, ${color})`, borderRadius:3, transition:"width 1s ease" }} />
      </div>
    </div>
  );
}

// Rarity Badge
function RarityBadge({ rarity }) {
  const colors = { mythical:"#FF4B6E", legendary:"#F5C518", rare:"#00C8FF", uncommon:"#00E676", common:"#78909C" };
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color: colors[rarity] || "#78909C", padding:"2px 8px", border:`1px solid ${colors[rarity] || "#78909C"}40`, borderRadius:99 }}>
      {rarity}
    </span>
  );
}

// Tier Badge
function TierBadge({ tier }) {
  const classes = { S:"tier-s", A:"tier-a", B:"tier-b", C:"tier-c", D:"tier-d" };
  return (
    <div className={classes[tier] || "tier-d"} style={{ width:32, height:32, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:16, flexShrink:0 }}>
      {tier}
    </div>
  );
}

// Loading Spinner
function Spinner() {
  return (
    <div style={{ display:"flex", gap:6, padding:8 }}>
      <div className="dot" /><div className="dot" /><div className="dot" />
    </div>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

// ── HOME PAGE ──
function HomePage({ onNav }) {
  const [searchQ, setSearchQ] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fruits");

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setLoading(true); setAiResult("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are an expert Blox Fruits game assistant. Provide clear, detailed, and helpful answers about the Roblox game Blox Fruits. Use emojis where appropriate. Format answers with line breaks for readability.",
          messages:[{ role:"user", content: searchQ }]
        })
      });
      const data = await res.json();
      setAiResult(data.content?.[0]?.text || "No response.");
    } catch { setAiResult("⚠️ Could not connect to AI. Please try again."); }
    setLoading(false);
  };

  const trending = ["Best fruit for PvP 2025","How to get Leopard fruit","Dragon vs Dough comparison","Third Sea progression guide","Best grinding spot lvl 1500","How to unlock Godhuman","Blox Fruits tier list","Hallow Scythe drop rate"];

  const featuredFruits = FRUITS.filter(f => f.tier === "S").slice(0,4);

  return (
    <div>
      {/* HERO */}
      <div className="ocean-bg hero-grid" style={{ minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px 60px", position:"relative", overflow:"hidden" }}>
        <ParticleCanvas />
        {/* Glow orbs */}
        <div style={{ position:"absolute", top:"20%", left:"10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,120,255,0.15) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"15%", right:"8%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", textAlign:"center", maxWidth:760, zIndex:1 }}>
          <div className="tag" style={{ marginBottom:20 }}>⚡ AI-Powered Encyclopedia</div>
          <h1 className="cinzel" style={{ fontSize:"clamp(42px,7vw,90px)", fontWeight:900, lineHeight:1.05, marginBottom:16, letterSpacing:-1 }}>
            BLOX
            <span style={{ display:"block", background:"linear-gradient(135deg, #00C8FF, #0076FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>FRUITS</span>
            <span style={{ fontSize:"clamp(18px,3vw,32px)", color:"var(--muted)", fontWeight:400, letterSpacing:6 }}>INTELLIGENCE</span>
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,19px)", color:"var(--muted)", marginBottom:40, lineHeight:1.7, maxWidth:560, margin:"0 auto 40px" }}>
            Your AI-powered guide to Blox Fruits. Ask anything, get instant strategies, tier lists, build recommendations and real-time insights.
          </p>

          {/* SEARCH BAR */}
          <div className="glass" style={{ padding:6, borderRadius:14, maxWidth:660, margin:"0 auto 28px", display:"flex", gap:8 }}>
            <input className="input-field" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder='Try: "Best fruit for grinding" or "How to beat Rip_Indra"'
              style={{ background:"transparent", border:"none", flex:1, fontSize:16 }} />
            <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ borderRadius:10, padding:"12px 24px" }}>
              {loading ? "..." : "🔍 Ask AI"}
            </button>
          </div>

          {/* TRENDING */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            {trending.slice(0,6).map(t => (
              <button key={t} onClick={()=>{setSearchQ(t);}} style={{ background:"rgba(0,200,255,0.07)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:999, color:"var(--muted)", fontSize:12, padding:"6px 14px", cursor:"pointer", transition:"all 0.2s", fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}
                onMouseEnter={e=>{e.currentTarget.style.color="var(--accent)";e.currentTarget.style.borderColor="var(--accent)";}}
                onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="rgba(0,200,255,0.2)";}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* AI RESULT */}
        {(loading || aiResult) && (
          <div className="glass anim-fade" style={{ maxWidth:740, margin:"40px auto 0", padding:28, textAlign:"left", position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#0076FF,#00C8FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
              <span className="cinzel" style={{ color:"var(--accent)", fontWeight:700, fontSize:14, letterSpacing:1 }}>AI RESPONSE</span>
            </div>
            {loading ? <Spinner /> : <div style={{ fontSize:15, lineHeight:1.8, color:"var(--text)", whiteSpace:"pre-wrap" }}>{aiResult}</div>}
          </div>
        )}
      </div>

      {/* FEATURED FRUITS */}
      <div className="section">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <h2 className="cinzel" style={{ fontSize:28, fontWeight:700 }}>
            <span style={{ color:"var(--accent)" }}>S-TIER</span> FRUITS
          </h2>
          <button className="btn-ghost" onClick={()=>onNav("database")}>View All →</button>
        </div>
        <div className="grid-4">
          {featuredFruits.map(f => (
            <div key={f.id} className="card" style={{ padding:20, cursor:"pointer" }} onClick={()=>onNav("database")}>
              <div style={{ fontSize:42, marginBottom:12, textAlign:"center" }}>{f.img}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <span className="cinzel" style={{ fontSize:16, fontWeight:700 }}>{f.name}</span>
                <TierBadge tier={f.tier} />
              </div>
              <RarityBadge rarity={f.rarity} />
              <div style={{ marginTop:12 }}>
                <StatBar label="PvP" value={f.pvp} />
                <StatBar label="PvE" value={f.pve} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK STATS */}
      <div style={{ padding:"40px 24px", background:"var(--surface)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:32, textAlign:"center" }}>
          {[["🍈","150+","Total Fruits"],["⚔️","50+","Swords"],["👾","80+","Bosses"],["🗺️","3","Seas"],["⚡","6","Fighting Styles"],["👥","10M+","Active Players"]].map(([icon,val,label])=>(
            <div key={label}>
              <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
              <div className="cinzel" style={{ fontSize:32, fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginTop:4, letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWS PREVIEW */}
      <div className="section">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <h2 className="cinzel" style={{ fontSize:28, fontWeight:700 }}>Latest <span style={{color:"var(--accent)"}}>Updates</span></h2>
          <button className="btn-ghost" onClick={()=>onNav("news")}>All News →</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {NEWS.slice(0,3).map(n=>(
            <div key={n.id} className="glass" style={{ padding:"18px 22px", display:"flex", gap:16, alignItems:"flex-start" }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase",
                color: n.tag==="Update"?"#00E676":n.tag==="Patch"?"#F5C518":"#00C8FF",
                padding:"3px 10px", border:`1px solid currentColor`, borderRadius:99, flexShrink:0, marginTop:2 }}>
                {n.tag}
              </span>
              <div>
                <div className="cinzel" style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{n.title}</div>
                <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6 }}>{n.desc}</div>
              </div>
              <span style={{ fontSize:12, color:"var(--muted)", flexShrink:0, marginLeft:"auto" }}>{n.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CHAT PAGE ──
function ChatPage() {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"⚓ Ahoy! I'm your Blox Fruits AI assistant. Ask me anything about fruits, builds, strategies, tier lists, bosses — I've got you covered!\n\n**Try asking:**\n• What's the best fruit for PvP?\n• How do I level up fast in Third Sea?\n• Compare Dragon vs Dough fruit\n• What fighting style should I use?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content: input };
    setMessages(prev=>[...prev, userMsg]);
    setInput(""); setLoading(true);
    try {
      const history = [...messages, userMsg].map(m=>({ role:m.role, content:m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are an expert Blox Fruits game AI assistant with deep knowledge of all fruits, swords, fighting styles, bosses, maps, builds, combos, and meta strategies. Be helpful, accurate, and enthusiastic. Use relevant emojis. Format responses clearly with line breaks. Keep responses focused on Blox Fruits gameplay.",
          messages: history
        })
      });
      const data = await res.json();
      setMessages(prev=>[...prev,{ role:"assistant", content: data.content?.[0]?.text||"Sorry, no response." }]);
    } catch { setMessages(prev=>[...prev,{ role:"assistant", content:"⚠️ Connection error. Please try again." }]); }
    setLoading(false);
  };

  const analyzeYoutube = async () => {
    if (!youtubeUrl.trim()) return;
    setYtLoading(true);
    const userMsg = { role:"user", content:`Please analyze this YouTube video about Blox Fruits and provide:\n1. Key strategies mentioned\n2. Tips and tricks\n3. Important timestamps (if known)\n4. Overall recommendation\n\nVideo URL: ${youtubeUrl}` };
    setMessages(prev=>[...prev, userMsg]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are a Blox Fruits expert. When given a YouTube URL, analyze based on the URL slug/title and provide comprehensive Blox Fruits tips, strategies and insights that would likely be in such a video. Be detailed and helpful.",
          messages:[{ role:"user", content: userMsg.content }]
        })
      });
      const data = await res.json();
      setMessages(prev=>[...prev,{ role:"assistant", content: data.content?.[0]?.text||"Could not analyze." }]);
    } catch { setMessages(prev=>[...prev,{ role:"assistant", content:"⚠️ Analysis failed." }]); }
    setYoutubeUrl(""); setYtLoading(false);
  };

  const suggestions = ["Best PvP build for beginners","How to farm Devil Fruits fast","Strongest sword in the game","Best grinding spots per level","How to unlock Second Sea","Dragon awakening guide"];

  return (
    <div style={{ display:"flex", height:"calc(100vh - 64px)", overflow:"hidden" }}>
      {/* SIDEBAR */}
      <div className="hide-mobile" style={{ width:260, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", padding:20, gap:16, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Quick Questions</div>
          {suggestions.map(s=>(
            <button key={s} onClick={()=>{ setInput(s); }}
              style={{ display:"block", width:"100%", textAlign:"left", background:"transparent", border:"1px solid var(--border)", borderRadius:8, color:"var(--muted)", padding:"9px 12px", marginBottom:8, cursor:"pointer", fontSize:13, fontFamily:"'Rajdhani',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--text)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";}}>
              {s}
            </button>
          ))}
        </div>
        {/* YouTube Analyzer */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:16 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>📺 YouTube Analyzer</div>
          <input className="input-field" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)} placeholder="Paste YouTube URL..." style={{ fontSize:13, padding:"10px 12px", marginBottom:8 }} />
          <button className="btn-primary" style={{ width:"100%", padding:"10px 0", fontSize:13 }} onClick={analyzeYoutube} disabled={ytLoading}>
            {ytLoading ? "Analyzing..." : "🎬 Analyze Video"}
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:16 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: m.role==="user"?"flex-end":"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#0076FF,#00C8FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🤖</div>
                  <span style={{ fontSize:12, color:"var(--muted)", fontWeight:600 }}>Blox AI</span>
                </div>
              )}
              <div className={m.role==="user" ? "bubble-user" : "bubble-ai"}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#0076FF,#00C8FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🤖</div>
              <div className="bubble-ai"><Spinner /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)", background:"var(--bg)" }}>
          <div style={{ display:"flex", gap:10 }}>
            <input className="input-field" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
              placeholder="Ask about fruits, builds, strategies, bosses..." style={{ flex:1 }} />
            <button className="btn-primary" onClick={send} disabled={loading||!input.trim()}>Send ↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DATABASE PAGE ──
function DatabasePage() {
  const [tab, setTab] = useState("fruits");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const tabs = [["fruits","🍈 Fruits"],["swords","⚔️ Swords"],["fighting","🥊 Fighting Styles"],["bosses","👾 Bosses"],["maps","🗺️ Maps"]];
  const fruitFilters = [["all","All"],["Beast","Beast"],["Paramecia","Paramecia"],["Natural","Natural"],["Zoan","Zoan"]];

  const filteredFruits = FRUITS.filter(f =>
    (filter==="all"||f.type===filter) &&
    (search===""||f.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <h2 className="cinzel" style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Game <span style={{color:"var(--accent)"}}>Database</span></h2>
      <p style={{ color:"var(--muted)", marginBottom:28 }}>Complete reference for all Blox Fruits items, weapons, and locations.</p>

      {/* TABS */}
      <div style={{ display:"flex", gap:8, marginBottom:28, flexWrap:"wrap" }}>
        {tabs.map(([id,label])=>(
          <button key={id} className={`btn-ghost ${tab===id?"active":""}`} onClick={()=>{setTab(id);setSelected(null);}}>
            {label}
          </button>
        ))}
      </div>

      {/* FRUITS */}
      {tab==="fruits" && (
        <div>
          <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
            <input className="input-field" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search fruits..." style={{ maxWidth:220 }} />
            {fruitFilters.map(([id,label])=>(
              <button key={id} className={`btn-ghost ${filter===id?"active":""}`} onClick={()=>setFilter(id)} style={{ fontSize:13 }}>{label}</button>
            ))}
          </div>

          {selected ? (
            <div className="anim-fade">
              <button className="btn-ghost" onClick={()=>setSelected(null)} style={{ marginBottom:20 }}>← Back</button>
              <div className="glass" style={{ padding:32 }}>
                <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  <div style={{ fontSize:80, lineHeight:1 }}>{selected.img}</div>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                      <h3 className="cinzel" style={{ fontSize:32, fontWeight:900 }}>{selected.name}</h3>
                      <TierBadge tier={selected.tier} /><RarityBadge rarity={selected.rarity} />
                    </div>
                    <p style={{ color:"var(--muted)", fontSize:15, lineHeight:1.7, marginBottom:20 }}>{selected.desc}</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                      <div>
                        <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Stats</div>
                        <StatBar label="PvP Power" value={selected.pvp} />
                        <StatBar label="PvE Power" value={selected.pve} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Info</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {[["Type",selected.type],["Price",selected.price],["Tier",selected.tier+"-Tier"]].map(([k,v])=>(
                            <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                              <span style={{ color:"var(--muted)" }}>{k}</span>
                              <span style={{ fontWeight:700, color:"var(--accent)" }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop:24 }}>
                      <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Abilities</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {selected.abilities.map(a=>(
                          <span key={a} className="tag" style={{ fontSize:13 }}>{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid-3">
              {filteredFruits.map(f=>(
                <div key={f.id} className="card" style={{ padding:18, cursor:"pointer" }} onClick={()=>setSelected(f)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <span style={{ fontSize:38 }}>{f.img}</span>
                    <TierBadge tier={f.tier} />
                  </div>
                  <div className="cinzel" style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{f.name}</div>
                  <div style={{ marginBottom:10 }}><RarityBadge rarity={f.rarity} /></div>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:12 }}>{f.type}</div>
                  <StatBar label="PvP" value={f.pvp} />
                  <StatBar label="PvE" value={f.pve} />
                  <div style={{ marginTop:10, fontSize:13, display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"var(--muted)" }}>Price</span>
                    <span style={{ color:"var(--gold)", fontWeight:700 }}>{f.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SWORDS */}
      {tab==="swords" && (
        <div className="grid-2">
          {SWORDS.map(s=>(
            <div key={s.id} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <span style={{ fontSize:40 }}>{s.img}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span className="cinzel" style={{ fontSize:18, fontWeight:700 }}>{s.name}</span>
                    <RarityBadge rarity={s.rarity} />
                  </div>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:10 }}>{s.type}</div>
                  <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6 }}>{s.desc}</p>
                  <StatBar label="Damage" value={s.dmg} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FIGHTING STYLES */}
      {tab==="fighting" && (
        <div className="grid-2">
          {FIGHTING_STYLES.map(fs=>(
            <div key={fs.id} className="card" style={{ padding:22 }}>
              <div style={{ fontSize:44, marginBottom:12 }}>{fs.img}</div>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                <span className="cinzel" style={{ fontSize:20, fontWeight:700 }}>{fs.name}</span>
                <RarityBadge rarity={fs.rarity} />
              </div>
              <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6 }}>{fs.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* BOSSES */}
      {tab==="bosses" && (
        <div className="grid-2">
          {BOSSES.map(b=>(
            <div key={b.id} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <span style={{ fontSize:36 }}>{b.img}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span className="cinzel" style={{ fontSize:17, fontWeight:700 }}>{b.name}</span>
                    <span style={{ fontSize:11, letterSpacing:1, color:"var(--accent)", textTransform:"uppercase", background:"rgba(0,200,255,0.1)", padding:"2px 10px", borderRadius:99 }}>{b.sea}</span>
                  </div>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>Lvl: <span style={{ color:"var(--gold)", fontWeight:700 }}>{b.lvl}</span></div>
                  <div style={{ fontSize:13 }}><span style={{ color:"var(--muted)" }}>Drops: </span><span style={{ color:"var(--green)" }}>{b.reward}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAPS */}
      {tab==="maps" && (
        <div>
          {["First Sea","Second Sea","Third Sea"].map(sea=>(
            <div key={sea} style={{ marginBottom:40 }}>
              <h3 className="cinzel" style={{ fontSize:22, fontWeight:700, marginBottom:18, color:"var(--accent)" }}>{sea}</h3>
              <div className="grid-3">
                {MAPS.filter(m=>m.sea===sea).map(m=>(
                  <div key={m.id} className="card" style={{ padding:18 }}>
                    <span style={{ fontSize:40, display:"block", marginBottom:12 }}>{m.img}</span>
                    <div className="cinzel" style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{m.name}</div>
                    <div style={{ fontSize:12, color:"var(--gold)", fontWeight:700, marginBottom:10 }}>Lvl {m.lvl}</div>
                    <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TIER LIST PAGE ──
function TierListPage() {
  const [mode, setMode] = useState("pvp");
  const [aiComment, setAiComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const getSortedFruits = () => {
    return [...FRUITS].sort((a,b) => {
      const valA = mode==="pvp" ? a.pvp : a.pve;
      const valB = mode==="pvp" ? b.pvp : b.pve;
      return valB - valA;
    });
  };

  const tierGroups = { S:[], A:[], B:[], C:[], D:[] };
  getSortedFruits().forEach(f => {
    const val = mode==="pvp" ? f.pvp : f.pve;
    if (val >= 9) tierGroups.S.push(f);
    else if (val >= 7) tierGroups.A.push(f);
    else if (val >= 5) tierGroups.B.push(f);
    else if (val >= 3) tierGroups.C.push(f);
    else tierGroups.D.push(f);
  });

  const getAiAnalysis = async () => {
    setAiLoading(true); setAiComment("");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:800,
        system:"You are a top-tier Blox Fruits competitive analyst. Provide expert tier list commentary.",
        messages:[{ role:"user", content:`Analyze the current Blox Fruits ${mode.toUpperCase()} meta. What fruits are dominating and why? What's overpowered? What should be nerfed? Keep it to 3-4 key points.` }]
      })
    });
    const data = await res.json();
    setAiComment(data.content?.[0]?.text || "No analysis.");
    setAiLoading(false);
  };

  const tierColors = { S:"#FF4B6E", A:"#FF8C42", B:"#00E676", C:"#0076FF", D:"#78909C" };
  const tierDesc = { S:"Dominant — Pick these for guaranteed wins", A:"Excellent — Reliable in most scenarios", B:"Solid — Good with the right build", C:"Average — Works but has better options", D:"Underperforming — Usually outclassed" };

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 className="cinzel" style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Fruit <span style={{color:"var(--accent)"}}>Tier List</span></h2>
          <p style={{ color:"var(--muted)" }}>AI-powered rankings updated for the current meta.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className={`btn-ghost ${mode==="pvp"?"active":""}`} onClick={()=>setMode("pvp")}>⚔️ PvP</button>
          <button className={`btn-ghost ${mode==="pve"?"active":""}`} onClick={()=>setMode("pve")}>🌊 PvE</button>
          <button className="btn-primary" onClick={getAiAnalysis} disabled={aiLoading}>{aiLoading?"Analyzing...":"🤖 AI Analysis"}</button>
        </div>
      </div>

      {(aiLoading || aiComment) && (
        <div className="glass anim-fade" style={{ padding:22, marginBottom:28 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:18 }}>🤖</span>
            <span className="cinzel" style={{ color:"var(--accent)", fontWeight:700, fontSize:13, letterSpacing:1 }}>META ANALYSIS</span>
          </div>
          {aiLoading ? <Spinner /> : <div style={{ fontSize:15, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiComment}</div>}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {Object.entries(tierGroups).map(([tier, fruits]) => (
          <div key={tier} style={{ display:"flex", gap:0, alignItems:"stretch", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)" }}>
            {/* Tier Label */}
            <div className={`tier-${tier.toLowerCase()}`} style={{ width:70, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 8px" }}>
              <div className="cinzel" style={{ fontSize:28, fontWeight:900, color:"#fff" }}>{tier}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", textAlign:"center", marginTop:4, lineHeight:1.3 }}>
                {mode==="pvp"?"PvP":"PvE"}
              </div>
            </div>
            {/* Fruits */}
            <div style={{ flex:1, background:"var(--surface)", padding:"12px 16px", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", minHeight:80 }}>
              {fruits.length === 0 ? (
                <span style={{ color:"var(--muted)", fontSize:13 }}>No fruits in this tier</span>
              ) : fruits.map(f => (
                <div key={f.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"8px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", minWidth:70, transition:"all 0.2s", cursor:"default" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=tierColors[tier]}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                  <span style={{ fontSize:24 }}>{f.img}</span>
                  <span className="cinzel" style={{ fontSize:12, fontWeight:700, color:"var(--text)", whiteSpace:"nowrap" }}>{f.name}</span>
                  <span style={{ fontSize:11, color: tierColors[tier], fontWeight:700 }}>{mode==="pvp"?f.pvp:f.pve}/10</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* LEGEND */}
      <div className="glass" style={{ padding:20, marginTop:24 }}>
        <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:14 }}>Legend</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:10 }}>
          {Object.entries(tierDesc).map(([t,d])=>(
            <div key={t} style={{ display:"flex", gap:10, alignItems:"center" }}>
              <TierBadge tier={t} />
              <span style={{ fontSize:13, color:"var(--muted)" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BUILD CREATOR PAGE ──
function BuildCreatorPage() {
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedSword, setSelectedSword] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [playstyle, setPlaystyle] = useState("pvp");
  const [level, setLevel] = useState("1-100");
  const [aiRec, setAiRec] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBuild = async () => {
    if (!selectedFruit && !selectedSword && !selectedStyle) return;
    setLoading(true); setAiRec("");
    const fruit = selectedFruit ? FRUITS.find(f=>f.id===selectedFruit)?.name : "Any";
    const sword = selectedSword ? SWORDS.find(s=>s.id===selectedSword)?.name : "Any";
    const style = selectedStyle ? FIGHTING_STYLES.find(s=>s.id===selectedStyle)?.name : "Any";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:900,
          system:"You are an elite Blox Fruits build theorist. Provide detailed, optimized build recommendations.",
          messages:[{ role:"user", content:`Create an optimized Blox Fruits build with these selections:\n- Fruit: ${fruit}\n- Sword: ${sword}\n- Fighting Style: ${style}\n- Playstyle: ${playstyle}\n- Level Range: ${level}\n\nProvide:\n1. Stat distribution (Melee/Defense/Sword/Gun/Fruit)\n2. Best combo sequence\n3. Synergy analysis\n4. Pros & Cons\n5. Tips for this build` }]
        })
      });
      const data = await res.json();
      setAiRec(data.content?.[0]?.text||"No recommendation.");
    } catch { setAiRec("⚠️ Failed to generate build."); }
    setLoading(false);
  };

  const topFruits = FRUITS.filter(f=>f.tier==="S"||f.tier==="A").slice(0,8);
  const topSwords = SWORDS.slice(0,6);

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <h2 className="cinzel" style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Build <span style={{color:"var(--accent)"}}>Creator</span></h2>
      <p style={{ color:"var(--muted)", marginBottom:32 }}>Select your gear and let AI generate the optimal build strategy.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* LEFT: SELECTIONS */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Playstyle */}
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Playstyle & Level</div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {["pvp","pve","hybrid"].map(p=>(
                <button key={p} className={`btn-ghost ${playstyle===p?"active":""}`} onClick={()=>setPlaystyle(p)} style={{ textTransform:"capitalize" }}>{p}</button>
              ))}
            </div>
            <select className="input-field" value={level} onChange={e=>setLevel(e.target.value)} style={{ cursor:"pointer" }}>
              {["1-100","100-300","300-700","700-1500","1500-2200","2200+"].map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Fruit Selection */}
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:14 }}>Select Fruit</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {topFruits.map(f=>(
                <button key={f.id} onClick={()=>setSelectedFruit(selectedFruit===f.id?null:f.id)}
                  style={{ background: selectedFruit===f.id?"rgba(0,200,255,0.15)":"rgba(255,255,255,0.03)", border:`1px solid ${selectedFruit===f.id?"var(--accent)":"var(--border)"}`, borderRadius:10, padding:"10px 6px", cursor:"pointer", textAlign:"center", transition:"all 0.2s" }}>
                  <div style={{ fontSize:26 }}>{f.img}</div>
                  <div style={{ fontSize:11, color: selectedFruit===f.id?"var(--accent)":"var(--muted)", fontWeight:700, marginTop:4 }}>{f.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sword */}
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:14 }}>Select Sword</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {topSwords.map(s=>(
                <button key={s.id} onClick={()=>setSelectedSword(selectedSword===s.id?null:s.id)}
                  style={{ display:"flex", alignItems:"center", gap:12, background: selectedSword===s.id?"rgba(0,200,255,0.1)":"transparent", border:`1px solid ${selectedSword===s.id?"var(--accent)":"var(--border)"}`, borderRadius:10, padding:"10px 14px", cursor:"pointer", transition:"all 0.2s", textAlign:"left" }}>
                  <span style={{ fontSize:22 }}>{s.img}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color: selectedSword===s.id?"var(--accent)":"var(--text)", fontFamily:"'Rajdhani',sans-serif" }}>{s.name}</div>
                    <div style={{ fontSize:11 }}><RarityBadge rarity={s.rarity} /></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fighting Style */}
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:14 }}>Select Fighting Style</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {FIGHTING_STYLES.map(fs=>(
                <button key={fs.id} onClick={()=>setSelectedStyle(selectedStyle===fs.id?null:fs.id)}
                  style={{ background: selectedStyle===fs.id?"rgba(0,200,255,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${selectedStyle===fs.id?"var(--accent)":"var(--border)"}`, borderRadius:10, padding:"12px", cursor:"pointer", textAlign:"center", transition:"all 0.2s" }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{fs.img}</div>
                  <div style={{ fontSize:12, fontWeight:700, color: selectedStyle===fs.id?"var(--accent)":"var(--muted)" }}>{fs.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary anim-pulse" onClick={generateBuild} disabled={loading||(!selectedFruit&&!selectedSword&&!selectedStyle)} style={{ padding:"14px 0", fontSize:16, letterSpacing:2 }}>
            {loading ? "⚙️ Generating Build..." : "🚀 Generate AI Build"}
          </button>
        </div>

        {/* RIGHT: AI RECOMMENDATION */}
        <div>
          <div className="glass" style={{ padding:24, height:"100%", minHeight:400 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0076FF,#00C8FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🤖</div>
              <div>
                <div className="cinzel" style={{ fontWeight:700, fontSize:16 }}>AI Build Recommendation</div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>Powered by Claude AI</div>
              </div>
            </div>

            {/* Current Selection Summary */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {selectedFruit && <span className="tag">{FRUITS.find(f=>f.id===selectedFruit)?.img} {FRUITS.find(f=>f.id===selectedFruit)?.name}</span>}
              {selectedSword && <span className="tag">⚔️ {SWORDS.find(s=>s.id===selectedSword)?.name}</span>}
              {selectedStyle && <span className="tag">{FIGHTING_STYLES.find(s=>s.id===selectedStyle)?.img} {FIGHTING_STYLES.find(s=>s.id===selectedStyle)?.name}</span>}
              {!selectedFruit && !selectedSword && !selectedStyle && <span style={{ color:"var(--muted)", fontSize:14 }}>Select items on the left to get started</span>}
            </div>

            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:60, gap:16 }}>
                <div style={{ width:48,height:48,border:"3px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
                <div style={{ color:"var(--muted)", fontSize:14 }}>Analyzing synergies...</div>
              </div>
            ) : aiRec ? (
              <div className="anim-fade" style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap", color:"var(--text)" }}>
                {aiRec}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:20, opacity:0.5 }}>
                <div style={{ fontSize:64 }}>⚗️</div>
                <div style={{ fontSize:16, color:"var(--muted)", textAlign:"center" }}>Select your gear and click<br/>Generate AI Build to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NEWS PAGE ──
function NewsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);

  const searchNews = async () => {
    if (!query.trim()) return;
    setLoading(true); setResults("");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:800,
        system:"You are a Blox Fruits news analyst. Provide information about recent updates, patches, events, and meta changes in Blox Fruits.",
        messages:[{ role:"user", content: query }]
      })
    });
    const data = await res.json();
    setResults(data.content?.[0]?.text||"No results.");
    setLoading(false);
  };

  const tagColors = { Update:"#00E676", Patch:"#F5C518", Event:"#00C8FF" };

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <h2 className="cinzel" style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>News & <span style={{color:"var(--accent)"}}>Updates</span></h2>
      <p style={{ color:"var(--muted)", marginBottom:28 }}>Stay current with the latest Blox Fruits updates, events, and patch notes.</p>

      {/* AI SEARCH */}
      <div className="glass" style={{ padding:24, marginBottom:32 }}>
        <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:14 }}>🔍 AI News Search</div>
        <div style={{ display:"flex", gap:10 }}>
          <input className="input-field" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchNews()} placeholder='e.g. "What changed in the latest update?" or "Dragon fruit nerf history"' style={{ flex:1 }} />
          <button className="btn-primary" onClick={searchNews} disabled={loading}>{loading?"...":"Search"}</button>
        </div>
        {(loading||results) && (
          <div style={{ marginTop:20 }}>
            {loading ? <Spinner /> : <div style={{ fontSize:15, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{results}</div>}
          </div>
        )}
      </div>

      {/* NEWS CARDS */}
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {NEWS.map(n=>(
          <div key={n.id} className="card" style={{ padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color: tagColors[n.tag]||"var(--accent)", padding:"4px 12px", border:`1px solid currentColor`, borderRadius:99 }}>
                  {n.tag}
                </span>
                <span style={{ fontSize:14, color:"var(--muted)" }}>{n.date}</span>
              </div>
            </div>
            <h3 className="cinzel" style={{ fontSize:20, fontWeight:700, marginBottom:10 }}>{n.title}</h3>
            <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pages = [
    { id:"home",     icon:"🏠", label:"Home"      },
    { id:"chat",     icon:"🤖", label:"AI Chat"   },
    { id:"database", icon:"📚", label:"Database"  },
    { id:"tierlist", icon:"🏆", label:"Tier List" },
    { id:"builder",  icon:"⚗️", label:"Builder"   },
    { id:"news",     icon:"📰", label:"News"      },
  ];

  const nav = (id) => { setPage(id); setMobileMenuOpen(false); window.scrollTo(0,0); };

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      <GlobalStyles />

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0076FF,#00C8FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🍈</div>
          <span className="cinzel" style={{ fontWeight:900, fontSize:18, letterSpacing:1 }}>BLOX<span style={{color:"var(--accent)"}}>FRUITS</span><span style={{color:"var(--muted)",fontSize:11,marginLeft:6,fontWeight:400}}>AI</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display:"flex", gap:4 }}>
          {pages.map(p=>(
            <button key={p.id} onClick={()=>nav(p.id)}
              style={{ background: page===p.id?"rgba(0,200,255,0.1)":"transparent", border:`1px solid ${page===p.id?"var(--accent)":"transparent"}`, borderRadius:8, color: page===p.id?"var(--accent)":"var(--muted)", padding:"6px 14px", cursor:"pointer", fontSize:13, fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:0.5, transition:"all 0.2s" }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button className="btn-primary" style={{ padding:"8px 16px", fontSize:12 }}>⚡ Play Now</button>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="content-area">
        {page==="home"     && <HomePage onNav={nav} />}
        {page==="chat"     && <ChatPage />}
        {page==="database" && <DatabasePage />}
        {page==="tierlist" && <TierListPage />}
        {page==="builder"  && <BuildCreatorPage />}
        {page==="news"     && <NewsPage />}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-nav">
        {pages.map(p=>(
          <button key={p.id} onClick={()=>nav(p.id)}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"transparent", border:"none", color: page===p.id?"var(--accent)":"var(--muted)", cursor:"pointer", padding:"0 8px", flex:1 }}>
            <span style={{ fontSize:20 }}>{p.icon}</span>
            <span style={{ fontSize:10, fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"32px 24px", textAlign:"center", background:"var(--bg2)" }}>
        <div className="cinzel" style={{ fontSize:14, color:"var(--muted)", marginBottom:8 }}>
          🍈 BLOX FRUITS AI — Powered by Claude
        </div>
        <div style={{ fontSize:12, color:"var(--muted)", opacity:0.5 }}>
          Unofficial fan resource. Not affiliated with Roblox or the Blox Fruits development team.
        </div>
      </footer>
    </div>
  );
}
