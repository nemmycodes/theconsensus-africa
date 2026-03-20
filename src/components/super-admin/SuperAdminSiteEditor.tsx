import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SuperAdminHeader from "./SuperAdminHeader";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";

interface SectionContent {
  [key: string]: string;
}

const SuperAdminSiteEditor = () => {
  const [heroContent, setHeroContent] = useState<SectionContent>({});
  const [aboutContent, setAboutContent] = useState<SectionContent>({});
  const [leaderContent, setLeaderContent] = useState<SectionContent>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPortraitFile, setHeroPortraitFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [leaderImageFile, setLeaderImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("section_key, content");
      if (data) {
        data.forEach((row: any) => {
          const content = row.content as SectionContent;
          switch (row.section_key) {
            case "hero": setHeroContent(content); break;
            case "about_who_we_are": setAboutContent(content); break;
            case "leader": setLeaderContent(content); break;
          }
        });
      }
    };
    fetchContent();
  }, []);

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("cms-uploads")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("cms-uploads").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const saveSection = async (sectionKey: string, content: SectionContent, imageFile: File | null, imageKey: string, extraFile?: File | null, extraKey?: string) => {
    setSaving(sectionKey);
    try {
      const updatedContent = { ...content };

      if (imageFile) {
        const url = await uploadImage(imageFile, `site/${sectionKey}`);
        if (url) updatedContent[imageKey] = url;
      }

      if (extraFile && extraKey) {
        const url = await uploadImage(extraFile, `site/${sectionKey}-extra`);
        if (url) updatedContent[extraKey] = url;
      }

      const { error } = await supabase
        .from("site_content")
        .update({ content: updatedContent as any, updated_at: new Date().toISOString() })
        .eq("section_key", sectionKey);

      if (error) throw error;

      // Update local state
      switch (sectionKey) {
        case "hero": setHeroContent(updatedContent); break;
        case "about_who_we_are": setAboutContent(updatedContent); break;
        case "leader": setLeaderContent(updatedContent); break;
      }

      toast({ title: "Saved!", description: `${sectionKey} section updated successfully.` });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <SuperAdminHeader title="Website Editor" subtitle="Edit content displayed on the public website" />

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="hero" className="text-xs">Hero Section</TabsTrigger>
          <TabsTrigger value="about" className="text-xs">Who We Are</TabsTrigger>
          <TabsTrigger value="leader" className="text-xs">Leader Section</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Homepage Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Badge Text</Label>
                  <Input value={heroContent.badge || ""} onChange={(e) => setHeroContent({ ...heroContent, badge: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Highlight Word (colored)</Label>
                  <Input value={heroContent.highlight_word || ""} onChange={(e) => setHeroContent({ ...heroContent, highlight_word: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Main Heading</Label>
                <Input value={heroContent.heading || ""} onChange={(e) => setHeroContent({ ...heroContent, heading: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Paragraph 1</Label>
                <Textarea rows={4} value={heroContent.paragraph1 || ""} onChange={(e) => setHeroContent({ ...heroContent, paragraph1: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Paragraph 2</Label>
                <Textarea rows={4} value={heroContent.paragraph2 || ""} onChange={(e) => setHeroContent({ ...heroContent, paragraph2: e.target.value })} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Mentor Name</Label>
                  <Input value={heroContent.mentor_name || ""} onChange={(e) => setHeroContent({ ...heroContent, mentor_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Tagline</Label>
                  <Input value={heroContent.tagline || ""} onChange={(e) => setHeroContent({ ...heroContent, tagline: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Hero Background Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)} />
                  {heroContent.hero_bg_url && <img src={heroContent.hero_bg_url} alt="Current hero bg" className="w-32 h-20 object-cover rounded mt-1" />}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Mentor Portrait Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setHeroPortraitFile(e.target.files?.[0] || null)} />
                  {heroContent.mentor_img_url && <img src={heroContent.mentor_img_url} alt="Current portrait" className="w-24 h-32 object-cover rounded mt-1" />}
                </div>
              </div>

              <Button
                onClick={() => saveSection("hero", heroContent, heroImageFile, "hero_bg_url", heroPortraitFile, "mentor_img_url")}
                disabled={saving === "hero"}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving === "hero" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Hero Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Who We Are */}
        <TabsContent value="about">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wide">About Page — Who We Are</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Section Heading</Label>
                <Input value={aboutContent.heading || ""} onChange={(e) => setAboutContent({ ...aboutContent, heading: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Paragraph 1</Label>
                <Textarea rows={4} value={aboutContent.paragraph1 || ""} onChange={(e) => setAboutContent({ ...aboutContent, paragraph1: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Paragraph 2</Label>
                <Textarea rows={4} value={aboutContent.paragraph2 || ""} onChange={(e) => setAboutContent({ ...aboutContent, paragraph2: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Paragraph 3</Label>
                <Textarea rows={4} value={aboutContent.paragraph3 || ""} onChange={(e) => setAboutContent({ ...aboutContent, paragraph3: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Who We Are Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setAboutImageFile(e.target.files?.[0] || null)} />
                {aboutContent.image_url && <img src={aboutContent.image_url} alt="Current about image" className="w-32 h-20 object-cover rounded mt-1" />}
              </div>

              <Button
                onClick={() => saveSection("about_who_we_are", aboutContent, aboutImageFile, "image_url")}
                disabled={saving === "about_who_we_are"}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving === "about_who_we_are" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Who We Are
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leader Section */}
        <TabsContent value="leader">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Leader / Chief Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Title Label</Label>
                  <Input value={leaderContent.title_label || ""} onChange={(e) => setLeaderContent({ ...leaderContent, title_label: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Full Name</Label>
                  <Input value={leaderContent.name || ""} onChange={(e) => setLeaderContent({ ...leaderContent, name: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Quote</Label>
                <Textarea rows={3} value={leaderContent.quote || ""} onChange={(e) => setLeaderContent({ ...leaderContent, quote: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Bio / Description</Label>
                <Textarea rows={4} value={leaderContent.bio || ""} onChange={(e) => setLeaderContent({ ...leaderContent, bio: e.target.value })} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Years in Leadership</Label>
                  <Input value={leaderContent.years_in_leadership || ""} onChange={(e) => setLeaderContent({ ...leaderContent, years_in_leadership: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Mentees Active</Label>
                  <Input value={leaderContent.mentees_active || ""} onChange={(e) => setLeaderContent({ ...leaderContent, mentees_active: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Leader Photo</Label>
                <Input type="file" accept="image/*" onChange={(e) => setLeaderImageFile(e.target.files?.[0] || null)} />
                {leaderContent.image_url && <img src={leaderContent.image_url} alt="Current leader" className="w-24 h-32 object-cover rounded mt-1" />}
              </div>

              <Button
                onClick={() => saveSection("leader", leaderContent, leaderImageFile, "image_url")}
                disabled={saving === "leader"}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving === "leader" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Leader Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminSiteEditor;
