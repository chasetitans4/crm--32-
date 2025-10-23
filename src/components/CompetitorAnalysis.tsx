"use client";

import React, { useState, useMemo } from "react"
import {
    Search,
    Plus,
    X,
    ExternalLink,
    Download,
    BarChart2,
    Globe,
    TrendingUp,
    Award,
    AlertTriangle,
    Trash2,
    ShieldCheck,
    Key,
    FileText,
    Layers,
    Target,
} from "lucide-react"

// For standalone demo, we'll create a mock context hook.
const useMockAppContext = () => ({
    state: {
        clients: [
            { id: 1, name: "Sunrise Innovations" },
            { id: 2, name: "Peak Performance Co." },
            { id: 3, name: "Riverbend Solutions" },
        ],
    },
});

// --- TYPE DEFINITIONS ---
interface Competitor {
    id: number
    name: string
    url: string
    date: string
    associatedClientId?: string;
    metrics: {
        trafficScore: number
        seoScore: number
        speedScore: number
        designScore: number
        mobileScore: number
        socialScore: number
    }
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    keywords: {
        top: string[];
        opportunities: string[];
    };
    topContent: {
        title: string;
        url: string;
        monthlyViews: number;
    }[];
    techStack: string[];
}

type SwotType = "Strengths" | "Weaknesses" | "Opportunities";

// --- REUSABLE SUB-COMPONENTS ---

const MetricScoreCard = ({ title, score }: { title: string; score: number }) => {
    const getScoreColor = (s: number) => (s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600");
    const getScoreBgColor = (s: number) => (s >= 80 ? "bg-green-100" : s >= 60 ? "bg-yellow-100" : "bg-red-100");

    return (
        <div className={`p-4 rounded-lg ${getScoreBgColor(score)}`}>
            <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-xs text-gray-500">/ 100</div>
        </div>
    );
};

const SWOTList = ({ title, items, type }: { title: string, items: string[], type: SwotType }) => {
    const config = {
        "Strengths": { icon: <Award size={18} />, color: "green", titleColor: "text-green-700" },
        "Weaknesses": { icon: <AlertTriangle size={18} />, color: "red", titleColor: "text-red-700" },
        "Opportunities": { icon: <TrendingUp size={18} />, color: "blue", titleColor: "text-blue-700" },
    };
    const { icon, color, titleColor } = config[type];
    return (
        <div className="border rounded-lg p-4 bg-gray-50/50 h-full">
            <h4 className={`font-semibold mb-3 flex items-center gap-2 ${titleColor}`}>{icon}{title}</h4>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={`${type}-${index}`} className="text-sm text-gray-800 flex items-start gap-2">
                        <span className={`text-${color}-500 mt-1`}>›</span><span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RecommendationsView = ({ competitor }: { competitor: Competitor }) => (
    <div className="border rounded-lg p-4 mt-6 bg-white">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" />Competitive Advantage Recommendations</h4>
        <div className="space-y-3">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"><div className="font-medium text-indigo-800">Website Design</div><p className="text-sm mt-1 text-indigo-700">{competitor.metrics.designScore < 70 ? `${competitor.name}'s website design scores below average at ${competitor.metrics.designScore}/100. Highlight your modern, user-friendly design as a key differentiator.` : `${competitor.name} has a strong design score of ${competitor.metrics.designScore}/100. Focus on specific design elements where you can outperform them.`}</p></div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"><div className="font-medium text-indigo-800">SEO Strategy</div><p className="text-sm mt-1 text-indigo-700">{competitor.metrics.seoScore < 70 ? `With an SEO score of only ${competitor.metrics.seoScore}/100, ${competitor.name} is vulnerable in search rankings. Emphasize how your SEO-optimized website will help clients outrank them.` : `${competitor.name} has invested in SEO with a score of ${competitor.metrics.seoScore}/100. Your pitch should include a comprehensive SEO strategy that targets specific keywords they may be missing.`}</p></div>
        </div>
    </div>
);

const RadialProgress = ({ score }: { score: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
    const trackColor = score >= 80 ? 'text-green-100' : score >= 60 ? 'text-yellow-100' : 'text-red-100';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle className={`stroke-current ${trackColor}`} strokeWidth="10" fill="transparent" r={radius} cx="60" cy="60" />
                <circle
                    className={`stroke-current ${color} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                 <span className={`text-3xl font-bold ${color.replace('500', '600')}`}>{score}</span>
                 <span className="text-xs text-gray-500">Overall</span>
            </div>
        </div>
    );
};

const AnalysisDetailView = ({ competitor, onGeneratePDF }: { competitor: Competitor; onGeneratePDF: () => void }) => {
    const overallScore = useMemo(() => {
        const { metrics } = competitor;
        const allScores = Object.values(metrics);
        return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    }, [competitor]);

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b">
                <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold">{competitor.name}</h3>
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"><Globe size={14} />{competitor.url.replace(/^https?:\/\//, "")}</a>
                </div>
                <div className="flex gap-2">
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"><ExternalLink size={14} /> Visit</a>
                    <button onClick={onGeneratePDF} className="text-gray-700 flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"><Download size={14} /> Export</button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                     <RadialProgress score={overallScore} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                    <MetricScoreCard title="Traffic" score={competitor.metrics.trafficScore} /><MetricScoreCard title="SEO" score={competitor.metrics.seoScore} /><MetricScoreCard title="Speed" score={competitor.metrics.speedScore} /><MetricScoreCard title="Design" score={competitor.metrics.designScore} /><MetricScoreCard title="Mobile" score={competitor.metrics.mobileScore} /><MetricScoreCard title="Social" score={competitor.metrics.socialScore} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <SWOTList title="Strengths" items={competitor.strengths} type="Strengths" /><SWOTList title="Weaknesses" items={competitor.weaknesses} type="Weaknesses" /><SWOTList title="Opportunities" items={competitor.opportunities} type="Opportunities" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50/50"><h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800"><Key size={18} className="text-amber-600"/>Keyword Analysis</h4><div className="space-y-4"><div><h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1"><Target size={14}/>Top Keywords</h5><div className="flex flex-wrap gap-2">{competitor.keywords.top.map(k=>(<span key={k} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{k}</span>))}</div></div><div><h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1 text-teal-700"><TrendingUp size={14}/>Keyword Opportunities</h5><div className="flex flex-wrap gap-2">{competitor.keywords.opportunities.map(k=>(<span key={k} className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{k}</span>))}</div></div></div></div>
                <div className="border rounded-lg p-4 bg-gray-50/50"><h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800"><FileText size={18} className="text-sky-600"/>Top Performing Content</h4><ul className="space-y-3">{competitor.topContent.map(c=>(<li key={c.title} className="text-sm"><a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">{c.title}</a><p className="text-xs text-gray-500">{c.monthlyViews.toLocaleString()} monthly views</p></li>))}</ul></div>
            </div>

            <div className="border rounded-lg p-4 mt-6 bg-gray-50/50"><h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800"><Layers size={18} className="text-violet-600"/>Technology Stack</h4><div className="flex flex-wrap gap-2">{competitor.techStack.map(t=>(<span key={t} className="text-sm bg-gray-200 text-gray-800 px-2.5 py-1 rounded-md">{t}</span>))}</div></div>
            
            <RecommendationsView competitor={competitor} />
        </>
    );
};

// ... other components (CompetitorListItem, AddCompetitorModal, ConfirmationModal) remain the same

const CompetitorListItem = ({ competitor, isSelected, onSelect, onDelete }: { competitor: Competitor, isSelected: boolean, onSelect: () => void, onDelete: () => void }) => {
    return (
        <div className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group relative ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`} onClick={onSelect}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete competitor"><Trash2 size={16} /></button>
            <div className="font-medium pr-6">{competitor.name}</div>
            <div className="text-sm text-gray-500">Analyzed: {competitor.date}</div>
        </div>
    );
};
const AddCompetitorModal = ({ isOpen, onClose, onAnalyze, clients }: { isOpen: boolean; onClose: () => void; onAnalyze: (url: string, clientId: string) => Promise<void>; clients: { id: number, name: string }[] }) => {
    const [url, setUrl] = useState("");
    const [selectedClientId, setSelectedClientId] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    if (!isOpen) return null;
    const handleAnalyze = () => {
        setIsAnalyzing(true);
        onAnalyze(url, selectedClientId).finally(() => { setIsAnalyzing(false); setUrl(""); setSelectedClientId(""); });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Analyze New Competitor</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal"><X size={20} /></button></div><div className="space-y-4"><div><label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 mb-1">Competitor Website URL</label><input type="url" id="competitorUrl" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full border rounded-md px-3 py-2" required /></div><div><label htmlFor="clientSelect" className="block text-sm font-medium text-gray-700 mb-1">Associate with Client (Optional)</label><select id="clientSelect" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full border rounded-md px-3 py-2"><option value="">No specific client</option>{clients.map((client) => (<option key={client.id} value={client.id}>{client.name}</option>))}</select></div></div><div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button><button type="button" onClick={handleAnalyze} disabled={isAnalyzing || !url} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{isAnalyzing ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Analyzing...</>) : (<><Search size={16} />Analyze</>)}</button></div></div>
        </div>
    );
};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><div className="mt-2 text-sm text-gray-600">{children}</div><div className="flex justify-end gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Confirm</button></div></div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const CompetitorAnalysis: React.FC = () => {
    const { state } = useMockAppContext();
    const { clients } = state;

    const [competitors, setCompetitors] = useState<Competitor[]>([
        { id: 1, name: "ABC Plumbing", url: "https://abcplumbing.com", date: "2025-05-10", metrics: { trafficScore: 72, seoScore: 68, speedScore: 85, designScore: 65, mobileScore: 90, socialScore: 45 }, strengths: ["Strong local SEO", "Fast loading website"], weaknesses: ["Limited content marketing", "Outdated design"], opportunities: ["Improve content marketing"], keywords: { top: ["plumber near me", "emergency plumber", "drain cleaning"], opportunities: ["tankless water heater installation", "commercial plumbing services"] }, topContent: [{ title: "5 Signs You Need a New Water Heater", url: "#", monthlyViews: 1200 }, { title: "DIY Fix for a Leaky Faucet", url: "#", monthlyViews: 850 }], techStack: ["WordPress", "Yoast SEO", "Google Analytics", "Mailchimp"] },
        { id: 2, name: "XYZ Dental", url: "https://xyzdental.com", date: "2025-05-08", metrics: { trafficScore: 85, seoScore: 78, speedScore: 62, designScore: 88, mobileScore: 75, socialScore: 80 }, strengths: ["Modern design", "Strong content marketing"], weaknesses: ["Slow page load times", "Poor mobile experience"], opportunities: ["Improve website speed"], keywords: { top: ["cosmetic dentistry", "invisalign", "teeth whitening"], opportunities: ["dental implants financing", "pediatric dentist reviews"] }, topContent: [{ title: "Invisalign vs. Braces: Which is Right for You?", url: "#", monthlyViews: 2500 }, { title: "The Benefits of Regular Dental Checkups", url: "#", monthlyViews: 1500 }], techStack: ["React", "Next.js", "Vercel", "Stripe", "Contentful"] },
    ]);
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(competitors[0] || null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [competitorToDelete, setCompetitorToDelete] = useState<Competitor | null>(null);

    const filteredCompetitors = useMemo(() =>
        competitors.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [competitors, searchQuery]
    );

    const handleAnalyzeCompetitor = (url: string, associatedClientId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            let domain, name;
            try {
                const fullUrl = url.startsWith('http') ? url : `https://` + url;
                new URL(fullUrl); // for validation
                domain = new URL(fullUrl).hostname.replace("www.", "");
                name = domain.split(".")[0];
                name = name.charAt(0).toUpperCase() + name.slice(1);
            } catch (error) {
                alert("Please enter a valid URL (e.g., https://example.com)");
                reject(error); return;
            }

            setTimeout(() => {
                const newCompetitor: Competitor = {
                    id: Date.now(), name, url: `https://${domain}`, date: new Date().toISOString().split("T")[0], associatedClientId,
                    metrics: { trafficScore: Math.floor(Math.random() * 50) + 45, seoScore: Math.floor(Math.random() * 50) + 45, speedScore: Math.floor(Math.random() * 50) + 45, designScore: Math.floor(Math.random() * 50) + 45, mobileScore: Math.floor(Math.random() * 50) + 45, socialScore: Math.floor(Math.random() * 50) + 45 },
                    strengths: ["Generated Strength 1", "Generated Strength 2"], weaknesses: ["Generated Weakness 1", "Generated Weakness 2"], opportunities: ["Generated Opportunity 1"],
                    keywords: { top: ["gen keyword 1", "gen keyword 2"], opportunities: ["opportunity 1", "opportunity 2"] },
                    topContent: [{ title: "Generated Top Post", url: "#", monthlyViews: Math.floor(Math.random() * 2000) + 500 }],
                    techStack: ["Shopify", "Klaviyo", "Google Analytics"],
                };
                setCompetitors(prev => [newCompetitor, ...prev]);
                setSelectedCompetitor(newCompetitor);
                setShowAddModal(false);
                resolve();
            }, 2000);
        });
    };
    
    const confirmDelete = () => {
        if (!competitorToDelete) return;
        const remainingCompetitors = competitors.filter(c => c.id !== competitorToDelete.id);
        setCompetitors(remainingCompetitors);
        if (selectedCompetitor?.id === competitorToDelete.id) {
            // Select the next competitor in the filtered list, or null if empty
            const nextIndex = filteredCompetitors.findIndex(c => c.id === competitorToDelete.id);
            const newSelection = remainingCompetitors.length > 0 ? (remainingCompetitors[nextIndex] || remainingCompetitors[0]) : null;
            setSelectedCompetitor(newSelection);
        }
        setCompetitorToDelete(null);
    };

    const generatePDFReport = () => {
        alert("This would trigger a PDF download of the selected competitor's analysis.");
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Competitor Analysis</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={16} /> Analyze Competitor
                </button>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-1 self-start">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search competitors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                        {filteredCompetitors.length > 0 ? (
                            filteredCompetitors.map((c) => (
                                <CompetitorListItem key={c.id} competitor={c} isSelected={selectedCompetitor?.id === c.id} onSelect={() => setSelectedCompetitor(c)} onDelete={() => setCompetitorToDelete(c)} />
                            ))
                        ) : (<div className="text-center py-10 text-gray-500"><p>No competitors found.</p></div>)}
                    </div>
                </aside>
                <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
                    {selectedCompetitor ? (
                        <AnalysisDetailView competitor={selectedCompetitor} onGeneratePDF={generatePDFReport} />
                    ) : (
                        <div className="text-center h-full flex flex-col items-center justify-center text-gray-500 min-h-[75vh]">
                            <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No Competitor Selected</h3>
                            <p className="mb-4">Select a competitor or analyze a new one.</p>
                            <button onClick={() => setShowAddModal(true)} className="text-blue-600 flex items-center gap-1 mx-auto hover:underline">
                                <Plus size={16} /> Analyze New Competitor
                            </button>
                        </div>
                    )}
                </section>
            </main>
            <AddCompetitorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAnalyze={handleAnalyzeCompetitor} clients={clients} />
            <ConfirmationModal isOpen={!!competitorToDelete} onClose={() => setCompetitorToDelete(null)} onConfirm={confirmDelete} title="Delete Competitor?">
                <p>Are you sure you want to delete the analysis for <strong>{competitorToDelete?.name}</strong>? This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

export default CompetitorAnalysis;
