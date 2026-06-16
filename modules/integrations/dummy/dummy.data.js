const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Shaurya", "Atharva", "Advik", "Kabir", "Ananya", "Diya", "Aadhya",
  "Saanvi", "Pari", "Anika", "Navya", "Myra", "Sara", "Ira", "Aanya",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Mehta", "Reddy",
  "Nair", "Iyer", "Khan", "Joshi", "Mishra", "Agarwal", "Chopra", "Malhotra",
];

const INQUIRIES = [
  "Looking for airport pickup next Friday",
  "Need a cab for wedding party (4 cars)",
  "Outstation trip to Jaipur — 3 days",
  "Daily office commute package",
  "Group tour for 10 people",
  "Half-day city sightseeing",
  "Long-term car rental for 1 month",
  "Pickup from railway station tomorrow",
];

const CAMPAIGNS = {
  facebook: ["Summer Promo", "Reels Boost", "Lead Gen FB", "Carousel Ad"],
  instagram: ["Stories Promo", "Reels Campaign", "Influencer Tie-up", "IG Shop"],
  google_ads: ["Search - Cabs", "Search - Tours", "Display Remarketing", "YouTube Pre-roll"],
  website: ["Homepage Form", "Pricing Page", "Contact Form", "Blog CTA"],
};

const GOOGLE_KEYWORDS = [
  "cab service near me",
  "airport taxi booking",
  "outstation cab",
  "wedding car rental",
  "car rental for tour",
  "best taxi service",
  "luxury cab booking",
  "tempo traveller rental",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const phone = () => {
  let p = "9";
  for (let i = 0; i < 9; i++) p += Math.floor(Math.random() * 10);
  return p;
};

const generateLead = (source) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const lead = {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(
      Math.random() * 1000,
    )}@example.com`,
    phone: phone(),
    source,
    campaign: pick(CAMPAIGNS[source] || ["General"]),
    inquiry: pick(INQUIRIES),
  };

  if (source === "google_ads") {
    lead.keyword = pick(GOOGLE_KEYWORDS);
  }

  return lead;
};

module.exports = {
  generateLead,
  pick,
  FIRST_NAMES,
  LAST_NAMES,
  CAMPAIGNS,
  GOOGLE_KEYWORDS,
};
