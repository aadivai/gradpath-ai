import type { University, Profile } from '@/types'

// Static enrichment data for global universities to satisfy GradPath 3.0 rich dataset requirements
export const UNIVERSITY_METADATA: Record<string, {
  the_ranking: number
  employment_rate: number // percentage
  visa_success_rate: number // percentage
  roi_score: number // out of 100
  climate: 'warm' | 'cold' | 'moderate'
  internship_opportunities: string
  placement_statistics: string
  international_student_count: number
  language_requirements: string
  image_url: string
  safety_index?: number
  city_rating?: number
  nearby_companies?: string
  nearby_startups?: string
  industry_connections?: string
  research_labs?: string
  faculty_ratio?: string
}> = {
  'Massachusetts Institute of Technology (MIT)': {
    the_ranking: 3, employment_rate: 95, visa_success_rate: 88, roi_score: 98, climate: 'cold',
    internship_opportunities: 'Access to top Boston tech startups & MIT Media Lab research contracts.',
    placement_statistics: '$120,000 median starting salary. 96% placement within 3 months.',
    international_student_count: 3400, language_requirements: 'English (IELTS 7.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600',
    safety_index: 85, city_rating: 9.0,
    nearby_companies: 'Google, Microsoft, Amazon, Akamai, Biogen, Novartis',
    nearby_startups: 'Boston Dynamics, HubSpot, Toast, Formlabs, Desktop Metal',
    industry_connections: 'Unmatched MIT Industrial Liaison Program, direct VC pipelines.',
    research_labs: 'Computer Science and Artificial Intelligence Lab (CSAIL), Media Lab, Lincoln Lab',
    faculty_ratio: '1:3'
  },
  'Stanford University': {
    the_ranking: 2, employment_rate: 96, visa_success_rate: 90, roi_score: 99, climate: 'warm',
    internship_opportunities: 'Direct pipeline to Silicon Valley giants (Google, Apple, Meta).',
    placement_statistics: '$135,000 median starting salary. 97% placement within 3 months.',
    international_student_count: 4100, language_requirements: 'English (IELTS 7.5+)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600',
    safety_index: 92, city_rating: 9.5,
    nearby_companies: 'Google, Apple, Meta, HP, VMware, Tesla',
    nearby_startups: 'Stripe, OpenAI, Airbnb, Robinhood, Plaid',
    industry_connections: 'Stanford Technology Ventures Program, heavy Sand Hill Road venture firm pipelines.',
    research_labs: 'Stanford AI Lab (SAIL), Stanford Center for Research on Foundation Models',
    faculty_ratio: '1:5'
  },
  'Harvard University': {
    the_ranking: 4, employment_rate: 94, visa_success_rate: 89, roi_score: 97, climate: 'cold',
    internship_opportunities: 'Global internships, Harvard Business School consultancies.',
    placement_statistics: '$118,000 median starting salary. 95% placement within 3 months.',
    international_student_count: 4800, language_requirements: 'English (IELTS 7.5+)',
    image_url: 'https://images.unsplash.com/photo-1568310065099-28c0b58e7279?q=80&w=600',
    safety_index: 87, city_rating: 9.0,
    nearby_companies: 'Boston Consulting Group, McKinsey, Bain, Fidelity, Vertex Pharmaceuticals',
    nearby_startups: 'HubSpot, Toast, WHOOP, Kayak',
    industry_connections: 'Harvard Harvard Alumni Association (HAA), vast private equity / hedge fund connections.',
    research_labs: 'Harvard John A. Paulson School of Engineering and Applied Sciences (SEAS) Labs',
    faculty_ratio: '1:7'
  },
  'San Jose State University': {
    the_ranking: 601, employment_rate: 88, visa_success_rate: 94, roi_score: 92, climate: 'warm',
    internship_opportunities: 'Top feeder school for local San Jose and Santa Clara software roles.',
    placement_statistics: '$92,000 median starting salary. 90% placement within 3 months.',
    international_student_count: 2800, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'University of Texas at Dallas': {
    the_ranking: 301, employment_rate: 89, visa_success_rate: 92, roi_score: 88, climate: 'warm',
    internship_opportunities: 'Strong links with Telecom Corridor companies in Richardson.',
    placement_statistics: '$88,000 median starting salary. 92% placement within 3 months.',
    international_student_count: 5200, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'University of Toronto': {
    the_ranking: 18, employment_rate: 92, visa_success_rate: 95, roi_score: 91, climate: 'cold',
    internship_opportunities: 'Co-op programs in Ontario government and tech sectors.',
    placement_statistics: '$82,000 CAD median starting salary. 91% placement within 6 months.',
    international_student_count: 12000, language_requirements: 'English (IELTS 7.0+)',
    image_url: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=600'
  },
  'University of British Columbia (UBC)': {
    the_ranking: 31, employment_rate: 90, visa_success_rate: 95, roi_score: 89, climate: 'moderate',
    internship_opportunities: 'Tech internships in Vancouver’s booming software ecosystem.',
    placement_statistics: '$79,000 CAD median starting salary. 89% placement within 6 months.',
    international_student_count: 9800, language_requirements: 'English (IELTS 7.0+)',
    image_url: 'https://images.unsplash.com/photo-1568310065099-28c0b58e7279?q=80&w=600'
  },
  'York University': {
    the_ranking: 401, employment_rate: 85, visa_success_rate: 96, roi_score: 82, climate: 'cold',
    internship_opportunities: 'Flexible summer internships and corporate placements in Toronto.',
    placement_statistics: '$65,000 CAD median starting salary. 87% placement within 6 months.',
    international_student_count: 7200, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'Technical University of Munich (TUM)': {
    the_ranking: 30, employment_rate: 97, visa_success_rate: 98, roi_score: 99, climate: 'cold',
    internship_opportunities: 'Research partnerships with BMW, Siemens, and European Space Agency.',
    placement_statistics: 'No tuition fees. €52,000 starting salary. 98% placement in Europe.',
    international_student_count: 14000, language_requirements: 'English / German (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600',
    safety_index: 94, city_rating: 9.3,
    nearby_companies: 'BMW Group, Siemens AG, Allianz, Munich Re, Infineon Technologies',
    nearby_startups: 'Celonis, Personio, Lilium, Isar Aerospace, IQM Quantum Computers',
    industry_connections: 'TUM Partners of Excellence, Munich Innovation Hub, direct link to German Mittelstand.',
    research_labs: 'TUM Institute for Advanced Study (TUM-IAS), Munich School of Robotics and Machine Intelligence',
    faculty_ratio: '1:9'
  },
  'RWTH Aachen University': {
    the_ranking: 90, employment_rate: 94, visa_success_rate: 97, roi_score: 98, climate: 'moderate',
    internship_opportunities: 'Germany’s leading engineering school, heavy industrial ties.',
    placement_statistics: 'No tuition. €48,000 starting salary. 95% placement within 6 months.',
    international_student_count: 9500, language_requirements: 'English / German (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'University of Duisburg-Essen': {
    the_ranking: 501, employment_rate: 82, visa_success_rate: 97, roi_score: 95, climate: 'moderate',
    internship_opportunities: 'Regional research positions and German language support tracks.',
    placement_statistics: 'No tuition. €40,000 average starting salary. 88% regional placement.',
    international_student_count: 6100, language_requirements: 'English / German (IELTS 6.0+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'University of Oxford': {
    the_ranking: 1, employment_rate: 96, visa_success_rate: 96, roi_score: 95, climate: 'cold',
    internship_opportunities: 'Prestigious fellowships, UK policy research, and global consultancies.',
    placement_statistics: '£60,000 starting salary. 97% placement within 3 months.',
    international_student_count: 8500, language_requirements: 'English (IELTS 7.5+)',
    image_url: 'https://images.unsplash.com/photo-1568310065099-28c0b58e7279?q=80&w=600'
  },
  'Imperial College London': {
    the_ranking: 8, employment_rate: 95, visa_success_rate: 95, roi_score: 96, climate: 'cold',
    internship_opportunities: 'Access to London finance and biotech startup hubs.',
    placement_statistics: '£55,000 starting salary. 95% placement within 3 months.',
    international_student_count: 9200, language_requirements: 'English (IELTS 7.0+)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'University of Manchester': {
    the_ranking: 51, employment_rate: 88, visa_success_rate: 95, roi_score: 87, climate: 'cold',
    internship_opportunities: 'Broad industrial placements in Northwest England manufacturing sectors.',
    placement_statistics: '£42,000 starting salary. 89% placement within 6 months.',
    international_student_count: 14000, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'Sorbonne University': {
    the_ranking: 43, employment_rate: 86, visa_success_rate: 94, roi_score: 93, climate: 'moderate',
    internship_opportunities: 'Sorbonne labs, Paris public sectors, and French cultural firms.',
    placement_statistics: '€38,000 starting salary. 86% placement in Europe.',
    international_student_count: 8200, language_requirements: 'French / English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=600'
  },
  'Ecole Polytechnique': {
    the_ranking: 71, employment_rate: 93, visa_success_rate: 92, roi_score: 90, climate: 'moderate',
    internship_opportunities: 'Defense, AI, and aerospace research contracts in Palaiseau.',
    placement_statistics: '€55,000 starting salary. 93% placement within 3 months.',
    international_student_count: 1600, language_requirements: 'English (IELTS 7.0+ / GRE 315)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'Delft University of Technology (TU Delft)': {
    the_ranking: 48, employment_rate: 94, visa_success_rate: 97, roi_score: 92, climate: 'moderate',
    internship_opportunities: 'Global maritime, clean-energy, and civil design internships in Rotterdam.',
    placement_statistics: '€44,000 starting salary. 94% placement in 3 months.',
    international_student_count: 4800, language_requirements: 'English (IELTS 7.0+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'University of Amsterdam': {
    the_ranking: 61, employment_rate: 89, visa_success_rate: 96, roi_score: 86, climate: 'moderate',
    internship_opportunities: 'Corporate internships with multinational HQs located in Amsterdam.',
    placement_statistics: '€40,000 starting salary. 90% placement within 6 months.',
    international_student_count: 7500, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'Trinity College Dublin': {
    the_ranking: 134, employment_rate: 90, visa_success_rate: 98, roi_score: 89, climate: 'moderate',
    internship_opportunities: 'Tech internships in Dublin’s "Silicon Docks" (Google, Stripe, LinkedIn).',
    placement_statistics: '€45,000 starting salary. 92% placement within 6 months.',
    international_student_count: 5500, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=600'
  },
  'University College Dublin (UCD)': {
    the_ranking: 200, employment_rate: 88, visa_success_rate: 98, roi_score: 86, climate: 'moderate',
    internship_opportunities: 'Strong links to Dublin corporate finance and software hubs.',
    placement_statistics: '€41,000 starting salary. 89% placement within 6 months.',
    international_student_count: 6800, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'University of Melbourne': {
    the_ranking: 37, employment_rate: 91, visa_success_rate: 90, roi_score: 89, climate: 'moderate',
    internship_opportunities: 'Local Australian research and corporate consultancies.',
    placement_statistics: '$75,000 AUD median starting salary. 91% placement within 6 months.',
    international_student_count: 14000, language_requirements: 'English (IELTS 7.0+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'University of Sydney': {
    the_ranking: 41, employment_rate: 89, visa_success_rate: 90, roi_score: 88, climate: 'warm',
    internship_opportunities: 'Corporate software and engineering internships in NSW.',
    placement_statistics: '$72,000 AUD median starting salary. 89% placement within 6 months.',
    international_student_count: 16000, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'University of Auckland': {
    the_ranking: 150, employment_rate: 84, visa_success_rate: 92, roi_score: 84, climate: 'moderate',
    internship_opportunities: 'Engineering placements with local construction and infrastructure firms.',
    placement_statistics: '$62,000 NZD starting salary. 85% placement in 6 months.',
    international_student_count: 5100, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'KTH Royal Institute of Technology': {
    the_ranking: 97, employment_rate: 92, visa_success_rate: 96, roi_score: 90, climate: 'cold',
    internship_opportunities: 'Research projects with Spotify, Ericsson, and local Stockholm startups.',
    placement_statistics: 'SEK 38,000/mo starting salary. 92% placement within 6 months.',
    international_student_count: 3100, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'Aalto University': {
    the_ranking: 147, employment_rate: 91, visa_success_rate: 97, roi_score: 91, climate: 'cold',
    internship_opportunities: 'Nokia collaboration projects, startup grants via Aalto Entrepreneurship Society.',
    placement_statistics: '€42,000 starting salary. 91% placement within 6 months.',
    international_student_count: 2400, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'University of Oslo': {
    the_ranking: 139, employment_rate: 89, visa_success_rate: 98, roi_score: 93, climate: 'cold',
    internship_opportunities: 'Energy sector research internships and public health organizations.',
    placement_statistics: 'NOK 450,000/yr starting salary. 90% placement within 6 months.',
    international_student_count: 2100, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1568310065099-28c0b58e7279?q=80&w=600'
  },
  'University of Copenhagen': {
    the_ranking: 110, employment_rate: 88, visa_success_rate: 96, roi_score: 87, climate: 'cold',
    internship_opportunities: 'Novo Nordisk collaborations, European medical and agricultural research.',
    placement_statistics: 'DKK 38,000/mo starting salary. 88% placement within 6 months.',
    international_student_count: 3800, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'ETH Zurich': {
    the_ranking: 11, employment_rate: 96, visa_success_rate: 97, roi_score: 98, climate: 'cold',
    internship_opportunities: 'World-renowned research labs, Google Zurich, IBM research.',
    placement_statistics: 'CHF 85,000 starting salary. 96% placement within 3 months.',
    international_student_count: 7100, language_requirements: 'English (IELTS 7.5+ / GRE 320)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'Politecnico di Milano': {
    the_ranking: 111, employment_rate: 91, visa_success_rate: 97, roi_score: 92, climate: 'moderate',
    internship_opportunities: 'Italian engineering consultancies, automotive firms, and design houses.',
    placement_statistics: '€35,000 starting salary. 91% placement within 6 months.',
    international_student_count: 6200, language_requirements: 'English (IELTS 6.0+)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  },
  'University of Barcelona': {
    the_ranking: 180, employment_rate: 83, visa_success_rate: 96, roi_score: 85, climate: 'warm',
    internship_opportunities: 'Local Spanish financial firms, tourism tech startups.',
    placement_statistics: '€28,000 starting salary. 85% placement within 6 months.',
    international_student_count: 4800, language_requirements: 'Spanish / English (IELTS 6.0+)',
    image_url: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=600'
  },
  'National University of Singapore (NUS)': {
    the_ranking: 11, employment_rate: 95, visa_success_rate: 94, roi_score: 96, climate: 'warm',
    internship_opportunities: 'Research at A*STAR labs, top APAC investment banking pipelines.',
    placement_statistics: '$58,000 SGD starting salary. 95% placement in 3 months.',
    international_student_count: 8500, language_requirements: 'English (IELTS 7.0+ / GRE 320)',
    image_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600'
  },
  'University of Tokyo': {
    the_ranking: 23, employment_rate: 92, visa_success_rate: 93, roi_score: 94, climate: 'moderate',
    internship_opportunities: 'Robotics labs, JAXA aerospace research, Tokyo industrial giants.',
    placement_statistics: '¥5,200,000 starting salary. 94% placement within 6 months.',
    international_student_count: 4200, language_requirements: 'English / Japanese (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1568310065099-28c0b58e7279?q=80&w=600'
  },
  'Seoul National University': {
    the_ranking: 33, employment_rate: 90, visa_success_rate: 92, roi_score: 92, climate: 'moderate',
    internship_opportunities: 'Samsung, Hyundai, and LG research sponsorships and internships.',
    placement_statistics: '₩48,000,000 starting salary. 91% placement within 6 months.',
    international_student_count: 3600, language_requirements: 'English (IELTS 6.5+)',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600'
  },
  'Khalifa University': {
    the_ranking: 181, employment_rate: 86, visa_success_rate: 96, roi_score: 89, climate: 'warm',
    internship_opportunities: 'ADNOC petroleum engineering research, UAE sustainability initiatives.',
    placement_statistics: 'AED 120,000 starting salary. 88% placement in Middle East.',
    international_student_count: 1500, language_requirements: 'English (IELTS 6.5+ / GRE 300)',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'
  }
}

export interface ScoredUniversity extends University {
  matching_score: number
  why_recommended: string
  admission_probability?: number
  scholarship_probability?: number
  roi_score?: number | null
  employment_score?: number | null
  safety_index?: number | null
  city_rating?: number | null
  nearby_companies?: string | null
  nearby_startups?: string | null
  industry_connections?: string | null
  research_labs?: string | null
  faculty_ratio?: string | null
  internship_opportunities?: string | null
  placement_statistics?: string | null
  international_student_count?: number | null
  language_requirements?: string | null
  image_url?: string | null
}

export function scoreAndFilter(universities: University[], profile: Profile): {
  safe: ScoredUniversity[]
  moderate: ScoredUniversity[]
  ambitious: ScoredUniversity[]
  dream: ScoredUniversity[]
} {
  const cgpa = profile.cgpa ?? 0
  const ielts = profile.ielts_score ?? 0
  const gre = profile.gre_score ?? 0
  const budgetUSD = profile.budget_inr ? Math.round(profile.budget_inr / 83) : Infinity
  const countries = profile.preferred_countries ?? []
  const research = profile.research_experience_months ?? 0
  const projects = profile.projects_count ?? 0
  const publications = profile.publications_count ?? 0
  const internships = profile.internships_count ?? 0
  const workExperience = profile.work_experience_months ?? 0
  const weather = profile.weather_preference ?? 'any'

  const scored: ScoredUniversity[] = universities.map(uni => {
    // Merge rich metadata
    const meta = UNIVERSITY_METADATA[uni.name] || {
      the_ranking: (uni.qs_ranking ?? 100) + 10,
      employment_rate: 85,
      visa_success_rate: 90,
      roi_score: 80,
      climate: 'moderate',
      internship_opportunities: 'Broad local student internship schemes.',
      placement_statistics: 'Standard regional placements.',
      international_student_count: 2000,
      language_requirements: 'English',
      image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600',
      safety_index: 82,
      city_rating: 8.5,
      nearby_companies: 'Local consulting firms, tech providers, regional banking offices.',
      nearby_startups: 'SaaS ventures, e-commerce firms, hardware labs.',
      industry_connections: 'Strong relationships with local engineering and business corporations.',
      research_labs: 'Primary regional research departments, digital innovation hubs.',
      faculty_ratio: '1:15'
    }

    const enrichedUni: ScoredUniversity = {
      ...uni,
      ...meta,
      matching_score: 0,
      why_recommended: ''
    }

    // 1. Core academic filters (Hard Filters for eligibility)
    const cost = (uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0)
    
    // Strict Budget cap check (exclude if cost is > 150% of budget)
    if (budgetUSD < Infinity && cost > budgetUSD * 1.5) {
      return null as any
    }

    // GPA check (exclude if student is more than 2.0 GPA below the minimum)
    if (cgpa > 0 && uni.min_cgpa && cgpa < uni.min_cgpa - 2.0) {
      return null as any
    }

    // 2. Score Calculation (Max 100 points)
    let score = 50 // Base score

    // GPA Scoring
    if (uni.min_cgpa) {
      const diff = cgpa - uni.min_cgpa
      if (diff >= 0) score += 15 // Exceeds GPA min
      else if (diff >= -0.5) score += 5 // Slightly below
      else score -= 15 // Significantly below
    }

    // IELTS Scoring
    if (uni.min_ielts && ielts > 0) {
      const diff = ielts - uni.min_ielts
      if (diff >= 0) score += 10
      else if (diff >= -0.5) score += 0
      else score -= 10
    }

    // GRE Scoring
    if (uni.min_gre && gre > 0) {
      const diff = gre - uni.min_gre
      if (diff >= 0) score += 10
      else score -= 5
    }

    // Academic achievements / Work Exp / Research Bonus (up to 15 points)
    const workBonus = Math.min(5, Math.floor(workExperience / 12) * 2)
    const researchBonus = Math.min(5, Math.floor(research / 6) * 1.5 + publications * 2)
    const practicalBonus = Math.min(5, projects * 1 + internships * 1.5)
    score += (workBonus + researchBonus + practicalBonus)

    // Country match bonus
    if (countries.length > 0) {
      if (countries.includes(uni.country)) score += 10
      else score -= 5
    }

    // Climate match bonus
    if (weather !== 'any' && meta.climate === weather) {
      score += 5
    }

    // Bound score to 0 - 100
    enrichedUni.matching_score = Math.min(100, Math.max(0, score))

    // 3. Dynamic Predictors
    enrichedUni.admission_probability = Math.round(enrichedUni.matching_score)
    
    // Scholarship prediction
    const baseSch = cgpa >= 8.5 ? 45 : cgpa >= 7.5 ? 25 : 5
    const schBonus = Math.min(45, (publications * 10) + (research * 2) + (projects * 4) + (internships * 5))
    enrichedUni.scholarship_probability = Math.min(95, baseSch + schBonus)

    // ROI and Employment details
    enrichedUni.roi_score = meta.roi_score ?? 80
    enrichedUni.employment_score = meta.employment_rate ? Math.round((meta.employment_rate / 10) * 10) / 10 : 8.5

    // Formulate concise reasoning
    const reasons: string[] = []
    if (cgpa >= (uni.min_cgpa ?? 0)) reasons.push(`CGPA (${cgpa}) meets/exceeds requirement`)
    if (research > 6 || publications > 0) reasons.push('Strong academic/research profile')
    if (workExperience >= 12) reasons.push('Valuable industry experience')
    if (countries.includes(uni.country)) reasons.push(`Matches country preference (${uni.country})`)
    if (weather !== 'any' && meta.climate === weather) reasons.push(`Climate matches (${meta.climate})`)

    enrichedUni.why_recommended = reasons.slice(0, 2).join(' & ') || 'Good baseline fit for academic and cost preferences.'

    return enrichedUni
  }).filter(Boolean)

  // Tier classification based on matching scores and academic requirements:
  return {
    safe: scored.filter(u => {
      const gpaDiff = cgpa - (u.min_cgpa ?? 0)
      return u.matching_score >= 75 && gpaDiff >= 0.3
    }),
    moderate: scored.filter(u => {
      const gpaDiff = cgpa - (u.min_cgpa ?? 0)
      return (u.matching_score >= 60 && u.matching_score < 75) || (gpaDiff >= 0 && gpaDiff < 0.3)
    }),
    ambitious: scored.filter(u => {
      const gpaDiff = cgpa - (u.min_cgpa ?? 0)
      return (u.matching_score >= 45 && u.matching_score < 60) || (gpaDiff < 0 && gpaDiff >= -0.7)
    }),
    dream: scored.filter(u => {
      const gpaDiff = cgpa - (u.min_cgpa ?? 0)
      return u.matching_score < 45 || gpaDiff < -0.7
    })
  }
}