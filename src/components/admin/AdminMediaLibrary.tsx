import AdminHeader from "./AdminHeader";
import { Image, Upload, Folder, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminMediaLibrary = () => {
  return (
    <div>
      <AdminHeader title="Media Library" subtitle="Manage uploaded images, documents, and media files" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search media files..." className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Upload className="w-4 h-4" /> Upload Files
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Files", value: "0", icon: Image },
          { label: "Images", value: "0", icon: Image },
          { label: "Documents", value: "0", icon: Folder },
          { label: "Storage Used", value: "0 MB", icon: Folder },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">No media files yet</h3>
        <p className="text-sm text-gray-500 mb-4">Upload images, documents, and other media files to use across the platform.</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Upload className="w-4 h-4" /> Upload Your First File
        </Button>
      </div>
    </div>
  );
};

export default AdminMediaLibrary;
