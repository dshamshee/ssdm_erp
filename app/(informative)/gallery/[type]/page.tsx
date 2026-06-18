"use client";

import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import { Image as ImageIcon, Video, Play, X, ChevronRight, Award } from "lucide-react";
import { notFound } from "next/navigation";

// Photo Items
const photoItems = [
  {
    src: "/images/gallery_campus.png",
    title: "Main Campus Entrance",
    category: "Campus",
  },
  {
    src: "/images/gallery_library.png",
    title: "Central Library",
    category: "Academics",
  },
  {
    src: "/images/gallery_classroom.png",
    title: "Smart Classroom Setup",
    category: "Technology",
  },
  {
    src: "/images/gallery_lab.png",
    title: "Science Practical Lab",
    category: "Research",
  },
  {
    src: "/images/gallery_library.png",
    title: "E-Resource Cubicles",
    category: "Technology",
  },
  {
    src: "/images/gallery_lab.png",
    title: "Chemistry Laboratory",
    category: "Research",
  },
  {
    src: "/images/gallery_campus.png",
    title: "Main Campus Gardens",
    category: "Campus",
  },
  {
    src: "/images/gallery_classroom.png",
    title: "Conference Hall Seminar",
    category: "Campus",
  },
];

// Video Items
const videoItems = [
  {
    thumbnail: "/images/gallery_campus.png",
    title: "Virtual Tour of SSDM College Campus",
    duration: "4:32",
    tag: "Campus Tour",
  },
  {
    thumbnail: "/images/principal.jpeg",
    title: "Principal's Welcome Address for New Students",
    duration: "2:45",
    tag: "Leadership",
  },
  {
    thumbnail: "/images/gallery_classroom.png",
    title: "Seminar on Women's Leadership in Science",
    duration: "8:15",
    tag: "Academic",
  },
  {
    thumbnail: "/images/gallery_lab.png",
    title: "Annual Science Exhibition & Lab Experiments",
    duration: "5:10",
    tag: "Event",
  },
];

export default function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  if (type !== "photo" && type !== "video") {
    notFound();
  }

  // State for photo filter
  const [activeFilter, setActiveFilter] = useState("All");
  // State for video modal player
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Filter photos
  const filteredPhotos =
    activeFilter === "All"
      ? photoItems
      : photoItems.filter((item) => item.category === activeFilter);

  const categories = ["All", "Campus", "Academics", "Technology", "Research"];

  // Config mock
  const config = {
    name: "SANT SANDHYA DAS MAHILA COLLEGE",
    email: "ssdm@gmail.com",
    phone: "XXXXXXXXXX",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow">
        {/* Banner */}
        <section className="bg-[#002b5b] text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-300">
              {type === "photo" ? (
                <ImageIcon className="h-3.5 w-3.5" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}{" "}
              Media Gallery
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize">
              {type === "photo" ? "Photo Gallery" : "Video Gallery"}
            </h1>
          </div>
        </section>

        {/* Content grid */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Main Gallery Area */}
            <div className="lg:col-span-9 space-y-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              {type === "photo" ? (
                <div className="space-y-6">
                  {/* Photo Filters */}
                  <div className="flex flex-wrap gap-2 border-b pb-4">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          activeFilter === cat
                            ? "bg-blue-900 text-white shadow-sm"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPhotos.map((item, i) => (
                      <div
                        key={i}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all"
                      >
                        <Image
                          src={item.src}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs md:text-sm mt-0.5">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Video Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {videoItems.map((item, i) => (
                      <div
                        key={i}
                        className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <div
                          onClick={() => setActiveVideo(item.title)}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 cursor-pointer"
                        >
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-102"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white scale-90 group-hover:scale-100 group-hover:bg-blue-900 group-hover:border-blue-800 transition-all duration-300 shadow-lg">
                              <Play className="h-6 w-6 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-slate-950/70 text-white px-2 py-0.5 rounded-full">
                            {item.duration}
                          </span>
                        </div>
                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {item.tag}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-2 leading-snug group-hover:text-blue-950 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b">
                  Gallery Navigation
                </h3>
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/gallery/photo"
                    className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      type === "photo"
                        ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Photo Gallery
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </Link>
                  <Link
                    href="/gallery/video"
                    className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      type === "video"
                        ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Video Gallery
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </Link>
                </nav>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-3">
                <Award className="h-8 w-8 text-blue-900 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">SSDM Events</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  View highlights of cultural celebrations, annual meetings,
                  seminars, and student campus achievements.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mock Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-black w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-center items-center text-white">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 bg-white/10 border border-white/20 p-2 rounded-full hover:bg-white/20 hover:scale-105 transition-all cursor-pointer z-10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center p-6 space-y-4">
              <Play className="h-16 w-16 text-blue-500 mx-auto fill-current animate-pulse" />
              <h3 className="text-lg font-bold">{activeVideo}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                [Mock Video Stream Player] This is a high-fidelity demonstration
                of video streaming playback for college events.
              </p>
            </div>
          </div>
        </div>
      )}

      <SiteFooter config={config as any} />
    </div>
  );
}
