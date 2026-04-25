import { useState, useEffect, useRef } from 'react';
import { teams, liveMatches } from '../utils/iplData';

const OUTCOMES = [
  { val: 0, w: 30 }, { val: 1, w: 28 }, { val: 2, w: 12 },
  { val: 3, w: 3 }, { val: 4, w: 14 }, { val: 6, w: 8 }, { val: 'W', w: 5 }
];

function randomOutcome() {
  const total = OUTCOMES.reduce((s, o) => s + o.w, 0);
  let r = Math.random() * total;
  for (const o of OUTCOMES) { r -= o.w; if (r <= 0) return o.val; }
  return 0;
}

function initMatch(match) {
  const t1 = teams[match.team1], t2 = teams[match.team2];
  const batters = t1.players.filter(p => ['BAT','WK','ALL'].includes(p.role));
  const bowlers = t2.players.filter(p => ['BOWL','ALL'].includes(p.role));

  const isEnded    = match.status === 'ENDED';
  const isLive     = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING' || match.status === 'SOON';

  // Seed scores only for ENDED/LIVE — upcoming matches start at 0
  const seedScore   = isEnded ? 206 : isLive ? 118 : 0;
  const seedWickets = isEnded ? 5   : isLive ? 2   : 0;
  const seedBalls   = isEnded ? 113 : isLive ? 72  : 0;

  const dismissed = (isLive || isEnded) ? [
    { ...batters[0], r: isEnded?81:42, b: isEnded?44:31, fours: isEnded?8:4, sixes: isEnded?4:2, out:true, how:`b ${bowlers[1]?.name||'Mohammed Shami'}` },
    { ...batters[1], r: isEnded?12:28, b: isEnded?10:22, fours: isEnded?1:3, sixes:0, out:true, how:`c sub b ${bowlers[0]?.name||'Rashid Khan'}` },
  ] : [];

  if (isEnded) {
    dismissed.push({ ...batters[2], r:4,  b:6,  fours:0, sixes:0, out:true, how:`lbw b ${bowlers[2]?.name||'Noor Ahmad'}` });
    dismissed.push({ ...batters[3], r:39, b:29, fours:4, sixes:1, out:true, how:`c ${bowlers[3]?.name||'Vijay Shankar'} b ${bowlers[0]?.name||'Rashid Khan'}` });
    dismissed.push({ ...batters[4], r:18, b:12, fours:2, sixes:1, out:true, how:`b ${bowlers[1]?.name||'Mohammed Shami'}` });
  }

  // For UPCOMING: batsmen start at 0. For LIVE: use seeded values. For ENDED: use final values.
  const batsmanSeed = isUpcoming
    ? [
        { ...batters[0], r:0, b:0, fours:0, sixes:0, out:false, how:'' },
        { ...batters[1], r:0, b:0, fours:0, sixes:0, out:false, how:'' },
      ]
    : [
        { ...batters[isEnded?5:seedWickets], r: isEnded?44:34, b: isEnded?35:27, fours: isEnded?1:3, sixes: isEnded?3:1, out:false, how:'' },
        { ...batters[isEnded?6:seedWickets+1], r: isEnded?65:11, b: isEnded?49:9,  fours: isEnded?6:1, sixes: isEnded?2:0, out:false, how:'' },
      ];

  return {
    match, batting: t1, bowling: t2,
    score: seedScore, wickets: seedWickets, balls: seedBalls,
    batsmen: batsmanSeed,
    dismissed,
    nextBatter: isEnded ? 7 : isUpcoming ? 2 : seedWickets + 2,
    allBatters: batters,
    bowler: isUpcoming
      ? { ...bowlers[0], o:0, m:0, r:0, w:0 }
      : { ...bowlers[isEnded?3:1], o: isEnded?4:3, m:0, r: isEnded?33:28, w: isEnded?1:1 },
    bowlerIdx: isEnded ? 3 : 0,
    allBowlers: bowlers,
    usedBowlers: (isLive || isEnded) ? [
      { ...bowlers[0], o: isEnded?4:3, m:0, r: isEnded?32:24, w: isEnded?2:1 },
      { ...bowlers[1], o: isEnded?4:3, m:0, r: isEnded?35:28, w: isEnded?1:1 },
      { ...bowlers[2], o: isEnded?4:0, m:0, r: isEnded?28:0,  w: isEnded?1:0 },
      { ...bowlers[3], o: isEnded?3:0, m:0, r: isEnded?33:0,  w: isEnded?1:0 },
    ] : [{ ...bowlers[0], o:0, m:0, r:0, w:0 }],
    thisOver: isLive ? [1,4,0,2] : [],
    commentary: (isLive || isEnded) ? [
      isEnded ? `MATCH OVER! Royal Challengers Bengaluru won by 5 wickets!` : `${batters[seedWickets]?.name} drives elegantly for FOUR!`,
      isEnded ? `Cameron Green hits the winning runs! RCB chase down 206 in style!` : `Dot ball — tight line outside off stump`,
      isEnded ? `Virat Kohli — Player of the Match! 81 off 44 balls` : `${batters[seedWickets]?.name} works it to mid-wicket for 2`,
    ] : [],
    done: isEnded,
  };
}

function sr(r, b) { return b === 0 ? '0.00' : (r / b * 100).toFixed(1); }
function eco(r, balls) { return balls === 0 ? '0.00' : (r / balls * 6).toFixed(2); }
function overs(balls) { return `${Math.floor(balls/6)}.${balls%6}`; }
function crr(score, balls) { return balls === 0 ? '0.00' : (score / balls * 6).toFixed(2); }

const ballColor = v => v === 'W' ? '#ef4444' : v === 6 ? '#8b5cf6' : v === 4 ? '#3b82f6' : v === 0 ? '#374151' : '#e5e7eb';
const ballText = v => v === 'W' ? 'W' : String(v);

const LIVE_MATCH_ID = 151889; // RCB vs GT, IPL 2026 Match 42

export default function IPLScoreboard() {
  const [matchIdx, setMatchIdx] = useState(0);
  const [state, setState] = useState(() => initMatch(liveMatches[0]));
  const [tab, setTab] = useState('SCORECARD');
  const [paused, setPaused] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [liveError, setLiveError] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [schedule, setSchedule] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const timerRef = useRef(null);
  const liveRef = useRef(null);
  const countRef = useRef(null);

  // Fetch schedule and points table once on mount
  useEffect(() => {
    fetch('/api/cricket/series/schedule').then(r => r.json()).then(d => {
      if (d.matches) setSchedule(d.matches);
    }).catch(() => {});
    fetch('/api/cricket/series/pointstable').then(r => r.json()).then(d => {
      if (d.table) setPointsTable(d.table);
    }).catch(() => {});
  }, []);

  // Fetch real data from Cricbuzz proxy
  const fetchLive = async () => {
    if (matchIdx !== 0) return;
    try {
      const r = await fetch(`/api/cricket/${LIVE_MATCH_ID}/live`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setLiveData(d);
      setLiveError(null);
      setCountdown(30);
      // If match ended, stop the auto-refresh interval
      if (d.isCompleted) {
        clearInterval(liveRef.current);
        clearInterval(countRef.current);
      }
    } catch (e) {
      setLiveError(e.message);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchLive();
    liveRef.current = setInterval(fetchLive, 30000);
    // 1-second countdown tick
    countRef.current = setInterval(() => setCountdown(c => (c <= 1 ? 30 : c - 1)), 1000);
    return () => { clearInterval(liveRef.current); clearInterval(countRef.current); };
  }, [matchIdx]);

  useEffect(() => {
    setState(initMatch(liveMatches[matchIdx]));
    setLiveData(null);   // ← clear old match's scraped data
    setLiveError(null);
    setTab('SCORECARD');
  }, [matchIdx]);

  // Stop simulation if match.status is ENDED (known) OR live API confirms isCompleted
  const matchEnded = liveMatches[matchIdx]?.status === 'ENDED' || liveData?.isCompleted === true;
  // Don't simulate upcoming matches
  const matchStatus = liveMatches[matchIdx]?.status;
  const matchNotStarted = matchStatus === 'SOON' || matchStatus === 'UPCOMING';

  useEffect(() => {
    if (paused || matchEnded || matchNotStarted) return; // ← stop sim when match over or not started yet
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.done) return prev;
        const s = JSON.parse(JSON.stringify(prev));
        const outcome = randomOutcome();
        const strikerIdx = 0;
        const striker = s.batsmen[strikerIdx];
        const nonStriker = s.batsmen[1];

        if (outcome === 'W') {
          striker.out = true;
          striker.how = `b ${s.bowler.name}`;
          s.dismissed.push({ ...striker });
          s.wickets++;
          s.bowler.w++;
          s.bowler.r += 0;
          s.thisOver.push('W');
          s.commentary.unshift(`OUT! ${striker.name} dismissed by ${s.bowler.name}!`);
          if (s.nextBatter < s.allBatters.length) {
            const newB = { ...s.allBatters[s.nextBatter], r:0, b:0, fours:0, sixes:0, out:false, how:'' };
            s.batsmen = [nonStriker, newB];
            s.nextBatter++;
          } else { s.done = true; return s; }
        } else {
          striker.r += outcome;
          striker.b++;
          if (outcome === 4) striker.fours++;
          if (outcome === 6) striker.sixes++;
          s.score += outcome;
          s.bowler.r += outcome;
          s.thisOver.push(outcome);
          const desc = outcome === 0 ? `Dot ball — ${striker.name} defends` :
            outcome === 6 ? `SIX! ${striker.name} launches it over the ropes!` :
            outcome === 4 ? `FOUR! ${striker.name} drives to the boundary!` :
            `${striker.name} pushes for ${outcome}`;
          s.commentary.unshift(desc);
          if (s.commentary.length > 30) s.commentary.pop();
          if (outcome % 2 === 1) s.batsmen = [nonStriker, striker];
        }

        s.balls++;
        if (s.balls % 6 === 0) {
          s.bowler.o++;
          s.thisOver = [];
          s.batsmen = [s.batsmen[1], s.batsmen[0]];
          const nextBowlerIdx = (s.bowlerIdx + 1) % s.allBowlers.length;
          s.bowlerIdx = nextBowlerIdx;
          const existing = s.usedBowlers.find(b => b.name === s.allBowlers[nextBowlerIdx].name);
          if (existing) s.bowler = existing;
          else {
            const nb = { ...s.allBowlers[nextBowlerIdx], o:0, m:0, r:0, w:0 };
            s.usedBowlers.push(nb);
            s.bowler = nb;
          }
        }
        if (s.balls >= 120 || s.wickets >= 10) s.done = true;
        return s;
      });
    }, 2500);
    return () => clearInterval(timerRef.current);
  }, [paused, matchIdx, matchEnded, matchNotStarted]);

  const { match, batting, bowling, score, wickets, balls, batsmen, dismissed, bowler, usedBowlers, thisOver, commentary, done } = state;
  const t1 = teams[match.team1], t2 = teams[match.team2];


  // Prefer real scraped data, fall back to simulation state
  const live = liveData;
  const inn1 = live?.innings?.[0];
  const inn2 = live?.innings?.[1];
  // For ended RCB vs GT: GT batted first (205/3), RCB chased (206/5)
  const displayScore = inn2 || inn1;
  const displayCommentary = live?.commentary?.length ? live.commentary : commentary;
  const displayBatsmen = live?.batsmen?.length ? live.batsmen : batsmen.filter(b => !b.out);
  const displayBowler = live?.bowlers?.find(b => b.active) || live?.bowlers?.[0] || bowler;
  const matchResult = live?.result || match.finalResult || null;
  const potm = live?.playerOfMatch || match.potm || null;

  // For ended match: show correct final scores from match data if API hasn't returned yet
  const gtScore  = inn1 || (matchEnded && match.team2 === 'GT' ? { team:'GT',  runs:205, wickets:3, overs:20   } : null);
  const rcbScore = inn2 || (matchEnded && match.team1 === 'RCB' ? { team:'RCB', runs:206, wickets:5, overs:18.5 } : null);
  const displayInnings = [gtScore, rcbScore].filter(Boolean);

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', fontFamily:'Inter,sans-serif', color:'#f1f5f9' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#0f172a)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'1rem 2rem', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1rem' }}>🏏</div>
        <div>
          <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.2rem',background:'linear-gradient(135deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>IPL 2026 Live</p>
          <p style={{ fontSize:'0.72rem',color:'#94a3b8' }}>SmartStadiumX Cricket Centre</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          {/* Countdown Timer — only show if match is ongoing */}
          {matchIdx === 0 && !matchEnded && (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <span style={{ fontSize:'0.7rem',color:'#94a3b8' }}>Next refresh in</span>
                <span style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1rem',color: countdown<=5?'#f87171':countdown<=10?'#f59e0b':'#34d399',minWidth:24,textAlign:'center' }}>{countdown}s</span>
              </div>
              <div style={{ width:120,height:3,background:'rgba(255,255,255,0.1)',borderRadius:99,overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:99,background: countdown<=5?'#ef4444':countdown<=10?'#f59e0b':'#34d399',width:`${(countdown/30)*100}%`,transition:'width 1s linear' }} />
              </div>
            </div>
          )}
          {/* Match ended badge */}
          {matchEnded && (
            <span style={{ padding:'6px 14px',borderRadius:8,background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24',fontSize:'0.8rem',fontWeight:700 }}>🏆 Match Ended</span>
          )}
          {!matchEnded && <button onClick={fetchLive} title="Refresh now" style={{ padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(59,130,246,0.15)',color:'#60a5fa',cursor:'pointer',fontSize:'0.8rem',fontWeight:600 }}>⟳ Now</button>}
          {!matchEnded && <button onClick={() => setPaused(p => !p)} style={{ padding:'6px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background: paused ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',color: paused ? '#34d399' : '#f87171',cursor:'pointer',fontSize:'0.8rem',fontWeight:600 }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>}
          {(done && !matchEnded) && <span style={{ padding:'6px 14px',borderRadius:8,background:'rgba(245,158,11,0.15)',color:'#fbbf24',fontSize:'0.8rem',fontWeight:600 }}>Innings Complete</span>}
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'1.5rem' }}>
        {/* Match Selector */}
        <div style={{ display:'flex',gap:8,marginBottom:'1.5rem',flexWrap:'wrap' }}>
          {liveMatches.map((m,i) => {
            const ta=teams[m.team1], tb=teams[m.team2];
            const isSelected = matchIdx===i;
            const isLive = m.status==='LIVE';
            // First match uses real data — check if it ended
            const isEnded = i===0 && matchEnded;
            return (
              <button key={m.id} onClick={() => setMatchIdx(i)}
                style={{ padding:'10px 14px',borderRadius:12,border:`1px solid ${isSelected?'rgba(99,102,241,0.6)':isEnded?'rgba(251,191,36,0.25)':isLive?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.08)'}`,background:isSelected?'rgba(99,102,241,0.2)':isEnded?'rgba(251,191,36,0.05)':isLive?'rgba(239,68,68,0.05)':'rgba(255,255,255,0.03)',cursor:'pointer',color:'#f1f5f9',fontSize:'0.8rem',fontWeight:600,display:'flex',flexDirection:'column',gap:6,alignItems:'flex-start',minWidth:160 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,width:'100%',justifyContent:'space-between' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <span style={{ background:ta.color,padding:'2px 7px',borderRadius:5,fontSize:'0.72rem',fontWeight:800 }}>{ta.short}</span>
                    <span style={{ color:'#64748b',fontSize:'0.75rem' }}>vs</span>
                    <span style={{ background:tb.color,padding:'2px 7px',borderRadius:5,fontSize:'0.72rem',fontWeight:800 }}>{tb.short}</span>
                  </div>
                  {isEnded
                    ? <span style={{ padding:'2px 8px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,background:'rgba(251,191,36,0.2)',color:'#fbbf24' }}>ENDED</span>
                    : isLive
                      ? <span style={{ display:'flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,background:'rgba(239,68,68,0.2)',color:'#ef4444' }}>
                          <span style={{ width:6,height:6,borderRadius:'50%',background:'#ef4444',display:'inline-block',animation:'livePulse 1s infinite' }} />LIVE
                        </span>
                      : <span style={{ padding:'2px 8px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,background:'rgba(100,116,139,0.2)',color:'#94a3b8' }}>SOON</span>
                  }
                </div>
                <p style={{ fontSize:'0.68rem',color:'#64748b',fontWeight:400 }}>{m.date}</p>
              </button>
            );
          })}
        </div>

        {/* Score Card */}
        <div style={{ background:`linear-gradient(135deg,${t1.color}22,${t2.color}22)`,border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'1.5rem',marginBottom:'1.5rem' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
            <p style={{ fontSize:'0.75rem',color:'#94a3b8' }}>{match.matchNo} · {match.venue}</p>
            {live && !matchEnded && <span style={{ fontSize:'0.7rem',color:'#34d399',background:'rgba(52,211,153,0.1)',padding:'2px 8px',borderRadius:6 }}>🟢 Live from Cricbuzz · {new Date(live.scrapedAt).toLocaleTimeString()}</span>}
            {matchEnded && <span style={{ fontSize:'0.7rem',color:'#fbbf24',background:'rgba(251,191,36,0.1)',padding:'2px 8px',borderRadius:6 }}>🏆 Match Completed</span>}
            {liveError && !matchEnded && <span style={{ fontSize:'0.7rem',color:'#f59e0b' }}>⚡ Simulation mode</span>}
          </div>

          {/* Result Banner — shown when match ends */}
          {matchEnded && matchResult && (
            <div style={{ background:'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.1))',border:'1px solid rgba(251,191,36,0.4)',borderRadius:12,padding:'0.75rem 1.25rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:12 }}>
              <span style={{ fontSize:'1.5rem' }}>🏆</span>
              <div>
                <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.1rem',color:'#fbbf24' }}>{matchResult}</p>
                <p style={{ fontSize:'0.72rem',color:'#94a3b8',marginTop:2 }}>Final Result · IPL 2026</p>
              </div>
            </div>
          )}
          {matchEnded && !matchResult && (
            <div style={{ background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:12,padding:'0.75rem 1.25rem',marginBottom:'1rem' }}>
              <p style={{ fontFamily:'Outfit',fontWeight:700,color:'#fbbf24' }}>🏆 Match has ended — Final scores shown below</p>
            </div>
          )}

          {/* Player of the Match */}
          {matchEnded && potm && (
            <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',border:'1px solid rgba(139,92,246,0.3)',borderRadius:10,padding:'8px 16px',marginBottom:'1rem',display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ fontSize:'1.2rem' }}>⭐</span>
              <div>
                <p style={{ fontSize:'0.65rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase' }}>Player of the Match</p>
                <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1rem',color:'#a78bfa' }}>{potm}</p>
              </div>
            </div>
          )}

          {/* Innings Summary — both teams */}
          {(displayInnings.length > 0) && (
            <div style={{ display:'flex',gap:16,marginBottom:'1rem',flexWrap:'wrap' }}>
              {displayInnings.map((inn, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'8px 14px',display:'flex',gap:10,alignItems:'center' }}>
                  <span style={{ background: teams[inn.team]?.color||'#374151',padding:'2px 6px',borderRadius:4,fontSize:'0.72rem',fontWeight:800 }}>{inn.team}</span>
                  <span style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.3rem' }}>{inn.runs}<span style={{ color:'#94a3b8',fontWeight:400 }}>/{inn.wickets}</span></span>
                  <span style={{ color:'#94a3b8',fontSize:'0.8rem' }}>({inn.overs} ov)</span>
                  <span style={{ fontSize:'0.72rem',padding:'2px 6px',borderRadius:4, background: i===0?'rgba(100,116,139,0.2)':'rgba(52,211,153,0.15)', color: i===0?'#94a3b8':'#34d399', fontWeight:600 }}>{i===0?'1st Inn':matchEnded?'Final':'LIVE ●'}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem' }}>
            <div style={{ display:'flex',alignItems:'center',gap:16 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:56,height:56,borderRadius:14,background:t1.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.2rem',marginBottom:4 }}>{t1.short}</div>
                <p style={{ fontSize:'0.75rem',color:'#94a3b8' }}>{t1.name}</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'Outfit',fontWeight:900,fontSize:'3.5rem',lineHeight:1 }}>
                  {displayScore ? displayScore.runs : score}
                  <span style={{ fontSize:'1.5rem',color:'#94a3b8' }}>/{displayScore ? displayScore.wickets : wickets}</span>
                </p>
                <p style={{ color:'#94a3b8',fontSize:'0.85rem' }}>{displayScore ? `${displayScore.overs} overs` : overs(balls)}</p>
              </div>
            </div>
            <div style={{ display:'flex',gap:24 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:'0.7rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase' }}>CRR</p>
                <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.8rem',color:'#34d399' }}>{live?.crr || crr(score,balls)}</p>
              </div>
              {!matchEnded && <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:'0.7rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase' }}>RRR</p>
                <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.8rem',color:'#f59e0b' }}>{live?.rrr || '—'}</p>
              </div>}
              {live?.reqRuns && !matchEnded && (
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:'0.7rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase' }}>Need</p>
                  <p style={{ fontFamily:'Outfit',fontWeight:800,fontSize:'1.4rem',color:'#f87171' }}>{live.reqRuns} <span style={{ fontSize:'0.85rem',color:'#94a3b8' }}>in {live.reqBalls}b</span></p>
                </div>
              )}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:56,height:56,borderRadius:14,background:t2.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.2rem',marginBottom:4 }}>{t2.short}</div>
              <p style={{ fontSize:'0.75rem',color:'#94a3b8' }}>{t2.name}</p>
            </div>
          </div>

          {/* This Over (simulation) */}
          {!live && <div style={{ marginTop:'1.25rem', display:'flex',alignItems:'center',gap:8 }}>
            <p style={{ fontSize:'0.75rem',color:'#94a3b8',fontWeight:600,marginRight:4 }}>THIS OVER:</p>
            {thisOver.map((b,i) => (
              <div key={i} style={{ width:30,height:30,borderRadius:'50%',background:ballColor(b),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:700,color: b===0?'#6b7280':'#0a0e1a' }}>{ballText(b)}</div>
            ))}
            {Array(6-thisOver.length).fill(0).map((_,i)=>(
              <div key={i} style={{ width:30,height:30,borderRadius:'50%',border:'1px dashed rgba(255,255,255,0.15)' }} />
            ))}
          </div>}
        </div>


        {/* Batsmen & Bowler */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem' }}>
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.25rem' }}>
            <p style={{ fontSize:'0.72rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase',marginBottom:'0.75rem' }}>🏏 At the Crease</p>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
              <thead><tr>{['Batsman','R','B','4s','6s','SR'].map(h=><th key={h} style={{ textAlign:h==='Batsman'?'left':'center',color:'#64748b',fontWeight:600,fontSize:'0.7rem',paddingBottom:6,textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {displayBatsmen.map((b,i)=>(
                  <tr key={b.name}>
                    <td style={{ padding:'5px 0',fontWeight:700 }}>{b.name}{(b.striker||i===0)?<span style={{ color:'#f59e0b',marginLeft:6 }}>*</span>:''}</td>
                    <td style={{ textAlign:'center',fontWeight:700,color:'#f59e0b' }}>{b.r}</td>
                    <td style={{ textAlign:'center',color:'#94a3b8' }}>{b.b}</td>
                    <td style={{ textAlign:'center',color:'#60a5fa' }}>{b.fours}</td>
                    <td style={{ textAlign:'center',color:'#a78bfa' }}>{b.sixes}</td>
                    <td style={{ textAlign:'center' }}>{b.sr || (b.b?((b.r/b.b)*100).toFixed(1):'0.00')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.25rem' }}>
            <p style={{ fontSize:'0.72rem',color:'#94a3b8',fontWeight:600,textTransform:'uppercase',marginBottom:'0.75rem' }}>⚡ Current Bowler</p>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
              <thead><tr>{['Bowler','O','M','R','W','Eco'].map(h=><th key={h} style={{ textAlign:h==='Bowler'?'left':'center',color:'#64748b',fontWeight:600,fontSize:'0.7rem',paddingBottom:6,textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight:700 }}>{displayBowler?.name} <span style={{ color:'#34d399',fontSize:'0.7rem' }}>●</span></td>
                  <td style={{ textAlign:'center' }}>{displayBowler?.o ?? displayBowler?.o ?? '—'}</td>
                  <td style={{ textAlign:'center',color:'#94a3b8' }}>{displayBowler?.m ?? '0'}</td>
                  <td style={{ textAlign:'center',color:'#f87171' }}>{displayBowler?.r ?? '—'}</td>
                  <td style={{ textAlign:'center',color:'#f59e0b',fontWeight:700 }}>{displayBowler?.w ?? '—'}</td>
                  <td style={{ textAlign:'center' }}>{displayBowler?.eco ?? (displayBowler?.o ? ((displayBowler.r/(displayBowler.o*6))*6).toFixed(2) : '—')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* Tabs */}
        <div style={{ display:'flex',gap:4,marginBottom:'1rem',background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,flexWrap:'wrap' }}>
          {['SCORECARD','BOWLING','COMMENTARY','SQUADS','SCHEDULE','POINTS TABLE'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'7px 16px',borderRadius:9,border:'none',background:tab===t?'rgba(99,102,241,0.3)':'transparent',color:tab===t?'#a78bfa':'#94a3b8',cursor:'pointer',fontSize:'0.78rem',fontWeight:700,transition:'all 0.2s' }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'1.5rem' }}>
          {tab==='SCORECARD' && (
            <div>
              <p style={{ fontWeight:700,marginBottom:'0.75rem',color:'#60a5fa' }}>{batting.name} Innings</p>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
                <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{['Batsman','Dismissal','R','B','4s','6s','SR'].map(h=><th key={h} style={{ textAlign:h==='Batsman'||h==='Dismissal'?'left':'center',padding:'8px 4px',color:'#64748b',fontWeight:600,fontSize:'0.7rem',textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {dismissed.map(b=>(
                    <tr key={b.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',opacity:0.7 }}>
                      <td style={{ padding:'7px 4px',fontWeight:600 }}>{b.name}</td>
                      <td style={{ padding:'7px 4px',color:'#94a3b8',fontSize:'0.75rem' }}>{b.how}</td>
                      <td style={{ textAlign:'center',fontWeight:700 }}>{b.r}</td>
                      <td style={{ textAlign:'center',color:'#94a3b8' }}>{b.b}</td>
                      <td style={{ textAlign:'center',color:'#60a5fa' }}>{b.fours}</td>
                      <td style={{ textAlign:'center',color:'#a78bfa' }}>{b.sixes}</td>
                      <td style={{ textAlign:'center' }}>{sr(b.r,b.b)}</td>
                    </tr>
                  ))}
                  {batsmen.filter(b=>!b.out).map((b,i)=>(
                    <tr key={b.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'7px 4px',fontWeight:700 }}>{b.name} {i===0&&<span style={{ color:'#f59e0b' }}>*</span>}</td>
                      <td style={{ padding:'7px 4px',color:'#34d399',fontSize:'0.75rem' }}>batting</td>
                      <td style={{ textAlign:'center',fontWeight:700,color:'#fbbf24' }}>{b.r}</td>
                      <td style={{ textAlign:'center',color:'#94a3b8' }}>{b.b}</td>
                      <td style={{ textAlign:'center',color:'#60a5fa' }}>{b.fours}</td>
                      <td style={{ textAlign:'center',color:'#a78bfa' }}>{b.sixes}</td>
                      <td style={{ textAlign:'center' }}>{sr(b.r,b.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop:'1rem',padding:'0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:10 }}>
                <span style={{ fontWeight:700,color:'#fbbf24' }}>Total: {score}/{wickets}</span>
                <span style={{ color:'#94a3b8',marginLeft:16,fontSize:'0.85rem' }}>({overs(balls)} Ov, RR: {crr(score,balls)})</span>
              </div>
            </div>
          )}

          {tab==='BOWLING' && (
            <div>
              <p style={{ fontWeight:700,marginBottom:'0.75rem',color:'#ef4444' }}>{bowling.name} Bowling</p>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
                <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{['Bowler','O','M','R','W','Economy'].map(h=><th key={h} style={{ textAlign:h==='Bowler'?'left':'center',padding:'8px 4px',color:'#64748b',fontWeight:600,fontSize:'0.7rem',textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {usedBowlers.map(b=>(
                    <tr key={b.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'7px 4px',fontWeight:b.name===bowler.name?700:400 }}>
                        {b.name}{b.name===bowler.name&&<span style={{ color:'#34d399',marginLeft:6,fontSize:'0.7rem' }}>●</span>}
                      </td>
                      <td style={{ textAlign:'center' }}>{b.o}</td>
                      <td style={{ textAlign:'center',color:'#94a3b8' }}>{b.m}</td>
                      <td style={{ textAlign:'center',color:'#f87171' }}>{b.r}</td>
                      <td style={{ textAlign:'center',fontWeight:700,color: b.w>=3?'#f59e0b':'#f1f5f9' }}>{b.w}</td>
                      <td style={{ textAlign:'center' }}>{eco(b.r,b.o*6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab==='COMMENTARY' && (
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:'1rem' }}>
                <p style={{ fontWeight:700,color:'#a78bfa' }}>📢 Live Commentary</p>
                {live && <span style={{ fontSize:'0.7rem',color:'#34d399',background:'rgba(52,211,153,0.1)',padding:'2px 8px',borderRadius:6 }}>Real data from Cricbuzz</span>}
              </div>
              {displayCommentary.map((c,i)=>(
                <div key={i} style={{ padding:'0.6rem 0.75rem',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.85rem',display:'flex',gap:12,alignItems:'flex-start' }}>
                  <span style={{ color:'#64748b',fontSize:'0.72rem',flexShrink:0,marginTop:2 }}>{i+1}.</span>
                  <span style={{ color: c.toLowerCase().includes('six')||c.includes('SIX')?'#a78bfa':c.toLowerCase().includes('four')||c.includes('FOUR')?'#60a5fa':c.toLowerCase().includes('out')||c.toLowerCase().includes('wicket')?'#f87171':'#f1f5f9' }}>{c}</span>
                </div>
              ))}
              {displayCommentary.length===0&&<p style={{ color:'#94a3b8',textAlign:'center',padding:'2rem' }}>Waiting for commentary...</p>}
            </div>
          )}

          {tab==='SQUADS' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem' }}>
              {[match.team1,match.team2].map(tk=>{
                const tm=teams[tk];
                return (
                  <div key={tk}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:'0.75rem' }}>
                      <div style={{ width:32,height:32,borderRadius:8,background:tm.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem' }}>{tm.short}</div>
                      <p style={{ fontWeight:700,fontSize:'1rem' }}>{tm.name}</p>
                    </div>
                    {tm.players.map(p=>(
                      <div key={p.name} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.82rem' }}>
                        <span style={{ fontWeight:500 }}>{p.name}</span>
                        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                          <span style={{ fontSize:'0.68rem',padding:'2px 6px',borderRadius:4,background: p.role==='BAT'?'rgba(59,130,246,0.2)':p.role==='BOWL'?'rgba(239,68,68,0.2)':p.role==='WK'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)', color: p.role==='BAT'?'#60a5fa':p.role==='BOWL'?'#f87171':p.role==='WK'?'#fbbf24':'#34d399', fontWeight:700 }}>{p.role}</span>
                          <span style={{ fontSize:'0.7rem',color:'#94a3b8' }}>{p.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {tab==='SCHEDULE' && (
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem' }}>
                <p style={{ fontWeight:700,color:'#60a5fa' }}>📅 IPL 2026 Schedule</p>
                <a href="https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/matches" target="_blank" rel="noreferrer" style={{ fontSize:'0.72rem',color:'#94a3b8',textDecoration:'none' }}>View on Cricbuzz ↗</a>
              </div>
              {schedule.length > 0 ? (
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {schedule.map((m,i) => {
                    const ta = teams[m.team1], tb = teams[m.team2];
                    return (
                      <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <span style={{ background:ta?.color||'#374151',padding:'2px 8px',borderRadius:5,fontSize:'0.75rem',fontWeight:800 }}>{m.team1}</span>
                          <span style={{ color:'#64748b',fontSize:'0.8rem' }}>vs</span>
                          <span style={{ background:tb?.color||'#374151',padding:'2px 8px',borderRadius:5,fontSize:'0.75rem',fontWeight:800 }}>{m.team2}</span>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          {m.result
                            ? <p style={{ fontSize:'0.78rem',color:'#34d399',fontWeight:600 }}>{m.result}</p>
                            : <p style={{ fontSize:'0.78rem',color:'#94a3b8' }}>{m.date || 'Upcoming'}</p>
                          }
                          <span style={{ fontSize:'0.65rem',padding:'2px 6px',borderRadius:99,background: m.status==='ENDED'?'rgba(251,191,36,0.15)':m.status==='LIVE'?'rgba(239,68,68,0.15)':'rgba(100,116,139,0.15)', color: m.status==='ENDED'?'#fbbf24':m.status==='LIVE'?'#ef4444':'#94a3b8', fontWeight:700 }}>{m.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign:'center',padding:'2rem' }}>
                  <p style={{ color:'#94a3b8',marginBottom:8 }}>Loading schedule from Cricbuzz...</p>
                  <a href="https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/matches" target="_blank" rel="noreferrer" style={{ color:'#60a5fa',fontSize:'0.85rem' }}>→ Open IPL 2026 Schedule on Cricbuzz</a>
                </div>
              )}
            </div>
          )}

          {tab==='POINTS TABLE' && (
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem' }}>
                <p style={{ fontWeight:700,color:'#a78bfa' }}>🏆 IPL 2026 Points Table</p>
                <a href="https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/points-table" target="_blank" rel="noreferrer" style={{ fontSize:'0.72rem',color:'#94a3b8',textDecoration:'none' }}>View on Cricbuzz ↗</a>
              </div>
              {pointsTable.length > 0 ? (
                <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                      {['#','Team','P','W','L','NR','Pts','NRR'].map(h => (
                        <th key={h} style={{ textAlign:h==='Team'?'left':'center',padding:'8px 6px',color:'#64748b',fontWeight:600,fontSize:'0.7rem',textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pointsTable.map((row,i) => {
                      const tm = teams[row.team];
                      const isTop4 = i < 4;
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',background:isTop4?'rgba(99,102,241,0.05)':'transparent' }}>
                          <td style={{ padding:'8px 6px',color:'#64748b',textAlign:'center' }}>{i+1}</td>
                          <td style={{ padding:'8px 6px' }}>
                            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                              <span style={{ background:tm?.color||'#374151',padding:'2px 6px',borderRadius:4,fontSize:'0.7rem',fontWeight:800 }}>{row.team}</span>
                              <span style={{ fontWeight:600,fontSize:'0.82rem' }}>{tm?.name||row.team}</span>
                              {isTop4 && <span style={{ fontSize:'0.6rem',padding:'1px 5px',borderRadius:99,background:'rgba(99,102,241,0.2)',color:'#a78bfa',fontWeight:700 }}>PO</span>}
                            </div>
                          </td>
                          <td style={{ textAlign:'center',color:'#94a3b8' }}>{row.p}</td>
                          <td style={{ textAlign:'center',color:'#34d399',fontWeight:700 }}>{row.w}</td>
                          <td style={{ textAlign:'center',color:'#f87171' }}>{row.l}</td>
                          <td style={{ textAlign:'center',color:'#94a3b8' }}>{row.nr}</td>
                          <td style={{ textAlign:'center',fontWeight:800,color:'#fbbf24',fontSize:'0.9rem' }}>{row.pts}</td>
                          <td style={{ textAlign:'center',color: parseFloat(row.nrr)>0?'#34d399':'#f87171' }}>{row.nrr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign:'center',padding:'2rem' }}>
                  <p style={{ color:'#94a3b8',marginBottom:8 }}>Loading points table from Cricbuzz...</p>
                  <a href="https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/points-table" target="_blank" rel="noreferrer" style={{ color:'#60a5fa',fontSize:'0.85rem' }}>→ Open IPL 2026 Points Table on Cricbuzz</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
      `}</style>
    </div>
  );
}
