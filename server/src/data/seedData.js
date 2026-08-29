const initialCollegeDocuments = [
  {
    id: "doc-adm-01",
    title: "Admissions & Eligibility Guide 2026",
    category: "Admissions",
    department: "Admissions Office",
    description: "Official admission guidelines, eligibility criteria for B.Tech, M.Tech, MBA, MCA, application deadlines, and quota details.",
    content: `
# ADMISSIONS AND ELIGIBILITY CRITERIA 2026-2027

## 1. Undergraduate Programs (B.Tech)
- **Eligibility:** Candidates must have passed 10+2 (or equivalent) with a minimum of 60% aggregate marks in Physics, Mathematics, and Chemistry/Computer Science.
- **Accepted Entrance Exams:** JEE Main, State CET (Cutoff: Rank within top 15,000 for CSE/IT, top 35,000 for ECE/EE, top 60,000 for Mechanical/Civil), or Institutional Entrance Test (AIT-CET).
- **Application Fee:** INR 1,500 for general category; INR 800 for SC/ST candidates.
- **Important Deadlines:**
  - Online Application Start: April 10, 2026
  - Last Date to Submit: June 15, 2026
  - Counseling & Seat Allotment Round 1: July 5, 2026
  - Orientation Day: August 1, 2026

## 2. Postgraduate Programs (M.Tech, MBA, MCA)
- **M.Tech:** Valid GATE score or Institutional PG Test. Minimum 55% in B.Tech/B.E. in relevant discipline.
- **MBA:** CAT / MAT / CMAT / XAT percentile > 65% followed by Group Discussion (GD) and Personal Interview (PI).
- **MCA:** Bachelor's degree with Mathematics at 10+2 level or graduation level with minimum 50% marks.

## 3. Lateral Entry (B.Tech 2nd Year)
- Diploma holders or B.Sc. degree graduates with minimum 55% marks are eligible for lateral entry admission to the 3rd semester of B.Tech.

## 4. International / NRI Admissions
- 15% supernumerary seats are reserved for NRI / Foreign National candidates. SAT scores (Minimum 1100) or 10+2 equivalent with Physics, Chemistry, and Math.
- Contact: admissions@campus.edu | Helpline: +91 (080) 4567-8901 / Room 102, Admin Block.
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-fee-02",
    title: "Fee Structure & Scholarship Schemes 2026",
    category: "Fees",
    department: "Accounts & Finance",
    description: "Tuition fees per semester, hostel and transport charges, payment schedule, installments, and merit-cum-means scholarships.",
    content: `
# TUITION FEES AND SCHOLARSHIPS 2026

## 1. Annual Tuition Fee Schedule
- **B.Tech (CSE / AI & ML / Data Science):** INR 1,45,000 per annum (Paid INR 72,500 per semester).
- **B.Tech (ECE / EEE / Mechanical / Civil):** INR 1,20,000 per annum (Paid INR 60,000 per semester).
- **M.Tech (All Specializations):** INR 90,000 per annum.
- **MBA:** INR 1,60,000 per annum.
- **MCA:** INR 1,10,000 per annum.
- **One-time Refundable Security Deposit:** INR 10,000 (Refundable upon course completion).
- **Exam & Library Fee:** INR 5,000 per semester.

## 2. Payment Modes & Deadlines
- Fees must be paid online via the Campus ERP portal (Credit Card / Debit Card / Net Banking / UPI / NEFT).
- Odd Semester Fee Due Date: August 10
- Even Semester Fee Due Date: January 15
- Late fine: INR 100 per day up to 15 days, after which student registration will be temporarily suspended.

## 3. Scholarship Schemes
- **Merit Scholarship:**
  - 100% Tuition Fee Waiver for top 500 JEE Main ranks.
  - 50% Tuition Fee Waiver for rank 501 - 2500.
  - 25% Tuition Fee Waiver for students scoring > 9.2 CGPA in college semesters.
- **Sports Scholarship:** Up to 75% fee concession for National and State level sports players.
- **Sibling Concession:** 10% fee reduction for younger sibling studying simultaneously in the college.
- **Financial Aid / Need-based:** Annual family income < INR 2.5 LPA qualifies for full or partial assistance under the College Trust Fund.
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-acad-03",
    title: "Academic Regulations & Examination Policies",
    category: "Academics",
    department: "Academic Office & Exam Cell",
    description: "Grading system, CGPA calculation, 75% attendance policy, backlog rules, re-evaluation, and makeup examinations.",
    content: `
# ACADEMIC REGULATIONS AND EXAM POLICIES

## 1. Attendance Policy (Mandatory 75% Rule)
- A student must maintain a minimum of **75% aggregate attendance** in lectures, tutorials, and laboratories for each course to be eligible to write the End-Semester Examination.
- Medical relaxation: Up to 10% relaxation (i.e., minimum 65%) can be granted by the Dean of Academic Affairs upon submission of valid medical certificates and hospital discharge summary within 5 working days of resumption.
- Attendance below 65% leads to course debarment (Grade 'F' for non-attendance), requiring the student to re-register for the course during the summer semester.

## 2. Grading Scale (10-Point Scale)
- **O (Outstanding):** 90-100% | Grade Point: 10
- **A+ (Excellent):** 80-89% | Grade Point: 9
- **A (Very Good):** 70-79% | Grade Point: 8
- **B+ (Good):** 60-69% | Grade Point: 7
- **B (Above Average):** 50-59% | Grade Point: 6
- **C (Pass):** 40-49% | Grade Point: 5
- **F (Fail):** Below 40% | Grade Point: 0

## 3. Backlog & Supplementary Exams
- Supplementary exams are conducted within 30 days after the declaration of regular semester results.
- Maximum allowable backlogs to get promoted to 3rd year: No more than 4 active backlogs from 1st year.
- Promotion to 4th year requires clearing all 1st-year subjects.

## 4. Re-evaluation & Answer Script Photocopy
- Students can apply for answer script re-evaluation within 7 days of result publication via the ERP.
- Fee for Re-evaluation: INR 750 per subject.
- Fee for Photocopy: INR 300 per subject.
- Contact: Controller of Examinations (COE), Ground Floor, Exam Cell Block.
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-hostel-04",
    title: "Hostel, Mess & Campus Living Regulations",
    category: "Hostel & Campus",
    department: "Student Affairs & Chief Warden Office",
    description: "Hostel room types, mess timings, menu options, gate curfew timings, night leave pass procedure, laundry, and anti-ragging policies.",
    content: `
# HOSTEL AND CAMPUS RESIDENCE MANUAL

## 1. Hostel Accommodation & Charges
- **Boys Hostel:** Blocks A, B, and C (Capacity: 1200 students).
- **Girls Hostel:** Blocks D and E (Capacity: 900 students).
- **Room Types & Rates (per year including food):**
  - Triple Sharing Non-AC: INR 85,000
  - Double Sharing Non-AC: INR 98,000
  - Double Sharing AC: INR 1,20,000
  - Single Room AC (Final year & PG students only): INR 1,45,000

## 2. Mess Timings & Food Regulations
- **Breakfast:** 07:30 AM - 09:15 AM
- **Lunch:** 12:00 PM - 02:00 PM
- **Evening Snacks & Tea:** 04:45 PM - 06:00 PM
- **Dinner:** 07:30 PM - 09:30 PM
- Vegetarian and Non-Vegetarian (3 days a week: Wed, Fri, Sun) options are served. Pure Jain food is prepared in a dedicated cooking counter.

## 3. Gate Curfew & Night Pass Procedure
- **Hostel Entry Curfew:** 09:30 PM sharp on weekdays; 10:00 PM on Saturdays and Sundays.
- **Outing Passes:** Day outing till 08:30 PM requires digital checkout via the Campus Resident App.
- **Night Out / Home Leave:** Must be applied 24 hours in advance on ERP and approved by Parent SMS/Email verification followed by Warden signoff.

## 4. Zero Tolerance Ragging Policy
- The institution enforces strict Anti-Ragging regulations as per UGC norms. Any student caught ragging will face immediate suspension, rustication, and filing of an FIR with local police.
- 24x7 Anti-Ragging Helpline: 1800-180-5522 | Warden Control Desk: +91 (080) 4567-8940.
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-place-05",
    title: "Training & Placement Cell (T&P) Handbook",
    category: "Placements",
    department: "Corporate Relations & Placement Cell",
    description: "Placement statistics, top recruiters, eligibility criteria (CGPA > 6.5 / 7.0), internships, dream company policy, and resume verification.",
    content: `
# TRAINING AND PLACEMENT CELL (T&P) HANDBOOK

## 1. Placement Highlights & Statistics (Previous Academic Year)
- **Highest Package Offered:** INR 44.5 LPA (International / Tier 1 Product)
- **Average Package (CSE / IT):** INR 11.2 LPA
- **Overall Institutional Average:** INR 8.6 LPA
- **Placement Percentage:** 94.8% eligible students placed.
- **Total Companies Visited:** 180+ companies including Microsoft, Amazon, Google, Cisco, TCS Digital, Infosys, Deloitte, Cognizant, Accenture, Goldman Sachs.

## 2. Placement Eligibility Criteria
- Minimum CGPA required: 6.5 CGPA overall with no active standing backlogs at the time of recruitment.
- For Tier 1 Dream Companies (Package > INR 12 LPA): Minimum 7.5 CGPA with maximum 1 historical backlog cleared.
- Attendance requirement: Minimum 80% attendance in mandatory Soft Skills, Aptitude, and DSA training sessions conducted by T&P.

## 3. "Dream" and "Super Dream" Job Policy
- A student who secures a Regular offer (INR 4 - 8 LPA) remains eligible to sit for Dream offers (INR 8 - 15 LPA) and Super Dream offers (> INR 15 LPA).
- Once a student secures a Super Dream offer (> INR 15 LPA), they are out of the placement drive to give opportunities to fellow peers.

## 4. Summer Internships
- 6th semester students must undergo a compulsory 8-to-12-week summer industry internship.
- Average internship stipend ranges from INR 25,000 to INR 85,000 per month.
- Placement Cell Office: 3rd Floor, Technology Tower | Email: placements@campus.edu.
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-lib-06",
    title: "Library, Sports, Innovation Labs & Student Clubs",
    category: "Campus Life",
    department: "Dean Student Welfare",
    description: "Central library book borrowing, digital subscriptions (IEEE, Springer), sports facilities, gymnasium, technical and cultural clubs.",
    content: `
# CAMPUS FACILITIES, LIBRARY AND STUDENT CLUBS

## 1. Central Library & Digital Resources
- **Timings:** Open from 08:00 AM to 11:00 PM on all working days; 24x7 open during semester exam months.
- **Book Issue Limit:**
  - UG Students: 4 books for 14 days (renewable once online).
  - PG / Research Scholars: 6 books for 30 days.
- **Digital Library:** Free campus-wide access to IEEE Xplore, ScienceDirect, ACM Digital Library, SpringerLink, and NPTEL video archives.
- **Overdue Fines:** INR 2 per book per day.

## 2. Sports Complex & Gymnasium
- Modern indoor sports arena featuring 4 Badminton courts, Table Tennis tables, Squash court, and Olympic-standard Wooden Basketball court.
- Outdoor facilities: Full-size Football and Cricket grounds with floodlights, 400m synthetic running track, and Tennis courts.
- Gymnasium timings: 06:00 AM - 09:00 AM (Morning) & 05:00 PM - 09:00 PM (Evening). Instructor available.

## 3. Student Clubs & Innovation Cells
- **Technical Clubs:**
  - Google Developer Student Club (GDSC)
  - Robotics & AI Automation Society (RAAS)
  - CodeWarriors Competitive Programming Club
  - CyberSec & Ethical Hacking Guild
- **Cultural & Arts Clubs:**
  - 'Dhwani' Music Society
  - 'Natya' Drama & Theatricals
  - 'ShutterBug' Photography Club
  - Literary & Debating Society (LitSoc)
- **Annual Flagship Events:**
  - *TechNova:* Annual Inter-College Technical Symposium (October).
  - *Aura:* 3-Day Annual National Cultural Fest (February/March).
- Faculty Coordinator: Dean Student Welfare (Room 205, Main Block).
    `,
    uploadedBy: "Admin",
    createdAt: new Date().toISOString()
  }
];

module.exports = {
  initialCollegeDocuments
};
