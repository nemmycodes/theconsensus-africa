import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const genderOptions = ["Male", "Female", "Prefer not to say", "Others"];
const maritalStatusOptions = ["Married", "Divorced", "Widow", "Single"];
const socialStatusOptions = ["Orphan", "Physically Challenged", "Internally Displaced Person", "Homeless", "Working", "Not Working"];
const qualificationOptions = ["No Formal Education", "Primary School", "Secondary School", "Diploma", "NCE", "HND", "Bachelor's Degree", "Postgraduate", "Others"];
const educationStatusOptions = ["Student", "Graduate", "Out of School", "Others"];
const economicStatusOptions = ["Employed", "Self-Employed", "Trader", "Farmer", "Artisan", "Professional", "Student", "Unemployed", "Creative Professional", "Athlete", "Others"];
const sectorOptions = ["Agriculture", "Trading", "Small Business", "Technology", "Civil Service", "Education", "Professional Services", "Creative Industry", "Sports", "Others"];
const incomeOptions = ["No Income", "₦1–₦50,000", "₦50,000–₦100,000", "₦100,000–₦300,000", "₦300,000+"];
const businessOwnership = ["Yes", "No", "Planning to Start"];
const businessTypes = ["Trading", "Agriculture", "Food Processing", "Fashion", "Retail", "Technology", "Creative", "Professional Services", "Others"];
const artisanSkillsList = ["Tailoring", "Carpentry", "Welding", "Mechanics", "Electrical", "Masonry", "Plumbing", "Others"];
const creativeSkillsList = ["Music", "Photography", "Videography", "Graphic Design", "Fashion Design", "Writing", "Digital Content", "Others"];
const professionalSkillsList = ["Law", "Medicine", "Engineering", "Accounting", "Education", "IT", "Business Consulting", "Others"];
const sportTypes = ["Football", "Basketball", "Athletics", "Volleyball", "Boxing", "Others"];
const volunteerRoles = ["Community Mobilisation", "Data Collection", "Civic Education", "Programme Support", "Communications", "Others"];
const availabilityOptions = ["Full Time", "Part Time", "Event Based", "Others"];

interface KefCaresFormFieldsProps {
  form: any;
  setForm: (fn: (prev: any) => any) => void;
  toggleArrayItem: (field: "artisan_skills" | "creative_skills" | "professional_skills", item: string) => void;
}

const KefCaresFormFields = ({ form, setForm, toggleArrayItem }: KefCaresFormFieldsProps) => {
  return (
    <>
      {/* 1. Personal Information */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">1. Personal Information</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Member ID *</Label><Input value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))} required placeholder="Enter your Member ID" /></div>
          <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required /></div>
          <div><Label>Gender *</Label><Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent>{genderOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
          <div><Label>Marital Status *</Label><Select value={form.marital_status} onValueChange={v => setForm(p => ({ ...p, marital_status: v }))}><SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger><SelectContent>{maritalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Social Status *</Label><Select value={form.social_status} onValueChange={v => setForm(p => ({ ...p, social_status: v }))}><SelectTrigger><SelectValue placeholder="Select social status" /></SelectTrigger><SelectContent>{socialStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Phone Number *</Label><Input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} required /></div>
          <div className="flex items-center gap-2"><Checkbox checked={form.whatsapp_active} onCheckedChange={c => setForm(p => ({ ...p, whatsapp_active: !!c }))} /><Label>WhatsApp Active</Label></div>
          <div><Label>Email Address</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
        </div>
        <div><Label>Residential Address</Label><Textarea value={form.residential_address} onChange={e => setForm(p => ({ ...p, residential_address: e.target.value }))} /></div>
      </fieldset>

      {/* 2. Location */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">2. Location Information (Central Zone)</legend>
        <p className="text-sm text-muted-foreground">State: <strong>Plateau State</strong> | Zone: <strong>Central Zone</strong></p>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>LGA *</Label><Select value={form.lga} onValueChange={v => setForm(p => ({ ...p, lga: v }))}><SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger><SelectContent>{lgaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Ward</Label><Input value={form.ward} onChange={e => setForm(p => ({ ...p, ward: e.target.value }))} /></div>
          <div><Label>Polling Unit Name</Label><Input value={form.polling_unit} onChange={e => setForm(p => ({ ...p, polling_unit: e.target.value }))} /></div>
          <div><Label>Community / Settlement</Label><Input value={form.community} onChange={e => setForm(p => ({ ...p, community: e.target.value }))} /></div>
        </div>
      </fieldset>

      {/* 3. Education */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">3. Education Profile</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Highest Qualification</Label><Select value={form.highest_qualification} onValueChange={v => setForm(p => ({ ...p, highest_qualification: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{qualificationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Field of Study</Label><Input value={form.field_of_study} onChange={e => setForm(p => ({ ...p, field_of_study: e.target.value }))} /></div>
          <div><Label>Education Status</Label><Select value={form.education_status} onValueChange={v => setForm(p => ({ ...p, education_status: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{educationStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </fieldset>

      {/* 4. Employment */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">4. Employment & Economic Status</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Current Economic Status</Label><Select value={form.economic_status} onValueChange={v => setForm(p => ({ ...p, economic_status: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{economicStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Occupation / Profession</Label><Input value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} /></div>
          <div><Label>Primary Economic Sector</Label><Select value={form.primary_economic_sector} onValueChange={v => setForm(p => ({ ...p, primary_economic_sector: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sectorOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </fieldset>

      {/* 5. Income & Business */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">5. Income & Business Information</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Monthly Income Range</Label><Select value={form.monthly_income_range} onValueChange={v => setForm(p => ({ ...p, monthly_income_range: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{incomeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Do you own a business?</Label><Select value={form.owns_business} onValueChange={v => setForm(p => ({ ...p, owns_business: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{businessOwnership.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Business Type</Label><Select value={form.business_type} onValueChange={v => setForm(p => ({ ...p, business_type: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{businessTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </fieldset>

      {/* 6. Skills */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">6. Skills & Talents</legend>
        <div>
          <Label className="mb-2 block">Artisan Skills</Label>
          <div className="flex flex-wrap gap-3">{artisanSkillsList.map(s => (<label key={s} className="flex items-center gap-1.5 text-sm"><Checkbox checked={form.artisan_skills.includes(s)} onCheckedChange={() => toggleArrayItem("artisan_skills", s)} />{s}</label>))}</div>
        </div>
        <div>
          <Label className="mb-2 block">Creative Skills</Label>
          <div className="flex flex-wrap gap-3">{creativeSkillsList.map(s => (<label key={s} className="flex items-center gap-1.5 text-sm"><Checkbox checked={form.creative_skills.includes(s)} onCheckedChange={() => toggleArrayItem("creative_skills", s)} />{s}</label>))}</div>
        </div>
        <div>
          <Label className="mb-2 block">Professional Skills</Label>
          <div className="flex flex-wrap gap-3">{professionalSkillsList.map(s => (<label key={s} className="flex items-center gap-1.5 text-sm"><Checkbox checked={form.professional_skills.includes(s)} onCheckedChange={() => toggleArrayItem("professional_skills", s)} />{s}</label>))}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2"><Checkbox checked={form.sports_participation} onCheckedChange={c => setForm(p => ({ ...p, sports_participation: !!c }))} /><Label>Sports Participation</Label></div>
          {form.sports_participation && (
            <div><Label>Sport Type</Label><Select value={form.sport_type} onValueChange={v => setForm(p => ({ ...p, sport_type: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sportTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          )}
        </div>
      </fieldset>

      {/* 7. Programme Interest */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">7. Programme Interest</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            ["interest_entrepreneurship", "Entrepreneurship Training"],
            ["interest_agricultural", "Agricultural Support"],
            ["interest_trading", "Trading Support"],
            ["interest_skills_training", "Skills Training"],
            ["interest_economic_empowerment", "Economic Empowerment"],
            ["interest_leadership", "Leadership Development"],
            ["interest_professional_networking", "Professional Networking"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={form[key] as boolean} onCheckedChange={c => setForm(p => ({ ...p, [key]: !!c }))} />{label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 8. Volunteer */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4 w-full">8. Volunteer Participation</legend>
        <div className="flex items-center gap-2 mb-3"><Checkbox checked={form.interested_in_volunteering} onCheckedChange={c => setForm(p => ({ ...p, interested_in_volunteering: !!c }))} /><Label>Interested in Volunteering?</Label></div>
        {form.interested_in_volunteering && (
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Volunteer Role</Label><Select value={form.volunteer_role} onValueChange={v => setForm(p => ({ ...p, volunteer_role: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{volunteerRoles.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Availability</Label><Select value={form.volunteer_availability} onValueChange={v => setForm(p => ({ ...p, volunteer_availability: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{availabilityOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          </div>
        )}
      </fieldset>

      {/* 9. Consent */}
      <fieldset className="space-y-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <legend className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">9. Consent</legend>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={form.consent_given} onCheckedChange={c => setForm(p => ({ ...p, consent_given: !!c }))} className="mt-0.5" />
          <span>I consent to the collection and use of my information for KEF-CARES economic empowerment and community programmes.</span>
        </label>
      </fieldset>
    </>
  );
};

export default KefCaresFormFields;
