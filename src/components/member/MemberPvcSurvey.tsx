import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react";

interface Props {
  onCompleted?: () => void;
  embedded?: boolean;
}

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano",
  "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

type State = Record<string, any>;

const Radio = ({ name, value, current, onChange, label }: any) => (
  <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
    <input
      type="radio"
      name={name}
      checked={current === value}
      onChange={() => onChange(value)}
      className="accent-emerald-600 w-4 h-4"
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

const Check = ({ values = [], value, onToggle, label }: any) => (
  <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
    <input
      type="checkbox"
      checked={values.includes(value)}
      onChange={() => onToggle(value)}
      className="accent-emerald-600 w-4 h-4"
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

const Field = ({ q, children }: any) => (
  <div className="space-y-2 py-3 border-b border-gray-100 last:border-0">
    <p className="font-medium text-sm text-gray-900">{q}</p>
    <div>{children}</div>
  </div>
);

const Section = ({ title, children }: any) => (
  <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 mb-5">
    <h2 className="text-lg font-bold text-emerald-700 mb-2">{title}</h2>
    <div className="divide-y divide-gray-100">{children}</div>
  </section>
);

const MemberPvcSurvey = ({ onCompleted, embedded }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [f, setF] = useState<State>({
    no_pvc_reasons: [], pvc_challenges: [], encourage_participation: [],
    election_concerns: [], reforms: [], candidate_qualities: [],
    nigeria_challenges: [], plateau_challenges: [],
  });

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: string, v: string) => setF((p) => {
    const arr = p[k] || [];
    return { ...p, [k]: arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v] };
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("pvc_surveys").select("id").eq("user_id", user.id).maybeSingle();
      if (data) setSubmitted(true);
      setLoading(false);
    })();
  }, [user]);

  const submit = async () => {
    if (!user) return;
    if (!f.gender || !f.age_range || !f.state_of_residence || !f.has_pvc) {
      toast.error("Please answer the required questions (gender, age, state, PVC status).");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("pvc_surveys").insert({ ...f, user_id: user.id });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thank you! Your responses have been recorded.");
    setSubmitted(true);
    onCompleted?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-emerald-200 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Survey Completed</h2>
        <p className="text-sm text-gray-600">
          Thank you for participating in the PVC & Electoral Participation Survey.
          Your responses will help improve voter engagement and democratic governance in Nigeria.
        </p>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "max-w-4xl mx-auto"}>
      <div className="bg-emerald-600 text-white rounded-xl p-5 md:p-6 mb-5 flex items-start gap-4">
        <ClipboardList className="w-8 h-8 shrink-0" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold">PVC & Electoral Participation Survey</h1>
          <p className="text-sm text-emerald-50 mt-1">
            As a new member, please complete this short research survey. Your input shapes our advocacy on voter participation, electoral reform, and democratic governance.
          </p>
        </div>
      </div>

      <Section title="Section A: Personal Information">
        <Field q="1. Gender">
          {["Male","Female","Prefer not to say"].map(v => (
            <Radio key={v} name="gender" value={v} current={f.gender} onChange={(x:string)=>set("gender",x)} label={v} />
          ))}
        </Field>
        <Field q="2. Age Range">
          {["18–24","25–34","35–44","45–54","55–64","65 and above"].map(v => (
            <Radio key={v} name="age_range" value={v} current={f.age_range} onChange={(x:string)=>set("age_range",x)} label={v} />
          ))}
        </Field>
        <Field q="3. State of Residence">
          <select value={f.state_of_residence || ""} onChange={(e)=>set("state_of_residence", e.target.value)}
            className="w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">Select state…</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field q="4. Local Government Area (LGA)">
          <input value={f.lga||""} onChange={(e)=>set("lga", e.target.value)}
            className="w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Your LGA" />
        </Field>
        <Field q="5. Occupation">
          {["Student","Civil Servant","Business Owner","Farmer","Artisan","Professional","Unemployed","Retired","Other"].map(v => (
            <Radio key={v} name="occupation" value={v} current={f.occupation} onChange={(x:string)=>set("occupation",x)} label={v} />
          ))}
          {f.occupation === "Other" && (
            <input value={f.occupation_other||""} onChange={(e)=>set("occupation_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify occupation" />
          )}
        </Field>
        <Field q="6. Educational Qualification">
          {["No Formal Education","Primary Education","Secondary Education","Diploma/NCE","Bachelor's Degree/HND","Postgraduate Degree","Other"].map(v => (
            <Radio key={v} name="education" value={v} current={f.education} onChange={(x:string)=>set("education",x)} label={v} />
          ))}
        </Field>
      </Section>

      <Section title="Section B: PVC Status">
        <Field q="7. Do you currently have a Permanent Voter's Card (PVC)?">
          {["Yes","No"].map(v => (
            <Radio key={v} name="has_pvc" value={v} current={f.has_pvc} onChange={(x:string)=>set("has_pvc",x)} label={v} />
          ))}
        </Field>
        {f.has_pvc === "Yes" && (
          <Field q="8. If YES, what is the status of your PVC?">
            {["Active and up-to-date","Need transfer to another polling unit","Need correction/update of personal details","Lost and need replacement","Not sure"].map(v => (
              <Radio key={v} name="pvc_status" value={v} current={f.pvc_status} onChange={(x:string)=>set("pvc_status",x)} label={v} />
            ))}
          </Field>
        )}
        {f.has_pvc === "No" && (
          <Field q="9. If NO, why do you not have a PVC? (Select all that apply)">
            {["I have never registered","Registration center was too far","Lack of information about registration","Registration process was stressful","Lack of interest in voting","Lack of trust in elections","Lost previous PVC and did not replace it","Age-related issues","Other"].map(v => (
              <Check key={v} values={f.no_pvc_reasons} value={v} onToggle={(x:string)=>toggle("no_pvc_reasons",x)} label={v} />
            ))}
            {f.no_pvc_reasons?.includes("Other") && (
              <input value={f.no_pvc_reason_other||""} onChange={(e)=>set("no_pvc_reason_other", e.target.value)}
                className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify reason" />
            )}
          </Field>
        )}
        <Field q="10. Are you willing to register for a PVC if registration is made easier?">
          {["Yes","No","Not sure"].map(v => (
            <Radio key={v} name="willing_to_register" value={v} current={f.willing_to_register} onChange={(x:string)=>set("willing_to_register",x)} label={v} />
          ))}
        </Field>
        <Field q="11. If you need PVC transfer, update, or replacement, have you attempted to do so before?">
          {["Yes","No"].map(v => (
            <Radio key={v} name="attempted_pvc_update" value={v} current={f.attempted_pvc_update} onChange={(x:string)=>set("attempted_pvc_update",x)} label={v} />
          ))}
        </Field>
        {f.attempted_pvc_update === "Yes" && (
          <Field q="12. If yes, what challenges did you encounter?">
            {["Long queues","Technical issues","Lack of information","Distance to registration center","Delays by officials","Other"].map(v => (
              <Check key={v} values={f.pvc_challenges} value={v} onToggle={(x:string)=>toggle("pvc_challenges",x)} label={v} />
            ))}
            {f.pvc_challenges?.includes("Other") && (
              <input value={f.pvc_challenges_other||""} onChange={(e)=>set("pvc_challenges_other", e.target.value)}
                className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify challenge" />
            )}
          </Field>
        )}
      </Section>

      <Section title="Section C: Electoral Participation">
        <Field q="13. Did you vote in the last general election?">
          {["Yes","No"].map(v => (
            <Radio key={v} name="voted_last_election" value={v} current={f.voted_last_election} onChange={(x:string)=>set("voted_last_election",x)} label={v} />
          ))}
        </Field>
        {f.voted_last_election === "No" && (
          <Field q="14. If NO, what was the reason?">
            {["No PVC","Security concerns","Lack of trust in the process","Was not available on election day","Health reasons","Lost interest in politics","Other"].map(v => (
              <Radio key={v} name="not_vote_reason" value={v} current={f.not_vote_reason} onChange={(x:string)=>set("not_vote_reason",x)} label={v} />
            ))}
            {f.not_vote_reason === "Other" && (
              <input value={f.not_vote_reason_other||""} onChange={(e)=>set("not_vote_reason_other", e.target.value)}
                className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify reason" />
            )}
          </Field>
        )}
        <Field q="15. How likely are you to vote in the next election?">
          {["Very likely","Likely","Undecided","Unlikely","Very unlikely"].map(v => (
            <Radio key={v} name="likely_next_election" value={v} current={f.likely_next_election} onChange={(x:string)=>set("likely_next_election",x)} label={v} />
          ))}
        </Field>
        <Field q="16. What would encourage you to participate more actively in elections? (Select all that apply)">
          {["Transparent elections","Better candidates","Improved security","Civic education","Easier voter registration process","Better economic conditions","Other"].map(v => (
            <Check key={v} values={f.encourage_participation} value={v} onToggle={(x:string)=>toggle("encourage_participation",x)} label={v} />
          ))}
          {f.encourage_participation?.includes("Other") && (
            <input value={f.encourage_participation_other||""} onChange={(e)=>set("encourage_participation_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
      </Section>

      <Section title="Section D: Confidence in the Electoral Process">
        <Field q="17. How much confidence do you have in Nigeria's electoral process?">
          {["Very high","High","Moderate","Low","Very low"].map(v => (
            <Radio key={v} name="electoral_confidence" value={v} current={f.electoral_confidence} onChange={(x:string)=>set("electoral_confidence",x)} label={v} />
          ))}
        </Field>
        <Field q="18. How would you rate the performance of INEC in recent elections?">
          {["Excellent","Good","Fair","Poor","Very Poor"].map(v => (
            <Radio key={v} name="inec_rating" value={v} current={f.inec_rating} onChange={(x:string)=>set("inec_rating",x)} label={v} />
          ))}
        </Field>
        <Field q="19. Do you believe your vote can influence election outcomes?">
          {["Yes","No","Not sure"].map(v => (
            <Radio key={v} name="vote_influence" value={v} current={f.vote_influence} onChange={(x:string)=>set("vote_influence",x)} label={v} />
          ))}
        </Field>
        <Field q="20. What are your major concerns about elections in Nigeria? (Select all that apply)">
          {["Vote buying","Election violence","Rigging/manipulation","Technical failures","Lack of transparency","Poor voter education","Security challenges","Other"].map(v => (
            <Check key={v} values={f.election_concerns} value={v} onToggle={(x:string)=>toggle("election_concerns",x)} label={v} />
          ))}
          {f.election_concerns?.includes("Other") && (
            <input value={f.election_concerns_other||""} onChange={(e)=>set("election_concerns_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
        <Field q="21. What reforms would increase your confidence in elections? (Select all that apply)">
          {["Stronger electoral laws","Electronic voting","Better result transmission","Improved security","Greater transparency","Better voter education","Other"].map(v => (
            <Check key={v} values={f.reforms} value={v} onToggle={(x:string)=>toggle("reforms",x)} label={v} />
          ))}
          {f.reforms?.includes("Other") && (
            <input value={f.reforms_other||""} onChange={(e)=>set("reforms_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
      </Section>

      <Section title="Section E: Political Preferences">
        <Field q="22. If a Presidential Election were held today, which political party would you most likely support?">
          {["APC","PDP","Labour Party","NNPP","SDP","ADC","Other","Undecided"].map(v => (
            <Radio key={v} name="preferred_party" value={v} current={f.preferred_party} onChange={(x:string)=>set("preferred_party",x)} label={v} />
          ))}
          {f.preferred_party === "Other" && (
            <input value={f.preferred_party_other||""} onChange={(e)=>set("preferred_party_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify party" />
          )}
        </Field>
        <Field q="23. If a Presidential Election were held today, who would be your preferred candidate?">
          <input value={f.preferred_president||""} onChange={(e)=>set("preferred_president", e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Candidate name" />
        </Field>
        <Field q="24. If a Governorship Election were held today in your state, who would be your preferred candidate?">
          <input value={f.preferred_governor||""} onChange={(e)=>set("preferred_governor", e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Candidate name" />
        </Field>
        <Field q="25. What are the top three qualities you look for in a candidate? (Select up to 3)">
          {["Integrity","Competence","Experience","Accountability","Youthfulness","Accessibility","Vision","Other"].map(v => (
            <Check key={v} values={f.candidate_qualities} value={v}
              onToggle={(x:string) => {
                const arr = f.candidate_qualities || [];
                if (!arr.includes(x) && arr.length >= 3) { toast.warning("Pick at most 3."); return; }
                toggle("candidate_qualities", x);
              }} label={v} />
          ))}
          {f.candidate_qualities?.includes("Other") && (
            <input value={f.candidate_qualities_other||""} onChange={(e)=>set("candidate_qualities_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
      </Section>

      <Section title="Section F: National Issues and Public Sentiment">
        <Field q="26. How would you describe the current condition of Nigeria?">
          {["Very good","Good","Fair","Poor","Very poor"].map(v => (
            <Radio key={v} name="nigeria_condition" value={v} current={f.nigeria_condition} onChange={(x:string)=>set("nigeria_condition",x)} label={v} />
          ))}
        </Field>
        <Field q="27. What are the three biggest challenges facing Nigeria today? (Select up to 3)">
          {["Economy/Inflation","Unemployment","Insecurity","Corruption","Poor Infrastructure","Education","Healthcare","Power Supply","Agriculture","Other"].map(v => (
            <Check key={v} values={f.nigeria_challenges} value={v}
              onToggle={(x:string)=>{
                const arr = f.nigeria_challenges || [];
                if (!arr.includes(x) && arr.length >= 3) { toast.warning("Pick at most 3."); return; }
                toggle("nigeria_challenges", x);
              }} label={v} />
          ))}
          {f.nigeria_challenges?.includes("Other") && (
            <input value={f.nigeria_challenges_other||""} onChange={(e)=>set("nigeria_challenges_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
        <Field q="28. How optimistic are you about Nigeria's future?">
          {["Very optimistic","Optimistic","Neutral","Pessimistic","Very pessimistic"].map(v => (
            <Radio key={v} name="optimism" value={v} current={f.optimism} onChange={(x:string)=>set("optimism",x)} label={v} />
          ))}
        </Field>
        <Field q="29. What should be the federal government's top priority in the next four years?">
          <textarea value={f.government_priority||""} onChange={(e)=>set("government_priority", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="30. What advice would you give to political leaders in Nigeria?">
          <textarea value={f.advice_leaders||""} onChange={(e)=>set("advice_leaders", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="31. What advice would you give to INEC to improve future elections?">
          <textarea value={f.advice_inec||""} onChange={(e)=>set("advice_inec", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="32. Any other comment or recommendation about Nigeria's democracy and electoral process?">
          <textarea value={f.other_comments||""} onChange={(e)=>set("other_comments", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
      </Section>

      <Section title="Section G: Plateau State Issues and Public Sentiment">
        <Field q="33. How would you describe the current condition of Plateau State?">
          {["Very good","Good","Fair","Poor","Very poor"].map(v => (
            <Radio key={v} name="plateau_condition" value={v} current={f.plateau_condition} onChange={(x:string)=>set("plateau_condition",x)} label={v} />
          ))}
        </Field>
        <Field q="34. What are the three biggest challenges facing Plateau State today? (Select up to 3)">
          {["Economy/Cost of living","Unemployment","Insecurity","Corruption","Poor Infrastructure","Education","Healthcare","Power Supply","Agriculture","Communal Conflicts","Other"].map(v => (
            <Check key={v} values={f.plateau_challenges} value={v}
              onToggle={(x:string)=>{
                const arr = f.plateau_challenges || [];
                if (!arr.includes(x) && arr.length >= 3) { toast.warning("Pick at most 3."); return; }
                toggle("plateau_challenges", x);
              }} label={v} />
          ))}
          {f.plateau_challenges?.includes("Other") && (
            <input value={f.plateau_challenges_other||""} onChange={(e)=>set("plateau_challenges_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
        <Field q="35. How optimistic are you about Plateau State's future?">
          {["Very optimistic","Optimistic","Neutral","Pessimistic","Very pessimistic"].map(v => (
            <Radio key={v} name="plateau_optimism" value={v} current={f.plateau_optimism} onChange={(x:string)=>set("plateau_optimism",x)} label={v} />
          ))}
        </Field>
        <Field q="36. What should be the Plateau State government's top priority in the next four years?">
          <textarea value={f.plateau_government_priority||""} onChange={(e)=>set("plateau_government_priority", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="37. What advice would you give to political leaders in Plateau State?">
          <textarea value={f.plateau_advice_leaders||""} onChange={(e)=>set("plateau_advice_leaders", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="38. What advice would you give to INEC Plateau to improve future elections in the state?">
          <textarea value={f.plateau_advice_inec||""} onChange={(e)=>set("plateau_advice_inec", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="39. Any other comment or recommendation about Plateau State's democracy and electoral process?">
          <textarea value={f.plateau_other_comments||""} onChange={(e)=>set("plateau_other_comments", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
      </Section>


      <Section title="Section F: National Issues and Public Sentiment">
        <Field q="27. How would you describe the current condition of Nigeria?">
          {["Very good","Good","Fair","Poor","Very poor"].map(v => (
            <Radio key={v} name="nigeria_condition" value={v} current={f.nigeria_condition} onChange={(x:string)=>set("nigeria_condition",x)} label={v} />
          ))}
        </Field>
        <Field q="28. What are the three biggest challenges facing Nigeria today? (Select up to 3)">
          {["Economy/Inflation","Unemployment","Insecurity","Corruption","Poor Infrastructure","Education","Healthcare","Power Supply","Agriculture","Other"].map(v => (
            <Check key={v} values={f.nigeria_challenges} value={v}
              onToggle={(x:string)=>{
                const arr = f.nigeria_challenges || [];
                if (!arr.includes(x) && arr.length >= 3) { toast.warning("Pick at most 3."); return; }
                toggle("nigeria_challenges", x);
              }} label={v} />
          ))}
          {f.nigeria_challenges?.includes("Other") && (
            <input value={f.nigeria_challenges_other||""} onChange={(e)=>set("nigeria_challenges_other", e.target.value)}
              className="mt-2 w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Specify" />
          )}
        </Field>
        <Field q="29. How optimistic are you about Nigeria's future?">
          {["Very optimistic","Optimistic","Neutral","Pessimistic","Very pessimistic"].map(v => (
            <Radio key={v} name="optimism" value={v} current={f.optimism} onChange={(x:string)=>set("optimism",x)} label={v} />
          ))}
        </Field>
        <Field q="30. What should be the government's top priority in the next four years?">
          <textarea value={f.government_priority||""} onChange={(e)=>set("government_priority", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="31. What advice would you give to political leaders in Nigeria?">
          <textarea value={f.advice_leaders||""} onChange={(e)=>set("advice_leaders", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="32. What advice would you give to INEC to improve future elections?">
          <textarea value={f.advice_inec||""} onChange={(e)=>set("advice_inec", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
        <Field q="33. Any other comment or recommendation about Nigeria's democracy and electoral process?">
          <textarea value={f.other_comments||""} onChange={(e)=>set("other_comments", e.target.value)}
            rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </Field>
      </Section>

      <div className="flex justify-end gap-3 pb-10">
        <button
          onClick={submit}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Survey
        </button>
      </div>
    </div>
  );
};

export default MemberPvcSurvey;
