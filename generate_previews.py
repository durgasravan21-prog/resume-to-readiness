import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1200
NAVY = (3, 36, 72)
NAVY_CONTAINER = (31, 58, 95)
CREAM = (252, 249, 244)
WHITE = (255, 255, 255)
SAND_LOW = (246, 243, 238)
SAND_HIGH = (235, 232, 227)
BORDER = (229, 226, 221)
TEXT_DARK = (28, 28, 25)
TEXT_MUTED = (67, 71, 78)
TERRACOTTA = (156, 67, 30)
ORANGE_BG = (253, 141, 97)
GREEN_BG = (232, 240, 234)
GREEN_TXT = (79, 122, 90)
WARN_BG = (247, 238, 219)
WARN_TXT = (183, 131, 47)
ERR_BG = (246, 228, 224)
ERR_TXT = (166, 72, 58)

def get_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except:
        return ImageFont.load_default()

def draw_header_sidebar(d, active_nav="Overview"):
    # Header
    d.rectangle([0, 0, W, 64], fill=WHITE, outline=BORDER)
    d.rectangle([24, 16, 56, 48], fill=NAVY_CONTAINER)
    d.text((36, 22), "R", fill=WHITE, font=get_font(20))
    d.text((68, 20), "Readiness", fill=NAVY, font=get_font(22))
    d.text((220, 22), "PLACEMENT CELL • AY 2024-25", fill=TEXT_MUTED, font=get_font(13))
    d.text((W - 280, 22), "Prof. Ravi Sharma  (TPC Incharge)", fill=TEXT_DARK, font=get_font(14))
    
    # Sidebar
    d.rectangle([0, 64, 240, H], fill=SAND_LOW, outline=BORDER)
    d.text((24, 88), "INSTITUTIONAL CONSOLE", fill=TEXT_MUTED, font=get_font(11))
    navs = ["Overview", "Students", "Roles", "Reports", "Settings"]
    y = 120
    for nav in navs:
        if nav == active_nav:
            d.rectangle([16, y, 224, y+40], fill=NAVY)
            d.text((36, y+10), nav, fill=WHITE, font=get_font(15))
        else:
            d.text((36, y+10), nav, fill=TEXT_MUTED, font=get_font(15))
        y += 50
    d.rectangle([16, H-80, 224, H-24], fill=WHITE, outline=BORDER)
    d.text((28, H-68), "System Status: Sync Active v2.4", fill=TEXT_DARK, font=get_font(12))

# ── 1. Placement Coordinator Dashboard ────────────────────────────────────────
img1 = Image.new("RGB", (W, H), CREAM)
d1 = ImageDraw.Draw(img1)
draw_header_sidebar(d1, "Overview")

# Main content
x0 = 280
d1.text((x0, 90), "Final year, Computer Science", fill=NAVY, font=get_font(28))
d1.text((x0, 130), "Evaluation ledger and competency diagnosis across graduating engineering candidates", fill=TEXT_MUTED, font=get_font(14))
d1.text((W - 320, 100), "● Batch 2021–2025 • Active Evaluation", fill=TERRACOTTA, font=get_font(13))

# Metric cards
metrics = [
    ("Cohort Census", "1,248", "Resumes analysed", None),
    ("Benchmark Met", "312", "Ready for target role (25%)", (GREEN_BG, GREEN_TXT, "Strong evidence")),
    ("Intervention Required", "587", "Need stronger proof (47%)", (WARN_BG, WARN_TXT, "Needs stronger proof")),
    ("Under-Substantiated", "349", "Early stage (28%)", (ERR_BG, ERR_TXT, "Missing proofs"))
]
card_w = (W - x0 - 80) // 4
for i, (label, val, sub, badge) in enumerate(metrics):
    cx = x0 + i * (card_w + 16)
    d1.rectangle([cx, 170, cx + card_w, 290], fill=WHITE, outline=BORDER)
    d1.text((cx + 20, 185), label.upper(), fill=TEXT_MUTED, font=get_font(11))
    if badge:
        d1.rectangle([cx + card_w - 140, 182, cx + card_w - 20, 204], fill=badge[0])
        d1.text((cx + card_w - 130, 186), badge[2], fill=badge[1], font=get_font(10))
    d1.text((cx + 20, 215), val, fill=NAVY, font=get_font(42))
    d1.text((cx + 20, 265), sub, fill=TEXT_MUTED, font=get_font(12))

# Table & Gap breakdown
tbl_w = int((W - x0 - 60) * 0.65)
d1.rectangle([x0, 310, x0 + tbl_w, H - 40], fill=WHITE, outline=BORDER)
d1.text((x0 + 20, 330), "Candidate Roster (1,248 candidates)", fill=TEXT_DARK, font=get_font(18))
d1.rectangle([x0 + 20, 365, x0 + tbl_w - 20, 400], fill=SAND_LOW)
d1.text((x0 + 30, 375), "Student                               Target Role                     Match                   Top Gap", fill=TEXT_MUTED, font=get_font(12))

rows = [
    ("Rahul Verma", "2021BCS0142", "Data Analyst", "Needs stronger proof", "Dashboard & BI tools", WARN_BG, WARN_TXT),
    ("Ananya Reddy", "2021BCS0089", "Junior Frontend Dev", "Strong evidence", "React state management", GREEN_BG, GREEN_TXT),
    ("Devansh Mathur", "2021BCS0312", "Backend Engineer", "Needs stronger proof", "Distributed tracing", WARN_BG, WARN_TXT),
    ("Meera Venkatesh", "2021BCS0044", "Data Scientist", "Strong evidence", "Model deployment latency", GREEN_BG, GREEN_TXT),
    ("Rohan Kulkarni", "2021BCS0219", "Systems Engineer", "Early stage", "Linux kernel & memory", ERR_BG, ERR_TXT),
    ("Priya Nair", "2021BCS0188", "Product Analyst", "Strong evidence", "A/B testing statistical rigor", GREEN_BG, GREEN_TXT),
    ("Siddharth Sen", "2021BCS0401", "Full Stack Engineer", "Needs stronger proof", "CI/CD pipeline test gates", WARN_BG, WARN_TXT),
]
for idx, (name, roll, role, match, gap, bg, txt) in enumerate(rows):
    ry = 410 + idx * 52
    d1.rectangle([x0 + 20, ry, x0 + tbl_w - 20, ry + 46], fill=WHITE if idx % 2 == 0 else SAND_LOW)
    d1.text((x0 + 30, ry + 8), name, fill=TEXT_DARK, font=get_font(14))
    d1.text((x0 + 30, ry + 26), roll, fill=TEXT_MUTED, font=get_font(11))
    d1.text((x0 + 220, ry + 14), role, fill=TEXT_DARK, font=get_font(13))
    d1.rectangle([x0 + 410, ry + 12, x0 + 550, ry + 34], fill=bg)
    d1.text((x0 + 418, ry + 15), match, fill=txt, font=get_font(11))
    d1.text((x0 + 570, ry + 14), gap, fill=TEXT_MUTED, font=get_font(12))

# Common Gaps panel
gap_x = x0 + tbl_w + 20
gap_w = W - gap_x - 40
d1.rectangle([gap_x, 310, gap_x + gap_w, H - 40], fill=WHITE, outline=BORDER)
d1.text((gap_x + 20, 330), "Most Common Gaps", fill=NAVY, font=get_font(18))
d1.text((gap_x + 20, 355), "Identified from 1,248 resumes", fill=TEXT_MUTED, font=get_font(12))

gaps = [
    ("1. System design basics", "38.6%", 0.386),
    ("2. SQL joins & query tuning", "33.2%", 0.332),
    ("3. Testing & test coverage", "31.1%", 0.311),
    ("4. Dashboard & BI storytelling", "25.0%", 0.250),
    ("5. Cloud deployment & Docker", "21.9%", 0.219),
    ("6. Distributed tracing & logs", "15.8%", 0.158)
]
for idx, (title, pct, ratio) in enumerate(gaps):
    gy = 390 + idx * 56
    d1.text((gap_x + 20, gy), title, fill=TEXT_DARK, font=get_font(13))
    d1.text((gap_x + gap_w - 60, gy), pct, fill=TEXT_MUTED, font=get_font(12))
    d1.rectangle([gap_x + 20, gy + 22, gap_x + gap_w - 20, gy + 30], fill=SAND_HIGH)
    d1.rectangle([gap_x + 20, gy + 22, gap_x + 20 + int((gap_w - 40) * ratio), gy + 30], fill=NAVY_CONTAINER)

d1.rectangle([gap_x + 20, H - 110, gap_x + gap_w - 20, H - 65], fill=NAVY)
d1.text((gap_x + 60, H - 94), "Schedule Cohort Workshop", fill=WHITE, font=get_font(14))

os.makedirs("placement_coordinator_dashboard", exist_ok=True)
img1.save("placement_coordinator_dashboard/screen.png")
print("Saved placement_coordinator_dashboard/screen.png")

# ── 2. Student Coaching (Rahul Verma) ────────────────────────────────────────
img2 = Image.new("RGB", (W, H), CREAM)
d2 = ImageDraw.Draw(img2)
draw_header_sidebar(d2, "Students")

# Header section
d2.text((x0, 85), "Students / Rahul Verma (2021BCS0142)", fill=TEXT_MUTED, font=get_font(12))
d2.text((x0, 110), "Rahul Verma", fill=NAVY, font=get_font(32))
d2.rectangle([x0 + 210, 118, x0 + 370, 144], fill=WARN_BG)
d2.text((x0 + 220, 122), "NEEDS STRONGER PROOF", fill=WARN_TXT, font=get_font(11))
d2.text((x0, 155), "B.Tech Computer Science • Class of 2025 • Target Role: Data Analyst", fill=TEXT_MUTED, font=get_font(14))

# Action banner
banner_w = int((W - x0 - 60) * 0.65)
d2.rectangle([x0, 195, x0 + banner_w, 295], fill=SAND_LOW, outline=BORDER)
d2.rectangle([x0, 195, x0 + 6, 295], fill=TERRACOTTA)
d2.text((x0 + 24, 210), "Suggested coordinator action", fill=NAVY, font=get_font(18))
d2.text((x0 + 24, 240), "Rahul has solid SQL querying and Python data wrangling, but lacks verifiable production dashboard work.\nA short session on presenting analysis and building an interactive dashboard case study would elevate him to High Match.", fill=TEXT_DARK, font=get_font(13))
d2.text((x0 + 24, 275), "Assign dashboard practice assignment →", fill=TERRACOTTA, font=get_font(13))

# Audit section
d2.text((x0, 320), "Competency & Evidence Audit (5 criteria indexed)", fill=NAVY, font=get_font(20))
d2.text((x0, 355), "STRONG EVIDENCE (2 VERIFIED)", fill=NAVY, font=get_font(12))

c_w = (banner_w - 20) // 2
# Verified 1
d2.rectangle([x0, 380, x0 + c_w, 490], fill=WHITE, outline=BORDER)
d2.text((x0 + 16, 395), "SQL Querying & Window Joins  ✓", fill=TEXT_DARK, font=get_font(15))
d2.rectangle([x0 + 16, 425, x0 + c_w - 16, 470], fill=SAND_LOW)
d2.text((x0 + 24, 435), "“Optimized complex PostgreSQL queries with window\nfunctions reducing runtime by 35%.”", fill=TEXT_MUTED, font=get_font(11))

# Verified 2
d2.rectangle([x0 + c_w + 20, 380, x0 + banner_w, 490], fill=WHITE, outline=BORDER)
d2.text((x0 + c_w + 36, 395), "Python for Data Manipulation  ✓", fill=TEXT_DARK, font=get_font(15))
d2.rectangle([x0 + c_w + 36, 425, x0 + banner_w - 16, 470], fill=SAND_LOW)
d2.text((x0 + c_w + 44, 435), "“Built ETL scripts scraping e-commerce catalogs\nand cleaned 50k rows in Pandas.”", fill=TEXT_MUTED, font=get_font(11))

d2.text((x0, 520), "NEEDS STRONGER PROOF (2 UNVERIFIED)", fill=TERRACOTTA, font=get_font(12))
# Unverified 1
d2.rectangle([x0, 545, x0 + c_w, 655], fill=WHITE, outline=BORDER)
d2.text((x0 + 16, 560), "BI & Dashboards  ?", fill=TEXT_DARK, font=get_font(15))
d2.rectangle([x0 + 16, 590, x0 + c_w - 16, 635], fill=SAND_LOW)
d2.text((x0 + 24, 600), "Mentions “Familiar with Tableau” without supporting\nproject metric or live portfolio link.", fill=TEXT_MUTED, font=get_font(11))

# Unverified 2
d2.rectangle([x0 + c_w + 20, 545, x0 + banner_w, 655], fill=WHITE, outline=BORDER)
d2.text((x0 + c_w + 36, 560), "Statistical Hypothesis Testing  ?", fill=TEXT_DARK, font=get_font(15))
d2.rectangle([x0 + c_w + 36, 590, x0 + banner_w - 16, 635], fill=SAND_LOW)
d2.text((x0 + c_w + 44, 600), "“Explored A/B test methodologies in coursework.”\nLacks applied experimental datasets.", fill=TEXT_MUTED, font=get_font(11))

# Critical Absence
d2.text((x0, 685), "CRITICAL ABSENCE (1 MISSING)", fill=ERR_TXT, font=get_font(12))
d2.rectangle([x0, 710, x0 + banner_w, 810], fill=WHITE, outline=BORDER)
d2.text((x0 + 16, 725), "Executive Storytelling & Presentation Decks  ✕", fill=TEXT_DARK, font=get_font(15))
d2.rectangle([x0 + 16, 755, x0 + banner_w - 16, 795], fill=ERR_BG)
d2.text((x0 + 24, 765), "No slide deck, executive memo, or non-technical business case study found in application packet.", fill=ERR_TXT, font=get_font(12))

# Right Column: Coaching Notes & Fit Index
rc_x = x0 + banner_w + 20
rc_w = W - rc_x - 40

# Coaching Notes
d2.rectangle([rc_x, 195, rc_x + rc_w, 540], fill=WHITE, outline=BORDER)
d2.text((rc_x + 20, 215), "Coaching Notes", fill=NAVY, font=get_font(18))
d2.rectangle([rc_x + rc_w - 110, 212, rc_x + rc_w - 20, 236], fill=SAND_HIGH)
d2.text((rc_x + rc_w - 100, 217), "Private Log", fill=TEXT_DARK, font=get_font(11))

# Note 1
d2.rectangle([rc_x + 20, 255, rc_x + rc_w - 20, 360], fill=SAND_LOW)
d2.text((rc_x + 30, 265), "Prof. Ravi Sharma  •  14 Sept, 11:30 AM", fill=NAVY, font=get_font(12))
d2.text((rc_x + 30, 290), "“Spoke to Rahul after mock interview. His SQL\nfundamentals are solid, but he struggles to\narticulate business impact. Advised him to\nrecord a 3-min walkthrough.”", fill=TEXT_DARK, font=get_font(11))

# Note 2
d2.rectangle([rc_x + 20, 375, rc_x + rc_w - 20, 460], fill=SAND_LOW)
d2.text((rc_x + 30, 385), "Placement Desk  •  12 Sept, 04:15 PM", fill=NAVY, font=get_font(12))
d2.text((rc_x + 30, 410), "“Initial resume parsed. Flagged for Business\nIntelligence workshop series.”", fill=TEXT_DARK, font=get_font(11))

# Fit Index
d2.rectangle([rc_x, 560, rc_x + rc_w, 750], fill=SAND_HIGH, outline=BORDER)
d2.text((rc_x + 20, 580), "TARGET ROLE FIT INDEX", fill=TEXT_MUTED, font=get_font(11))
d2.text((rc_x + 20, 610), "68", fill=NAVY, font=get_font(48))
d2.text((rc_x + 85, 630), "/ 100", fill=TEXT_MUTED, font=get_font(18))
d2.text((rc_x + rc_w - 120, 630), "Moderate Fit", fill=TERRACOTTA, font=get_font(14))
d2.rectangle([rc_x + 20, 675, rc_x + rc_w - 20, 687], fill=BORDER)
d2.rectangle([rc_x + 20, 675, rc_x + 20 + int((rc_w - 40) * 0.68), 687], fill=TERRACOTTA)
d2.text((rc_x + 20, 705), "Candidate meets 75% of technical requisites,\nbut 33% of business contextualization.", fill=TEXT_MUTED, font=get_font(12))

os.makedirs("student_coaching_rahul_verma", exist_ok=True)
img2.save("student_coaching_rahul_verma/screen.png")
print("Saved student_coaching_rahul_verma/screen.png")

# ── 3. System States & Edge Cases ────────────────────────────────────────────
img3 = Image.new("RGB", (W, H), CREAM)
d3 = ImageDraw.Draw(img3)
draw_header_sidebar(d3, "Reports")

# Header
d3.text((x0, 85), "SPECIFICATION DOCUMENT 04-A • VERSION 1.2", fill=TEXT_MUTED, font=get_font(11))
d3.text((x0, 110), "Design System: Core States & Edge Cases", fill=NAVY, font=get_font(28))
d3.text((x0, 150), "Institutional error boundaries, degraded parsing feedback, and pending state patterns designed for anxiety reduction.", fill=TEXT_MUTED, font=get_font(14))

gw = (W - x0 - 60) // 2
gh = 420
gy0 = 190

# State 1: Empty Repository
d3.rectangle([x0, gy0, x0 + gw, gy0 + gh], fill=WHITE, outline=BORDER)
d3.rectangle([x0, gy0, x0 + gw, gy0 + 44], fill=SAND_LOW)
d3.text((x0 + 20, gy0 + 12), "STATE 01 • Empty Repository", fill=NAVY, font=get_font(13))
d3.text((x0 + gw - 180, gy0 + 12), "View: /student/analyses", fill=TEXT_MUTED, font=get_font(11))
d3.text((x0 + gw // 2 - 80, gy0 + 140), "No analyses yet", fill=NAVY, font=get_font(22))
d3.text((x0 + 40, gy0 + 180), "Upload your resume to compare it with real industry benchmarks\nand get a structured roadmap for placement preparation.", fill=TEXT_MUTED, font=get_font(13))
d3.rectangle([x0 + gw // 2 - 100, gy0 + 250, x0 + gw // 2 + 100, gy0 + 295], fill=NAVY)
d3.text((x0 + gw // 2 - 70, gy0 + 265), "Upload a resume", fill=WHITE, font=get_font(14))

# State 2: Parsing Error
d3.rectangle([x0 + gw + 20, gy0, x0 + 2 * gw + 20, gy0 + gh], fill=WHITE, outline=BORDER)
d3.rectangle([x0 + gw + 20, gy0, x0 + 2 * gw + 20, gy0 + 44], fill=SAND_LOW)
d3.text((x0 + gw + 40, gy0 + 12), "STATE 02 • Inline File Parsing Error", fill=NAVY, font=get_font(13))
d3.rectangle([x0 + 2 * gw - 120, gy0 + 10, x0 + 2 * gw, gy0 + 34], fill=ERR_BG)
d3.text((x0 + 2 * gw - 110, gy0 + 14), "Action Required", fill=ERR_TXT, font=get_font(11))
d3.rectangle([x0 + gw + 40, gy0 + 70, x0 + 2 * gw, gy0 + 140], fill=ERR_BG)
d3.text((x0 + gw + 56, gy0 + 85), "⚠ We could not read this file. Try a text-based PDF or a DOCX.", fill=ERR_TXT, font=get_font(13))
d3.text((x0 + gw + 56, gy0 + 110), "Retry upload →", fill=NAVY, font=get_font(12))
d3.rectangle([x0 + gw + 40, gy0 + 160, x0 + 2 * gw, gy0 + 230], fill=SAND_LOW)
d3.text((x0 + gw + 60, gy0 + 180), "Rahul_Resume_Scanned_Image.pdf  (2.4MB • Unreadable text layer)", fill=TEXT_DARK, font=get_font(13))
d3.text((x0 + gw + 40, gy0 + 260), "Scanned image files or password-protected documents cannot be parsed.\nExport directly from Google Docs, Word, or LaTeX for accurate parsing.", fill=TEXT_MUTED, font=get_font(12))

gy1 = gy0 + gh + 20

# State 3: Low-Confidence Result
d3.rectangle([x0, gy1, x0 + gw, gy1 + gh], fill=WHITE, outline=BORDER)
d3.rectangle([x0, gy1, x0 + gw, gy1 + 44], fill=SAND_LOW)
d3.text((x0 + 20, gy1 + 12), "STATE 03 • Low-Confidence Disclaimer", fill=NAVY, font=get_font(13))
d3.rectangle([x0 + gw - 140, gy1 + 10, x0 + gw - 20, gy1 + 34], fill=WARN_BG)
d3.text((x0 + gw - 130, gy1 + 14), "Signal Deficiency", fill=WARN_TXT, font=get_font(11))
d3.rectangle([x0 + 20, gy1 + 65, x0 + gw - 20, gy1 + 130], fill=WARN_BG)
d3.text((x0 + 36, gy1 + 80), "Your resume has little detail about projects, so some ratings are uncertain.\nAdding project descriptions will improve this.", fill=TEXT_DARK, font=get_font(12))
d3.text((x0 + 20, gy1 + 155), "Skill Calibration Ledger (Benchmark: Backend Eng I)", fill=NAVY, font=get_font(15))
d3.rectangle([x0 + 20, gy1 + 185, x0 + gw - 20, gy1 + 250], fill=SAND_LOW)
d3.text((x0 + 36, gy1 + 195), "Distributed Systems & Cache — Low confidence (52%)", fill=TEXT_DARK, font=get_font(13))
d3.text((x0 + 36, gy1 + 220), "Mentioned Redis once in skills list without metrics or architectural context.", fill=TEXT_MUTED, font=get_font(11))
d3.rectangle([x0 + 20, gy1 + 265, x0 + gw - 20, gy1 + 330], fill=SAND_LOW)
d3.text((x0 + 36, gy1 + 275), "PostgreSQL Query Tuning — Low confidence (48%)", fill=TEXT_DARK, font=get_font(13))
d3.text((x0 + 36, gy1 + 300), "Academic course listed, but no project implementation found.", fill=TEXT_MUTED, font=get_font(11))

# State 4: Loading Skeletons
d3.rectangle([x0 + gw + 20, gy1, x0 + 2 * gw + 20, gy1 + gh], fill=WHITE, outline=BORDER)
d3.rectangle([x0 + gw + 20, gy1, x0 + 2 * gw + 20, gy1 + 44], fill=SAND_LOW)
d3.text((x0 + gw + 40, gy1 + 12), "STATE 04 • Loading Skeletons", fill=NAVY, font=get_font(13))
d3.text((x0 + 2 * gw - 80, gy1 + 12), "● Parsing", fill=NAVY, font=get_font(12))

# Skeleton bars
d3.rectangle([x0 + gw + 40, gy1 + 75, x0 + gw + 260, gy1 + 95], fill=SAND_HIGH)
d3.rectangle([x0 + gw + 40, gy1 + 110, x0 + gw + 360, gy1 + 125], fill=SAND_LOW)
d3.rectangle([x0 + gw + 40, gy1 + 150, x0 + gw + 160, gy1 + 210], fill=SAND_LOW)
d3.rectangle([x0 + gw + 180, gy1 + 150, x0 + gw + 300, gy1 + 210], fill=SAND_LOW)
d3.rectangle([x0 + gw + 320, gy1 + 150, x0 + gw + 440, gy1 + 210], fill=SAND_LOW)
d3.rectangle([x0 + gw + 40, gy1 + 230, x0 + 2 * gw, gy1 + 280], fill=SAND_LOW)
d3.rectangle([x0 + gw + 40, gy1 + 295, x0 + 2 * gw, gy1 + 345], fill=SAND_LOW)
d3.rectangle([x0 + gw + 40, gy1 + 365, x0 + 2 * gw, gy1 + 400], fill=SAND_LOW)
d3.text((x0 + gw + 56, gy1 + 375), "Reading resume lines against Junior Frontend Developer benchmark... 64% complete", fill=TEXT_DARK, font=get_font(12))

os.makedirs("system_states_edge_cases", exist_ok=True)
img3.save("system_states_edge_cases/screen.png")
print("Saved system_states_edge_cases/screen.png")
