import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Share2 } from "lucide-react";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";

const newsItems = [
  {
    image: news1,
    date: "OCTOBER 24, 2024",
    title: "Chief Kefas Ropshik Wungak Outlines Vision for Northern Development",
    description: "The party's chairman addressed a massive crowd in Kano, focusing on agricultural modernization and solar energy infrastructure for the North.",
    comments: 24,
  },
  {
    image: news2,
    date: "OCTOBER 21, 2024",
    title: "Consensus Party Launches Digital Membership Identification Card",
    description: "A landmark move in Nigerian politics, the new ID system uses blockchain technology to ensure membership integrity and voting transparency.",
    comments: 89,
  },
];

const NewsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">News Feed</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Latest Updates</h2>
          </div>
          <a href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            View News Archive <ArrowRight size={14} />
          </a>
        </motion.div>

        <div className="space-y-6">
          {newsItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors group cursor-pointer"
            >
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-xs font-bold text-primary tracking-wider">{item.date}</span>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {item.comments} Comments</span>
                  <span className="flex items-center gap-1"><Share2 size={12} /> Share</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
