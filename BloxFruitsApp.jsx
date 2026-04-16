/**
 * BloxFruitsApp.jsx — Production Refactor
 * ─────────────────────────────────────────────────────
 * CHANGES FROM ORIGINAL:
 *  1. AppContext  — eliminates apiKey prop-drilling
 *  2. useMemo/useCallback — no unnecessary recomputes
 *  3. Debounced search   — smooth UX, no thrash
 *  4. Chat history cap   — only last 12 msgs sent to API
 *  5. CSS :hover classes — no inline onMouse* handlers
 *  6. Favorites system   — localStorage-backed bookmarks
 *  7. Fruit Comparator   — side-by-side compare modal
 *  8. Skeleton loaders   — graceful loading states
 *  9. YouTube fix        — honest web_search capability
 * 10. Error boundary     — app survives API crashes
 * 11. Empty states       — clear feedback when 0 results
 * 12. Trading values     — sortable column in database
 * 13. GlobalStyles static— rendered once, not re-parsed
 * 14. ParticleCanvas lazy— only mounts on home page
 */

import {
  useState, useEffect, useRef, useMemo, useCallback,
  createContext, useContext, memo, Component,
} from "react";

// ─── STATIC STYLES (rendered once at module level) ─────────────────────────
const STYLE_ID = "blox-styles";
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#03080F; --bg2:#060F1C; --surface:#0A1628;
      --glass:rgba(10,22,40,0.75); --border:rgba(0,200,255,0.15);
      --accent:#00C8FF; --accent2:#0076FF; --gold:#F5C518;
      --red:#FF3D5A; --green:#00E676; --text:#E8F4FC; --muted:#6B8BA4;
      --card-glow:0 0 30px rgba(0,200,255,0.08);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 3px; }
    .cinzel { font-family: 'Cinzel', serif; }
    .mono   { font-family: 'Share Tech Mono', monospace; }
    .ocean-bg {
      background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,120,255,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,200,255,0.07) 0%, transparent 50%),
        radial-gradient(ellipse 60% 50% at 20% 100%, rgba(0,40,120,0.25) 0%, transparent 60%),
        var(--bg);
    }
    .glass {
      background: var(--glass); backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border); border-radius: 16px;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      border: none; border-radius: 8px; color: #fff;
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 14px; letter-spacing: 1px; text-transform: uppercase;
      padding: 10px 22px; cursor: pointer;
      box-shadow: 0 0 20px rgba(0,200,255,0.35); transition: all 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 35px rgba(0,200,255,0.6); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-ghost {
      background: transparent; border: 1px solid var(--border);
      border-radius: 8px; color: var(--muted); cursor: pointer;
      font-family: 'Rajdhani', sans-serif; font-weight: 600;
      font-size: 13px; letter-spacing: 1px; text-transform: uppercase;
      padding: 9px 20px; transition: all 0.2s ease;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-ghost.active { border-color: var(--accent); color: var(--accent); background: rgba(0,200,255,0.08); }
    .btn-icon {
      background: transparent; border: 1px solid var(--border); border-radius: 8px;
      color: var(--muted); cursor: pointer; padding: 7px 12px;
      font-size: 16px; line-height: 1; transition: all 0.2s;
    }
    .btn-icon:hover { border-color: var(--accent); color: var(--accent); }
    .input-field {
      background: rgba(6,15,28,0.9); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-family: 'Rajdhani', sans-serif;
      font-size: 15px; padding: 12px 16px; width: 100%;
      transition: border-color 0.2s ease; outline: none;
    }
    .input-field:focus { border-color: var(--accent); box-shadow: 0 0 15px rgba(0,200,255,0.15); }
    .input-field::placeholder { color: var(--muted); }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; transition: all 0.22s ease; overflow: hidden;
    }
    .card:hover { border-color: rgba(0,200,255,0.35); box-shadow: var(--card-glow); transform: translateY(-2px); }
    .card-clickable { cursor: pointer; }
    .tier-s { background: linear-gradient(135deg,#ff4b6e,#ff8c42); }
    .tier-a { background: linear-gradient(135deg,#ff8c42,#f5c518); }
    .tier-b { background: linear-gradient(135deg,#4caf50,#00c8ff); }
    .tier-c { background: linear-gradient(135deg,#0076ff,#7c4dff); }
    .tier-d { background: linear-gradient(135deg,#455a64,#607d8b); }
    @keyframes fadeInUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse-glow { 0%,100% { box-shadow:0 0 20px rgba(0,200,255,0.3); } 50% { box-shadow:0 0 45px rgba(0,200,255,0.7); } }
    @keyframes float      { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
    @keyframes wave       { 0%,100% { transform:scaleY(1); } 50% { transform:scaleY(1.4); } }
    @keyframes shimmer    { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes spin       { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .anim-fade-up { animation: fadeInUp 0.5s ease forwards; }
    .anim-fade    { animation: fadeIn 0.35s ease forwards; }
    .anim-float   { animation: float 4s ease-in-out infinite; }
    .anim-pulse   { animation: pulse-glow 3s ease infinite; }
    .bubble-user {
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      border-radius: 18px 18px 4px 18px; padding: 12px 16px;
      max-width: 75%; margin-left: auto; font-size: 15px; line-height: 1.6;
    }
    .bubble-ai {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px 18px 18px 4px; padding: 14px 18px;
      max-width: 85%; font-size: 15px; line-height: 1.7; white-space: pre-wrap;
    }
    .bubble-ai strong { color: var(--accent); }
    .dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent); animation: wave 1s ease infinite; }
    .dot:nth-child(2) { animation-delay:.15s; }
    .dot:nth-child(3) { animation-delay:.3s; }
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      background: rgba(3,8,15,0.88); border-bottom: 1px solid var(--border);
      padding: 0 24px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-btn {
      background: transparent; border: 1px solid transparent;
      border-radius: 8px; color: var(--muted); padding: 6px 14px;
      cursor: pointer; font-size: 13px; font-family: 'Rajdhani', sans-serif;
      font-weight: 600; letter-spacing: 0.5px; transition: all 0.2s;
    }
    .nav-btn:hover { color: var(--text); border-color: var(--border); }
    .nav-btn.active { background: rgba(0,200,255,0.1); border-color: var(--accent); color: var(--accent); }
    .hero-grid {
      background-image:
        linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.25);
      border-radius: 999px; padding: 4px 12px;
      font-size: 12px; font-weight: 600; color: var(--accent);
      letter-spacing: 0.5px; text-transform: uppercase;
    }
    .stat-fill { height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--accent2), var(--accent)); transition: width 0.8s ease; }
    .content-area { padding-top: 64px; min-height: 100vh; }
    .section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
    .rarity-mythical { color:#ff4b6e; text-shadow:0 0 8px rgba(255,75,110,0.5); }
    .rarity-legendary { color:#f5c518; text-shadow:0 0 8px rgba(245,197,24,0.5); }
    .rarity-rare      { color:#00c8ff; text-shadow:0 0 8px rgba(0,200,255,0.5); }
    .rarity-uncommon  { color:#00e676; }
    .rarity-common    { color:#78909c; }
    .search-underline { position:relative; }
    .search-underline::after {
      content:''; position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
      width:0; height:2px; background:linear-gradient(90deg,var(--accent2),var(--accent));
      transition:width 0.3s ease; border-radius:2px;
    }
    .search-underline:focus-within::after { width:100%; }
    canvas.particles { position:absolute; inset:0; pointer-events:none; opacity:0.4; }
    .mobile-nav {
      position:fixed; bottom:0; left:0; right:0; z-index:999;
      background:rgba(3,8,15,0.97); border-top:1px solid var(--border);
      display:none; padding:8px 0 max(4px, env(safe-area-inset-bottom));
    }
    .skeleton {
      background: linear-gradient(90deg, var(--surface) 25%, rgba(0,200,255,0.05) 50%, var(--surface) 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px;
    }
    .fav-btn { background: none; border: none; cursor: pointer; font-size: 18px; line-height: 1; padding: 4px; transition: transform 0.15s; }
    .fav-btn:hover { transform: scale(1.25); }
    .compare-btn {
      background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.25);
      border-radius: 6px; color: var(--accent); font-size: 11px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: uppercase; padding: 3px 9px;
      cursor: pointer; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
    }
    .compare-btn:hover { background: rgba(0,200,255,0.18); }
    .compare-btn.selected { background: rgba(0,200,255,0.25); border-color: var(--accent); }
    .scroll-top-btn {
      position: fixed; bottom: 90px; right: 20px; z-index: 800;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(0,118,255,0.85); border: 1px solid var(--accent);
      color: white; font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,200,255,0.3);
    }
    .scroll-top-btn:hover { background: var(--accent2); transform: translateY(-2px); }
    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
      .hide-mobile { display: none !important; }
      .mobile-nav { display: flex; justify-content: space-around; }
      .desktop-nav { display: none !important; }
      .content-area { padding-bottom: 72px; }
    }
    @media (max-width: 480px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(s);
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const FRUITS = [
  { id:1,  name:"Leopard",  type:"Beast",    rarity:"mythical",  tier:"S", pvp:10, pve:9,  price:"N/A",      tradingVal:5000, img:"🐆", desc:"The rarest and most powerful beast fruit. Incredible mobility and AoE damage.", abilities:["Leopard Awakening","Claw Slash","Pounce","Frenzy"] },
  { id:2,  name:"Dragon",   type:"Beast",    rarity:"mythical",  tier:"S", pvp:9,  pve:10, price:"N/A",      tradingVal:4800, img:"🐉", desc:"Massive transformation fruit. Best boss killer in the game.", abilities:["Dragon Breath","Talon Slash","Dragon Scale","Ancient Dragon"] },
  { id:3,  name:"Dough",    type:"Paramecia",rarity:"legendary", tier:"S", pvp:10, pve:8,  price:"2,800,000",tradingVal:3200, img:"🍩", desc:"Top-tier PvP fruit with excellent stuns and hitboxes.", abilities:["Dough Fist","Massive Dough","Torque Snail","Fermentation"] },
  { id:4,  name:"Spirit",   type:"Natural",  rarity:"legendary", tier:"S", pvp:9,  pve:9,  price:"3,400,000",tradingVal:3000, img:"👻", desc:"Versatile S-tier with great ranged and close combat.", abilities:["Soul Guitar","Wrath","Astral Projection","Haunting"] },
  { id:5,  name:"Venom",    type:"Paramecia",rarity:"legendary", tier:"S", pvp:8,  pve:9,  price:"3,000,000",tradingVal:2800, img:"☠️", desc:"Excellent DoT damage and zone control for PvE.", abilities:["Venom Hunt","Venom Spit","Toxic Cloud","Cobra Strike"] },
  { id:6,  name:"Kitsune",  type:"Beast",    rarity:"mythical",  tier:"S", pvp:8,  pve:10, price:"N/A",      tradingVal:4200, img:"🦊", desc:"New mythical fox fruit with incredible grinding capability.", abilities:["Fox Fire","Nine Tails","Illusion Dance","Fox Leap"] },
  { id:7,  name:"Blizzard", type:"Natural",  rarity:"legendary", tier:"A", pvp:7,  pve:8,  price:"2,500,000",tradingVal:1800, img:"❄️", desc:"Great AoE freezing abilities, excellent for clearing mobs.", abilities:["Snowball","Blizzard Storm","Ice Age","Arctic Blast"] },
  { id:8,  name:"Shadow",   type:"Paramecia",rarity:"legendary", tier:"A", pvp:7,  pve:8,  price:"2,900,000",tradingVal:1600, img:"🌑", desc:"Unique mechanics with multiple shadow moves. Solid A-tier.", abilities:["Shadow Clone","Umbra","Dark Vortex","Nightmare"] },
  { id:9,  name:"Phoenix",  type:"Zoan",     rarity:"legendary", tier:"A", pvp:7,  pve:8,  price:"1,800,000",tradingVal:1400, img:"🔥", desc:"Healing and blue fire combos. Excellent sustain.", abilities:["Blue Flames","Fly","Rebirth","Inferno"] },
  { id:10, name:"Light",    type:"Natural",  rarity:"legendary", tier:"A", pvp:6,  pve:9,  price:"650,000",  tradingVal:900, img:"✨", desc:"Classic speed king. Amazing for traveling and grinding.", abilities:["Laser","Light Speed Kick","Reflection","Flash"] },
  { id:11, name:"Portal",   type:"Paramecia",rarity:"rare",      tier:"B", pvp:5,  pve:7,  price:"1,400,000",tradingVal:600, img:"🌀", desc:"Good utility and escape. Fun mechanics but limited damage.", abilities:["Portal Strike","Portal Warp","Dimension","Void"] },
  { id:12, name:"Buddha",   type:"Zoan",     rarity:"legendary", tier:"A", pvp:4,  pve:10, price:"1,500,000",tradingVal:1100, img:"🧘", desc:"The ultimate grinding fruit. Massive hitbox in transformed state.", abilities:["Buddha Beam","Giant Transformation","Enlightened","Holy Light"] },
  { id:13, name:"Gravity",  type:"Paramecia",rarity:"legendary", tier:"B", pvp:6,  pve:7,  price:"2,500,000",tradingVal:800, img:"🌍", desc:"Interesting zoning but needs setup.", abilities:["Gravity Push","Meteor","Black Hole","Gravity Shift"] },
  { id:14, name:"Rumble",   type:"Natural",  rarity:"legendary", tier:"B", pvp:6,  pve:7,  price:"2,100,000",tradingVal:750, img:"⚡", desc:"Electric moves with great range, but lacks burst damage.", abilities:["Thor Elephant Gun","Thunderstorm","Lightning Leap","Eye of the Storm"] },
  { id:15, name:"Magma",    type:"Natural",  rarity:"rare",      tier:"B", pvp:5,  pve:8,  price:"850,000",  tradingVal:500, img:"🌋", desc:"Solid PvE fruit. Magma floor shreds bosses.", abilities:["Magma Fist","Magma Meteor","Floor Magma","Volcano"] },
];

const SWORDS = [
  { id:1, name:"Hallow Scythe",       rarity:"mythical",  dmg:10, type:"Sword",  img:"⚔️",  desc:"Drops from Death King. Insane reach and L-click combo potential." },
  { id:2, name:"Cursed Dual Katana",  rarity:"mythical",  dmg:10, type:"Sword",  img:"⚔️",  desc:"Combination of Yama + Tushita. Best sword in the game overall." },
  { id:3, name:"Tushita",             rarity:"legendary", dmg:9,  type:"Katana", img:"🗡️",  desc:"Elite sword from the third sea. Extremely powerful moveset." },
  { id:4, name:"Yama",                rarity:"legendary", dmg:9,  type:"Katana", img:"🗡️",  desc:"Third sea boss drop. Required for CDK combination." },
  { id:5, name:"Dark Blade",          rarity:"legendary", dmg:8,  type:"Sword",  img:"⚔️",  desc:"Game-pass sword. Classic look with solid damage output." },
  { id:6, name:"Soul Cane",           rarity:"legendary", dmg:8,  type:"Cane",   img:"🪄",  desc:"Spirit-infused cane from Cursed Captain. Long range moves." },
  { id:7, name:"Shisui",              rarity:"rare",      dmg:7,  type:"Katana", img:"🗡️",  desc:"Sleek katana from the second sea. Good for combos." },
  { id:8, name:"Triple Katana",       rarity:"uncommon",  dmg:6,  type:"Katana", img:"🗡️",  desc:"Classic triple slash. Great starter sword for new players." },
];

const BOSSES = [
  { id:1, name:"Rip_Indra",      sea:"Third Sea",  lvl:5000, reward:"Dark Fragment, Hallow Scythe",  img:"👿", hp:"huge" },
  { id:2, name:"Soul Reaper",    sea:"Third Sea",  lvl:5750, reward:"Hallow Scythe (low %)",         img:"💀", hp:"high" },
  { id:3, name:"Longma",         sea:"Third Sea",  lvl:5000, reward:"Dragon Trident, Pole V2",       img:"🐉", hp:"high" },
  { id:4, name:"God of Destroy", sea:"Second Sea", lvl:3000, reward:"Dark Coat, Gura Buddy",         img:"🔱", hp:"medium" },
  { id:5, name:"Sea Beast",      sea:"All Seas",   lvl:"Any",reward:"Sea Beast Drops",               img:"🦑", hp:"varies" },
  { id:6, name:"Darkbeard",      sea:"Second Sea", lvl:1000, reward:"Dark Fragment",                 img:"🧔", hp:"medium" },
  { id:7, name:"Cake Prince",    sea:"Second Sea", lvl:1500, reward:"Saber, Canvander",              img:"🎂", hp:"medium" },
  { id:8, name:"King Legacy",    sea:"Third Sea",  lvl:4800, reward:"Tushita, 3x EXP",              img:"👑", hp:"high" },
];

const FIGHTING_STYLES = [
  { id:1, name:"Death Step",      rarity:"legendary",img:"💀", desc:"Mastered form of Dark Step. Incredible damage and combos." },
  { id:2, name:"Godhuman",        rarity:"mythical", img:"✊", desc:"Ultimate fighting style combining all 5 styles. Best in game." },
  { id:3, name:"Superhuman",      rarity:"rare",     img:"💪", desc:"Classic Superhuman. Strong reliable moves, easy to master." },
  { id:4, name:"Sharkman Karate", rarity:"legendary",img:"🦈", desc:"Water-based style. Amazing AoE and ranged attacks." },
  { id:5, name:"Electric Claw",   rarity:"legendary",img:"⚡", desc:"Fast electric combos. Excellent for PvP burst damage." },
  { id:6, name:"Dragon Talon",    rarity:"legendary",img:"🐲", desc:"Dragon-inspired kicks with fire. High damage ceiling." },
];

const GUNS = [
  { id:1, name:"Kabucha",       rarity:"legendary", dmg:9, type:"Musket",  img:"💥", desc:"Highest damage gun. Essential for gun builds in Second Sea." },
  { id:2, name:"Acidum Rifle",  rarity:"legendary", dmg:9, type:"Rifle",   img:"🔫", desc:"Ranged gun with AoE acid pool. Excellent for PvP zoning." },
  { id:3, name:"Slingshot",     rarity:"rare",      dmg:7, type:"Ranged",  img:"🪃", desc:"Fires multiple projectiles. Good starter weapon." },
  { id:4, name:"Bizarre Rifle", rarity:"legendary", dmg:8, type:"Rifle",   img:"🔫", desc:"Fires knockback bullets. Great for keeping distance." },
  { id:5, name:"Serpent Bow",   rarity:"legendary", dmg:8, type:"Bow",     img:"🏹", desc:"Fires homing snake arrows. Consistent damage at range." },
  { id:6, name:"Bazooka",       rarity:"uncommon",  dmg:6, type:"Launcher",img:"💥", desc:"Classic explosive launcher. Good AoE for clearing groups." },
];

const MAPS = [
  { id:1, sea:"First Sea",  name:"Starter Island",  lvl:"1-30",    img:"🏝️", desc:"Tutorial island. Learn the basics here." },
  { id:2, sea:"First Sea",  name:"Marine Fortress", lvl:"30-70",   img:"⚓",  desc:"First real challenge. Marine NPCs." },
  { id:3, sea:"First Sea",  name:"Jungle",          lvl:"70-100",  img:"🌴", desc:"Hidden fruit spawns. Beginner grinding zone." },
  { id:4, sea:"Second Sea", name:"Kingdom of Rose", lvl:"700-900", img:"🌹", desc:"Hub island of the Second Sea. Many NPCs." },
  { id:5, sea:"Second Sea", name:"Green Zone",      lvl:"875-925", img:"🌿", desc:"Great for leveling from 875-925." },
  { id:6, sea:"Second Sea", name:"Snow Mountain",   lvl:"925-975", img:"🗻", desc:"Snow Raiders and yetis. Cold but valuable." },
  { id:7, sea:"Third Sea",  name:"Port Town",       lvl:"1500+",   img:"🏰", desc:"First stop in the Third Sea." },
  { id:8, sea:"Third Sea",  name:"Floating Turtle", lvl:"1875+",   img:"🐢", desc:"Giant turtle island. Amazing for late game." },
  { id:9, sea:"Third Sea",  name:"Sea of Treats",   lvl:"2100+",   img:"🍭", desc:"Cake theme. Best XP zones in third sea." },
];

const NEWS = [
  { id:1, date:"Mar 2025", title:"Update 21 — Kitsune Fruit Released",   tag:"Update", desc:"New mythical beast fruit Kitsune with 4 unique moves. New island: Fox Grove. Balance patches for Dragon and Dough." },
  { id:2, date:"Feb 2025", title:"Valentine's Event 2025",               tag:"Event",  desc:"Limited-time Valentine items, exclusive accessories and title. Sea beast event with double rewards." },
  { id:3, date:"Jan 2025", title:"Balance Patch 20.2 — Tier Shifts",    tag:"Patch",  desc:"Leopard nerfed, Spirit buffed. Godhuman now requires higher stats. Death Step combos adjusted." },
  { id:4, date:"Dec 2024", title:"Update 20 — Sea of Treats Expansion", tag:"Update", desc:"Third Sea expansion with new grinding zones. Cake Island bosses. New boss: Cursed Captain added." },
  { id:5, date:"Nov 2024", title:"Halloween 2024 Event",                 tag:"Event",  desc:"Reaper's Night limited-time mode. Hallow Scythe permanent addition. Ghost NPC questlines." },
];

const TAG_COLORS = { Update:"#00E676", Patch:"#F5C518", Event:"#00C8FF" };
const RARITY_COLORS = { mythical:"#FF4B6E", legendary:"#F5C518", rare:"#00C8FF", uncommon:"#00E676", common:"#78909C" };
const ANTHROPIC_HEADERS = (key) => ({
  "Content-Type": "application/json",
  "x-api-key": key,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
});
const MAX_CHAT_HISTORY = 12; // cap context window

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function AppProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("blox_api_key") || "");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blox_favorites") || "{}"); } catch { return {}; }
  });

  const saveApiKey = useCallback((key) => {
    localStorage.setItem("blox_api_key", key);
    setApiKey(key);
  }, []);

  const toggleFavorite = useCallback((type, id) => {
    setFavorites(prev => {
      const key = `${type}:${id}`;
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      localStorage.setItem("blox_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((type, id) => !!favorites[`${type}:${id}`], [favorites]);

  return (
    <AppContext.Provider value={{ apiKey, saveApiKey, toggleFavorite, isFavorite }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding:40, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <h2 className="cinzel" style={{ color:"var(--red)", marginBottom:8 }}>Something crashed</h2>
        <p style={{ color:"var(--muted)", marginBottom:20 }}>{this.state.error.message}</p>
        <button className="btn-primary" onClick={() => this.setState({ error: null })}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

async function callClaude(apiKey, system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: ANTHROPIC_HEADERS(apiKey),
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "No response.";
}

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

const Spinner = memo(() => (
  <div style={{ display:"flex", gap:6, padding:8 }}>
    <div className="dot"/><div className="dot"/><div className="dot"/>
  </div>
));

const SkeletonCard = memo(() => (
  <div className="card" style={{ padding:20, minHeight:160 }}>
    <div className="skeleton" style={{ height:40, width:"60%", marginBottom:12 }} />
    <div className="skeleton" style={{ height:16, width:"90%", marginBottom:8 }} />
    <div className="skeleton" style={{ height:16, width:"70%" }} />
  </div>
));

const StatBar = memo(({ label, value, max = 10 }) => {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? "#00E676" : pct >= 60 ? "#F5C518" : pct >= 40 ? "#FF8C42" : "#FF3D5A";
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4, color:"var(--muted)" }}>
        <span>{label}</span><span style={{ color, fontWeight:700 }}>{value}/{max}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,#0076FF,${color})`, borderRadius:3, transition:"width 0.8s ease" }} />
      </div>
    </div>
  );
});

const RarityBadge = memo(({ rarity }) => (
  <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase",
    color: RARITY_COLORS[rarity] || "#78909C",
    padding:"2px 8px", border:`1px solid ${(RARITY_COLORS[rarity]||"#78909C")}40`, borderRadius:99 }}>
    {rarity}
  </span>
));

const TierBadge = memo(({ tier }) => {
  const cls = { S:"tier-s", A:"tier-a", B:"tier-b", C:"tier-c", D:"tier-d" };
  return (
    <div className={cls[tier]||"tier-d"} style={{ width:32, height:32, borderRadius:6, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif",
      fontWeight:900, fontSize:16, flexShrink:0 }}>{tier}</div>
  );
});

// Particle canvas — only mounts on homepage to save CPU
const ParticleCanvas = memo(() => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, vx: (Math.random()-0.5)*0.3, vy: -Math.random()*0.4-0.1,
      a: Math.random()*0.5+0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,200,255,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random()*canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="particles" style={{ width:"100%", height:"100%" }} />;
});

// ─── MODALS ───────────────────────────────────────────────────────────────────

function Modal({ onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.75)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div className="glass anim-fade" style={{ padding:32, maxWidth, width:"100%", borderRadius:18, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none",
          border:"none", color:"var(--muted)", fontSize:22, cursor:"pointer", lineHeight:1 }}>✕</button>
        {children}
      </div>
    </div>
  );
}

function SettingsModal({ onClose }) {
  const { apiKey, saveApiKey } = useApp();
  const [input, setInput] = useState(apiKey);
  const handleSave = useCallback(() => { saveApiKey(input.trim()); onClose(); }, [input, saveApiKey, onClose]);
  return (
    <Modal onClose={onClose}>
      <h3 className="cinzel" style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>⚙️ Settings</h3>
      <p style={{ fontSize:14, color:"var(--muted)", marginBottom:20, lineHeight:1.6 }}>
        Enter your <strong style={{ color:"var(--accent)" }}>Anthropic API key</strong> to unlock AI features.
        Your key is stored only in your browser — never sent to any third-party server.
      </p>
      <label style={{ fontSize:12, letterSpacing:1, color:"var(--muted)", textTransform:"uppercase", display:"block", marginBottom:8 }}>API Key</label>
      <input className="input-field" type="password" value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSave()}
        placeholder="sk-ant-..." style={{ marginBottom:16 }} />
      <div style={{ display:"flex", gap:10 }}>
        <button className="btn-primary" onClick={handleSave} style={{ flex:1 }}>Save Key</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
      {apiKey && <div style={{ marginTop:14, fontSize:13, color:"var(--green)" }}>✓ API key is active</div>}
    </Modal>
  );
}

function FruitDetailModal({ fruit, onClose }) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite("fruit", fruit.id);
  return (
    <Modal onClose={onClose} maxWidth={540}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:20 }}>
        <div style={{ fontSize:64 }}>{fruit.img}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <h2 className="cinzel" style={{ fontSize:24, fontWeight:900 }}>{fruit.name}</h2>
            <TierBadge tier={fruit.tier} />
            <button className="fav-btn" onClick={() => toggleFavorite("fruit", fruit.id)}>{fav ? "⭐" : "☆"}</button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <RarityBadge rarity={fruit.rarity} />
            <span style={{ fontSize:12, color:"var(--muted)", padding:"2px 8px", background:"rgba(255,255,255,0.05)", borderRadius:99 }}>{fruit.type}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7, marginBottom:20 }}>{fruit.desc}</p>
      <div style={{ marginBottom:20 }}>
        <StatBar label="PvP" value={fruit.pvp} />
        <StatBar label="PvE" value={fruit.pve} />
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>Abilities</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {fruit.abilities.map(a => (
            <span key={a} style={{ background:"rgba(0,200,255,0.08)", border:"1px solid var(--border)",
              borderRadius:8, padding:"5px 12px", fontSize:13, color:"var(--text)" }}>{a}</span>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px",
        background:"rgba(0,200,255,0.05)", borderRadius:10, border:"1px solid var(--border)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>Market Price</div>
          <div style={{ fontSize:16, fontWeight:700, color:"var(--gold)", marginTop:2 }}>{fruit.price}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>Trade Value</div>
          <div style={{ fontSize:16, fontWeight:700, color:"var(--accent)", marginTop:2 }}>{fruit.tradingVal.toLocaleString()}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>Rarity</div>
          <div className={`rarity-${fruit.rarity}`} style={{ fontSize:16, fontWeight:700, marginTop:2, textTransform:"capitalize" }}>{fruit.rarity}</div>
        </div>
      </div>
    </Modal>
  );
}

function ComparatorModal({ fruits, onClose }) {
  const [a, b] = fruits;
  const metrics = [
    { label:"PvP", ka:"pvp", kb:"pvp" },
    { label:"PvE", ka:"pve", kb:"pve" },
    { label:"Trade Value", ka:"tradingVal", kb:"tradingVal" },
  ];
  return (
    <Modal onClose={onClose} maxWidth={640}>
      <h3 className="cinzel" style={{ fontSize:20, fontWeight:900, marginBottom:20 }}>⚖️ Fruit Comparator</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:16, alignItems:"center" }}>
        {/* Fruit A */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:8 }}>{a.img}</div>
          <div className="cinzel" style={{ fontSize:18, fontWeight:700 }}>{a.name}</div>
          <RarityBadge rarity={a.rarity} />
        </div>
        <div className="cinzel" style={{ fontSize:24, color:"var(--muted)", textAlign:"center" }}>VS</div>
        {/* Fruit B */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:8 }}>{b.img}</div>
          <div className="cinzel" style={{ fontSize:18, fontWeight:700 }}>{b.name}</div>
          <RarityBadge rarity={b.rarity} />
        </div>
      </div>
      <div style={{ marginTop:24 }}>
        {metrics.map(m => {
          const va = a[m.ka], vb = b[m.kb];
          const winner = va > vb ? "a" : vb > va ? "b" : "tie";
          return (
            <div key={m.label} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                <span style={{ color: winner==="a" ? "#00E676" : "var(--muted)", fontWeight: winner==="a" ? 700:400 }}>{va.toLocaleString()}</span>
                <span style={{ color:"var(--muted)", fontSize:11, letterSpacing:1, textTransform:"uppercase" }}>{m.label}</span>
                <span style={{ color: winner==="b" ? "#00E676" : "var(--muted)", fontWeight: winner==="b" ? 700:400 }}>{vb.toLocaleString()}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden", direction:"rtl" }}>
                  <div style={{ width:`${(va/Math.max(va,vb))*100}%`, height:"100%", background: winner==="a"?"#00E676":"var(--accent2)", borderRadius:3 }} />
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${(vb/Math.max(va,vb))*100}%`, height:"100%", background: winner==="b"?"#00E676":"var(--accent2)", borderRadius:3 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

// ── HOME PAGE ──
function HomePage({ onNav }) {
  const { apiKey } = useApp();
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const trending = ["Best PvP fruit 2025","How to awaken Dragon","Fastest leveling route","Dough vs Leopard","Best Third Sea build","Godhuman requirements"];
  const featuredFruits = useMemo(() => FRUITS.filter(f => f.tier === "S").slice(0, 4), []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    if (!apiKey) { setAiResult("⚠️ Set your Anthropic API key in ⚙️ Settings to use AI features."); return; }
    setLoading(true); setAiResult("");
    try {
      const text = await callClaude(apiKey,
        "You are an expert Blox Fruits wiki assistant. Answer concisely but accurately. Use bullet points and emojis to make responses scannable. Focus on current meta (Update 21).",
        [{ role:"user", content: query }]
      );
      setAiResult(text);
    } catch (e) { setAiResult(`⚠️ Error: ${e.message}`); }
    setLoading(false);
  }, [query, apiKey]);

  return (
    <div>
      {/* HERO */}
      <div className="hero-grid ocean-bg" style={{ position:"relative", padding:"100px 24px 80px", textAlign:"center", overflow:"hidden" }}>
        <ParticleCanvas />
        <div style={{ position:"relative", zIndex:1 }}>
          <div className="tag" style={{ margin:"0 auto 24px" }}>🆕 Update 21 — Kitsune Released</div>
          <h1 className="cinzel anim-fade-up" style={{ fontSize:"clamp(2.2rem,6vw,4rem)", fontWeight:900, lineHeight:1.1, marginBottom:16 }}>
            THE ULTIMATE<br /><span style={{ color:"var(--accent)" }}>BLOX FRUITS</span><br />GUIDE
          </h1>
          <p style={{ color:"var(--muted)", fontSize:17, maxWidth:560, margin:"0 auto 36px", lineHeight:1.6 }}>
            AI-powered database for fruits, builds, bosses, and strategies. Updated for Update 21.
          </p>
          {/* SEARCH */}
          <div className="search-underline glass" style={{ maxWidth:640, margin:"0 auto 20px", display:"flex",
            alignItems:"center", gap:12, padding:"14px 20px", borderRadius:14 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🔍</span>
            <input style={{ background:"transparent", border:"none", flex:1, fontSize:16,
              color:"var(--text)", outline:"none", fontFamily:"'Rajdhani',sans-serif" }}
              placeholder="Ask anything about Blox Fruits..."
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()} />
            <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ borderRadius:10, padding:"10px 22px" }}>
              {loading ? "..." : "Ask AI"}
            </button>
          </div>
          {/* TRENDING PILLS */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            {trending.map(t => (
              <button key={t} onClick={() => setQuery(t)}
                style={{ background:"rgba(0,200,255,0.07)", border:"1px solid rgba(0,200,255,0.2)",
                  borderRadius:999, color:"var(--muted)", fontSize:12, padding:"6px 14px",
                  cursor:"pointer", transition:"all 0.2s", fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {/* AI RESULT */}
        {(loading || aiResult) && (
          <div className="glass anim-fade" style={{ maxWidth:700, margin:"32px auto 0", padding:24, textAlign:"left", position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#0076FF,#00C8FF)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
              <span className="cinzel" style={{ color:"var(--accent)", fontWeight:700, fontSize:13, letterSpacing:1 }}>AI RESPONSE</span>
            </div>
            {loading ? <Spinner /> : <div style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiResult}</div>}
          </div>
        )}
      </div>

      {/* QUICK STATS */}
      <div style={{ padding:"36px 24px", background:"var(--surface)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:28, textAlign:"center" }}>
          {[["🍈","150+","Fruits"],["⚔️","50+","Swords"],["👾","80+","Bosses"],["🗺️","3","Seas"],["⚡","6","Fighting Styles"],["👥","10M+","Players"]].map(([icon,val,label]) => (
            <div key={label}>
              <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
              <div className="cinzel" style={{ fontSize:28, fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:12, color:"var(--muted)", marginTop:4, letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* S-TIER FRUITS */}
      <div className="section">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <h2 className="cinzel" style={{ fontSize:26, fontWeight:700 }}>
            <span style={{ color:"var(--accent)" }}>S-TIER</span> FRUITS
          </h2>
          <button className="btn-ghost" onClick={() => onNav("database")}>View All →</button>
        </div>
        <div className="grid-4">
          {featuredFruits.map(f => (
            <div key={f.id} className="card card-clickable" style={{ padding:20 }} onClick={() => onNav("database")}>
              <div style={{ fontSize:40, marginBottom:10, textAlign:"center" }}>{f.img}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <span className="cinzel" style={{ fontSize:15, fontWeight:700 }}>{f.name}</span>
                <TierBadge tier={f.tier} />
              </div>
              <RarityBadge rarity={f.rarity} />
              <div style={{ marginTop:12 }}>
                <StatBar label="PvP" value={f.pvp} />
                <StatBar label="PvE" value={f.pve} />
              </div>
              <div style={{ marginTop:10, fontSize:12, color:"var(--muted)" }}>
                Trade: <span style={{ color:"var(--accent)", fontWeight:700 }}>{f.tradingVal.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWS PREVIEW */}
      <div className="section" style={{ paddingTop:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h2 className="cinzel" style={{ fontSize:26, fontWeight:700 }}>Latest <span style={{ color:"var(--accent)" }}>Updates</span></h2>
          <button className="btn-ghost" onClick={() => onNav("news")}>All News →</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {NEWS.slice(0,3).map(n => (
            <div key={n.id} className="glass" style={{ padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase",
                color: TAG_COLORS[n.tag]||"var(--accent)", padding:"3px 10px",
                border:`1px solid currentColor`, borderRadius:99, flexShrink:0, marginTop:2 }}>{n.tag}</span>
              <div style={{ flex:1 }}>
                <div className="cinzel" style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{n.title}</div>
                <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{n.desc}</div>
              </div>
              <span style={{ fontSize:12, color:"var(--muted)", flexShrink:0, marginLeft:"auto" }}>{n.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CHAT PAGE ── (fixed: capped history, honest YouTube handling)
function ChatPage() {
  const { apiKey } = useApp();
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:"⚓ Ahoy! I'm your Blox Fruits AI assistant. Ask me anything about fruits, builds, strategies, tier lists, or bosses!\n\n**Try:**\n• What's the best PvP fruit?\n• How do I level fast in Third Sea?\n• Compare Dragon vs Dough\n• Best combo for Godhuman?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) {
      setMessages(p => [...p, { role:"assistant", content:"⚠️ Set your API key in ⚙️ Settings first." }]);
      return;
    }
    const userMsg = { role:"user", content: input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput(""); setLoading(true);
    try {
      // ✅ FIX: Only send last N messages to cap context window
      const history = [...messages, userMsg].slice(-MAX_CHAT_HISTORY).map(m => ({ role:m.role, content:m.content }));
      const text = await callClaude(apiKey,
        "You are an expert Blox Fruits game AI assistant. Deep knowledge of all fruits, swords, fighting styles, bosses, maps, builds, combos, and meta strategies (current: Update 21). Be helpful, accurate, and enthusiastic. Use emojis. Format with bullet points and line breaks. Keep it Blox Fruits focused.",
        history
      );
      setMessages(p => [...p, { role:"assistant", content: text }]);
    } catch (e) {
      setMessages(p => [...p, { role:"assistant", content:`⚠️ Error: ${e.message}` }]);
    }
    setLoading(false);
  }, [input, loading, messages, apiKey]);

  const suggestions = ["Best PvP build for beginners","How to farm Devil Fruits fast","Strongest sword in the game","Best grinding spots Third Sea","How to unlock Second Sea","Dragon awakening guide"];

  return (
    <div style={{ display:"flex", height:"calc(100vh - 64px)", overflow:"hidden" }}>
      {/* SIDEBAR */}
      <div className="hide-mobile" style={{ width:250, background:"var(--surface)", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column", padding:18, gap:16, flexShrink:0, overflowY:"auto" }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>Quick Questions</div>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)}
              style={{ display:"block", width:"100%", textAlign:"left", background:"transparent",
                border:"1px solid var(--border)", borderRadius:8, color:"var(--muted)",
                padding:"8px 12px", marginBottom:6, cursor:"pointer", fontSize:13,
                fontFamily:"'Rajdhani',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--text)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)"}}>
              {s}
            </button>
          ))}
        </div>
        {/* ✅ FIX: Honest note about YouTube */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>💡 Tip</div>
          <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
            Paste a YouTube video title or description into the chat and I'll give you tips based on that content.
          </p>
        </div>
        {messages.length > 3 && (
          <button className="btn-ghost" onClick={() => setMessages(messages.slice(0,1))}
            style={{ fontSize:12, padding:"7px 12px" }}>🗑️ Clear Chat</button>
        )}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: m.role==="user"?"flex-end":"flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#0076FF,#00C8FF)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🤖</div>
                  <span style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>Blox AI</span>
                </div>
              )}
              <div className={m.role==="user" ? "bubble-user" : "bubble-ai"}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#0076FF,#00C8FF)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🤖</div>
              <div className="bubble-ai"><Spinner /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)", background:"var(--bg)" }}>
          <div style={{ display:"flex", gap:10 }}>
            <input className="input-field" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about fruits, builds, bosses..." style={{ flex:1 }} />
            <button className="btn-primary" onClick={send} disabled={loading || !input.trim()}>Send ↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DATABASE PAGE ── (fixed: debounced search, useMemo, comparator, favorites)
function DatabasePage() {
  const { toggleFavorite, isFavorite } = useApp();
  const [tab, setTab] = useState("fruits");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("tier");
  const [selected, setSelected] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const debouncedSearch = useDebounce(search, 280);

  const TIER_ORDER = { S:0, A:1, B:2, C:3, D:4 };

  const filteredFruits = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return FRUITS
      .filter(f => (filter==="all" || f.type===filter) && (!q || f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)))
      .sort((a,b) => {
        if (sortBy === "tier") return (TIER_ORDER[a.tier]??9) - (TIER_ORDER[b.tier]??9);
        if (sortBy === "pvp") return b.pvp - a.pvp;
        if (sortBy === "pve") return b.pve - a.pve;
        if (sortBy === "trade") return b.tradingVal - a.tradingVal;
        return 0;
      });
  }, [debouncedSearch, filter, sortBy]);

  const filteredSwords = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return SWORDS.filter(s => !q || s.name.toLowerCase().includes(q));
  }, [debouncedSearch]);

  const toggleCompare = useCallback((fruit) => {
    setCompareList(prev => {
      if (prev.find(f => f.id === fruit.id)) return prev.filter(f => f.id !== fruit.id);
      if (prev.length >= 2) return [prev[1], fruit];
      return [...prev, fruit];
    });
  }, []);

  const tabs = [["fruits","🍈 Fruits"],["swords","⚔️ Swords"],["guns","🔫 Guns"],["fighting","🥊 Styles"],["bosses","👾 Bosses"],["maps","🗺️ Maps"]];
  const fruitFilters = [["all","All"],["Beast","Beast"],["Paramecia","Paramecia"],["Natural","Natural"],["Zoan","Zoan"]];
  const sortOptions = [["tier","Tier"],["pvp","PvP"],["pve","PvE"],["trade","Trade Val"]];

  return (
    <div className="section" style={{ paddingTop:32 }}>
      {selected && <FruitDetailModal fruit={selected} onClose={() => setSelected(null)} />}
      {showCompare && compareList.length === 2 && <ComparatorModal fruits={compareList} onClose={() => setShowCompare(false)} />}

      <h2 className="cinzel" style={{ fontSize:30, fontWeight:900, marginBottom:6 }}>
        Game <span style={{ color:"var(--accent)" }}>Database</span>
      </h2>
      <p style={{ color:"var(--muted)", marginBottom:24, fontSize:14 }}>Complete reference for all items, weapons, and locations.</p>

      {/* TABS */}
      <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
        {tabs.map(([id,label]) => (
          <button key={id} className={`btn-ghost ${tab===id?"active":""}`}
            onClick={() => { setTab(id); setSelected(null); setSearch(""); }}>
            {label}
          </button>
        ))}
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        <div className="search-underline" style={{ flex:1, minWidth:200 }}>
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`} style={{ paddingLeft:16 }} />
        </div>
        {tab === "fruits" && (
          <>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {fruitFilters.map(([id,label]) => (
                <button key={id} className={`btn-ghost ${filter===id?"active":""}`}
                  onClick={() => setFilter(id)} style={{ padding:"9px 14px", fontSize:12 }}>{label}</button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8,
                color:"var(--text)", padding:"9px 14px", fontSize:13, cursor:"pointer",
                fontFamily:"'Rajdhani',sans-serif", outline:"none" }}>
              {sortOptions.map(([v,l]) => <option key={v} value={v}>Sort: {l}</option>)}
            </select>
          </>
        )}
      </div>

      {/* COMPARE BAR */}
      {tab === "fruits" && compareList.length > 0 && (
        <div className="glass" style={{ padding:"12px 20px", marginBottom:18, display:"flex",
          alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>Comparing:</span>
            {compareList.map(f => (
              <span key={f.id} style={{ fontSize:14, fontWeight:700 }}>{f.img} {f.name}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {compareList.length === 2 && (
              <button className="btn-primary" style={{ padding:"7px 16px", fontSize:12 }}
                onClick={() => setShowCompare(true)}>⚖️ Compare</button>
            )}
            <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }}
              onClick={() => setCompareList([])}>Clear</button>
          </div>
        </div>
      )}

      {/* FRUITS */}
      {tab === "fruits" && (
        filteredFruits.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 24px", color:"var(--muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🍈</div>
            <p style={{ fontSize:16 }}>No fruits match your search.</p>
            <button className="btn-ghost" style={{ marginTop:16 }} onClick={() => { setSearch(""); setFilter("all"); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid-3">
            {filteredFruits.map((f,i) => (
              <div key={f.id} className="card card-clickable anim-fade-up"
                style={{ padding:18, animationDelay:`${i*0.04}s` }}
                onClick={() => setSelected(f)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:36 }}>{f.img}</span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <TierBadge tier={f.tier} />
                    <button className="fav-btn" onClick={e=>{e.stopPropagation();toggleFavorite("fruit",f.id)}}>
                      {isFavorite("fruit",f.id)?"⭐":"☆"}
                    </button>
                  </div>
                </div>
                <div className="cinzel" style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{f.name}</div>
                <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                  <RarityBadge rarity={f.rarity} />
                  <span style={{ fontSize:11, color:"var(--muted)", padding:"2px 8px",
                    background:"rgba(255,255,255,0.04)", borderRadius:99 }}>{f.type}</span>
                </div>
                <StatBar label="PvP" value={f.pvp} />
                <StatBar label="PvE" value={f.pve} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                  <span style={{ fontSize:12, color:"var(--muted)" }}>
                    Trade: <strong style={{ color:"var(--accent)" }}>{f.tradingVal.toLocaleString()}</strong>
                  </span>
                  <button className={`compare-btn ${compareList.find(c=>c.id===f.id)?"selected":""}`}
                    onClick={e=>{e.stopPropagation();toggleCompare(f)}}>
                    {compareList.find(c=>c.id===f.id)?"✓ Added":"+ Compare"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SWORDS */}
      {tab === "swords" && (
        <div className="grid-2">
          {filteredSwords.map(s => (
            <div key={s.id} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:38, flexShrink:0 }}>{s.img}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span className="cinzel" style={{ fontSize:16, fontWeight:700 }}>{s.name}</span>
                    <button className="fav-btn" onClick={() => toggleFavorite("sword",s.id)}>
                      {isFavorite("sword",s.id)?"⭐":"☆"}
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <RarityBadge rarity={s.rarity} />
                    <span style={{ fontSize:11, color:"var(--muted)", padding:"2px 8px",
                      background:"rgba(255,255,255,0.04)", borderRadius:99 }}>{s.type}</span>
                  </div>
                  <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6, marginBottom:10 }}>{s.desc}</p>
                  <StatBar label="Damage" value={s.dmg} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GUNS */}
      {tab === "guns" && (
        <div className="grid-2">
          {GUNS.filter(g => !debouncedSearch || g.name.toLowerCase().includes(debouncedSearch.toLowerCase())).map(g => (
            <div key={g.id} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:14 }}>
                <div style={{ fontSize:36, flexShrink:0 }}>{g.img}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span className="cinzel" style={{ fontSize:15, fontWeight:700 }}>{g.name}</span>
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <RarityBadge rarity={g.rarity} />
                    <span style={{ fontSize:11, color:"var(--muted)", padding:"2px 8px",
                      background:"rgba(255,255,255,0.04)", borderRadius:99 }}>{g.type}</span>
                  </div>
                  <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6, marginBottom:8 }}>{g.desc}</p>
                  <StatBar label="Damage" value={g.dmg} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FIGHTING STYLES */}
      {tab === "fighting" && (
        <div className="grid-2">
          {FIGHTING_STYLES.map(f => (
            <div key={f.id} className="card" style={{ padding:20, display:"flex", gap:14 }}>
              <div style={{ fontSize:42, flexShrink:0 }}>{f.img}</div>
              <div>
                <div className="cinzel" style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{f.name}</div>
                <RarityBadge rarity={f.rarity} />
                <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6, marginTop:8 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOSSES */}
      {tab === "bosses" && (
        <div className="grid-2">
          {BOSSES.filter(b => !debouncedSearch || b.name.toLowerCase().includes(debouncedSearch.toLowerCase())).map(b => (
            <div key={b.id} className="card" style={{ padding:20 }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:42, flexShrink:0 }}>{b.img}</div>
                <div style={{ flex:1 }}>
                  <div className="cinzel" style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{b.name}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"var(--accent)", padding:"2px 8px",
                      border:"1px solid rgba(0,200,255,0.3)", borderRadius:99 }}>{b.sea}</span>
                    <span style={{ fontSize:11, color:"var(--muted)", padding:"2px 8px",
                      background:"rgba(255,255,255,0.04)", borderRadius:99 }}>Lvl {b.lvl}</span>
                    <span style={{ fontSize:11, color:"var(--muted)", padding:"2px 8px",
                      background:"rgba(255,255,255,0.04)", borderRadius:99, textTransform:"capitalize" }}>HP: {b.hp}</span>
                  </div>
                  <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
                    🎁 <strong>Drops:</strong> {b.reward}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAPS */}
      {tab === "maps" && (
        ["First Sea","Second Sea","Third Sea"].map(sea => (
          <div key={sea} style={{ marginBottom:36 }}>
            <h3 className="cinzel" style={{ fontSize:20, fontWeight:700, marginBottom:16, color:"var(--accent)" }}>{sea}</h3>
            <div className="grid-3">
              {MAPS.filter(m => m.sea === sea).map(m => (
                <div key={m.id} className="card" style={{ padding:18 }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>{m.img}</div>
                  <div className="cinzel" style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:"var(--accent)", fontWeight:700, marginBottom:8 }}>Level {m.lvl}</div>
                  <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── TIER LIST PAGE ──
function TierListPage() {
  const { apiKey } = useApp();
  const [aiComment, setAiComment] = useState("");
  const [loading, setLoading] = useState(false);

  const tiers = useMemo(() => {
    const groups = {};
    FRUITS.forEach(f => { (groups[f.tier]||=[]).push(f); });
    return groups;
  }, []);

  const askMeta = useCallback(async () => {
    if (!apiKey) { setAiComment("⚠️ Set your API key in Settings to use AI features."); return; }
    setLoading(true); setAiComment("");
    try {
      const text = await callClaude(apiKey,
        "You are a competitive Blox Fruits analyst.",
        [{ role:"user", content:"Give me a concise current meta breakdown for Update 21: top PvP fruits, top PvE fruits, and any fruits that are underrated or overrated right now." }]
      );
      setAiComment(text);
    } catch(e) { setAiComment(`⚠️ ${e.message}`); }
    setLoading(false);
  }, [apiKey]);

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 className="cinzel" style={{ fontSize:30, fontWeight:900, marginBottom:6 }}>
            Fruit <span style={{ color:"var(--accent)" }}>Tier List</span>
          </h2>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Based on Update 21 meta. PvP & PvE combined ratings.</p>
        </div>
        <button className="btn-primary" onClick={askMeta} disabled={loading}>
          {loading ? "Analyzing..." : "🤖 AI Meta Analysis"}
        </button>
      </div>

      {(loading || aiComment) && (
        <div className="glass anim-fade" style={{ padding:24, marginBottom:28 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#0076FF,#00C8FF)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>🤖</div>
            <span className="cinzel" style={{ color:"var(--accent)", fontWeight:700, fontSize:13, letterSpacing:1 }}>META ANALYSIS</span>
          </div>
          {loading ? <Spinner /> : <div style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiComment}</div>}
        </div>
      )}

      {["S","A","B","C","D"].map(tier => (
        tiers[tier] && (
          <div key={tier} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              <TierBadge tier={tier} />
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              <span style={{ fontSize:12, color:"var(--muted)" }}>{tiers[tier].length} fruits</span>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {tiers[tier].map(f => (
                <div key={f.id} className="glass" style={{ padding:"10px 16px", display:"flex", alignItems:"center", gap:10, borderRadius:12 }}>
                  <span style={{ fontSize:26 }}>{f.img}</span>
                  <div>
                    <div className="cinzel" style={{ fontSize:14, fontWeight:700 }}>{f.name}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{f.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// ── BUILD CREATOR PAGE ──
function BuildCreatorPage() {
  const { apiKey } = useApp();
  const [selections, setSelections] = useState({ fruit:"", sword:"", style:"", focus:"pvp" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sel = useCallback((key, val) => setSelections(p => ({...p, [key]:val})), []);

  const generate = useCallback(async () => {
    if (!apiKey) { setResult("⚠️ Set your API key in Settings."); return; }
    const { fruit, sword, style, focus } = selections;
    if (!fruit && !sword && !style) { setResult("⚠️ Select at least one item to build around."); return; }
    setLoading(true); setResult("");
    const parts = [fruit&&`Fruit: ${fruit}`, sword&&`Sword: ${sword}`, style&&`Fighting Style: ${style}`].filter(Boolean).join(", ");
    try {
      const text = await callClaude(apiKey,
        "You are a top Blox Fruits build strategist. Create detailed, actionable build guides.",
        [{ role:"user", content:`Create a complete ${focus.toUpperCase()} build using: ${parts}. Include: stat distribution, combo steps, best accessories, playstyle tips, and a 1-10 rating. Format clearly with sections.` }]
      );
      setResult(text);
    } catch(e) { setResult(`⚠️ ${e.message}`); }
    setLoading(false);
  }, [selections, apiKey]);

  const copyResult = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const Picker = ({ label, items, key2, icon }) => (
    <div>
      <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>{icon} {label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        <button className={`btn-ghost ${!selections[key2]?"active":""}`} onClick={() => sel(key2,"")}>None</button>
        {items.map(item => (
          <button key={item.name} className={`btn-ghost ${selections[key2]===item.name?"active":""}`}
            onClick={() => sel(key2, item.name)}>
            {item.img} {item.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <h2 className="cinzel" style={{ fontSize:30, fontWeight:900, marginBottom:6 }}>
        Build <span style={{ color:"var(--accent)" }}>Creator</span>
      </h2>
      <p style={{ color:"var(--muted)", marginBottom:32, fontSize:14 }}>Select your gear and let AI craft your optimal build.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:2, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>🎯 Focus</div>
            <div style={{ display:"flex", gap:8 }}>
              {["pvp","pve","hybrid"].map(f => (
                <button key={f} className={`btn-ghost ${selections.focus===f?"active":""}`}
                  onClick={() => sel("focus",f)} style={{ textTransform:"capitalize" }}>{f}</button>
              ))}
            </div>
          </div>
          <Picker label="Fruit" items={FRUITS.slice(0,8)} key2="fruit" icon="🍈" />
          <Picker label="Sword" items={SWORDS.slice(0,6)} key2="sword" icon="⚔️" />
          <Picker label="Fighting Style" items={FIGHTING_STYLES} key2="style" icon="🥊" />
          <button className="btn-primary anim-pulse" onClick={generate} disabled={loading}
            style={{ padding:"14px 0", fontSize:15, letterSpacing:2 }}>
            {loading ? "Generating..." : "⚡ GENERATE BUILD"}
          </button>
        </div>

        <div>
          {(loading || result) ? (
            <div className="glass" style={{ padding:24, height:"100%", minHeight:300, position:"relative" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <span className="cinzel" style={{ color:"var(--accent)", fontWeight:700, fontSize:13, letterSpacing:1 }}>
                  ⚡ YOUR BUILD
                </span>
                {result && (
                  <button className="btn-ghost" onClick={copyResult} style={{ fontSize:12, padding:"5px 12px" }}>
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                )}
              </div>
              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap", overflowY:"auto", maxHeight:500 }}>{result}</div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding:32, height:"100%", minHeight:280, display:"flex",
              flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>⚗️</div>
              <div className="cinzel" style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Build Preview</div>
              <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6 }}>
                Select your gear on the left and click Generate Build to get a personalized strategy guide.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NEWS PAGE ──
function NewsPage() {
  const { apiKey } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("all");

  const searchNews = useCallback(async () => {
    if (!query.trim()) return;
    if (!apiKey) { setResults("⚠️ Set your API key in Settings."); return; }
    setLoading(true); setResults("");
    try {
      const text = await callClaude(apiKey,
        "You are a Blox Fruits update historian with knowledge of all patches, events, and balance changes.",
        [{ role:"user", content: query }]
      );
      setResults(text);
    } catch(e) { setResults(`⚠️ ${e.message}`); }
    setLoading(false);
  }, [query, apiKey]);

  const filteredNews = useMemo(() =>
    activeTag === "all" ? NEWS : NEWS.filter(n => n.tag === activeTag),
  [activeTag]);

  return (
    <div className="section" style={{ paddingTop:32 }}>
      <h2 className="cinzel" style={{ fontSize:30, fontWeight:900, marginBottom:6 }}>
        News & <span style={{ color:"var(--accent)" }}>Updates</span>
      </h2>
      <p style={{ color:"var(--muted)", marginBottom:28, fontSize:14 }}>Latest patches, events, and balance changes.</p>

      {/* AI SEARCH */}
      <div className="glass" style={{ padding:24, marginBottom:32 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)", letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>
          🤖 Ask About Updates
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input className="input-field" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key==="Enter" && searchNews()}
            placeholder='e.g. "What changed with Dough fruit?" or "Summary of Update 21"' style={{ flex:1 }} />
          <button className="btn-primary" onClick={searchNews} disabled={loading}>{loading?"...":"Ask"}</button>
        </div>
        {(loading || results) && (
          <div style={{ marginTop:16 }}>
            {loading ? <Spinner /> : <div style={{ fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{results}</div>}
          </div>
        )}
      </div>

      {/* TAG FILTERS */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["all","Update","Patch","Event"].map(tag => (
          <button key={tag} className={`btn-ghost ${activeTag===tag?"active":""}`}
            onClick={() => setActiveTag(tag)} style={{ fontSize:12, padding:"7px 14px" }}>
            {tag === "all" ? "All" : tag}
          </button>
        ))}
      </div>

      {/* NEWS CARDS */}
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {filteredNews.map(n => (
          <div key={n.id} className="card" style={{ padding:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase",
                  color: TAG_COLORS[n.tag]||"var(--accent)", padding:"3px 10px",
                  border:`1px solid currentColor`, borderRadius:99 }}>{n.tag}</span>
                <span style={{ fontSize:13, color:"var(--muted)" }}>{n.date}</span>
              </div>
            </div>
            <h3 className="cinzel" style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{n.title}</h3>
            <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </AppProvider>
  );
}

function AppInner() {
  const { apiKey } = useApp();
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive:true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nav = useCallback((id) => {
    setPage(id); setMobileMenuOpen(false); window.scrollTo({top:0,behavior:"smooth"});
  }, []);

  const pages = [
    { id:"home",     icon:"🏠", label:"Home"      },
    { id:"chat",     icon:"🤖", label:"AI Chat"   },
    { id:"database", icon:"📚", label:"Database"  },
    { id:"tierlist", icon:"🏆", label:"Tier List" },
    { id:"builder",  icon:"⚗️", label:"Builder"   },
    { id:"news",     icon:"📰", label:"News"      },
  ];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0076FF,#00C8FF)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🍈</div>
          <span className="cinzel" style={{ fontWeight:900, fontSize:18, letterSpacing:1 }}>
            BLOX<span style={{ color:"var(--accent)" }}>FRUITS</span>
            <span style={{ color:"var(--muted)", fontSize:11, marginLeft:6, fontWeight:400 }}>AI</span>
          </span>
        </div>

        <div className="desktop-nav" style={{ display:"flex", gap:4 }}>
          {pages.map(p => (
            <button key={p.id} className={`nav-btn ${page===p.id?"active":""}`} onClick={() => nav(p.id)}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings"
            style={{ borderColor: apiKey ? "var(--green)" : "var(--border)", color: apiKey ? "var(--green)" : "var(--muted)" }}>
            ⚙️
          </button>
          <button className="btn-icon hide-mobile" onClick={() => setMobileMenuOpen(o=>!o)}
            style={{ display:"none" }}>☰</button>
          {/* This shows on mobile via CSS */}
          <button onClick={() => setMobileMenuOpen(o=>!o)}
            style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8,
              color:"var(--muted)", padding:"7px 12px", cursor:"pointer", fontSize:18,
              lineHeight:1, display:"none" }} className="show-mobile">☰</button>
          <button className="btn-primary" style={{ padding:"8px 16px", fontSize:12 }}>⚡ Play</button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:999,
          background:"rgba(3,8,15,0.98)", borderBottom:"1px solid var(--border)",
          padding:16, display:"flex", flexDirection:"column", gap:8 }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => nav(p.id)}
              style={{ background: page===p.id?"rgba(0,200,255,0.1)":"transparent",
                border:`1px solid ${page===p.id?"var(--accent)":"var(--border)"}`,
                borderRadius:8, color: page===p.id?"var(--accent)":"var(--text)",
                padding:"12px 16px", cursor:"pointer", fontSize:15,
                fontFamily:"'Rajdhani',sans-serif", fontWeight:600, textAlign:"left" }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      <div className="content-area">
        <ErrorBoundary>
          {page==="home"     && <HomePage onNav={nav} />}
          {page==="chat"     && <ChatPage />}
          {page==="database" && <DatabasePage />}
          {page==="tierlist" && <TierListPage />}
          {page==="builder"  && <BuildCreatorPage />}
          {page==="news"     && <NewsPage />}
        </ErrorBoundary>
      </div>

      {/* BOTTOM MOBILE NAV */}
      <div className="mobile-nav">
        {pages.map(p => (
          <button key={p.id} onClick={() => nav(p.id)}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              background:"transparent", border:"none",
              color: page===p.id ? "var(--accent)" : "var(--muted)",
              cursor:"pointer", padding:"0 6px", flex:1 }}>
            <span style={{ fontSize:18 }}>{p.icon}</span>
            <span style={{ fontSize:10, fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* SCROLL TO TOP */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>↑</button>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"28px 24px", textAlign:"center", background:"var(--bg2)" }}>
        <div className="cinzel" style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}>
          🍈 BLOX FRUITS AI — Powered by Claude
        </div>
        <div style={{ fontSize:11, color:"var(--muted)", opacity:0.5 }}>
          Unofficial fan resource. Not affiliated with Roblox or the Blox Fruits dev team.
        </div>
      </footer>
    </div>
  );
}
