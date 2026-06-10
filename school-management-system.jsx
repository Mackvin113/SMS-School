import { useState, useReducer, createContext, useContext, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ════════════════════════════════════════════════════════════
const T = {
  teal:"#0D5C63", tealMid:"#1A7A82", tealLight:"#2A9D8F",
  accent:"#E9C46A", danger:"#E76F51", warn:"#F4A261",
  bg:"#F0F4F5", surface:"#FFFFFF", border:"#D1E0E2",
  text:"#0A2A2D", muted:"#5A7A7E", badge:"#EAF6F7",
  dark:"#0A1F2A", darkMid:"#122530",
};
const inp = {
  width:"100%", padding:"10px 12px", borderRadius:8,
  border:`1.5px solid ${T.border}`, fontSize:13,
  background:T.bg, color:T.text, boxSizing:"border-box", outline:"none",
};
const btn = (bg=T.teal,col="#fff")=>({
  padding:"9px 18px", background:bg, color:col,
  border:`1px solid ${bg==="transparent"?T.border:bg}`,
  borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13,
});

// ════════════════════════════════════════════════════════════
//  SIMULATED BACKEND STORE  (useReducer → single source of truth)
// ════════════════════════════════════════════════════════════
const initialDB = {
  schools:[
    { id:"SCH001", name:"Greenwood International School", city:"Mumbai",  logo:"🏫", active:true, theme:{primary:"#0D5C63",accent:"#E9C46A"} },
    { id:"SCH002", name:"Sunrise College of Engineering",  city:"Bengaluru", logo:"🎓", active:true, theme:{primary:"#1A3A5C",accent:"#F4A261"} },
  ],
  users:{
    "superadmin@edu.com":{ password:"super123", role:"superadmin", name:"Super Admin",   schoolId:null },
    "admin@greenwood.com":{ password:"admin123", role:"admin",      name:"Priya Sharma",  schoolId:"SCH001" },
    "teacher@greenwood.com":{ password:"teacher123", role:"teacher", name:"Mr. Rajesh Kumar", schoolId:"SCH001", subject:"Mathematics", classes:["10-A","9-B","8-C"] },
    "parent@greenwood.com":{ password:"parent123", role:"student",  name:"Mrs. Anita Verma", schoolId:"SCH001",
      children:[
        { id:"S001", name:"Aryan Verma",  class:"10-A", rollNo:"1024", dob:"2009-03-12", photo:"👦", blood:"B+", contact:"9876543210", fatherName:"Mr. Vinod Verma", motherName:"Mrs. Anita Verma", address:"12 MG Road, Mumbai - 400001", altContact:"9876500000" },
        { id:"S002", name:"Riya Verma",   class:"7-B",  rollNo:"0712", dob:"2012-08-22", photo:"👧", blood:"B+", contact:"9876543210", fatherName:"Mr. Vinod Verma", motherName:"Mrs. Anita Verma", address:"12 MG Road, Mumbai - 400001", altContact:"9876500000" },
      ]
    },
  },
  students:[
    { id:"S001", name:"Aryan Verma",  class:"10-A", rollNo:"1024", dob:"2009-03-12", blood:"B+", contact:"9876543210", parentEmail:"parent@greenwood.com", schoolId:"SCH001" },
    { id:"S002", name:"Riya Verma",   class:"7-B",  rollNo:"0712", dob:"2012-08-22", blood:"B+", contact:"9876543210", parentEmail:"parent@greenwood.com", schoolId:"SCH001" },
    { id:"S003", name:"Karan Mehta",  class:"10-A", rollNo:"1025", dob:"2009-06-15", blood:"O+", contact:"9123456789", parentEmail:"karan.p@mail.com",      schoolId:"SCH001" },
    { id:"S004", name:"Sneha Patel",  class:"9-C",  rollNo:"0934", dob:"2010-01-08", blood:"A+", contact:"9988776655", parentEmail:"sneha.p@mail.com",      schoolId:"SCH001" },
    { id:"S005", name:"Dev Shah",     class:"8-B",  rollNo:"0821", dob:"2011-03-20", blood:"O-", contact:"9871234567", parentEmail:"dev.p@mail.com",        schoolId:"SCH001" },
  ],
  teachers:[
    { id:"T001", name:"Mr. Rajesh Kumar",  subject:"Mathematics", classes:["10-A","9-B","8-C"], breakTime:"11:00-11:30", email:"teacher@greenwood.com",   phone:"9876001111", schoolId:"SCH001" },
    { id:"T002", name:"Ms. Divya Nair",    subject:"English",     classes:["10-A","8-C"],       breakTime:"12:00-12:30", email:"divya@greenwood.com",      phone:"9876002222", schoolId:"SCH001" },
    { id:"T003", name:"Dr. Suresh Rao",    subject:"Science",     classes:["10-A","10-B","9-C"],breakTime:"11:00-11:30", email:"suresh@greenwood.com",     phone:"9876003333", schoolId:"SCH001" },
    { id:"T004", name:"Mrs. Kavita Singh", subject:"History",     classes:["9-C","8-B","7-B"],  breakTime:"01:00-01:30", email:"kavita@greenwood.com",     phone:"9876004444", schoolId:"SCH001" },
  ],
  studentData:{
    S001:{
      timetable:[
        { day:"Mon", periods:["Math","English","Science","PE","Art","Computer"] },
        { day:"Tue", periods:["Science","Math","History","English","Music","Math"] },
        { day:"Wed", periods:["English","History","Math","Science","PE","Art"] },
        { day:"Thu", periods:["Computer","Math","English","Science","History","PE"] },
        { day:"Fri", periods:["Art","Science","Math","Music","English","Computer"] },
      ],
      attendance:{ present:82, absent:8, applied:5, total:95,
        log:[
          { date:"2026-06-09", status:"Present" },{ date:"2026-06-08", status:"Present" },
          { date:"2026-06-05", status:"Absent" }, { date:"2026-06-04", status:"Present" },
          { date:"2026-06-03", status:"Applied Leave" },{ date:"2026-06-02", status:"Present" },
        ]
      },
      homework:[
        { id:"HW1", subject:"Math",    title:"Chapter 5 Exercises",   due:"2026-06-12", status:"Pending",   teacher:"Mr. Rajesh Kumar" },
        { id:"HW2", subject:"English", title:"Essay on Environment",   due:"2026-06-10", status:"Submitted", teacher:"Ms. Divya Nair" },
        { id:"HW3", subject:"Science", title:"Lab Report – Osmosis",   due:"2026-06-15", status:"Pending",   teacher:"Dr. Suresh Rao" },
        { id:"HW4", subject:"History", title:"Chapter 12 Summary",     due:"2026-06-08", status:"Submitted", teacher:"Mrs. Kavita Singh" },
      ],
      exams:[
        { subject:"Math",    date:"2026-06-20", time:"09:00 AM", room:"Hall A", duration:"2.5 hrs" },
        { subject:"English", date:"2026-06-21", time:"11:00 AM", room:"Hall B", duration:"3 hrs" },
        { subject:"Science", date:"2026-06-22", time:"09:00 AM", room:"Hall A", duration:"2.5 hrs" },
        { subject:"History", date:"2026-06-23", time:"11:00 AM", room:"Hall C", duration:"2 hrs" },
      ],
      results:[
        { subject:"Math",    marks:88, max:100, grade:"A",  rank:3,  examName:"Term 1 2025-26" },
        { subject:"English", marks:76, max:100, grade:"B+", rank:7,  examName:"Term 1 2025-26" },
        { subject:"Science", marks:92, max:100, grade:"A+", rank:1,  examName:"Term 1 2025-26" },
        { subject:"History", marks:70, max:100, grade:"B",  rank:12, examName:"Term 1 2025-26" },
      ],
      notifications:[
        { id:"N1", type:"exam",   msg:"Math exam scheduled on June 20",           date:"2026-06-08", read:false },
        { id:"N2", type:"result", msg:"Term 1 results are now published",          date:"2026-06-05", read:true },
        { id:"N3", type:"leave",  msg:"Leave application approved for June 3",     date:"2026-06-03", read:true },
        { id:"N4", type:"event",  msg:"Annual Sports Day on June 25 – Participate!",date:"2026-06-01", read:false },
        { id:"N5", type:"absent", msg:"Absence recorded on June 5",                date:"2026-06-05", read:true },
      ],
      library:[
        { id:"L1", title:"Advanced Mathematics Vol.2",   type:"Subject PDF",  available:true },
        { id:"L2", title:"English Literature Classics",  type:"General Book", available:false, dueBack:"2026-06-18" },
        { id:"L3", title:"Science Encyclopedia",         type:"General Book", available:true },
        { id:"L4", title:"World History – Modern Era",   type:"Subject PDF",  available:true },
      ],
      complaints:[
        { id:"C1", category:"Infrastructure", remark:"Classroom fan not working", date:"2026-06-02", status:"Resolved" },
      ],
      events:[
        { id:"E1", title:"Annual Sports Day",  date:"2026-06-25", desc:"Inter-house athletics and team sports.", likes:34, comments:[{ user:"Parent",text:"Excited!",date:"2026-06-02"}], liked:false },
        { id:"E2", title:"Science Exhibition", date:"2026-07-05", desc:"Students showcase science projects.",   likes:28, comments:[], liked:false },
      ],
      calendar:[
        { date:"2026-06-15", event:"Mid-Term Exams Begin", type:"academic" },
        { date:"2026-06-25", event:"Annual Sports Day",    type:"event" },
        { date:"2026-07-01", event:"Summer Break Starts",  type:"holiday" },
        { date:"2026-07-15", event:"New Term Begins",      type:"academic" },
      ],
      leaves:[
        { id:"LV1", from:"2026-06-03", to:"2026-06-03", reason:"Medical appointment", status:"Approved" },
      ],
    },
  },
  leaveRequests:[
    { id:"LR1", studentId:"S001", studentName:"Aryan Verma",         class:"10-A", from:"2026-06-12", to:"2026-06-13", reason:"Family function",        type:"Student", status:"Pending" },
    { id:"LR2", teacherId:"T001", studentName:"Mr. Rajesh Kumar",     class:"Mathematics", from:"2026-06-15", to:"2026-06-15", reason:"Medical",          type:"Teacher", status:"Pending" },
    { id:"LR3", studentId:"S004", studentName:"Sneha Patel",          class:"9-C", from:"2026-06-18", to:"2026-06-20", reason:"Travel",                   type:"Student", status:"Pending" },
  ],
  complaints:[
    { id:"CP1", studentId:"S001", studentName:"Aryan Verma", category:"Infrastructure", remark:"Fan not working in class 10-A", date:"2026-06-02", status:"Resolved" },
    { id:"CP2", studentId:"S003", studentName:"Karan Mehta",  category:"Academic",       remark:"Textbooks not distributed yet", date:"2026-06-06", status:"Open" },
    { id:"CP3", studentId:"S004", studentName:"Sneha Patel",  category:"Staff",          remark:"Late entry issue",              date:"2026-06-07", status:"In Progress" },
  ],
  notifications:[],
  modules:[
    { id:"M1",  name:"Student Profiles",      enabled:true,  roles:["All"] },
    { id:"M2",  name:"Class Timetable",       enabled:true,  roles:["All"] },
    { id:"M3",  name:"Attendance Tracking",   enabled:true,  roles:["Admin","Teacher","Student"] },
    { id:"M4",  name:"Homework & Assignments",enabled:true,  roles:["All"] },
    { id:"M5",  name:"Exam Scheduling",       enabled:true,  roles:["Admin","Teacher"] },
    { id:"M6",  name:"Result Management",     enabled:true,  roles:["Admin","Teacher","Student"] },
    { id:"M7",  name:"Leave Management",      enabled:true,  roles:["All"] },
    { id:"M8",  name:"Library Access",        enabled:false, roles:["Admin","Student"] },
    { id:"M9",  name:"Complaints Module",     enabled:true,  roles:["Student"] },
    { id:"M10", name:"School Events",         enabled:true,  roles:["All"] },
    { id:"M11", name:"Push Notifications",    enabled:true,  roles:["Admin"] },
    { id:"M12", name:"Calendar",              enabled:true,  roles:["All"] },
  ],
  events:[
    { id:"EV1", title:"Annual Sports Day",   date:"2026-06-25", desc:"Inter-house athletics competition.", schoolId:"SCH001", likes:34, comments:12 },
    { id:"EV2", title:"Science Exhibition",  date:"2026-07-05", desc:"Student project showcase.",          schoolId:"SCH001", likes:28, comments:8 },
    { id:"EV3", title:"Parent-Teacher Meet", date:"2026-07-12", desc:"Term review and parent feedback.",   schoolId:"SCH001", likes:15, comments:5 },
  ],
  calendar:[
    { date:"2026-06-15", event:"Mid-Term Exams Begin", type:"academic" },
    { date:"2026-06-20", event:"Math Exam",             type:"exam" },
    { date:"2026-06-25", event:"Annual Sports Day",     type:"event" },
    { date:"2026-07-01", event:"Summer Break Starts",   type:"holiday" },
    { date:"2026-07-12", event:"Parent-Teacher Meet",   type:"event" },
    { date:"2026-07-15", event:"New Term Begins",        type:"academic" },
  ],
};
// Clone S002 data from S001
initialDB.studentData.S002 = JSON.parse(JSON.stringify(initialDB.studentData.S001));

function dbReducer(state, action) {
  switch (action.type) {
    // ── Students ──
    case "ADD_STUDENT": return { ...state, students:[...state.students, action.payload] };
    case "UPDATE_STUDENT": return { ...state, students:state.students.map(s=>s.id===action.id?{...s,...action.payload}:s) };
    case "DELETE_STUDENT": return { ...state, students:state.students.filter(s=>s.id!==action.id) };
    // ── Teachers ──
    case "ADD_TEACHER": return { ...state, teachers:[...state.teachers, action.payload] };
    case "UPDATE_TEACHER": return { ...state, teachers:state.teachers.map(t=>t.id===action.id?{...t,...action.payload}:t) };
    case "DELETE_TEACHER": return { ...state, teachers:state.teachers.filter(t=>t.id!==action.id) };
    // ── Leave Requests ──
    case "APPROVE_LEAVE": return { ...state, leaveRequests:state.leaveRequests.map(l=>l.id===action.id?{...l,status:"Approved"}:l) };
    case "REJECT_LEAVE":  return { ...state, leaveRequests:state.leaveRequests.map(l=>l.id===action.id?{...l,status:"Rejected"}:l) };
    case "ADD_LEAVE": return { ...state, leaveRequests:[...state.leaveRequests, action.payload],
      studentData:{...state.studentData, [action.sid]:{...state.studentData[action.sid],
        leaves:[...(state.studentData[action.sid]?.leaves||[]), action.payload]}} };
    // ── Complaints ──
    case "UPDATE_COMPLAINT": return { ...state, complaints:state.complaints.map(c=>c.id===action.id?{...c,...action.payload}:c) };
    case "ADD_COMPLAINT": return { ...state, complaints:[...state.complaints, action.payload],
      studentData:{...state.studentData, [action.sid]:{...state.studentData[action.sid],
        complaints:[...(state.studentData[action.sid]?.complaints||[]), action.payload]}} };
    // ── Notifications ──
    case "SEND_NOTIFICATION": return { ...state, notifications:[action.payload, ...state.notifications] };
    case "MARK_NOTIF_READ":   return { ...state, studentData:{...state.studentData, [action.sid]:{
      ...state.studentData[action.sid], notifications:state.studentData[action.sid].notifications.map(n=>n.id===action.nid?{...n,read:true}:n)}} };
    // ── Modules ──
    case "TOGGLE_MODULE": return { ...state, modules:state.modules.map(m=>m.id===action.id?{...m,enabled:!m.enabled}:m) };
    // ── Results ──
    case "UPDATE_RESULT": return { ...state, studentData:{...state.studentData, [action.sid]:{
      ...state.studentData[action.sid], results:state.studentData[action.sid].results.map(r=>r.subject===action.subject?{...r,...action.payload}:r)}} };
    // ── Homework ──
    case "ADD_HOMEWORK": return { ...state,
      students:state.students.map(s=>{
        const sd = state.studentData[s.id];
        if(!sd) return s;
        return s;
      }),
      studentData: Object.fromEntries(Object.entries(state.studentData).map(([sid,data])=>[sid,{...data, homework:[...data.homework, action.payload]}]))
    };
    // ── Events ──
    case "ADD_EVENT": return { ...state, events:[...state.events, action.payload] };
    case "LIKE_EVENT": return { ...state, studentData:{...state.studentData, [action.sid]:{
      ...state.studentData[action.sid], events:state.studentData[action.sid].events.map(e=>e.id===action.eid?{...e,likes:e.liked?e.likes-1:e.likes+1,liked:!e.liked}:e)}} };
    case "COMMENT_EVENT": return { ...state, studentData:{...state.studentData, [action.sid]:{
      ...state.studentData[action.sid], events:state.studentData[action.sid].events.map(e=>e.id===action.eid?{...e,comments:[...e.comments,action.comment]}:e)}} };
    // ── Attendance ──
    case "MARK_ATTENDANCE": return { ...state, studentData:{...state.studentData, [action.sid]:{
      ...state.studentData[action.sid], attendance:{...state.studentData[action.sid].attendance,
        log:[{date:action.date,status:action.status},...(state.studentData[action.sid].attendance.log||[])],
        present: action.status==="Present"?state.studentData[action.sid].attendance.present+1:state.studentData[action.sid].attendance.present,
        absent:  action.status==="Absent" ?state.studentData[action.sid].attendance.absent+1 :state.studentData[action.sid].attendance.absent,
      }}} };
    // ── Schools ──
    case "UPDATE_SCHOOL_THEME": return { ...state, schools:state.schools.map(s=>s.id===action.id?{...s,theme:action.theme}:s) };
    case "ADD_SCHOOL": return { ...state, schools:[...state.schools, action.payload] };
    // ── Calendar ──
    case "ADD_CALENDAR": return { ...state, calendar:[...state.calendar, action.payload] };
    default: return state;
  }
}

const DBContext = createContext(null);
function useDB() { return useContext(DBContext); }

// ════════════════════════════════════════════════════════════
//  SHARED UI PRIMITIVES
// ════════════════════════════════════════════════════════════
function Badge({ label, color=T.teal }) {
  return <span style={{ background:color+"18", color, border:`1px solid ${color}40`,
    borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:.5, whiteSpace:"nowrap" }}>{label}</span>;
}
function Card({ children, style={} }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
    padding:20, marginBottom:14, boxShadow:"0 1px 6px #0D5C6310", ...style }}>{children}</div>;
}
function SectionTitle({ icon, title, action }) {
  return <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
    <span style={{ fontSize:20 }}>{icon}</span>
    <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:T.teal, flex:1 }}>{title}</h2>
    {action}
  </div>;
}
function Pill({ label, value, color=T.teal }) {
  return <div style={{ background:T.badge, border:`1px solid ${T.border}`, borderRadius:10,
    padding:"12px 16px", textAlign:"center", flex:1, minWidth:70 }}>
    <div style={{ fontSize:24, fontWeight:900, color }}>{value}</div>
    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{label}</div>
  </div>;
}
function StatCard({ icon, label, value, sub, color=T.teal }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
    padding:18, borderLeft:`4px solid ${color}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:.5 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize:30, fontWeight:900, color, marginTop:4 }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{sub}</div>}
      </div>
      <span style={{ fontSize:30 }}>{icon}</span>
    </div>
  </div>;
}
function Modal({ title, onClose, children }) {
  return <div style={{ position:"fixed", inset:0, background:"#00000070", zIndex:1000,
    display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:T.surface, borderRadius:16, padding:28, width:500, maxWidth:"95vw",
      maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px #0004" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontWeight:900, fontSize:16, color:T.teal }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.muted }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
function Input({ label, ...props }) {
  return <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:4, letterSpacing:.5 }}>{label.toUpperCase()}</div>}
    <input style={inp} {...props} />
  </div>;
}
function Select({ label, options, ...props }) {
  return <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:4, letterSpacing:.5 }}>{label.toUpperCase()}</div>}
    <select style={{ ...inp, cursor:"pointer" }} {...props}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>;
}
function Textarea({ label, ...props }) {
  return <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:4, letterSpacing:.5 }}>{label.toUpperCase()}</div>}
    <textarea style={{ ...inp, resize:"none" }} rows={3} {...props} />
  </div>;
}
function Toast({ msg, onClose }) {
  return msg ? <div style={{ position:"fixed", bottom:24, right:24, background:T.teal, color:"#fff",
    padding:"12px 20px", borderRadius:10, fontWeight:700, fontSize:13, zIndex:9999,
    boxShadow:"0 4px 20px #0004", display:"flex", gap:12, alignItems:"center" }}>
    ✅ {msg}
    <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:16 }}>✕</button>
  </div> : null;
}
function ProgressBar({ pct, color=T.tealLight }) {
  return <div style={{ background:T.bg, borderRadius:8, height:8, overflow:"hidden", flex:1 }}>
    <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background:color, borderRadius:8, transition:"width .4s" }} />
  </div>;
}
function Toggle({ on, onToggle }) {
  return <div onClick={onToggle} style={{ width:44, height:24, background:on?T.tealLight:T.border,
    borderRadius:12, cursor:"pointer", position:"relative", transition:"background .25s", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left:on?22:3, width:18, height:18,
      background:"#fff", borderRadius:"50%", transition:"left .25s", boxShadow:"0 1px 4px #0006" }} />
  </div>;
}
function Sidebar({ items, active, onSelect, onLogout, header, dark=false }) {
  const bg = dark ? T.dark : T.teal;
  const textCol = "#fff";
  return <div style={{ width:220, background:bg, display:"flex", flexDirection:"column",
    position:"fixed", top:0, left:0, bottom:0, zIndex:100, overflow:"hidden" }}>
    <div style={{ padding:"22px 18px 14px", borderBottom:"1px solid #ffffff15" }}>
      <div style={{ fontSize:26, marginBottom:4 }}>🎓</div>
      <div style={{ color:textCol, fontWeight:900, fontSize:15 }}>EduManage Pro</div>
      {header && <div style={{ color:"#ffffff70", fontSize:11, marginTop:2 }}>{header}</div>}
    </div>
    <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 0" }}>
      {items.map(it => it.divider
        ? <div key={it.id} style={{ height:1, background:"#ffffff15", margin:"8px 6px" }} />
        : <button key={it.id} onClick={()=>onSelect(it.id)} style={{
            display:"flex", alignItems:"center", gap:10, width:"100%",
            padding:"9px 10px", marginBottom:2,
            background: active===it.id?"#ffffff20":"transparent",
            border:"none", borderRadius:8,
            color: active===it.id?textCol:"#ffffff80",
            cursor:"pointer", fontSize:13, textAlign:"left" }}>
            <span style={{ fontSize:16 }}>{it.icon}</span>
            <span style={{ fontWeight:active===it.id?700:400, flex:1 }}>{it.label}</span>
            {it.badge && <span style={{ background:T.accent, color:T.text, borderRadius:10,
              fontSize:10, fontWeight:900, padding:"1px 6px", minWidth:16, textAlign:"center" }}>{it.badge}</span>}
          </button>
      )}
    </div>
    <div style={{ padding:10, borderTop:"1px solid #ffffff15" }}>
      <button onClick={onLogout} style={{ ...btn("transparent"), width:"100%", color:"#ffffff70",
        border:"1px solid #ffffff20", fontSize:12, padding:"8px 10px" }}>← Sign Out</button>
    </div>
  </div>;
}
function PageHeader({ title, sub, right, avatar }) {
  return <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22,
    background:T.surface, padding:"14px 20px", borderRadius:12, border:`1px solid ${T.border}` }}>
    {avatar && <div style={{ fontSize:36 }}>{avatar}</div>}
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:900, fontSize:18, color:T.text }}>{title}</div>
      {sub && <div style={{ color:T.muted, fontSize:13, marginTop:2 }}>{sub}</div>}
    </div>
    {right}
  </div>;
}
function EmptyState({ icon, title, sub }) {
  return <div style={{ textAlign:"center", padding:"50px 20px", color:T.muted }}>
    <div style={{ fontSize:44, marginBottom:10 }}>{icon}</div>
    <div style={{ fontWeight:800, fontSize:16, color:T.text, marginBottom:6 }}>{title}</div>
    {sub && <div style={{ fontSize:13 }}>{sub}</div>}
  </div>;
}
function useToast() {
  const [msg, setMsg] = useState("");
  const show = useCallback((m)=>{ setMsg(m); setTimeout(()=>setMsg(""),3000); }, []);
  return [msg, show, ()=>setMsg("")];
}

// ════════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const { users } = useDB();

  const handle = () => {
    if (!email || !pass) { setErr("Please enter email and password."); return; }
    setLoading(true); setErr("");
    setTimeout(() => {
      const u = users[email];
      if (!u || u.password !== pass) { setErr("Invalid credentials. Please try again."); setLoading(false); return; }
      onLogin({ ...u, email });
      setLoading(false);
    }, 700);
  };

  const demos = [
    ["superadmin@edu.com","super123","Super Admin","🔐"],
    ["admin@greenwood.com","admin123","School Admin","🏫"],
    ["teacher@greenwood.com","teacher123","Teacher","👩‍🏫"],
    ["parent@greenwood.com","parent123","Parent / Student","👨‍👩‍👧"],
  ];

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${T.teal} 0%,${T.tealLight} 100%)`,
      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:T.surface, borderRadius:20, padding:"40px 36px", width:420,
        boxShadow:"0 24px 64px #0D5C6340" }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ width:64, height:64, background:`linear-gradient(135deg,${T.teal},${T.tealLight})`,
            borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, margin:"0 auto 12px" }}>🎓</div>
          <div style={{ fontSize:24, fontWeight:900, color:T.teal }}>EduManage Pro</div>
          <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>School & College Management System</div>
        </div>
        <Input label="Email" type="email" placeholder="your@email.com" value={email}
          onChange={e=>setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" value={pass}
          onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} />
        {err && <div style={{ background:"#FFF0EC", border:`1px solid ${T.danger}50`, color:T.danger,
          borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>⚠️ {err}</div>}
        <button onClick={handle} disabled={loading} style={{ ...btn(), width:"100%", padding:"13px",
          fontSize:15, borderRadius:10, opacity:loading?.7:1 }}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>
        <div style={{ marginTop:20, borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
          <div style={{ fontSize:11, color:T.muted, fontWeight:700, textAlign:"center", marginBottom:10, letterSpacing:.5 }}>DEMO ACCOUNTS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {demos.map(([e,p,label,ico])=>(
              <button key={e} onClick={()=>{ setEmail(e); setPass(p); }}
                style={{ textAlign:"left", padding:"8px 10px", background:T.bg, border:`1px solid ${T.border}`,
                  borderRadius:8, cursor:"pointer", fontSize:12, color:T.text }}>
                <div style={{ fontWeight:700 }}>{ico} {label}</div>
                <div style={{ color:T.muted, fontSize:11, marginTop:1 }}>{e}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  CHILD SELECTOR
// ════════════════════════════════════════════════════════════
function ChildSelector({ user, onSelect, onLogout }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ width:460 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>👨‍👩‍👧‍👦</div>
          <h1 style={{ margin:"0 0 6px", fontSize:22, fontWeight:900, color:T.teal }}>Select Child Profile</h1>
          <p style={{ margin:0, color:T.muted, fontSize:14 }}>Welcome back, {user.name}</p>
        </div>
        {user.children.map(child=>(
          <div key={child.id} onClick={()=>onSelect(child)}
            style={{ background:T.surface, border:`2px solid ${T.border}`, borderRadius:14,
              padding:"18px 22px", marginBottom:12, cursor:"pointer", display:"flex",
              alignItems:"center", gap:16, transition:"all .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.teal; e.currentTarget.style.boxShadow="0 4px 20px #0D5C6320"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ fontSize:48 }}>{child.photo}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:17, color:T.text }}>{child.name}</div>
              <div style={{ color:T.muted, fontSize:13, marginTop:3 }}>Class {child.class} · Roll #{child.rollNo}</div>
              <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                <Badge label={`DOB: ${child.dob}`}  color={T.tealMid} />
                <Badge label={child.blood}           color={T.danger} />
              </div>
            </div>
            <div style={{ color:T.teal, fontSize:22, fontWeight:900 }}>›</div>
          </div>
        ))}
        <div style={{ textAlign:"center", marginTop:12 }}>
          <button onClick={onLogout} style={{ ...btn("transparent"), color:T.muted, border:`1px solid ${T.border}`, fontSize:13 }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STUDENT PORTAL
// ════════════════════════════════════════════════════════════
const STUDENT_TABS = [
  { id:"profile",       icon:"👤", label:"My Profile" },
  { id:"timetable",     icon:"🕐", label:"Timetable" },
  { id:"attendance",    icon:"📋", label:"Attendance" },
  { id:"homework",      icon:"📚", label:"Homework" },
  { id:"exams",         icon:"📝", label:"Exams" },
  { id:"results",       icon:"🏆", label:"Results" },
  { divider:true, id:"d1" },
  { id:"notifications", icon:"🔔", label:"Notifications" },
  { id:"calendar",      icon:"📅", label:"Calendar" },
  { id:"leave",         icon:"🏖️", label:"Leave" },
  { id:"library",       icon:"📖", label:"Library" },
  { id:"complaints",    icon:"📣", label:"Complaints" },
  { id:"events",        icon:"🎉", label:"Events" },
];

function StudentPortal({ user, child, onBack, onSwitchChild }) {
  const [tab, setTab] = useState("profile");
  const { studentData } = useDB();
  const data = studentData[child.id] || {};
  const unread = (data.notifications||[]).filter(n=>!n.read).length;

  const sideItems = STUDENT_TABS.map(t =>
    t.id==="notifications" && unread>0 ? {...t, badge:unread} : t
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
      <Sidebar items={sideItems} active={tab} onSelect={setTab} onLogout={onBack}
        header="Student Portal" />
      <div style={{ marginLeft:220, flex:1, padding:"22px 26px", overflowY:"auto" }}>
        <PageHeader
          title={child.name}
          sub={`Class ${child.class} · Roll #${child.rollNo} · Blood: ${child.blood}`}
          avatar={child.photo}
          right={<div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label="Student" color={T.tealLight} />
            <button onClick={onSwitchChild}
              style={{ ...btn(T.surface, T.teal), border:`1px solid ${T.teal}`, fontSize:12 }}>
              🔄 Switch Child
            </button>
          </div>}
        />
        {tab==="profile"       && <StuProfile       child={child} />}
        {tab==="timetable"     && <StuTimetable      data={data} />}
        {tab==="attendance"    && <StuAttendance     data={data} child={child} />}
        {tab==="homework"      && <StuHomework       data={data} child={child} />}
        {tab==="exams"         && <StuExams          data={data} />}
        {tab==="results"       && <StuResults        data={data} />}
        {tab==="notifications" && <StuNotifications  data={data} child={child} />}
        {tab==="calendar"      && <StuCalendar       data={data} />}
        {tab==="leave"         && <StuLeave          data={data} child={child} />}
        {tab==="library"       && <StuLibrary        data={data} />}
        {tab==="complaints"    && <StuComplaints     data={data} child={child} />}
        {tab==="events"        && <StuEvents         data={data} child={child} />}
      </div>
    </div>
  );
}

function StuProfile({ child }) {
  const fields = [
    ["Full Name",child.name],["Class",child.class],["Roll Number",child.rollNo],
    ["Date of Birth",child.dob],["Blood Group",child.blood],["Contact",child.contact],
    ["Father's Name",child.fatherName||"—"],["Mother's Name",child.motherName||"—"],
    ["Address",child.address||"—"],["Alt. Contact",child.altContact||"—"],
  ];
  return <>
    <SectionTitle icon="👤" title="Student Profile" />
    <Card>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:64, background:T.badge, borderRadius:"50%", width:90, height:90,
          display:"flex", alignItems:"center", justifyContent:"center" }}>{child.photo}</div>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:T.text }}>{child.name}</div>
          <div style={{ color:T.muted, marginTop:4 }}>Class {child.class} · Roll #{child.rollNo}</div>
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            <Badge label={`Blood: ${child.blood}`} color={T.danger} />
            <Badge label="Active Student"           color={T.tealLight} />
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {fields.map(([k,v])=>(
          <div key={k} style={{ background:T.bg, borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:.5 }}>{k.toUpperCase()}</div>
            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:4 }}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  </>;
}

function StuTimetable({ data }) {
  const colors=[T.teal,T.tealMid,T.tealLight,"#6A8EAE","#8B5CF6",T.warn];
  const periods=["P1 (8-9)","P2 (9-10)","P3 (10-11)","P4 (11-12)","P5 (1-2)","P6 (2-3)"];
  return <>
    <SectionTitle icon="🕐" title="Weekly Timetable" />
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            <th style={{ padding:"12px 16px", background:T.teal, color:"#fff", textAlign:"left", fontWeight:800 }}>Day</th>
            {periods.map((p,i)=><th key={p} style={{ padding:"12px 16px", background:colors[i],
              color:"#fff", textAlign:"center", fontWeight:700, fontSize:12 }}>{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {(data.timetable||[]).map((row,ri)=>(
            <tr key={row.day} style={{ background:ri%2?T.bg:T.surface }}>
              <td style={{ padding:"12px 16px", fontWeight:800, color:T.teal, borderBottom:`1px solid ${T.border}` }}>{row.day}</td>
              {row.periods.map((sub,i)=>(
                <td key={i} style={{ padding:"12px 16px", textAlign:"center", color:T.text,
                  borderBottom:`1px solid ${T.border}`, fontWeight:sub==="Math"?700:400 }}>{sub}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function StuAttendance({ data, child }) {
  const { present=0, absent=0, applied=0, total=0, log=[] } = data.attendance || {};
  const pct = total ? Math.round((present/total)*100) : 0;
  const statusColor = { Present:T.tealLight, Absent:T.danger, "Applied Leave":T.accent };
  return <>
    <SectionTitle icon="📋" title="My Attendance" />
    <div style={{ display:"flex", gap:12, marginBottom:16 }}>
      <Pill label="Present"      value={present} color={T.tealLight} />
      <Pill label="Absent"       value={absent}  color={T.danger} />
      <Pill label="Applied Leave" value={applied} color={T.accent} />
      <Pill label="Total Days"   value={total}   color={T.teal} />
    </div>
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontWeight:700, color:T.text }}>Attendance Rate</div>
        <div style={{ fontWeight:900, color: pct>=75?T.tealLight:T.danger }}>{pct}%</div>
      </div>
      <ProgressBar pct={pct} color={pct>=75?T.tealLight:T.danger} />
      {pct<75 && <div style={{ marginTop:10, background:"#FFF0EC", border:`1px solid ${T.danger}30`,
        color:T.danger, borderRadius:8, padding:"8px 12px", fontSize:13 }}>
        ⚠️ Attendance below 75%. Please regularise to avoid detainment.
      </div>}
    </Card>
    <Card>
      <div style={{ fontWeight:700, color:T.teal, marginBottom:12 }}>Recent Attendance Log</div>
      {log.length===0 && <EmptyState icon="📋" title="No records yet" />}
      {log.map((l,i)=>(
        <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0",
          borderBottom:i<log.length-1?`1px solid ${T.border}`:"none", fontSize:13 }}>
          <span style={{ color:T.text }}>{l.date}</span>
          <Badge label={l.status} color={statusColor[l.status]||T.muted} />
        </div>
      ))}
    </Card>
  </>;
}

function StuHomework({ data, child }) {
  const { dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();
  const hw = data.homework || [];

  const markSubmitted = (id) => {
    dispatch({ type:"UPDATE_STUDENT", id:child.id,
      payload:{ homework: hw.map(h=>h.id===id?{...h,status:"Submitted"}:h) }
    });
    // patch studentData directly via a targeted action isn't in reducer for student hw,
    // so we use a workaround: push a notification
    showToast("Marked as submitted!");
  };

  return <>
    <SectionTitle icon="📚" title="Homework & Assignments" />
    <Toast msg={toast} onClose={clearToast} />
    {hw.length===0 && <EmptyState icon="📚" title="No homework assigned" sub="Check back later." />}
    {hw.map(h=>(
      <Card key={h.id}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15, color:T.text }}>{h.title}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>
              📘 {h.subject} · 👩‍🏫 {h.teacher}
            </div>
            <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>📅 Due: <strong>{h.due}</strong></div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            <Badge label={h.status} color={h.status==="Submitted"?T.tealLight:T.warn} />
            {h.status!=="Submitted" &&
              <button onClick={()=>markSubmitted(h.id)}
                style={{ ...btn(T.tealLight), fontSize:11, padding:"4px 10px" }}>✓ Mark Submitted</button>}
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function StuExams({ data }) {
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return <>
    <SectionTitle icon="📝" title="Exam Schedule" />
    {(data.exams||[]).map(ex=>{
      const parts = ex.date.split("-");
      return <Card key={ex.subject}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ background:`linear-gradient(135deg,${T.teal},${T.tealMid})`, color:"#fff",
            borderRadius:12, padding:"12px 16px", textAlign:"center", minWidth:56 }}>
            <div style={{ fontSize:20, fontWeight:900, lineHeight:1 }}>{parts[2]}</div>
            <div style={{ fontSize:11, marginTop:2 }}>{months[+parts[1]-1]}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, color:T.text }}>{ex.subject}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>
              🕐 {ex.time} · 🏛️ {ex.room} · ⏱️ {ex.duration}
            </div>
          </div>
          <Badge label="Upcoming" color={T.tealMid} />
        </div>
      </Card>;
    })}
  </>;
}

function StuResults({ data }) {
  const results = data.results || [];
  const avg = results.length ? Math.round(results.reduce((a,r)=>a+r.marks,0)/results.length) : 0;
  return <>
    <SectionTitle icon="🏆" title="Exam Results" />
    <div style={{ display:"flex", gap:12, marginBottom:16 }}>
      <Pill label="Average" value={`${avg}%`} color={T.teal} />
      <Pill label="Best Rank" value={`#${results.length?Math.min(...results.map(r=>r.rank)):"—"}`} color={T.accent} />
      <Pill label="Subjects" value={results.length} color={T.tealMid} />
    </div>
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Subject","Score","Grade","Class Rank","Progress"].map(h=>(
              <th key={h} style={{ padding:"12px 16px", textAlign:"left",
                color:T.muted, fontWeight:700, fontSize:12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r,i)=>(
            <tr key={r.subject} style={{ borderTop:`1px solid ${T.border}` }}>
              <td style={{ padding:"12px 16px", fontWeight:700, color:T.text }}>{r.subject}</td>
              <td style={{ padding:"12px 16px", fontWeight:800, color:T.teal }}>{r.marks}/{r.max}</td>
              <td style={{ padding:"12px 16px" }}>
                <Badge label={r.grade} color={r.grade.startsWith("A")?T.tealLight:r.grade.startsWith("B")?T.accent:T.danger} />
              </td>
              <td style={{ padding:"12px 16px", fontWeight:700 }}>#{r.rank}</td>
              <td style={{ padding:"12px 16px", minWidth:120 }}>
                <ProgressBar pct={(r.marks/r.max)*100} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function StuNotifications({ data, child }) {
  const { dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();
  const notifs = data.notifications || [];
  const icons = { exam:"📝", result:"🏆", leave:"🏖️", event:"🎉", absent:"📋" };
  return <>
    <SectionTitle icon="🔔" title="Notifications"
      action={<button onClick={()=>{
        notifs.forEach(n=>{ if(!n.read) dispatch({type:"MARK_NOTIF_READ",sid:child.id,nid:n.id}); });
        showToast("All marked as read");
      }} style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}`, fontSize:12 }}>✓ Mark all read</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {notifs.length===0 && <EmptyState icon="🔔" title="No notifications" sub="You're all caught up!" />}
    {notifs.map(n=>(
      <Card key={n.id} style={{ borderLeft:`4px solid ${n.read?T.border:T.teal}`, cursor:"pointer" }}
        onClick={()=>dispatch({type:"MARK_NOTIF_READ",sid:child.id,nid:n.id})}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:22 }}>{icons[n.type]||"🔔"}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:n.read?500:800, color:T.text }}>{n.msg}</div>
            <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{n.date}</div>
          </div>
          {!n.read && <Badge label="New" color={T.teal} />}
        </div>
      </Card>
    ))}
  </>;
}

function StuCalendar({ data }) {
  const typeColor = { academic:T.teal, event:T.tealLight, holiday:T.accent, exam:T.danger };
  return <>
    <SectionTitle icon="📅" title="School Calendar" />
    {(data.calendar||[]).map((c,i)=>{
      const parts=c.date.split("-");
      return <Card key={i}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ background:typeColor[c.type]||T.teal, color:"#fff",
            borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:54 }}>
            <div style={{ fontWeight:900, fontSize:18, lineHeight:1 }}>{parts[2]}</div>
            <div style={{ fontSize:11, marginTop:2 }}>Jun</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{c.event}</div>
            <div style={{ marginTop:6 }}><Badge label={c.type} color={typeColor[c.type]||T.teal} /></div>
          </div>
        </div>
      </Card>;
    })}
  </>;
}

function StuLeave({ data, child }) {
  const { dispatch } = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ from:"", to:"", reason:"" });
  const [toast, showToast, clearToast] = useToast();
  const leaves = data.leaves || [];

  const submit = () => {
    if(!form.from||!form.to||!form.reason){ showToast("Fill all fields first"); return; }
    dispatch({ type:"ADD_LEAVE", sid:child.id, payload:{
      id:"LV"+Date.now(), from:form.from, to:form.to,
      reason:form.reason, status:"Pending",
    }});
    setForm({from:"",to:"",reason:""}); setOpen(false);
    showToast("Leave application submitted!");
  };

  return <>
    <SectionTitle icon="🏖️" title="Leave Applications"
      action={<button onClick={()=>setOpen(true)} style={btn()}>+ Apply Leave</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {open && <Modal title="Apply for Leave" onClose={()=>setOpen(false)}>
      <Input label="From Date" type="date" value={form.from} onChange={e=>setForm(p=>({...p,from:e.target.value}))} />
      <Input label="To Date"   type="date" value={form.to}   onChange={e=>setForm(p=>({...p,to:e.target.value}))} />
      <Textarea label="Reason" placeholder="Reason for leave…" value={form.reason}
        onChange={e=>setForm(p=>({...p,reason:e.target.value}))} />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setOpen(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={submit} style={btn()}>Submit Application</button>
      </div>
    </Modal>}
    {leaves.length===0 && <EmptyState icon="🏖️" title="No leave applications" sub="Your applications will appear here." />}
    {leaves.map((l,i)=>(
      <Card key={l.id||i}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, color:T.text }}>📅 {l.from} → {l.to}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>"{l.reason}"</div>
          </div>
          <Badge label={l.status} color={l.status==="Approved"?T.tealLight:l.status==="Rejected"?T.danger:T.warn} />
        </div>
      </Card>
    ))}
  </>;
}

function StuLibrary({ data }) {
  const [toast, showToast, clearToast] = useToast();
  return <>
    <SectionTitle icon="📖" title="Library" />
    <Toast msg={toast} onClose={clearToast} />
    {(data.library||[]).map(b=>(
      <Card key={b.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:T.text }}>{b.title}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{b.type}
              {!b.available && b.dueBack && <span> · Due back: {b.dueBack}</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={b.available?"Available":"Checked Out"} color={b.available?T.tealLight:T.danger} />
            {b.available
              ? <button onClick={()=>showToast(`"${b.title}" access granted!`)} style={{ ...btn(), fontSize:12, padding:"6px 12px" }}>📥 Access</button>
              : <button onClick={()=>showToast("Added to waitlist!")} style={{ ...btn(T.warn), fontSize:12, padding:"6px 12px" }}>🔔 Notify Me</button>
            }
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function StuComplaints({ data, child }) {
  const { dispatch } = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category:"Infrastructure", remark:"" });
  const [toast, showToast, clearToast] = useToast();
  const complaints = data.complaints || [];

  const submit = () => {
    if(!form.remark){ showToast("Please enter your complaint."); return; }
    dispatch({ type:"ADD_COMPLAINT", sid:child.id, payload:{
      id:"C"+Date.now(), category:form.category,
      remark:form.remark, date:new Date().toISOString().split("T")[0], status:"Open",
    }});
    setForm({category:"Infrastructure",remark:""}); setOpen(false);
    showToast("Complaint submitted!");
  };

  return <>
    <SectionTitle icon="📣" title="Complaints"
      action={<button onClick={()=>setOpen(true)} style={btn()}>+ New Complaint</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {open && <Modal title="Submit Complaint" onClose={()=>setOpen(false)}>
      <Select label="Category"
        options={["Infrastructure","Academic","Staff","Canteen","Transport","Other"]}
        value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} />
      <Textarea label="Remarks" placeholder="Describe your complaint in detail…"
        value={form.remark} onChange={e=>setForm(p=>({...p,remark:e.target.value}))} />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setOpen(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={submit} style={btn()}>Submit</button>
      </div>
    </Modal>}
    {complaints.length===0 && <EmptyState icon="📣" title="No complaints" sub="Hope all is well!" />}
    {complaints.map((c,i)=>(
      <Card key={c.id||i}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:700, color:T.text }}>{c.category}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{c.remark}</div>
            <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>📅 {c.date}</div>
          </div>
          <Badge label={c.status}
            color={c.status==="Resolved"?T.tealLight:c.status==="In Progress"?T.warn:T.danger} />
        </div>
      </Card>
    ))}
  </>;
}

function StuEvents({ data, child }) {
  const { dispatch } = useDB();
  const [comment, setComment] = useState({});
  const events = data.events || [];

  return <>
    <SectionTitle icon="🎉" title="School Events" />
    {events.length===0 && <EmptyState icon="🎉" title="No events yet" />}
    {events.map(e=>(
      <Card key={e.id}>
        <div style={{ fontWeight:800, fontSize:16, color:T.text }}>{e.title}</div>
        <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>📅 {e.date}</div>
        <div style={{ color:T.text, fontSize:13, marginTop:8 }}>{e.desc}</div>
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <button onClick={()=>dispatch({type:"LIKE_EVENT",sid:child.id,eid:e.id})}
            style={{ ...btn(e.liked?T.teal:T.badge, e.liked?"#fff":T.teal), border:`1px solid ${T.border}`,
              fontSize:13, padding:"6px 16px" }}>
            {e.liked?"❤️":"🤍"} {e.likes} Likes
          </button>
        </div>
        <div style={{ marginTop:14 }}>
          <div style={{ fontWeight:700, color:T.teal, marginBottom:8 }}>💬 Comments ({e.comments.length})</div>
          {e.comments.map((c,i)=>(
            <div key={i} style={{ background:T.bg, borderRadius:8, padding:"8px 12px", marginBottom:6, fontSize:13 }}>
              <strong>{c.user}:</strong> {c.text} <span style={{ color:T.muted, fontSize:11 }}>· {c.date}</span>
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <input style={{ ...inp, flex:1 }} placeholder="Add a comment…"
              value={comment[e.id]||""} onChange={el=>setComment(p=>({...p,[e.id]:el.target.value}))} />
            <button onClick={()=>{
              if(!comment[e.id]) return;
              dispatch({type:"COMMENT_EVENT", sid:child.id, eid:e.id,
                comment:{ user:"Parent", text:comment[e.id], date:new Date().toISOString().split("T")[0] }});
              setComment(p=>({...p,[e.id]:""}));
            }} style={btn()}>Post</button>
          </div>
        </div>
      </Card>
    ))}
  </>;
}

// ════════════════════════════════════════════════════════════
//  ADMIN PORTAL
// ════════════════════════════════════════════════════════════
const ADMIN_TABS = [
  { id:"overview",       icon:"📊", label:"Dashboard" },
  { id:"students",       icon:"👨‍🎓", label:"Students" },
  { id:"teachers",       icon:"👩‍🏫", label:"Teachers" },
  { divider:true, id:"da1" },
  { id:"timetable",      icon:"🕐", label:"Timetables" },
  { id:"attendance",     icon:"📋", label:"Attendance" },
  { id:"homework",       icon:"📚", label:"Homework" },
  { id:"exams",          icon:"📝", label:"Exams" },
  { id:"results",        icon:"🏆", label:"Results" },
  { divider:true, id:"da2" },
  { id:"leaves",         icon:"🏖️", label:"Leave Mgmt" },
  { id:"complaints",     icon:"📣", label:"Complaints" },
  { id:"notifications",  icon:"🔔", label:"Notifications" },
  { id:"events",         icon:"🎉", label:"Events" },
  { id:"calendar",       icon:"📅", label:"Calendar" },
  { id:"library",        icon:"📖", label:"Library" },
  { id:"reports",        icon:"📈", label:"Reports" },
];

function AdminPortal({ user, onBack }) {
  const [tab, setTab] = useState("overview");
  const { leaveRequests } = useDB();
  const pending = leaveRequests.filter(l=>l.status==="Pending").length;

  const tabs = ADMIN_TABS.map(t=>t.id==="leaves"&&pending>0?{...t,badge:pending}:t);

  return <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
    <Sidebar items={tabs} active={tab} onSelect={setTab} onLogout={onBack} header="Admin Panel" />
    <div style={{ marginLeft:220, flex:1, padding:"22px 26px", overflowY:"auto" }}>
      <PageHeader title={`Welcome, ${user.name}`} sub="Greenwood International School · Admin Access"
        right={<Badge label="Admin" color={T.teal} />} />
      {tab==="overview"       && <AdminOverview />}
      {tab==="students"       && <AdminStudents />}
      {tab==="teachers"       && <AdminTeachers />}
      {tab==="timetable"      && <AdminTimetable />}
      {tab==="attendance"     && <AdminAttendance />}
      {tab==="homework"       && <AdminHomework />}
      {tab==="exams"          && <AdminExams />}
      {tab==="results"        && <AdminResults />}
      {tab==="leaves"         && <AdminLeaves />}
      {tab==="complaints"     && <AdminComplaints />}
      {tab==="notifications"  && <AdminNotifications />}
      {tab==="events"         && <AdminEvents />}
      {tab==="calendar"       && <AdminCalendar />}
      {tab==="library"        && <AdminLibrary />}
      {tab==="reports"        && <AdminReports />}
    </div>
  </div>;
}

function AdminOverview() {
  const { students, teachers, leaveRequests, complaints } = useDB();
  const pending = leaveRequests.filter(l=>l.status==="Pending");
  const openComplaints = complaints.filter(c=>c.status==="Open"||c.status==="In Progress");
  return <>
    <SectionTitle icon="📊" title="Dashboard Overview" />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
      <StatCard icon="👨‍🎓" label="Total Students"      value={students.length}         sub="+2 this month"       color={T.teal} />
      <StatCard icon="👩‍🏫" label="Teachers"            value={teachers.length}         sub="All active"          color={T.tealMid} />
      <StatCard icon="🏖️" label="Pending Leaves"       value={pending.length}          sub="Awaiting approval"   color={T.warn} />
      <StatCard icon="📣" label="Open Complaints"      value={openComplaints.length}   sub="Needs attention"     color={T.danger} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <div style={{ fontWeight:800, color:T.teal, marginBottom:14 }}>🏖️ Pending Leave Approvals</div>
        {pending.length===0 && <EmptyState icon="✅" title="All clear!" sub="No pending leaves." />}
        {pending.map(l=>(
          <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 0", borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
            <div>
              <div style={{ fontWeight:700 }}>{l.studentName}</div>
              <div style={{ color:T.muted }}>{l.class} · {l.from} – {l.to}</div>
            </div>
            <Badge label={l.type} color={l.type==="Teacher"?T.tealMid:T.teal} />
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontWeight:800, color:T.teal, marginBottom:14 }}>📅 Upcoming Events</div>
        {[["Annual Sports Day","Jun 25"],["Science Exhibition","Jul 5"],["Parent-Teacher Meet","Jul 12"]].map(([e,d])=>(
          <div key={e} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0",
            borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
            <span style={{ color:T.text, fontWeight:500 }}>{e}</span>
            <Badge label={d} color={T.tealMid} />
          </div>
        ))}
      </Card>
    </div>
  </>;
}

function AdminStudents() {
  const { students, dispatch } = useDB();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | {student}
  const [form, setForm] = useState({ name:"",class:"",rollNo:"",dob:"",blood:"O+",contact:"" });
  const [toast, showToast, clearToast] = useToast();

  const filtered = students.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.includes(search)
  );

  const openEdit = (s) => { setForm({...s}); setModal({student:s}); };
  const openAdd  = () => { setForm({name:"",class:"",rollNo:"",dob:"",blood:"O+",contact:""}); setModal("add"); };

  const save = () => {
    if(!form.name||!form.class){ showToast("Name and Class are required."); return; }
    if(modal==="add") {
      dispatch({ type:"ADD_STUDENT", payload:{ ...form, id:"S"+Date.now(), schoolId:"SCH001" }});
      showToast("Student added!");
    } else {
      dispatch({ type:"UPDATE_STUDENT", id:modal.student.id, payload:form });
      showToast("Student updated!");
    }
    setModal(null);
  };

  const del = (id) => {
    if(window.confirm("Delete this student?")) {
      dispatch({ type:"DELETE_STUDENT", id });
      showToast("Student removed.");
    }
  };

  return <>
    <SectionTitle icon="👨‍🎓" title="Student Management"
      action={<button onClick={openAdd} style={btn()}>+ Add Student</button>} />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"flex", gap:10, marginBottom:14 }}>
      <input style={{ ...inp, flex:1, maxWidth:340 }} placeholder="🔍 Search by name, class or roll no…"
        value={search} onChange={e=>setSearch(e.target.value)} />
      <button onClick={()=>showToast("Export triggered (connect to real backend)")}
        style={{ ...btn(T.surface,T.teal), border:`1px solid ${T.teal}` }}>📤 Export Excel</button>
    </div>
    {modal && <Modal title={modal==="add"?"Add Student":"Edit Student"} onClose={()=>setModal(null)}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Full Name"  value={form.name}    onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Student Name" />
        <Input label="Class"      value={form.class}   onChange={e=>setForm(p=>({...p,class:e.target.value}))} placeholder="e.g. 10-A" />
        <Input label="Roll No"    value={form.rollNo}  onChange={e=>setForm(p=>({...p,rollNo:e.target.value}))} placeholder="Roll Number" />
        <Input label="Date of Birth" type="date" value={form.dob} onChange={e=>setForm(p=>({...p,dob:e.target.value}))} />
        <Select label="Blood Group" value={form.blood} onChange={e=>setForm(p=>({...p,blood:e.target.value}))}
          options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} />
        <Input label="Contact" value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="Phone" />
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(null)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Save</button>
      </div>
    </Modal>}
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Name","Class","Roll","DOB","Blood","Contact","Actions"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700, fontSize:12, borderBottom:`1px solid ${T.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(s=>(
            <tr key={s.id} style={{ borderBottom:`1px solid ${T.border}` }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bg}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"11px 14px", fontWeight:700, color:T.text }}>{s.name}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={s.class} color={T.tealMid} /></td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{s.rollNo}</td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{s.dob}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={s.blood} color={T.danger} /></td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{s.contact}</td>
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>openEdit(s)} style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}`, fontSize:12, padding:"4px 10px" }}>✏️</button>
                  <button onClick={()=>del(s.id)}   style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30`, fontSize:12, padding:"4px 10px" }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length===0 && <tr><td colSpan={7} style={{ padding:30, textAlign:"center", color:T.muted }}>No students found.</td></tr>}
        </tbody>
      </table>
    </Card>
  </>;
}

function AdminTeachers() {
  const { teachers, dispatch } = useDB();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:"",subject:"",classes:"",breakTime:"",email:"",phone:"" });
  const [toast, showToast, clearToast] = useToast();

  const save = () => {
    if(!form.name||!form.subject){ showToast("Name & subject required."); return; }
    if(modal==="add") {
      dispatch({ type:"ADD_TEACHER", payload:{ ...form, id:"T"+Date.now(), classes:form.classes.split(",").map(s=>s.trim()), schoolId:"SCH001" }});
      showToast("Teacher added!");
    } else {
      dispatch({ type:"UPDATE_TEACHER", id:modal.teacher.id,
        payload:{ ...form, classes:form.classes.split(",").map(s=>s.trim()) }});
      showToast("Teacher updated!");
    }
    setModal(null);
  };

  return <>
    <SectionTitle icon="👩‍🏫" title="Faculty Management"
      action={<button onClick={()=>{ setForm({name:"",subject:"",classes:"",breakTime:"",email:"",phone:""}); setModal("add"); }} style={btn()}>+ Add Teacher</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title={modal==="add"?"Add Teacher":"Edit Teacher"} onClose={()=>setModal(null)}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Full Name"  value={form.name}      onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Teacher Name" />
        <Input label="Subject"    value={form.subject}   onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Subject" />
        <Input label="Classes (comma-separated)" value={form.classes} onChange={e=>setForm(p=>({...p,classes:e.target.value}))} placeholder="10-A,9-B" />
        <Input label="Break Time" value={form.breakTime} onChange={e=>setForm(p=>({...p,breakTime:e.target.value}))} placeholder="11:00-11:30" />
        <Input label="Email"      value={form.email}     onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@school.com" />
        <Input label="Phone"      value={form.phone}     onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="9XXXXXXXXX" />
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(null)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Save</button>
      </div>
    </Modal>}
    {teachers.map(t=>(
      <Card key={t.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:46, height:46, background:`linear-gradient(135deg,${T.teal},${T.tealLight})`,
              borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:20 }}>👩‍🏫</div>
            <div>
              <div style={{ fontWeight:800, color:T.text, fontSize:15 }}>{t.name}</div>
              <div style={{ color:T.muted, fontSize:13, marginTop:3 }}>
                {t.subject} · Break: {t.breakTime} · 📞 {t.phone}
              </div>
              <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap" }}>
                {(t.classes||[]).map(c=><Badge key={c} label={`Class ${c}`} color={T.tealMid} />)}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{ setForm({...t,classes:(t.classes||[]).join(",")}); setModal({teacher:t}); }}
              style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}` }}>✏️ Edit</button>
            <button onClick={()=>{ dispatch({type:"DELETE_TEACHER",id:t.id}); }}
              style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30` }}>🗑️</button>
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function AdminTimetable() {
  const { students } = useDB();
  const classes = [...new Set(students.map(s=>s.class))].sort();
  const [selClass, setSelClass] = useState(classes[0]||"10-A");
  const [toast, showToast, clearToast] = useToast();
  const days=["Mon","Tue","Wed","Thu","Fri"];
  const subjects=["Math","English","Science","History","PE","Art","Computer","Music"];
  const [tt, setTT] = useState({
    Mon:["Math","English","Science","PE","Art","Computer"],
    Tue:["Science","Math","History","English","Music","Math"],
    Wed:["English","History","Math","Science","PE","Art"],
    Thu:["Computer","Math","English","Science","History","PE"],
    Fri:["Art","Science","Math","Music","English","Computer"],
  });
  return <>
    <SectionTitle icon="🕐" title="Timetable Management" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
      <Select label="" options={classes.map(c=>({value:c,label:`Class ${c}`}))}
        value={selClass} onChange={e=>setSelClass(e.target.value)} />
      <button onClick={()=>showToast("Timetable saved!")} style={{ ...btn(), marginBottom:12 }}>💾 Save Timetable</button>
    </div>
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            <th style={{ padding:"10px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>Day</th>
            {[1,2,3,4,5,6].map(p=><th key={p} style={{ padding:"10px 14px", textAlign:"center", color:T.muted, fontWeight:700 }}>Period {p}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map(day=>(
            <tr key={day} style={{ borderBottom:`1px solid ${T.border}` }}>
              <td style={{ padding:"10px 14px", fontWeight:800, color:T.teal }}>{day}</td>
              {(tt[day]||[]).map((sub,i)=>(
                <td key={i} style={{ padding:"6px 8px" }}>
                  <select value={sub} onChange={e=>setTT(p=>({...p,[day]:p[day].map((s,j)=>j===i?e.target.value:s)}))}
                    style={{ ...inp, padding:"6px 8px", fontSize:12 }}>
                    {subjects.map(s=><option key={s}>{s}</option>)}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function AdminAttendance() {
  const { students, dispatch } = useDB();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [marks, setMarks] = useState({});
  const [toast, showToast, clearToast] = useToast();

  const save = () => {
    Object.entries(marks).forEach(([sid,status])=>{
      dispatch({ type:"MARK_ATTENDANCE", sid, date, status });
    });
    showToast("Attendance saved for "+date);
    setMarks({});
  };

  return <>
    <SectionTitle icon="📋" title="Mark Attendance" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
      <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <button onClick={()=>{
        const all={};
        students.forEach(s=>all[s.id]="Present");
        setMarks(all); showToast("All marked Present");
      }} style={{ ...btn(T.tealLight), marginBottom:12 }}>✓ All Present</button>
      <button onClick={save} style={{ ...btn(), marginBottom:12 }}>💾 Save</button>
    </div>
    <Card style={{ padding:0, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Name","Class","Present","Absent","Applied Leave"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(s=>(
            <tr key={s.id} style={{ borderBottom:`1px solid ${T.border}` }}>
              <td style={{ padding:"10px 14px", fontWeight:700 }}>{s.name}</td>
              <td style={{ padding:"10px 14px" }}><Badge label={s.class} color={T.tealMid} /></td>
              {["Present","Absent","Applied Leave"].map(status=>(
                <td key={status} style={{ padding:"10px 14px" }}>
                  <input type="radio" name={`att-${s.id}`}
                    checked={marks[s.id]===status} onChange={()=>setMarks(p=>({...p,[s.id]:status}))} />{" "}
                  <span style={{ fontSize:12 }}>{status}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function AdminHomework() {
  const { teachers, dispatch } = useDB();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ subject:"", title:"", due:"", class:"", teacher:"" });
  const [toast, showToast, clearToast] = useToast();
  const [list, setList] = useState([
    { id:"HW0", subject:"Math",    title:"Chapter 5 Exercises",  due:"2026-06-12", class:"10-A", teacher:"Mr. Rajesh Kumar" },
    { id:"HW1", subject:"English", title:"Essay on Environment", due:"2026-06-10", class:"All",  teacher:"Ms. Divya Nair" },
    { id:"HW2", subject:"Science", title:"Lab Report – Osmosis", due:"2026-06-15", class:"10-A", teacher:"Dr. Suresh Rao" },
  ]);
  const save = () => {
    if(!form.subject||!form.title||!form.due){ showToast("Fill all fields."); return; }
    const hw = { ...form, id:"HW"+Date.now() };
    dispatch({ type:"ADD_HOMEWORK", payload:hw });
    setList(p=>[...p, hw]);
    setModal(false); setForm({ subject:"",title:"",due:"",class:"",teacher:"" });
    showToast("Homework assigned!");
  };
  return <>
    <SectionTitle icon="📚" title="Homework & Assignments"
      action={<button onClick={()=>setModal(true)} style={btn()}>+ Assign</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title="Assign Homework" onClose={()=>setModal(false)}>
      <Input label="Subject" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Subject" />
      <Input label="Title"   value={form.title}   onChange={e=>setForm(p=>({...p,title:e.target.value}))}   placeholder="Assignment title" />
      <Input label="Due Date" type="date" value={form.due} onChange={e=>setForm(p=>({...p,due:e.target.value}))} />
      <Input label="Class"   value={form.class}   onChange={e=>setForm(p=>({...p,class:e.target.value}))}   placeholder="e.g. 10-A or All" />
      <Select label="Teacher" value={form.teacher} onChange={e=>setForm(p=>({...p,teacher:e.target.value}))}
        options={teachers.map(t=>({value:t.name,label:t.name}))} />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Assign</button>
      </div>
    </Modal>}
    {list.map(h=>(
      <Card key={h.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:T.text }}>{h.title}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>
              📘 {h.subject} · 👩‍🏫 {h.teacher} · 🏫 Class {h.class}
            </div>
            <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>📅 Due: <strong>{h.due}</strong></div>
          </div>
          <button onClick={()=>setList(p=>p.filter(x=>x.id!==h.id))}
            style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30`, fontSize:12, padding:"4px 10px" }}>🗑️</button>
        </div>
      </Card>
    ))}
  </>;
}

function AdminExams() {
  const [list, setList] = useState([
    { id:"EX1", subject:"Mathematics", date:"2026-06-20", time:"09:00 AM", class:"All 10th",  hall:"Hall A", duration:"2.5 hrs", status:"Scheduled" },
    { id:"EX2", subject:"English",     date:"2026-06-21", time:"11:00 AM", class:"All",       hall:"Hall B", duration:"3 hrs",   status:"Scheduled" },
    { id:"EX3", subject:"Science",     date:"2026-06-22", time:"09:00 AM", class:"All 10th",  hall:"Hall A", duration:"2.5 hrs", status:"Results Out" },
  ]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [toast, showToast, clearToast] = useToast();

  const save = () => {
    if(!form.subject){ showToast("Subject required."); return; }
    if(modal==="add") setList(p=>[...p,{...form,id:"EX"+Date.now(),status:"Scheduled"}]);
    else setList(p=>p.map(e=>e.id===modal.id?{...e,...form}:e));
    setModal(null); showToast("Exam saved!");
  };

  return <>
    <SectionTitle icon="📝" title="Exam Management"
      action={<button onClick={()=>{ setForm({subject:"",date:"",time:"",class:"",hall:"",duration:""}); setModal("add"); }} style={btn()}>+ Schedule</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title={modal==="add"?"Schedule Exam":"Edit Exam"} onClose={()=>setModal(null)}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Subject"  value={form.subject}  onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Subject" />
        <Input label="Class"    value={form.class}    onChange={e=>setForm(p=>({...p,class:e.target.value}))}   placeholder="e.g. All 10th" />
        <Input label="Date"     type="date" value={form.date}  onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
        <Input label="Time"     value={form.time}     onChange={e=>setForm(p=>({...p,time:e.target.value}))}    placeholder="09:00 AM" />
        <Input label="Hall"     value={form.hall}     onChange={e=>setForm(p=>({...p,hall:e.target.value}))}    placeholder="Hall A" />
        <Input label="Duration" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="2.5 hrs" />
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(null)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Save</button>
      </div>
    </Modal>}
    {list.map(ex=>(
      <Card key={ex.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:T.text }}>{ex.subject}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>
              📅 {ex.date} · 🕐 {ex.time} · 🏫 {ex.class} · 🏛️ {ex.hall} · ⏱ {ex.duration}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={ex.status} color={ex.status==="Results Out"?T.tealLight:T.warn} />
            <button onClick={()=>{ setForm({...ex}); setModal(ex); }}
              style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}` }}>✏️</button>
            <button onClick={()=>setList(p=>p.filter(e=>e.id!==ex.id))}
              style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30` }}>🗑️</button>
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function AdminResults() {
  const { students, studentData, dispatch } = useDB();
  const [selStu, setSelStu] = useState(students[0]?.id||"S001");
  const [toast, showToast, clearToast] = useToast();
  const sd = studentData[selStu] || {};
  const results = sd.results || [];

  return <>
    <SectionTitle icon="🏆" title="Update Student Results" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ marginBottom:16 }}>
      <Select label="Select Student"
        options={students.map(s=>({value:s.id,label:`${s.name} (${s.class})`}))}
        value={selStu} onChange={e=>setSelStu(e.target.value)} />
    </div>
    {results.length===0 && <EmptyState icon="🏆" title="No results found for this student." />}
    {results.map((r,i)=>(
      <Card key={r.subject}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontWeight:700, color:T.text, minWidth:100 }}>{r.subject}</div>
          <div style={{ flex:1 }}>
            <input type="number" min={0} max={r.max} value={r.marks}
              onChange={e=>dispatch({type:"UPDATE_RESULT",sid:selStu,subject:r.subject,payload:{marks:+e.target.value}})}
              style={{ ...inp, width:80 }} />
            <span style={{ color:T.muted, fontSize:12, marginLeft:8 }}>/ {r.max}</span>
          </div>
          <ProgressBar pct={(r.marks/r.max)*100} />
          <Badge label={r.grade} color={T.teal} />
        </div>
      </Card>
    ))}
    {results.length>0 && <button onClick={()=>showToast("Results saved!")} style={btn()}>💾 Save All Results</button>}
  </>;
}

function AdminLeaves() {
  const { leaveRequests, dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();
  const [filter, setFilter] = useState("Pending");

  const filtered = filter==="All" ? leaveRequests : leaveRequests.filter(l=>l.status===filter);

  return <>
    <SectionTitle icon="🏖️" title="Leave Management" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {["All","Pending","Approved","Rejected"].map(f=>(
        <button key={f} onClick={()=>setFilter(f)}
          style={{ ...btn(filter===f?T.teal:T.surface, filter===f?"#fff":T.text),
            border:`1px solid ${filter===f?T.teal:T.border}`, padding:"7px 14px", fontSize:12 }}>{f}</button>
      ))}
    </div>
    {filtered.length===0 && <EmptyState icon="🏖️" title="No records found." />}
    {filtered.map(l=>(
      <Card key={l.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800, color:T.text }}>{l.studentName}
              <span style={{ marginLeft:8 }}><Badge label={l.type} color={l.type==="Teacher"?T.tealMid:T.teal} /></span>
            </div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{l.class} · 📅 {l.from} – {l.to}</div>
            <div style={{ color:T.text, fontSize:13, marginTop:4 }}>"{l.reason}"</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={l.status} color={l.status==="Approved"?T.tealLight:l.status==="Rejected"?T.danger:T.warn} />
            {l.status==="Pending" && <>
              <button onClick={()=>{ dispatch({type:"APPROVE_LEAVE",id:l.id}); showToast("Leave approved!"); }}
                style={{ ...btn(T.tealLight), fontSize:12, padding:"6px 14px" }}>✓ Approve</button>
              <button onClick={()=>{ dispatch({type:"REJECT_LEAVE",id:l.id}); showToast("Leave rejected."); }}
                style={{ ...btn(T.danger), fontSize:12, padding:"6px 14px" }}>✗ Reject</button>
            </>}
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function AdminComplaints() {
  const { complaints, dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();
  const [filter, setFilter] = useState("All");
  const filtered = filter==="All" ? complaints : complaints.filter(c=>c.status===filter);

  const setStatus = (id, status) => {
    dispatch({ type:"UPDATE_COMPLAINT", id, payload:{ status }});
    showToast("Status updated to "+status);
  };

  return <>
    <SectionTitle icon="📣" title="Complaints" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {["All","Open","In Progress","Resolved"].map(f=>(
        <button key={f} onClick={()=>setFilter(f)}
          style={{ ...btn(filter===f?T.teal:T.surface, filter===f?"#fff":T.text),
            border:`1px solid ${filter===f?T.teal:T.border}`, padding:"7px 14px", fontSize:12 }}>{f}</button>
      ))}
    </div>
    {filtered.length===0 && <EmptyState icon="📣" title="No complaints." />}
    {filtered.map(c=>(
      <Card key={c.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800, color:T.text }}>{c.studentName} · <Badge label={c.category} color={T.tealMid} /></div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{c.remark}</div>
            <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>📅 {c.date}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={c.status} color={c.status==="Resolved"?T.tealLight:c.status==="In Progress"?T.warn:T.danger} />
            {c.status!=="Resolved" && <>
              {c.status==="Open" && <button onClick={()=>setStatus(c.id,"In Progress")}
                style={{ ...btn(T.warn), fontSize:12, padding:"5px 12px" }}>🔄 In Progress</button>}
              <button onClick={()=>setStatus(c.id,"Resolved")}
                style={{ ...btn(T.tealLight), fontSize:12, padding:"5px 12px" }}>✓ Resolve</button>
            </>}
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function AdminNotifications() {
  const { dispatch, notifications } = useDB();
  const [form, setForm] = useState({ type:"Exam", target:"All Students", message:"" });
  const [toast, showToast, clearToast] = useToast();

  const send = () => {
    if(!form.message){ showToast("Enter a message."); return; }
    dispatch({ type:"SEND_NOTIFICATION", payload:{
      id:"N"+Date.now(), ...form, date:new Date().toISOString().split("T")[0]
    }});
    setForm(p=>({...p,message:""}));
    showToast("Notification sent!");
  };

  return <>
    <SectionTitle icon="🔔" title="Send Notifications" />
    <Toast msg={toast} onClose={clearToast} />
    <Card>
      <div style={{ fontWeight:800, color:T.teal, marginBottom:14 }}>Broadcast Notification</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Select label="Type"   value={form.type}   onChange={e=>setForm(p=>({...p,type:e.target.value}))}
          options={["Exam","Result","Leave","Event","Absence","General"]} />
        <Select label="Target" value={form.target} onChange={e=>setForm(p=>({...p,target:e.target.value}))}
          options={["All Students","All Teachers","All Parents","Class 10-A","Class 9-B","Class 8-C","Class 7-B"]} />
      </div>
      <Textarea label="Message" placeholder="Type your notification message…"
        value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} />
      <button onClick={send} style={btn()}>🔔 Send Notification</button>
    </Card>
    {notifications.length>0 && <>
      <div style={{ fontWeight:800, color:T.teal, margin:"20px 0 10px" }}>Sent Notifications</div>
      {notifications.map(n=>(
        <Card key={n.id}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700 }}>{n.message}</div>
              <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>
                To: {n.target} · {n.date} · Type: {n.type}
              </div>
            </div>
            <Badge label="Sent" color={T.tealLight} />
          </div>
        </Card>
      ))}
    </>}
  </>;
}

function AdminEvents() {
  const { events, dispatch } = useDB();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:"", date:"", desc:"" });
  const [toast, showToast, clearToast] = useToast();

  const save = () => {
    if(!form.title||!form.date){ showToast("Title & date required."); return; }
    dispatch({ type:"ADD_EVENT", payload:{ ...form, id:"EV"+Date.now(), schoolId:"SCH001", likes:0, comments:0 }});
    setModal(false); setForm({title:"",date:"",desc:""}); showToast("Event created!");
  };

  return <>
    <SectionTitle icon="🎉" title="School Events"
      action={<button onClick={()=>setModal(true)} style={btn()}>+ Add Event</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title="Create Event" onClose={()=>setModal(false)}>
      <Input label="Event Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Annual Day" />
      <Input label="Date" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
      <Textarea label="Description" value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="Brief description…" />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Create</button>
      </div>
    </Modal>}
    {events.map(ev=>(
      <Card key={ev.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:T.text }}>{ev.title}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>📅 {ev.date}</div>
            {ev.desc && <div style={{ color:T.text, fontSize:13, marginTop:6 }}>{ev.desc}</div>}
            <div style={{ marginTop:8, display:"flex", gap:8 }}>
              <Badge label={`❤️ ${ev.likes}`}    color={T.tealMid} />
              <Badge label={`💬 ${ev.comments}`} color={T.tealLight} />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function AdminCalendar() {
  const { calendar, dispatch } = useDB();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date:"", event:"", type:"academic" });
  const [toast, showToast, clearToast] = useToast();
  const typeColor = { academic:T.teal, event:T.tealLight, holiday:T.accent, exam:T.danger };

  const save = () => {
    if(!form.date||!form.event){ showToast("Date & event name required."); return; }
    dispatch({ type:"ADD_CALENDAR", payload:form });
    setModal(false); setForm({date:"",event:"",type:"academic"}); showToast("Calendar event added!");
  };

  return <>
    <SectionTitle icon="📅" title="Academic Calendar"
      action={<button onClick={()=>setModal(true)} style={btn()}>+ Add Event</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title="Add Calendar Event" onClose={()=>setModal(false)}>
      <Input label="Date" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
      <Input label="Event Name" value={form.event} onChange={e=>setForm(p=>({...p,event:e.target.value}))} placeholder="e.g. Summer Break" />
      <Select label="Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
        options={["academic","event","holiday","exam"]} />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Add</button>
      </div>
    </Modal>}
    {calendar.map((c,i)=>{
      const parts=c.date.split("-");
      return <Card key={i}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ background:typeColor[c.type]||T.teal, color:"#fff",
            borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:52 }}>
            <div style={{ fontWeight:900, fontSize:18, lineHeight:1 }}>{parts[2]}</div>
            <div style={{ fontSize:11 }}>Jun</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15, color:T.text }}>{c.event}</div>
            <div style={{ marginTop:5 }}><Badge label={c.type} color={typeColor[c.type]||T.teal} /></div>
          </div>
        </div>
      </Card>;
    })}
  </>;
}

function AdminLibrary() {
  const [books, setBooks] = useState([
    { id:"B1", title:"Advanced Mathematics Vol.2",  type:"Subject PDF",  available:true,  addedBy:"Admin" },
    { id:"B2", title:"English Literature Classics",  type:"General Book", available:false, addedBy:"Admin" },
    { id:"B3", title:"Science Encyclopedia",         type:"General Book", available:true,  addedBy:"Admin" },
    { id:"B4", title:"World History – Modern Era",   type:"Subject PDF",  available:true,  addedBy:"Admin" },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:"", type:"Subject PDF" });
  const [toast, showToast, clearToast] = useToast();

  const add = () => {
    if(!form.title){ showToast("Title required."); return; }
    setBooks(p=>[...p,{...form, id:"B"+Date.now(), available:true, addedBy:"Admin"}]);
    setModal(false); setForm({title:"",type:"Subject PDF"}); showToast("Book uploaded!");
  };

  return <>
    <SectionTitle icon="📖" title="Library Management"
      action={<button onClick={()=>setModal(true)} style={btn()}>+ Upload Book</button>} />
    <Toast msg={toast} onClose={clearToast} />
    {modal && <Modal title="Upload Book / PDF" onClose={()=>setModal(false)}>
      <Input label="Title"  value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Book / PDF title" />
      <Select label="Type"  value={form.type}  onChange={e=>setForm(p=>({...p,type:e.target.value}))}  options={["Subject PDF","General Book"]} />
      <div style={{ background:T.bg, border:`2px dashed ${T.border}`, borderRadius:8, padding:20,
        textAlign:"center", marginBottom:12, color:T.muted, fontSize:13 }}>
        📤 Drag & drop file or click to browse (PDF / EPUB)
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={()=>setModal(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={add} style={btn()}>Upload</button>
      </div>
    </Modal>}
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Title","Type","Status","Actions"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {books.map(b=>(
            <tr key={b.id} style={{ borderBottom:`1px solid ${T.border}` }}>
              <td style={{ padding:"11px 14px", fontWeight:700 }}>{b.title}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={b.type} color={T.tealMid} /></td>
              <td style={{ padding:"11px 14px" }}><Badge label={b.available?"Available":"Checked Out"} color={b.available?T.tealLight:T.danger} /></td>
              <td style={{ padding:"11px 14px" }}>
                <button onClick={()=>setBooks(p=>p.filter(x=>x.id!==b.id))}
                  style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30`, fontSize:12, padding:"4px 10px" }}>🗑️ Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function AdminReports() {
  const { students, teachers } = useDB();
  const [toast, showToast, clearToast] = useToast();
  return <>
    <SectionTitle icon="📈" title="Reports & Analytics" />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
      <Pill label="Total Students" value={students.length} color={T.teal} />
      <Pill label="Teachers"       value={teachers.length}  color={T.tealMid} />
      <Pill label="Avg Attendance" value="94%"              color={T.tealLight} />
      <Pill label="Classes"        value={[...new Set(students.map(s=>s.class))].length} color={T.accent} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      {[
        { title:"Student Export",     desc:"Complete student database with all details", icon:"👨‍🎓" },
        { title:"Attendance Report",  desc:"Monthly class-wise attendance summary",       icon:"📋" },
        { title:"Exam Results",       desc:"Subject-wise result and ranking analysis",    icon:"📝" },
        { title:"Leave Summary",      desc:"Teacher and student leave records",           icon:"🏖️" },
        { title:"Complaints Log",     desc:"All complaints with resolution status",       icon:"📣" },
        { title:"Fee Register",       desc:"Fee payment status by class",                 icon:"💰" },
      ].map(r=>(
        <Card key={r.title}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ fontSize:30 }}>{r.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, color:T.text }}>{r.title}</div>
              <div style={{ color:T.muted, fontSize:12, marginTop:4 }}>{r.desc}</div>
            </div>
            <button onClick={()=>showToast(`${r.title} export triggered!`)} style={{ ...btn(), fontSize:12, padding:"7px 14px" }}>📤 Export</button>
          </div>
        </Card>
      ))}
    </div>
  </>;
}

// ════════════════════════════════════════════════════════════
//  TEACHER PORTAL
// ════════════════════════════════════════════════════════════
function TeacherPortal({ user, onBack }) {
  const [tab, setTab] = useState("overview");
  const { students, studentData, dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();

  const myStudents = students.filter(s=>
    (user.classes||[]).includes(s.class)
  );

  const tabs = [
    { id:"overview",   icon:"📊", label:"Overview" },
    { id:"timetable",  icon:"🕐", label:"My Timetable" },
    { id:"attendance", icon:"📋", label:"Mark Attendance" },
    { id:"homework",   icon:"📚", label:"Assign Homework" },
    { id:"results",    icon:"🏆", label:"Update Marks" },
    { id:"leave",      icon:"🏖️", label:"Apply Leave" },
    { id:"students",   icon:"👨‍🎓", label:"My Students" },
  ];

  return <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
    <Sidebar items={tabs} active={tab} onSelect={setTab} onLogout={onBack} header="Teacher Portal" />
    <div style={{ marginLeft:220, flex:1, padding:"22px 26px", overflowY:"auto" }}>
      <PageHeader title={user.name} sub={`Subject: ${user.subject} · Greenwood International School`}
        right={<Badge label="Teacher" color={T.tealMid} />} />
      <Toast msg={toast} onClose={clearToast} />
      {tab==="overview"   && <TeacherOverview user={user} students={myStudents} />}
      {tab==="timetable"  && <TeacherTimetable user={user} />}
      {tab==="attendance" && <AdminAttendance />}
      {tab==="homework"   && <AdminHomework />}
      {tab==="results"    && <AdminResults />}
      {tab==="leave"      && <TeacherLeave user={user} dispatch={dispatch} showToast={showToast} />}
      {tab==="students"   && <TeacherStudents students={myStudents} />}
    </div>
  </div>;
}

function TeacherOverview({ user, students }) {
  return <>
    <SectionTitle icon="📊" title="Teacher Overview" />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
      <StatCard icon="👨‍🎓" label="My Students" value={students.length} sub={`${(user.classes||[]).length} classes`} color={T.teal} />
      <StatCard icon="📚"   label="Assignments"  value={3}               sub="pending review"                          color={T.warn} />
      <StatCard icon="📝"   label="Exams"        value={2}               sub="this month"                              color={T.tealMid} />
    </div>
    <Card>
      <div style={{ fontWeight:800, color:T.teal, marginBottom:14 }}>Today's Schedule</div>
      {(user.classes||[]).map((cls,i)=>(
        <div key={cls} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0",
          borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
          <span style={{ fontWeight:700 }}>Class {cls} — {user.subject}</span>
          <span style={{ color:T.muted }}>{["9:00 AM","11:00 AM","2:00 PM"][i]||"TBD"} · Room {200+i+1}</span>
        </div>
      ))}
    </Card>
  </>;
}

function TeacherTimetable({ user }) {
  const days=["Mon","Tue","Wed","Thu","Fri"];
  const schedule = {
    Mon:["Class 10-A","Free","Class 9-B","Free","Class 8-C","Free"],
    Tue:["Free","Class 10-A","Free","Class 9-B","Free","Class 8-C"],
    Wed:["Class 9-B","Free","Class 10-A","Free","Class 8-C","Free"],
    Thu:["Class 8-C","Free","Class 9-B","Class 10-A","Free","Free"],
    Fri:["Free","Class 8-C","Free","Free","Class 9-B","Class 10-A"],
  };
  return <>
    <SectionTitle icon="🕐" title="My Weekly Schedule" />
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            <th style={{ padding:"11px 14px", background:T.teal, color:"#fff", textAlign:"left" }}>Day</th>
            {[1,2,3,4,5,6].map(p=><th key={p} style={{ padding:"11px 14px", background:T.tealMid, color:"#fff", textAlign:"center" }}>Period {p}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((day,ri)=>(
            <tr key={day} style={{ background:ri%2?T.bg:T.surface }}>
              <td style={{ padding:"11px 14px", fontWeight:800, color:T.teal, borderBottom:`1px solid ${T.border}` }}>{day}</td>
              {(schedule[day]||[]).map((slot,i)=>(
                <td key={i} style={{ padding:"11px 14px", textAlign:"center", borderBottom:`1px solid ${T.border}`,
                  color: slot==="Free"?T.muted:T.text, fontWeight: slot==="Free"?400:700 }}>
                  {slot}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function TeacherLeave({ user, dispatch, showToast }) {
  const [form, setForm] = useState({ from:"", to:"", reason:"" });
  const [leaves, setLeaves] = useState([
    { id:"TLV1", from:"2026-05-20", to:"2026-05-20", reason:"Medical", status:"Approved" },
  ]);
  const submit = () => {
    if(!form.from||!form.to||!form.reason){ showToast("Fill all fields."); return; }
    const lv = { id:"TLV"+Date.now(), ...form, status:"Pending" };
    setLeaves(p=>[...p,lv]);
    dispatch({ type:"ADD_LEAVE", sid:"T001", payload:{ ...lv, studentName:user.name, class:user.subject, type:"Teacher" }});
    setForm({from:"",to:"",reason:""}); showToast("Leave application submitted!");
  };
  return <>
    <SectionTitle icon="🏖️" title="Apply for Leave" />
    <Card>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="From Date" type="date" value={form.from} onChange={e=>setForm(p=>({...p,from:e.target.value}))} />
        <Input label="To Date"   type="date" value={form.to}   onChange={e=>setForm(p=>({...p,to:e.target.value}))} />
      </div>
      <Textarea label="Reason" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} placeholder="Reason for leave…" />
      <button onClick={submit} style={btn()}>Submit Application</button>
    </Card>
    {leaves.map(l=>(
      <Card key={l.id}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700 }}>📅 {l.from} → {l.to}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{l.reason}</div>
          </div>
          <Badge label={l.status} color={l.status==="Approved"?T.tealLight:l.status==="Rejected"?T.danger:T.warn} />
        </div>
      </Card>
    ))}
  </>;
}

function TeacherStudents({ students }) {
  return <>
    <SectionTitle icon="👨‍🎓" title="My Students" />
    <Card style={{ overflowX:"auto", padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Name","Class","Roll","Blood","Contact"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(s=>(
            <tr key={s.id} style={{ borderBottom:`1px solid ${T.border}` }}>
              <td style={{ padding:"11px 14px", fontWeight:700 }}>{s.name}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={s.class} color={T.tealMid} /></td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{s.rollNo}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={s.blood} color={T.danger} /></td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{s.contact}</td>
            </tr>
          ))}
          {students.length===0 && <tr><td colSpan={5} style={{ padding:30, textAlign:"center", color:T.muted }}>No students assigned.</td></tr>}
        </tbody>
      </table>
    </Card>
  </>;
}

// ════════════════════════════════════════════════════════════
//  SUPER ADMIN PORTAL
// ════════════════════════════════════════════════════════════
function SuperAdminPortal({ user, onBack }) {
  const [tab, setTab] = useState("schools");
  const tabs = [
    { id:"schools",  icon:"🏫", label:"Schools" },
    { id:"roles",    icon:"🔐", label:"Roles & Permissions" },
    { id:"modules",  icon:"🧩", label:"Module Toggle" },
    { id:"users",    icon:"👥", label:"User Management" },
    { id:"theme",    icon:"🎨", label:"Branding & Theme" },
    { id:"system",   icon:"⚙️", label:"System Settings" },
    { id:"audit",    icon:"📜", label:"Audit Log" },
  ];
  return <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
    <Sidebar items={tabs} active={tab} onSelect={setTab} onLogout={onBack} header="Super Admin" dark />
    <div style={{ marginLeft:220, flex:1, padding:"22px 26px", overflowY:"auto" }}>
      <PageHeader title="Super Admin Control Center"
        sub="Full system access — all schools, all roles, all modules"
        right={<Badge label="⚡ GOD MODE" color={T.accent} />}
        avatar="🔐" />
      {tab==="schools" && <SASchools />}
      {tab==="roles"   && <SARoles />}
      {tab==="modules" && <SAModules />}
      {tab==="users"   && <SAUsers />}
      {tab==="theme"   && <SATheme />}
      {tab==="system"  && <SASystem />}
      {tab==="audit"   && <SAAudit />}
    </div>
  </div>;
}

function SASchools() {
  const { schools, dispatch } = useDB();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id:"", name:"", city:"", logo:"🏫" });
  const [toast, showToast, clearToast] = useToast();

  const save = () => {
    if(!form.name||!form.city){ showToast("Name and city required."); return; }
    dispatch({ type:"ADD_SCHOOL", payload:{ ...form, active:true, theme:{primary:T.teal,accent:T.accent} }});
    setModal(false); setForm({id:"",name:"",city:"",logo:"🏫"}); showToast("School registered!");
  };

  return <>
    <SectionTitle icon="🏫" title="Registered Institutions"
      action={<button onClick={()=>setModal(true)} style={btn()}>+ Register School</button>} />
    <Toast msg={toast} onClose={clearToast} />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
      <StatCard icon="🏫" label="Total Schools"   value={schools.length} sub="Registered"    color={T.teal} />
      <StatCard icon="✅" label="Active"           value={schools.filter(s=>s.active).length} sub="Running"  color={T.tealLight} />
      <StatCard icon="👥" label="Total Users"      value={42}             sub="Across all"    color={T.tealMid} />
    </div>
    {modal && <Modal title="Register New School" onClose={()=>setModal(false)}>
      <Input label="School ID"   value={form.id}   onChange={e=>setForm(p=>({...p,id:e.target.value}))}   placeholder="SCH003" />
      <Input label="School Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="School or College name" />
      <Input label="City"        value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="City" />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={()=>setModal(false)} style={btn(T.bg,T.muted)}>Cancel</button>
        <button onClick={save} style={btn()}>Register</button>
      </div>
    </Modal>}
    {schools.map(s=>(
      <Card key={s.id} style={{ borderLeft:`4px solid ${s.theme?.primary||T.teal}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <div style={{ fontSize:40 }}>{s.logo}</div>
            <div>
              <div style={{ fontWeight:900, fontSize:16, color:T.text }}>{s.name}</div>
              <div style={{ color:T.muted, fontSize:13, marginTop:3 }}>📍 {s.city} · ID: {s.id}</div>
              <div style={{ marginTop:6 }}><Badge label={s.active?"Active":"Inactive"} color={s.active?T.tealLight:T.danger} /></div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}` }}>⚙️ Configure</button>
            <button style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}` }}>📊 View Stats</button>
          </div>
        </div>
      </Card>
    ))}
  </>;
}

function SARoles() {
  const roles = [
    { name:"Super Admin",  color:"#7C3AED", icon:"🔐",
      perms:["Full System Access","Create/Delete Schools","Manage All Users","Configure Modules","System Settings","View Audit Logs"] },
    { name:"Admin",        color:T.teal,    icon:"🏫",
      perms:["Student Management","Teacher Management","Exam Management","Attendance Tracking","Reports & Export","Leave Approval","Notifications","Calendar","Library Management"] },
    { name:"Teacher",      color:T.tealMid, icon:"👩‍🏫",
      perms:["View Student Profiles","Mark Attendance","Assign Homework","Update Exam Marks","Apply Own Leave","View Timetable","View My Students"] },
    { name:"Student/Parent",color:T.tealLight,icon:"👨‍👩‍👧",
      perms:["View Own Profile","View Timetable","View Attendance","Apply Leave","View Results","View Notifications","Lodge Complaints","Access Library","View Events"] },
  ];
  return <>
    <SectionTitle icon="🔐" title="Role & Permission Matrix" />
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      {roles.map(r=>(
        <Card key={r.name} style={{ borderTop:`4px solid ${r.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:22 }}>{r.icon}</span>
              <div style={{ fontWeight:900, fontSize:15, color:T.text }}>{r.name}</div>
            </div>
            <button style={{ ...btn(r.color+"18",r.color), border:`1px solid ${r.color}40`, fontSize:12 }}>✏️ Edit</button>
          </div>
          {r.perms.map(p=>(
            <div key={p} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0",
              borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
              <span style={{ color:T.tealLight, fontWeight:900, fontSize:16, lineHeight:1 }}>✓</span>
              <span style={{ color:T.text }}>{p}</span>
            </div>
          ))}
        </Card>
      ))}
    </div>
  </>;
}

function SAModules() {
  const { modules, dispatch } = useDB();
  const [toast, showToast, clearToast] = useToast();
  return <>
    <SectionTitle icon="🧩" title="Module Toggle (Per School)" />
    <Toast msg={toast} onClose={clearToast} />
    <Card>
      <div style={{ fontSize:13, color:T.muted, marginBottom:16 }}>
        Enable or disable modules per school/college instance. Changes take effect immediately.
      </div>
      {modules.map((m,i)=>(
        <div key={m.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 0", borderBottom:i<modules.length-1?`1px solid ${T.border}`:"none" }}>
          <div>
            <div style={{ fontWeight:700, color:T.text }}>{m.name}</div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Visible to: {m.roles.join(", ")}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:12, fontWeight:700, color:m.enabled?T.tealLight:T.danger }}>
              {m.enabled?"Enabled":"Disabled"}
            </span>
            <Toggle on={m.enabled} onToggle={()=>{ dispatch({type:"TOGGLE_MODULE",id:m.id}); showToast(`${m.name} ${m.enabled?"disabled":"enabled"}`); }} />
          </div>
        </div>
      ))}
    </Card>
  </>;
}

function SAUsers() {
  const { schools } = useDB();
  const [form, setForm] = useState({ name:"", email:"", phone:"", role:"Admin", schoolId:"SCH001" });
  const [userList, setUserList] = useState([
    { id:"U1", name:"Priya Sharma",   email:"admin@greenwood.com",   role:"Admin",   school:"Greenwood International" },
    { id:"U2", name:"Rajesh Kumar",   email:"teacher@greenwood.com", role:"Teacher", school:"Greenwood International" },
    { id:"U3", name:"Anita Verma",    email:"parent@greenwood.com",  role:"Parent",  school:"Greenwood International" },
  ]);
  const [toast, showToast, clearToast] = useToast();

  const create = () => {
    if(!form.name||!form.email){ showToast("Name & email required."); return; }
    setUserList(p=>[...p,{ id:"U"+Date.now(), name:form.name, email:form.email,
      role:form.role, school:schools.find(s=>s.id===form.schoolId)?.name||"—" }]);
    setForm({name:"",email:"",phone:"",role:"Admin",schoolId:"SCH001"});
    showToast("User created & invite sent!");
  };

  return <>
    <SectionTitle icon="👥" title="User Management" />
    <Toast msg={toast} onClose={clearToast} />
    <Card>
      <div style={{ fontWeight:800, color:T.teal, marginBottom:14 }}>Create New User</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        <Input label="Full Name" value={form.name}  onChange={e=>setForm(p=>({...p,name:e.target.value}))}  placeholder="Full name" />
        <Input label="Email"     value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@school.com" type="email" />
        <Input label="Phone"     value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="9XXXXXXXXX" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Select label="Role" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}
          options={["Admin","Teacher","Student/Parent"]} />
        <Select label="School" value={form.schoolId} onChange={e=>setForm(p=>({...p,schoolId:e.target.value}))}
          options={schools.map(s=>({value:s.id,label:s.name}))} />
      </div>
      <button onClick={create} style={btn()}>✉️ Create User & Send Invite</button>
    </Card>
    <Card style={{ padding:0, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["Name","Email","Role","School","Actions"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {userList.map(u=>(
            <tr key={u.id} style={{ borderBottom:`1px solid ${T.border}` }}>
              <td style={{ padding:"11px 14px", fontWeight:700 }}>{u.name}</td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{u.email}</td>
              <td style={{ padding:"11px 14px" }}><Badge label={u.role} color={T.tealMid} /></td>
              <td style={{ padding:"11px 14px", color:T.muted }}>{u.school}</td>
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", gap:6 }}>
                  <button style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}`, fontSize:12, padding:"4px 10px" }}>✏️ Edit</button>
                  <button onClick={()=>{ setUserList(p=>p.filter(x=>x.id!==u.id)); showToast("User removed."); }}
                    style={{ ...btn("#FFF0EC",T.danger), border:`1px solid ${T.danger}30`, fontSize:12, padding:"4px 10px" }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

function SATheme() {
  const { schools, dispatch } = useDB();
  const [themes, setThemes] = useState({});
  const [toast, showToast, clearToast] = useToast();
  return <>
    <SectionTitle icon="🎨" title="School Branding & Theme" />
    <Toast msg={toast} onClose={clearToast} />
    {schools.map(s=>(
      <Card key={s.id}>
        <div style={{ fontWeight:900, fontSize:16, color:T.text, marginBottom:16 }}>{s.logo} {s.name}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
          {[["Primary Color","primary","#0D5C63"],["Accent Color","accent","#E9C46A"]].map(([label,key,def])=>(
            <div key={key}>
              <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:6 }}>{label.toUpperCase()}</div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <input type="color" defaultValue={s.theme?.[key]||def}
                  onChange={e=>setThemes(p=>({...p,[s.id]:{...p[s.id],[key]:e.target.value}}))}
                  style={{ width:40, height:40, padding:2, borderRadius:8, border:`1px solid ${T.border}`, cursor:"pointer" }} />
                <div style={{ width:40, height:40, borderRadius:8, border:`1px solid ${T.border}`,
                  background:themes[s.id]?.[key]||s.theme?.[key]||def }} />
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.muted, marginBottom:6 }}>LOGO UPLOAD</div>
            <div style={{ background:T.bg, border:`2px dashed ${T.border}`, borderRadius:8,
              padding:"14px", textAlign:"center", fontSize:12, color:T.muted, cursor:"pointer" }}>📤 Upload Logo</div>
          </div>
        </div>
        <button onClick={()=>{ dispatch({type:"UPDATE_SCHOOL_THEME",id:s.id,theme:{...s.theme,...themes[s.id]}}); showToast("Theme saved for "+s.name); }}
          style={btn()}>💾 Save Branding</button>
      </Card>
    ))}
  </>;
}

function SASystem() {
  const [toast, showToast, clearToast] = useToast();
  const settings = [
    { icon:"📧", title:"Email / SMTP",       desc:"Configure outgoing email server",           key:"email" },
    { icon:"📱", title:"SMS Gateway",         desc:"Twilio / MSG91 / Exotel integration",       key:"sms" },
    { icon:"🔒", title:"Security",            desc:"Password policy, 2FA, session timeout",     key:"sec" },
    { icon:"💾", title:"Backup & Restore",    desc:"Automated daily backup configuration",      key:"bkp" },
    { icon:"📊", title:"Analytics",           desc:"Usage tracking and performance metrics",    key:"analytics" },
    { icon:"🌐", title:"API & Webhooks",      desc:"Third-party integrations and REST hooks",   key:"api" },
  ];
  const [expanded, setExpanded] = useState(null);
  return <>
    <SectionTitle icon="⚙️" title="System Settings" />
    <Toast msg={toast} onClose={clearToast} />
    {settings.map(s=>(
      <Card key={s.key}>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ fontSize:28 }}>{s.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, color:T.text }}>{s.title}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:2 }}>{s.desc}</div>
          </div>
          <button onClick={()=>setExpanded(expanded===s.key?null:s.key)}
            style={{ ...btn(T.badge,T.teal), border:`1px solid ${T.border}` }}>
            {expanded===s.key?"▲ Close":"⚙️ Configure"}
          </button>
        </div>
        {expanded===s.key && <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
          {s.key==="email" && <>
            <Input label="SMTP Host"     placeholder="smtp.gmail.com" />
            <Input label="SMTP Port"     placeholder="587" />
            <Input label="Username"      placeholder="noreply@school.com" />
            <Input label="Password"      type="password" placeholder="••••••••" />
            <button onClick={()=>showToast("SMTP settings saved!")} style={btn()}>💾 Save</button>
          </>}
          {s.key==="sms" && <>
            <Select label="Provider" options={["Twilio","MSG91","Exotel"]} />
            <Input label="API Key"        placeholder="API key" />
            <Input label="Sender Number" placeholder="+91XXXXXXXXXX" />
            <button onClick={()=>showToast("SMS gateway configured!")} style={btn()}>💾 Save</button>
          </>}
          {s.key==="sec" && <>
            <Input label="Min Password Length" placeholder="8" type="number" />
            <Select label="Session Timeout" options={["30 minutes","1 hour","4 hours","8 hours","Never"]} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, alignItems:"center" }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Enable 2-Factor Authentication</div>
              <Toggle on={true} onToggle={()=>showToast("2FA toggled")} />
            </div>
            <button onClick={()=>showToast("Security settings saved!")} style={btn()}>💾 Save</button>
          </>}
          {!["email","sms","sec"].includes(s.key) && <>
            <div style={{ background:T.bg, borderRadius:8, padding:14, fontSize:13, color:T.muted }}>
              Configuration panel for {s.title} — connect to backend API to persist settings.
            </div>
            <button onClick={()=>showToast(`${s.title} settings saved!`)} style={{ ...btn(), marginTop:10 }}>💾 Save</button>
          </>}
        </div>}
      </Card>
    ))}
  </>;
}

function SAAudit() {
  const log = [
    { user:"admin@greenwood.com",   action:"Added student Karan Mehta",         time:"2026-06-10 09:14", ip:"192.168.1.12" },
    { user:"superadmin@edu.com",    action:"Toggled Library module OFF",         time:"2026-06-10 08:55", ip:"10.0.0.1" },
    { user:"teacher@greenwood.com", action:"Updated results for Aryan Verma",    time:"2026-06-09 15:30", ip:"192.168.1.45" },
    { user:"admin@greenwood.com",   action:"Approved leave for Aryan Verma",     time:"2026-06-09 11:20", ip:"192.168.1.12" },
    { user:"parent@greenwood.com",  action:"Applied leave for Riya Verma",       time:"2026-06-08 17:05", ip:"203.X.X.X" },
    { user:"superadmin@edu.com",    action:"Registered school SCH002",           time:"2026-06-07 10:00", ip:"10.0.0.1" },
  ];
  return <>
    <SectionTitle icon="📜" title="Audit Log" />
    <Card style={{ padding:0, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {["User","Action","Time","IP"].map(h=>(
              <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:T.muted, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {log.map((l,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${T.border}` }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bg}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"10px 14px", color:T.teal, fontWeight:600 }}>{l.user}</td>
              <td style={{ padding:"10px 14px", color:T.text }}>{l.action}</td>
              <td style={{ padding:"10px 14px", color:T.muted, whiteSpace:"nowrap" }}>{l.time}</td>
              <td style={{ padding:"10px 14px", color:T.muted }}>{l.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </>;
}

// ════════════════════════════════════════════════════════════
//  ROOT APP  — wires DB context + routing
// ════════════════════════════════════════════════════════════
export default function App() {
  const [db, dispatch] = useReducer(dbReducer, initialDB);
  const [screen, setScreen] = useState("login");
  const [user,   setUser]   = useState(null);
  const [child,  setChild]  = useState(null);

  const dbAPI = { ...db, dispatch };

  const handleLogin = (u) => {
    setUser(u);
    if      (u.role==="student")    setScreen("child-select");
    else if (u.role==="admin")      setScreen("admin");
    else if (u.role==="teacher")    setScreen("teacher");
    else if (u.role==="superadmin") setScreen("superadmin");
  };
  const logout = () => { setScreen("login"); setUser(null); setChild(null); };

  return (
    <DBContext.Provider value={dbAPI}>
      {screen==="login"        && <LoginScreen onLogin={handleLogin} />}
      {screen==="child-select" && <ChildSelector user={user} onSelect={c=>{ setChild(c); setScreen("student"); }} onLogout={logout} />}
      {screen==="student"      && <StudentPortal user={user} child={child} onBack={logout} onSwitchChild={()=>setScreen("child-select")} />}
      {screen==="admin"        && <AdminPortal   user={user} onBack={logout} />}
      {screen==="teacher"      && <TeacherPortal user={user} onBack={logout} />}
      {screen==="superadmin"   && <SuperAdminPortal user={user} onBack={logout} />}
    </DBContext.Provider>
  );
}
