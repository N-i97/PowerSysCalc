#!/usr/bin/env python3
"""Generate PDF validation report from comprehensive-test JSON output."""

import json
import sys
from pathlib import Path
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Load report data ──────────────────────────────────────────────────────
JSON_PATH = Path(__file__).parent / "output" / "deep-report.json"
PDF_PATH  = Path(__file__).parent / "output" / "deep-report.pdf"

with open(JSON_PATH) as f:
    data = json.load(f)

# ── Styles ────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title", parent=styles["Title"], fontSize=22, spaceAfter=4*mm,
    textColor=colors.HexColor("#0E1726"), alignment=TA_CENTER,
)
subtitle_style = ParagraphStyle(
    "Subtitle", parent=styles["Normal"], fontSize=12,
    textColor=colors.HexColor("#5A6B82"), alignment=TA_CENTER, spaceAfter=12*mm,
)
h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16,
                    textColor=colors.HexColor("#0E1726"), spaceBefore=4*mm,
                    spaceAfter=2*mm, borderPadding=4)
h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=12,
                    textColor=colors.HexColor("#0E1726"), spaceBefore=3*mm,
                    spaceAfter=1*mm)
body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9,
                      textColor=colors.HexColor("#1A2236"), leading=12)
small = ParagraphStyle("Small", parent=styles["Normal"], fontSize=7.5,
                       textColor=colors.HexColor("#3A4A5E"), leading=10,
                       fontName="Courier")
mono = ParagraphStyle("Mono", parent=body, fontName="Courier", fontSize=8,
                      textColor=colors.HexColor("#3A4A5E"), leading=10)
pass_style = ParagraphStyle("Pass", parent=body, fontName="Helvetica-Bold",
                            textColor=colors.HexColor("#1B6A45"))
fail_style = ParagraphStyle("Fail", parent=body, fontName="Helvetica-Bold",
                            textColor=colors.HexColor("#A8201A"))
note_style = ParagraphStyle("Note", parent=body, fontSize=7.5,
                            textColor=colors.HexColor("#5A6B82"),
                            leftIndent=8, rightIndent=8, spaceBefore=1*mm)

# ── Build document ────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    str(PDF_PATH), pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm,
    topMargin=18*mm, bottomMargin=18*mm,
    title="PowerSys Calc — Validation Report",
    author="PowerSys Calc Test Suite",
)
story = []

# ── Title page ────────────────────────────────────────────────────────────
story.append(Spacer(1, 30*mm))
story.append(Paragraph("PowerSys Calc", title_style))
story.append(Paragraph("Comprehensive Validation Report", title_style))
story.append(Paragraph(
    f"Generated {datetime.fromisoformat(data['generatedAt']).strftime('%Y-%m-%d %H:%M:%S')}",
    subtitle_style,
))

# Summary box
summary_data = [
    ["Total calculators tested", str(data["totalCases"])],
    ["Passed",                str(data["totalPass"])],
    ["Failed",                str(data["totalFail"])],
    ["Pass rate",             f"{(data['totalPass']/data['totalCases']*100):.1f}%"],
]
summary_table = Table(summary_data, colWidths=[70*mm, 40*mm], hAlign="CENTER")
summary_table.setStyle(TableStyle([
    ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
    ("FONTSIZE", (0,0), (-1,-1), 11),
    ("TEXTCOLOR", (0,0), (0,-1), colors.HexColor("#3A4A5E")),
    ("TEXTCOLOR", (1,0), (1,-1), colors.HexColor("#0E1726")),
    ("FONTNAME", (1,0), (1,-1), "Helvetica-Bold"),
    ("ALIGN", (1,0), (1,-1), "RIGHT"),
    ("LINEABOVE", (0,0), (-1,0), 1.5, colors.HexColor("#0E1726")),
    ("LINEBELOW", (0,-1), (-1,-1), 1.5, colors.HexColor("#0E1726")),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.HexColor("#F8F5EE"), colors.HexColor("#F2EFE8")]),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
]))
# Color-code pass/fail
if data["totalFail"] == 0:
    summary_table.setStyle(TableStyle([("TEXTCOLOR", (1,1), (1,1), colors.HexColor("#1B6A45"))]))
    summary_table.setStyle(TableStyle([("TEXTCOLOR", (1,2), (1,2), colors.HexColor("#1B6A45"))]))
else:
    summary_table.setStyle(TableStyle([("TEXTCOLOR", (1,1), (1,1), colors.HexColor("#1B6A45"))]))
    summary_table.setStyle(TableStyle([("TEXTCOLOR", (1,2), (1,2), colors.HexColor("#A8201A"))]))

story.append(summary_table)
story.append(Spacer(1, 20*mm))
story.append(Paragraph(
    "<b>Scope:</b> Every calculator in the project (29 across 9 categories) is exercised with "
    "hand-derived inputs. All outputs are validated — result rows (value, unit, status), "
    "raw values, recommended picks (cable size, OCPD, transformer kVA, etc.), overall status, "
    "summary, engineering notes / standards references, recommendations, warnings, formulas, "
    "and step-by-step derivations.",
    body,
))
story.append(Spacer(1, 4*mm))
story.append(Paragraph(
    "<b>Test framework:</b> tests/comprehensive-validation.mts — a standalone test runner "
    "that imports each calculator definition, invokes <font name='Courier'>compute()</font> "
    "with hand-derived inputs, and asserts on every output field.",
    body,
))

# Findings
if data["totalFail"] > 0:
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("<b>Findings:</b>", body))
    for c in data["cases"]:
        if not c["pass"]:
            for ch in c["checks"]:
                if not ch["pass"]:
                    story.append(Paragraph(
                        f"• <b>[{c['calculator']}]</b> {ch['field']} — "
                        f"expected <font name='Courier'>{json.dumps(ch['expected'])}</font>, "
                        f"got <font name='Courier'>{json.dumps(ch['actual'])}</font>",
                        note_style,
                    ))

story.append(PageBreak())

# ── Summary table (all calculators at a glance) ──────────────────────────
story.append(Paragraph("Summary — All Calculators", h1))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0E1726")))

summary_rows = [["#", "Category", "Calculator", "Test", "Checks", "Status"]]
for i, c in enumerate(data["cases"], 1):
    status = "PASS" if c["pass"] else "FAIL"
    summary_rows.append([
        str(i),
        c["category"],
        c["calculator"],
        Paragraph(c["testName"], small),
        f"{c['passCount']}/{len(c['checks'])}",
        status,
    ])
sum_table = Table(summary_rows, colWidths=[8*mm, 25*mm, 35*mm, 65*mm, 15*mm, 15*mm], repeatRows=1)
sum_style = [
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,0), 8.5),
    ("TEXTCOLOR", (0,0), (-1,0), colors.HexColor("#F2EFE8")),
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0E1726")),
    ("ALIGN", (0,0), (0,-1), "CENTER"),
    ("ALIGN", (4,0), (4,-1), "CENTER"),
    ("ALIGN", (5,0), (5,-1), "CENTER"),
    ("FONTSIZE", (0,1), (-1,-1), 7.5),
    ("TEXTCOLOR", (0,1), (-1,-1), colors.HexColor("#1A2236")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#F8F5EE"), colors.HexColor("#F2EFE8")]),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 4),
    ("RIGHTPADDING", (0,0), (-1,-1), 4),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ("GRID", (0,0), (-1,-1), 0.25, colors.HexColor("#D5CCBA")),
]
# Color-code pass/fail cells
for i, c in enumerate(data["cases"], 1):
    if c["pass"]:
        sum_style.append(("TEXTCOLOR", (5, i), (5, i), colors.HexColor("#1B6A45")))
        sum_style.append(("FONTNAME", (5, i), (5, i), "Helvetica-Bold"))
    else:
        sum_style.append(("TEXTCOLOR", (5, i), (5, i), colors.HexColor("#A8201A")))
        sum_style.append(("FONTNAME", (5, i), (5, i), "Helvetica-Bold"))
sum_table.setStyle(TableStyle(sum_style))
story.append(sum_table)

story.append(PageBreak())

# ── Per-calculator details ───────────────────────────────────────────────
for idx, c in enumerate(data["cases"]):
    # Heading
    header = [
        Paragraph(
            f"{c['title']}  "
            f"<font size=9 color='#5A6B82'>— {c['calculator']}</font>",
            h1,
        ),
    ]
    story.extend(header)
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0E1726")))

    # Test info row
    status_label = "PASS" if c["pass"] else "FAIL"
    status_color = "#1B6A45" if c["pass"] else "#A8201A"
    info_text = (
        f"<b>Test:</b> {c['testName']}  ·  "
        f"<b>Category:</b> {c['category']}  ·  "
        f"<b>Result:</b> <font color='{status_color}'><b>{status_label}</b></font>  "
        f"({c['passCount']}/{len(c['checks'])} checks)"
    )
    story.append(Paragraph(info_text, body))

    # Input
    story.append(Paragraph("<b>Input</b>", h2))
    input_str = json.dumps(c["input"], indent=2)
    # Wrap in a monospaced paragraph for readability
    input_para = "<font name='Courier' size='7'>" + input_str.replace("\n", "<br/>") + "</font>"
    story.append(Paragraph(input_para, mono))

    # Checks table
    story.append(Paragraph("<b>Validation checks</b>", h2))
    rows = [["Field", "Expected", "Actual", "Pass"]]
    for ch in c["checks"]:
        exp_s = json.dumps(ch["expected"], default=str)
        if len(exp_s) > 60: exp_s = exp_s[:57] + "…"
        act_s = json.dumps(ch["actual"], default=str)
        if len(act_s) > 60: act_s = act_s[:57] + "…"
        rows.append([
            Paragraph(ch["field"], small),
            Paragraph(exp_s, mono),
            Paragraph(act_s, mono),
            "✓" if ch["pass"] else "✗",
        ])
    tbl = Table(rows, colWidths=[55*mm, 35*mm, 35*mm, 10*mm], repeatRows=1)
    tbl_style = [
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 8.5),
        ("TEXTCOLOR", (0,0), (-1,0), colors.HexColor("#F2EFE8")),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0E1726")),
        ("ALIGN", (3,0), (3,-1), "CENTER"),
        ("FONTSIZE", (0,1), (-1,-1), 7.5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#F8F5EE"), colors.HexColor("#F2EFE8")]),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("GRID", (0,0), (-1,-1), 0.25, colors.HexColor("#D5CCBA")),
    ]
    for i, ch in enumerate(c["checks"], 1):
        if ch["pass"]:
            tbl_style.append(("TEXTCOLOR", (3, i), (3, i), colors.HexColor("#1B6A45")))
            tbl_style.append(("FONTNAME", (3, i), (3, i), "Helvetica-Bold"))
        else:
            tbl_style.append(("TEXTCOLOR", (3, i), (3, i), colors.HexColor("#A8201A")))
            tbl_style.append(("FONTNAME", (3, i), (3, i), "Helvetica-Bold"))
    tbl.setStyle(TableStyle(tbl_style))
    story.append(tbl)

    # Page break between calculators (except last)
    if idx < len(data["cases"]) - 1:
        story.append(PageBreak())

# ── Build ─────────────────────────────────────────────────────────────────
doc.build(story)
print(f"PDF written: {PDF_PATH}")
print(f"  Total cases: {data['totalCases']}")
print(f"  Passed:      {data['totalPass']}")
print(f"  Failed:      {data['totalFail']}")
