---
title: "Shadow AI: the adoption gap that now carries a price tag"
source: "Research"
sourceUrl: "https://www.ibm.com/reports/data-breach"
publishedAt: 2026-06-09
summary: "IBM's breach data put a number on ungoverned AI use — $670,000 in extra breach cost — while Microsoft's workplace research shows three in four employees bring their own AI to work. The gap between the two is the enterprise risk story of 2026."
tags: ["shadow AI", "security", "governance", "research"]
media: []
crawlStatus: "manual-review"
---

Shadow AI — employees using AI tools their organization never sanctioned, and feeding company data into them — has graduated from an IT anxiety to a quantified line item on the breach ledger. Two primary sources, one measuring behavior and one measuring consequences, frame the 2026 picture.

On the behavior side, Microsoft and LinkedIn's [Work Trend Index](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part) found that 78% of AI users bring their own AI tools to work — a pattern Microsoft labeled "BYOAI" — and that the practice spans every generation, not just younger employees. Crucially, this is not fringe behavior by junior staff: usage concentrates among people under delivery pressure, and most of it happens without disclosure, which means organizations lose visibility precisely where sensitive work is being done.

On the consequence side, IBM's [Cost of a Data Breach Report](https://www.ibm.com/reports/data-breach) delivered the number that moved boardrooms: breaches involving high levels of shadow AI cost an average of $4.63 million — about $670,000 more than incidents at organizations with low or no shadow AI. One in five organizations studied reported a breach linked to shadow AI, and these incidents disproportionately exposed customer personally identifiable information (65%, versus a 53% global average) and spread data across multiple environments, which lengthens detection and containment. The companion finding from [IBM's newsroom summary](https://newsroom.ibm.com/2025-07-30-ibm-report-13-of-organizations-reported-breaches-of-ai-models-or-applications,-97-of-which-reported-lacking-proper-ai-access-controls) is arguably more damning: 13% of organizations reported breaches of AI models or applications themselves, and 97% of those lacked proper AI access controls. The problem is rarely exotic model attacks; it is basic governance absent at the point of adoption.

Put together, the two datasets describe a gap rather than a tool problem. Employees adopt AI faster than security teams can sanction it because the productivity benefit is immediate and personal, while the risk is delayed and organizational. Blanket bans demonstrably fail — Microsoft's data shows usage flourishing regardless of policy — and they push activity onto personal devices and accounts where no logging exists at all.

The emerging consensus response borrows from how shadow IT was eventually tamed, with one important difference: speed. The standard playbook now reads as follows. First, provide a sanctioned alternative good enough that going around it stops being worth the friction — enterprise deployments with logging, data-handling guarantees, and single sign-on. Second, instrument rather than prohibit: discovery of AI traffic, data-loss-prevention rules tuned for prompts and file uploads, and access controls on the AI applications themselves, the control IBM found missing in 97% of AI breaches. Third, train for judgment, not compliance theater — employees need to know which data categories never leave the boundary, and why.

Shadow AI is best read not as employee misconduct but as a demand signal the organization failed to meet, and the organizations closing the gap fastest are the ones that treat it that way. The IBM numbers simply established what ignoring that signal costs: roughly two-thirds of a million dollars per breach, plus the customer trust that leaves with the PII.
