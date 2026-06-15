import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Read env variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/)
  if (match) {
    const key = match[1].trim()
    let val = match[2].trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    env[key] = val
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const INDIAN_SCHOLARSHIPS = [
  {
    name: 'JN Tata Endowment Loan Scholarship',
    country: 'India',
    amount_usd: 12000,
    is_fully_funded: false,
    type: 'need',
    eligible_degrees: ['Masters', 'PhD'],
    min_cgpa: 7.0,
    deadline: 'Mar 15',
    link: 'https://www.jamsetjitatatrusts.org/our-work/education/j-n-tata-endowment-for-the-higher-education-of-indians/',
    description: 'Provides loan scholarships of up to ₹10 Lakhs to Indian nationals for postgraduate studies abroad in all disciplines and countries.'
  },
  {
    name: 'Inlaks Shivdasani Foundation Scholarship',
    country: 'India',
    amount_usd: 100000,
    is_fully_funded: true,
    type: 'merit',
    eligible_degrees: ['Masters', 'PhD'],
    min_cgpa: 8.5,
    deadline: 'Mar 30',
    link: 'https://www.inlaksfoundation.org/scholarships/',
    description: 'Highly prestigious full scholarship for young Indians to study at top universities in America, UK, and Europe.'
  },
  {
    name: 'K.C. Mahindra Postgraduate Scholarship',
    country: 'India',
    amount_usd: 10000,
    is_fully_funded: false,
    type: 'merit',
    eligible_degrees: ['Masters'],
    min_cgpa: 7.5,
    deadline: 'Jul 5',
    link: 'https://www.kcmahindratrust.org/what-we-do/scholarships/k-c-mahindra-scholarship-for-post-graduate-studies-abroad/',
    description: 'Interest-free loan scholarships of up to ₹8 Lakhs for Indian graduates to pursue post-graduate studies abroad at reputable universities.'
  },
  {
    name: 'National Overseas Scholarship Scheme (NOS)',
    country: 'India',
    amount_usd: 40000,
    is_fully_funded: true,
    type: 'government',
    eligible_degrees: ['Masters', 'PhD'],
    min_cgpa: 6.0,
    deadline: 'Mar 31',
    link: 'https://nosmsje.gov.in/',
    description: 'Fully funded Government of India scholarship for low-income SC, ST, and agricultural laborer students to pursue Masters or Ph.D. abroad.'
  },
  {
    name: 'Narotam Sekhsaria Foundation Scholarship',
    country: 'India',
    amount_usd: 24000,
    is_fully_funded: false,
    type: 'need',
    eligible_degrees: ['Masters', 'PhD'],
    min_cgpa: 7.5,
    deadline: 'Mar 15',
    link: 'https://pg.nsfoundation.co.in/',
    description: 'Provides interest-free loan scholarships of up to ₹20 Lakhs to Indian students with high academic records for PG studies abroad.'
  },
  {
    name: 'Felix Scholarship',
    country: 'India',
    amount_usd: 30000,
    is_fully_funded: true,
    type: 'merit',
    eligible_degrees: ['Masters', 'PhD'],
    min_cgpa: 7.8,
    deadline: 'Jan 31',
    link: 'https://www.felixscholarship.org/',
    description: 'Enables outstanding underprivileged students from India to pursue PG studies at Oxford, Reading, or SOAS.'
  }
]

async function run() {
  console.log('Starting Indian scholarships update...')
  
  // Fetch existing scholarships
  const { data: existing, error: fetchError } = await supabase
    .from('scholarships')
    .select('*')
  
  if (fetchError) {
    console.error('Error fetching scholarships:', fetchError)
    process.exit(1)
  }

  for (const target of INDIAN_SCHOLARSHIPS) {
    const match = existing.find(s => s.name.toLowerCase() === target.name.toLowerCase())
    if (match) {
      console.log(`Updating existing scholarship: "${target.name}"`)
      const { error: updateError } = await supabase
        .from('scholarships')
        .update({
          country: target.country,
          amount_usd: target.amount_usd,
          is_fully_funded: target.is_fully_funded,
          type: target.type,
          eligible_degrees: target.eligible_degrees,
          min_cgpa: target.min_cgpa,
          deadline: target.deadline,
          link: target.link,
          description: target.description
        })
        .eq('id', match.id)
      
      if (updateError) {
        console.error(`Failed to update ${target.name}:`, updateError)
      } else {
        console.log(`Successfully updated ${target.name}`)
      }
    } else {
      console.log(`Inserting new scholarship: "${target.name}"`)
      const { error: insertError } = await supabase
        .from('scholarships')
        .insert(target)
      
      if (insertError) {
        console.error(`Failed to insert ${target.name}:`, insertError)
      } else {
        console.log(`Successfully inserted ${target.name}`)
      }
    }
  }
  
  console.log('Update complete!')
}

run()
