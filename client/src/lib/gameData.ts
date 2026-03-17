export const CHAPTERS = ['A', 'B', 'C', 'D'] as const;
export type Chapter = typeof CHAPTERS[number];

export const CHAPTER_NAMES: Record<Chapter, string> = {
  A: 'Rebel', B: 'Pure Skin', C: 'Clean Home', D: 'Herb'
};

export const CHAPTER_IMAGES: Record<Chapter, string> = {
  A: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/ch-a_938deba7.jpg',
  B: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/ch-b_21ca82e4.jpg',
  C: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/ch-c_fbd1dd70.jpg',
  D: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/ch-d_93769911.jpg',
};

export const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/titan-hero_0911a948.jpg';
export const HQ_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663381269942/SVv7WmdfXd3HTuqUe2VA23/titan-hq_06dd8b41.jpg';

export type Option = { id: string; label: string; desc: string; inv: number; esg: number };
export type ChapterData = {
  opening: { title: string; text: string };
  d1: { title: string; context: string; options: Option[] };
  d2: { title: string; getContext: (d1: string) => string; options: Option[] };
  outcome: { whatHappened: string; reflections: string[]; nextLabel: string };
};

export const DATA: Record<Chapter, ChapterData> = {
  A: {
    opening: {
      title: 'Chapter A — Rebel',
      text: `<p>Titan has just bought <strong>Rebel</strong> — a well-known food brand famous for two things: its popular products and its strong social activism. Rebel's founders believe business should drive social change. They speak publicly on political issues, support social justice campaigns, and have built a loyal customer base that buys their products partly because of these values.</p><p>The founders agreed to sell only after Titan promised to protect Rebel's social mission. The price Titan paid includes a large premium for the brand's unique identity.</p><p>Your first decisions will shape whether that promise means anything.</p>`
    },
    d1: {
      title: 'Decision A1 — Governance Structure',
      context: "Rebel's founders want formal, legal protections for the brand's social mission — not just promises. Your legal team has prepared four options. Each one defines how much freedom Rebel will have.",
      options: [
        { id: 'A', label: 'Strong independent board', desc: "Create a fully independent board for Rebel. They have legal power to block any changes to the social mission. Titan can set financial goals but cannot override mission decisions.", inv: -3, esg: 8 },
        { id: 'B', label: 'Board with shared decisions', desc: "Create a semi-independent board. Rebel sets its own social mission, but if Titan disagrees, both sides must discuss it in a joint committee with equal members.", inv: 1, esg: -2 },
        { id: 'C', label: 'Advisory board only', desc: "Create a board that can give advice, but all final decisions belong to Titan's main board.", inv: 5, esg: -4 },
        { id: 'D', label: 'Time-limited independence', desc: 'Give Rebel independence for 3 years only. After that, all governance returns to Titan. Call it a "transition period."', inv: 3, esg: -2 },
      ]
    },
    d2: {
      title: 'Decision A2 — The Activism Crisis',
      getContext: (d1) => ({
        A: "Two years later, Rebel's independent board approves a major campaign that directly criticises one of Titan's biggest business partners for poor labour practices. Titan's partnership team is angry. They want you to stop the campaign. But under the structure you chose, Rebel's board has full authority.",
        B: "Two years later, Rebel's board approves a campaign criticising a major Titan business partner. Under your framework, Titan can call for a joint review — but the process is slow and public. The partner demands immediate action.",
        C: "Two years later, Rebel's advisory board recommends a major activism campaign. Since you kept final authority, you can approve or block it directly. But the founders are watching — and they have connections to the media.",
        D: "Eighteen months into the three-year independence window, Rebel launches a campaign against a Titan business partner. You cannot technically intervene yet — but the partner is threatening to end a contract worth 5% of Titan's revenue.",
      }[d1] ?? ''),
      options: [
        { id: 'A', label: "Defend Rebel's freedom", desc: "Let the campaign go ahead. Accept the business consequences. Tell the partner that Rebel operates independently.", inv: -5, esg: 6 },
        { id: 'B', label: 'Renegotiate the boundaries', desc: 'Open formal talks with Rebel\'s leadership about which future campaigns are acceptable. Call it "clarification," not censorship.', inv: 1, esg: -2 },
        { id: 'C', label: 'Block the campaign', desc: 'Stop the campaign. Announce a formal review of Rebel\'s governance, saying you need to "protect Titan\'s broader business."', inv: 4, esg: -6 },
      ]
    },
    outcome: {
      whatHappened: "The real company behind this story acquired the activist brand in 2000 and created an independent board with strong autonomy — similar to Option A in Decision 1. For over two decades, the brand used its platform to campaign on refugee rights, climate justice, and racial equality — sometimes creating tension with the parent company.\n\nIn 2022, the brand attempted to end sales in a politically contested territory, citing its social mission. The parent company's board overrode this decision and sold those operations without the brand's consent — effectively choosing to block the campaign when the political and commercial stakes became high enough.\n\nThe real path was: strong governance at first, then override when the pressure became too great.",
      reflections: [
        'Looking at your choices, would the founders of Rebel trust you?',
        'Is there a real difference between a governance structure that protects a brand\'s voice and one that protects it only until the pressure gets high enough?',
      ],
      nextLabel: 'Continue to Chapter B →',
    }
  },
  B: {
    opening: {
      title: 'Chapter B — Pure Skin',
      text: `<p>Your scores carry forward. People are watching whether Titan's treatment of Pure Skin matches how it handled Rebel.</p><p>Titan has acquired <strong>Pure Skin</strong> — a premium skincare brand built on two promises: zero harmful chemicals and zero-waste packaging. Pure Skin was a pioneer in the 'clean beauty' movement. Its loyal customers pay higher prices specifically because of these promises.</p><p>The acquisition was announced as proof that Titan is serious about sustainability across its entire business.</p>`
    },
    d1: {
      title: 'Decision B1 — Integration Strategy',
      context: "Pure Skin needs money to grow. Its zero-waste packaging costs much more than Titan's standard packaging. Its chemical-free products need separate manufacturing. Your operations team presents four options.",
      options: [
        { id: 'A', label: 'Full separation — invest heavily', desc: "Keep Pure Skin's supply chain completely separate. Build dedicated factories that maintain all sustainability promises. Cost: high. Time: 18 months.", inv: -4, esg: 5 },
        { id: 'B', label: 'Partial integration', desc: "Use Titan's distribution and marketing, but keep separate manufacturing for Pure Skin's main products. Some cost savings, some sustainability kept.", inv: 1, esg: 1 },
        { id: 'C', label: 'Full integration with targets', desc: "Move Pure Skin into Titan's standard operations. Set internal sustainability targets — but these targets are not legally required.", inv: 4, esg: -3 },
        { id: 'D', label: 'Absorb into Titan', desc: "Integrate immediately into Titan's standard supply chain. Gradually rebrand as a 'premium natural' line within Titan's existing beauty business.", inv: 5, esg: -5 },
      ]
    },
    d2: {
      title: 'Decision B2 — The Portfolio Review',
      getContext: (d1) => ({
        A: "Three years later, Pure Skin's dedicated facilities are working but the brand is losing money. The premium positioning works in Western markets but has not grown in Asia. Total losses since the acquisition are large. Your board is asking hard questions.",
        B: "Three years later, the partial integration model is more expensive than expected. Sales are flat. The board wants answers.",
        C: "Three years later, most internal sustainability targets have been quietly missed. Pure Skin's products are now made on shared production lines with changed formulations. The brand still markets itself as 'clean,' but insiders know the reality has shifted. Sales are falling as loyal customers notice changes.",
        D: "Two years later, Pure Skin is barely recognisable. The products use Titan's standard formulations with small changes. The 'clean beauty' customer base has mostly left. The name survives but the identity is gone.",
      }[d1] ?? ''),
      options: [
        { id: 'A', label: 'Invest more', desc: "Put more money into Pure Skin. Accept short-term losses for long-term brand value. Show the market that Titan supports what it buys.", inv: -3, esg: 5 },
        { id: 'B', label: 'Wait and see', desc: "Keep current investment levels. Set a 2-year review period. No big moves in either direction.", inv: 0, esg: -1 },
        { id: 'C', label: 'Cut back', desc: "Reduce investment to break-even levels. Make Pure Skin a smaller, niche brand within Titan.", inv: 3, esg: -4 },
        { id: 'D', label: 'Sell or close', desc: "Exit the brand. Either find a buyer or close it down.", inv: 4, esg: -6 },
      ]
    },
    outcome: {
      whatHappened: "The parent company acquired this clean beauty brand in 2015 as part of its prestige beauty strategy. At first, the brand kept its identity and product commitments — similar to Option B in Decision 1.\n\nBut over the following years, the brand struggled to grow within the large company's portfolio. By 2021, it was losing money. The parent company tried to sell it but could not find a buyer at an acceptable price. By 2024-2025, the brand was quietly shut down, with its products absorbed or discontinued.\n\nThe real path was: partial integration, followed by closure when financial results disappointed. The brand's sustainability identity survived on paper for several years but was never given the dedicated investment needed to succeed.",
      reflections: [
        'At what point does under-investment in a brand become the same as destroying it?',
        'Should Titan have known before buying Pure Skin that its sustainability promises were too expensive to keep at corporate scale?',
      ],
      nextLabel: 'Continue to Chapter C →',
    }
  },
  C: {
    opening: {
      title: 'Chapter C — Clean Home',
      text: `<p>Your scores carry forward. The market is now watching Titan's pattern across multiple acquisitions.</p><p>Titan has acquired <strong>Clean Home</strong> — a household cleaning brand built entirely on environmental activism. Clean Home's products are plant-based, its packaging is recycled, and its founding team has spent decades publicly campaigning for environmental laws, plastic reduction, and corporate accountability — including campaigns targeting companies very similar to Titan.</p><p>Clean Home's customers are not just buying cleaning products. They are buying the brand's political identity. The founders agreed to sell only because they believed Titan's ESG commitments were genuine.</p>`
    },
    d1: {
      title: 'Decision C1 — Brand Voice',
      context: "Clean Home's founding team wants to continue publishing their annual Corporate Responsibility Report. This report has always included public positions on environmental laws, criticism of industry lobbying, and calls for mandatory plastic reduction targets. Titan's legal team warns that some of these positions directly contradict Titan's own lobbying positions in several countries.",
      options: [
        { id: 'A', label: 'Full voice — no restrictions', desc: "Let Clean Home publish without interference. Accept that some positions will conflict with Titan's own lobbying.", inv: -3, esg: 6 },
        { id: 'B', label: 'Voice with review process', desc: "Let Clean Home publish, but require Titan's government affairs team to review the report first. Positions that directly conflict with Titan's lobbying must be discussed before publication.", inv: 1, esg: -2 },
        { id: 'C', label: 'Product voice only', desc: "Clean Home can talk about its products and packaging, but public positions on laws or regulation need Titan's approval.", inv: 3, esg: -4 },
        { id: 'D', label: 'Full editorial control', desc: "All external communications from Clean Home must be approved by Titan's communications team before publication.", inv: 4, esg: -6 },
      ]
    },
    d2: {
      title: 'Decision C2 — The Plastic Campaign',
      getContext: (d1) => ({
        A: "Three years later, Clean Home's founders propose a major public campaign calling for a legal ban on single-use plastic packaging — the kind of packaging used by several of Titan's other major brands. Under your full-voice policy, they don't need permission. But Titan's other brands division sends an urgent message: this campaign could lead to regulations that cost Titan hundreds of millions.",
        B: "Three years later, during the required review, Clean Home flags a proposed campaign for a legal ban on single-use plastics — targeting packaging used by Titan's own brands. The review process you created is now being tested by exactly the conflict it was designed to handle.",
        C: "Three years later, Clean Home's founders want to launch a campaign against single-use plastics. Under your rules, this needs Titan's approval since it involves legislation. The founders say the campaign is about product quality, not politics.",
        D: "Three years later, Clean Home submits a campaign against single-use plastics for approval. Your communications team flags it as a direct threat to Titan's other brands. The founders are already frustrated by months of delays on smaller communications.",
      }[d1] ?? ''),
      options: [
        { id: 'A', label: 'Approve the campaign', desc: "Let Clean Home run the campaign as planned, even though it targets Titan's own products.", inv: -5, esg: 7 },
        { id: 'B', label: 'Approve a narrower version', desc: "Allow the campaign but ask Clean Home to focus on general plastic reduction rather than a specific ban that affects Titan's products.", inv: 1, esg: -2 },
        { id: 'C', label: 'Block it quietly', desc: 'Ask the founders to stop the campaign for now, saying the timing is wrong and Titan needs "internal alignment." Do not make the block public.', inv: 3, esg: -4 },
        { id: 'D', label: 'Block it publicly', desc: "Issue a statement saying Titan supports plastic reduction but disagrees with a legal ban. Call it a strategic disagreement, not censorship.", inv: 2, esg: -5 },
      ]
    },
    outcome: {
      whatHappened: "The parent company acquired this environmental cleaning brand in 2016 for approximately $700 million. The brand was not just a green product company — it was a political activist, regularly publishing reports and lobbying for environmental laws.\n\nAfter the acquisition, the brand kept its products but its political activism and lobbying campaigns were gradually quieted. The real path was similar to Option B then Option C — the brand kept its product-focused sustainability communications but its political voice was slowly muted through review processes that worked as quiet censorship.\n\nThe products survived. The political identity did not. This is the most common result for activist brands bought by large companies — and the hardest to see from outside because the products look the same.",
      reflections: [
        "Is there a real difference between a brand that is told what it cannot say and a brand that learns over time what is safe to say?",
        "If Clean Home's founders resigned over the plastic campaign decision, how would you explain Titan's position to journalists?",
      ],
      nextLabel: 'Continue to Chapter D →',
    }
  },
  D: {
    opening: {
      title: 'Chapter D — Herb',
      text: `<p>Your scores carry forward. You are now managing four ESG brand acquisitions. Your pattern of decisions is becoming clear — or unclear.</p><p>Titan has acquired <strong>Herb</strong> — a small but fast-growing organic herbal tea and wellness brand. Herb was founded by two people: a business entrepreneur and a master herbalist. Every product is 100% certified organic. The brand holds multiple ethical certifications, donates 1% of all sales to environmental causes, and sources ingredients through fair trade programmes.</p><p>Herb's founders agreed to sell to Titan because they believed Titan's sustainability plan was genuine. They see the acquisition as a chance to bring their mission to a global audience. The herbalist co-founder has agreed to stay on in an advisory role to protect the brand's values.</p><p>This is the smallest and most personal of Titan's ESG acquisitions. The brand's identity is not just in its products — it is in its founders, its certifications, and its supply chain relationships with farmers around the world.</p>`
    },
    d1: {
      title: 'Decision D1 — Growth Strategy',
      context: "Herb is growing at 30% per year. Titan's beverage division sees huge global potential, especially in Asian wellness markets. But scaling the brand means making choices about how to grow. Herb's organic certification requires that every ingredient meets strict standards. Its ethical sourcing means paying farmers above-market prices. These commitments are expensive and limit how fast Titan can expand the brand.",
      options: [
        { id: 'A', label: 'Grow slowly, keep all standards', desc: "Expand Herb gradually, keeping all organic certifications and ethical sourcing. Accept slower growth and higher costs. Use Titan's distribution network but do not change the supply chain.", inv: -3, esg: 6 },
        { id: 'B', label: 'Grow with some flexibility', desc: "Expand faster by using some of Titan's existing tea supply chain where it meets organic standards. Keep all certifications but accept that not every new product line can meet the original sourcing standards immediately.", inv: 1, esg: -1 },
        { id: 'C', label: 'Prioritise scale', desc: "Move Herb's production into Titan's main tea facilities. Maintain organic certification where possible but prioritise volume and efficiency. Some ethical sourcing standards may slip.", inv: 4, esg: -4 },
        { id: 'D', label: 'Full integration into beverage division', desc: "Make Herb a product line within Titan's global tea business. Keep the brand name and organic label where regulations require it, but run operations through standard corporate processes.", inv: 5, esg: -6 },
      ]
    },
    d2: {
      title: 'Decision D2 — The Ownership Change',
      getContext: (d1) => ({
        A: "Four years later, Titan announces it is selling its entire tea business to a private equity firm for billions. Herb is included in the sale. The co-founder who stayed on as advisor is alarmed — a private equity owner will have no obligation to maintain Herb's certifications, ethical sourcing, or charitable donations. She asks you to separate Herb from the tea sale or find an independent buyer.",
        B: "Four years later, Titan is selling its tea business to a private equity firm. Herb's co-founder learns that under the new owner, several of the ethical certifications she fought to maintain will likely be reviewed for cost efficiency. She asks you to protect Herb before the sale.",
        C: "Four years later, Titan sells its tea business. Herb is already deeply integrated into Titan's tea operations. The co-founder left two years ago after disagreements about sourcing standards. The brand exists, but most of what made it special has already been diluted.",
        D: "Four years later, Titan sells its tea business. Herb has been a product line within the division for years. The founders are long gone. The organic label is maintained where legally required. The brand name survives but the identity does not.",
      }[d1] ?? ''),
      options: [
        { id: 'A', label: 'Separate Herb from the sale', desc: "Remove Herb from the tea business sale. Either keep it within Titan or find a buyer who will protect its values. This will complicate and possibly delay the larger deal.", inv: -4, esg: 6 },
        { id: 'B', label: 'Negotiate protections in the sale', desc: "Include Herb in the sale but negotiate conditions with the buyer to maintain organic certification and ethical sourcing for a set period. Conditions are hard to enforce long-term.", inv: 1, esg: -1 },
        { id: 'C', label: 'Include without conditions', desc: "Sell Herb as part of the package. The buyer can decide what to do with the brand. Focus on completing the deal cleanly.", inv: 4, esg: -5 },
        { id: 'D', label: 'Accelerate the sale', desc: "Push to close the deal quickly. Herb is a small part of a multi-billion deal. Do not let it slow things down.", inv: 3, esg: -4 },
      ]
    },
    outcome: {
      whatHappened: "The parent company acquired this organic herbal tea brand in 2017. The brand was the fastest-growing organic tea company in the world, with 100% certified organic ingredients, B Corp certification, and fair trade sourcing.\n\nAt first, the brand kept its independence — the co-founder stayed on, certifications were maintained, and a special 'Mission Council' was created to protect the brand's values. The real path initially looked like Option A or B in Decision 1.\n\nBut in 2021, the parent company sold its entire tea business to a private equity firm for €4.5 billion. The herbal brand was included in the package. By 2023, the brand's Bristol offices were closed, 90 of 120 staff were let go, and operations were moved to the parent tea company's headquarters. In 2024, the brand lost its B Corp certification because it could no longer be assessed independently — it had been absorbed into the larger business.\n\nThe real path for Decision 2 was closest to Option C — the brand was sold as part of a larger deal with no special protections. The products survived. The certifications, the staff, the offices, and the mission council did not.",
      reflections: [
        "When a company sells a brand it promised to protect, who is responsible for what happens next?",
        "Can a brand built on personal values (a herbalist, a mission, specific farmers) ever truly survive corporate ownership?",
      ],
      nextLabel: 'See Your Full Results →',
    }
  },
};

export const CONSEQUENCES: Record<string, Record<string, string>> = {
  A1: {
    A: "Rebel now has a legally independent board with real power. Investors worry this limits Titan's control over a brand it paid a premium for — but ESG analysts are very impressed.",
    B: "A balanced approach. Rebel has a voice, but Titan keeps a seat at the table. This satisfies most stakeholders without making anyone fully happy.",
    C: "Titan keeps full control. The governance structure looks good on paper, but the founders and ESG community know the advisory board has no real power.",
    D: "A compromise with a deadline. Rebel gets independence, but everyone knows it's temporary. Some critics call it a PR move.",
  },
  A2: {
    A: "The campaign goes ahead. The business partner is furious and reduces orders. Titan takes a financial hit, but Rebel's brand loyalty surges. ESG credibility is strengthened.",
    B: "The talks begin, but they leak to the media. Headlines read \"Titan tries to control activist brand.\" The process is messy, but it avoids direct confrontation.",
    C: "The campaign is killed. Rebel's founders go public with their frustration. Media stories question Titan's commitment to brand independence. ESG credibility takes a serious hit.",
  },
  B1: {
    A: "Pure Skin gets its own supply chain. Costs are very high, but the brand's sustainability promises are fully kept. Investors question whether this will ever be profitable.",
    B: "A practical middle ground. Pure Skin keeps its manufacturing standards for key products while using Titan's scale for distribution. Some compromises, but the core identity holds.",
    C: "Pure Skin is absorbed into Titan's operations. The sustainability targets are aspirational, not enforceable. Cost savings are significant, but the brand's authenticity is at risk.",
    D: "Pure Skin exists in name only within Titan's beauty division. The premium customers begin to leave. Short-term financial gains, long-term brand damage.",
  },
  B2: {
    A: "More money flows to Pure Skin. It's a bet on the brand's long-term value. Investors are unhappy about continued losses, but ESG credibility grows.",
    B: "Nothing changes. The review period gives everyone breathing room, but it also delays any real solution. The brand slowly drifts.",
    C: "Pure Skin becomes a small, quiet brand in Titan's portfolio. The sustainability story fades. Costs are under control, but the acquisition's original purpose is lost.",
    D: "Pure Skin is gone. Titan writes off the investment. The market notes that another ESG acquisition failed to survive inside a large company.",
  },
  C1: {
    A: "Clean Home's team is energised. They publish a hard-hitting report that gets media attention — some of it uncomfortable for Titan. ESG credibility rises significantly.",
    B: "The review process adds a layer of friction. Clean Home can still publish, but the review creates a quiet negotiation that shapes what gets said.",
    C: "Clean Home can talk about its products, but its political voice is silenced. The founders feel betrayed. The brand becomes a green product line, not an activist.",
    D: "Clean Home's communications are now fully controlled by Titan. The founders are furious. The brand's activist identity is effectively ended on day one.",
  },
  C2: {
    A: "The campaign launches and creates a media storm. Titan is publicly criticised for undermining its own products. But Clean Home's credibility reaches new heights. Other brands take notice.",
    B: "A watered-down campaign goes out. Clean Home's founders are disappointed but stay. The message is weaker, and some activists say Titan censored the original.",
    C: "The campaign is stopped. The founders are told it's temporary. But everyone knows it's not. Clean Home's activist identity is effectively over.",
    D: "Titan publicly disagrees with its own subsidiary. The statement gets attention but is seen as honest. However, Clean Home's founders see it as a betrayal.",
  },
  D1: {
    A: "Herb grows slowly but keeps everything that makes it special. Investors push back on the pace, but the brand's certifications and relationships remain intact.",
    B: "Herb grows faster while mostly keeping its standards. Some new product lines use Titan's supply chain. The co-founder is watchful but stays.",
    C: "Herb's production moves to Titan's facilities. Volume goes up, but sourcing standards begin to slip. The co-founder raises concerns that are noted but not acted on.",
    D: "Herb becomes a brand name on Titan's tea products. The founders' vision is replaced by corporate tea operations. Fast growth, but the soul of the brand is lost.",
  },
  D2: {
    A: "Herb is removed from the tea sale. The larger deal is delayed and costs more. But the brand gets a chance to survive with its values intact.",
    B: "Protections are written into the sale contract. Whether the new owner respects them is another question — but Titan has done what it can.",
    C: "Herb is sold as part of the package. Its future is now in the hands of a private equity firm focused on returns. The co-founder's concerns are politely noted.",
    D: "The deal closes fast. Herb is a line item in a multi-billion transaction. No one at the negotiating table is thinking about organic certification or fair trade farmers.",
  },
};

export function getArchetype(choices: Record<string, string>): { title: string; desc: string } {
  let esgScore = 0;
  Object.values(choices).forEach(c => {
    if (c === 'A') esgScore += 2;
    else if (c === 'B') esgScore += 1;
  });
  if (esgScore >= 14) return { title: 'The Mission CEO', desc: "You consistently protected every brand's identity, even at significant cost to investors. This is the rarest path. Very few real CEOs have maintained this level of commitment across multiple acquisitions." };
  if (esgScore >= 11) return { title: 'The Principled Leader', desc: "You mostly protected the brands you acquired, though you made practical compromises when the pressure became intense. Your ESG credibility is strong but not untested." };
  if (esgScore >= 6) return { title: 'The Pragmatic Manager', desc: "You balanced investor demands with ESG commitments, sometimes protecting brands and sometimes prioritising efficiency. This is the most common path — and the most common criticism of large companies managing ESG brands." };
  if (esgScore >= 2) return { title: 'The Efficiency CEO', desc: "You prioritised financial performance and operational efficiency across most decisions. The brands you acquired may have lost their original identity, but your investors are satisfied." };
  return { title: 'The Corporate Machine', desc: "Every decision prioritised control, efficiency, and investor returns. The ESG brands you acquired have been absorbed into the corporate structure. Their names may survive, but their missions do not." };
}

export const UNILEVER_ACTUAL: Record<string, string> = {
  A1: 'Option A — Strong independent board',
  A2: 'Option C — Blocked the campaign (Israel/Palestine)',
  B1: 'Option B — Partial integration',
  B2: 'Option D — Sold/closed the brand',
  C1: 'Option B — Voice with review process',
  C2: 'Option C — Quietly blocked activism',
  D1: 'Option A/B — Kept standards initially',
  D2: 'Option C — Sold as part of larger deal',
};

// Detailed Unilever real-world context per decision key
export const UNILEVER_DETAIL: Record<string, { label: string; context: string }> = {
  A1: {
    label: 'Option A — Strong independent board',
    context: 'Unilever created a fully independent board for Ben & Jerry\'s with legal authority to protect its social mission — the same as Option A. This structure held for over 20 years.',
  },
  A2: {
    label: 'Option C — Blocked the campaign',
    context: 'In 2022, Ben & Jerry\'s board voted to end sales in Israeli-occupied Palestinian territories. Unilever\'s main board overrode this decision and sold those operations to a local licensee — effectively blocking the campaign to protect a business relationship.',
  },
  B1: {
    label: 'Option B — Partial integration',
    context: 'Unilever kept REN Clean Skincare\'s product formulations and brand identity largely intact after the 2015 acquisition, while using its own distribution and marketing infrastructure — closest to Option B.',
  },
  B2: {
    label: 'Option D — Sold / closed the brand',
    context: 'After years of underperformance, Unilever was unable to find a buyer at an acceptable price. By 2024–2025 the brand was quietly wound down and its products discontinued — the outcome of Option D.',
  },
  C1: {
    label: 'Option B — Voice with review process',
    context: 'After acquiring Seventh Generation in 2016, Unilever allowed the brand to continue publishing its Corporate Responsibility Report, but internal review processes were introduced that shaped what positions were publicly taken — closest to Option B.',
  },
  C2: {
    label: 'Option C — Quietly blocked activism',
    context: 'Seventh Generation\'s plastic-ban campaign was significantly scaled back after Unilever\'s government affairs team raised concerns about conflicts with Unilever\'s own lobbying positions. The campaign was not publicly cancelled, but it was quietly stopped — Option C.',
  },
  D1: {
    label: 'Option A/B — Kept standards initially',
    context: 'After acquiring Pukka Herbs in 2017, Unilever maintained its organic certifications, B Corp status, and kept co-founder Sebastian Pole on as an advisor via a Mission Council — initially resembling Option A or B.',
  },
  D2: {
    label: 'Option C — Sold as part of larger deal',
    context: 'In 2022, Unilever sold its entire tea division to CVC Capital Partners for €4.5 billion. Pukka was included in the package with no special protections. By 2024, Pukka lost its B Corp certification, its Bristol offices closed, and 90 of 120 staff were made redundant — Option C.',
  },
};

export const CHAPTER_REVEAL_NAMES: Record<Chapter, string> = {
  A: "Rebel / Ben & Jerry's",
  B: 'Pure Skin / REN Clean Skincare',
  C: 'Clean Home / Seventh Generation',
  D: 'Herb / Pukka Herbs',
};

// Discussion prompts per decision key for the final comparison dashboard
export const DISCUSSION_PROMPTS: Record<string, string> = {
  A1: 'Did your governance structure actually protect Rebel\'s mission — or just delay the inevitable? What does the class distribution tell you about how students weigh legal protection vs. operational control?',
  A2: 'When commercial pressure conflicts with a brand\'s social mission, who should win? How did your classmates split on this — and what does the majority choice reveal about how future managers think about ESG commitments under stress?',
  B1: 'Full integration destroys identity; full independence destroys synergies. Where did the class land on this spectrum — and does the distribution match what you\'d expect from a group of future business leaders?',
  B2: 'When a brand underperforms financially, is selling or closing it a failure of ESG governance or a rational business decision? How does your class\'s response compare to what Unilever actually did?',
  C1: 'Allowing a brand to speak but controlling what it says — is that authentic ESG, or a form of greenwashing? Look at how the class split: does the majority choice represent genuine commitment or managed optics?',
  C2: 'Seventh Generation\'s plastic-ban campaign was stopped quietly, not publicly cancelled. Is silent suppression of activism worse than an open override? How many of your classmates chose the same path as Unilever?',
  D1: 'Keeping certifications and mission advisors costs money and limits flexibility. How did the class balance short-term efficiency against long-term brand integrity — and does the distribution surprise you?',
  D2: 'When a parent company sells an ESG brand as part of a larger deal, is that a betrayal of the acquisition promise — or just business? Compare your class\'s choices with Unilever\'s actual decision to sell Pukka with no special protections.',
};

export function getScoreBarWidth(val: number): number {
  return Math.max(0, Math.min(100, (val / 20) * 100));
}
