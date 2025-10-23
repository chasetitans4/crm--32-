"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, Copy, X, Maximize, Minimize } from "lucide-react" // Added Maximize, Minimize
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDraggable } from "@/hooks/useDraggable" // Import the new hook
import { sanitizeHTML } from "@/utils/security"

interface SalesScript {
  id: string
  title: string
  category: string
  purpose: string
  content: string
  isHtml?: boolean // New field to indicate if content is HTML
}

const initialScriptsData: SalesScript[] = [
  {
    id: "1",
    title: "Initial Client Outreach",
    category: "Cold Call",
    purpose: "To introduce our services and qualify the lead.",
    content: `
      Hello [Prospect Name], this is [Your Name] from [Your Company].
      We specialize in [briefly mention service].
      I'm calling because I noticed [specific detail about their business].
      Would you be open to a quick 5-minute chat about how we could help you [achieve a benefit]?
    `,
  },
  {
    id: "2",
    title: "Follow-up after Demo",
    category: "Follow-up",
    purpose: "To reiterate value and schedule next steps.",
    content: `
      Hi [Prospect Name], this is [Your Name] from [Your Company].
      Following up on our demo on [Date]. I wanted to see if you had any questions
      after reviewing the [product/service] we discussed.
      Are you available for a quick call tomorrow to discuss next steps?
    `,
  },
  {
    id: "3",
    title: "Objection Handling: Price",
    category: "Objection Handling",
    purpose: "To address price concerns and reframe value.",
    content: `
      I understand budget is a concern. Many of our clients initially feel that way.
      However, they've found that the ROI from our solution far outweighs the initial investment.
      Could we explore a tiered option that fits your current budget and still delivers results?
    `,
  },
  {
    id: "4",
    title: "Pixel Works Cold Call Sales Script: Enhanced Conversions Edition",
    category: "Cold Call",
    purpose:
      "To engage prospects, uncover pain points, articulate value, and secure next steps for web design and local SEO services.",
    isHtml: true,
    content: `
      <div class="side-note">
        <p>(Your goal: Respect their time, establish relevance, and pique curiosity.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 1: The Engaging Opening</div>
        <p><span class="font-bold">Sales Rep:</span> "Hi <span class="font-bold">[Prospect's Name]</span>, this is <span class="font-bold">[Your Name]</span> from Pixel Works. How are you doing today?"</p>
        <p class="italic-note">(Pause for their response. If they say "busy," acknowledge it and proceed.)</p>
        <p><span class="font-bold">Sales Rep:</span> "I totally get it, everyone's slammed these days. I'll be quick – I noticed <span class="font-bold">[a specific, recent detail about their business/website, e.g., 'your website design looks a bit outdated,']</span>. We've been helping businesses like yours in <span class="font-bold">[their industry]</span> like <span class="font-bold">[mention 1-2 similar client names if applicable, or just 'other businesses similar to yours']</span> to really boost their online presence and conversions. Do you have just two minutes for me to share a quick thought on how we might do that for you?"</p>
      </div>
      <div class="side-note">
        <p>(Your goal: Get them talking, understand their challenges, and position Pixel Works as a problem-solver.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 2: Uncovering Pain Points (Discovery Dialogue)</div>
        <p><span class="font-bold">Sales Rep:</span> "Great, thanks! So, at Pixel Works, we build conversion-focused websites and digital strategies. Many small businesses we talk to struggle with things like <span class="font-bold">[choose 1-2 relevant pain points based on your research/their observed need, e.g., 'converting website visitors into actual customers,' 'generating enough qualified leads,' or 'attracting local customers through their online presence']</span>. What's the biggest challenge you're currently facing when it comes to your website's performance or turning visitors into leads/sales?"</p>
        <p class="italic-note">(Listen actively and take notes. Ask follow-up questions based on their response.)</p>
        <p><span class="font-bold">Sales Rep:</span> "Thanks for sharing that, I can definitely see how <span class="font-bold">[rephrase their pain point in your own words to show understanding]</span> could be frustrating. What steps have you taken so far to improve <span class="font-bold">[their specific pain point, e.g., 'your website's conversion rate,' 'getting more leads,' or 'improving local visibility']</span>, and what's been missing from those efforts?"</p>
      </div>
      <div class="side-note">
        <p>(Your goal: Connect their pain points directly to Pixel Works' solutions with quantifiable benefits.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 3: Articulating Value & ROI (The "ROI Story")</div>
        <p><span class="font-bold">Sales Rep:</span> "That makes a lot of sense. At Pixel Works, our approach is all about making sure your website and digital presence actively work to convert visitors into customers. By implementing <span class="font-bold">[briefly mention 1-2 relevant services, e.g., 'a user-centric website redesign focused on clear calls-to-action and mobile optimization,' 'conversion rate optimization (CRO) strategies and an improved customer journey,' or 'targeted local SEO services to drive more relevant traffic,']</span> we were able to increase their online inquiries by <span class="font-bold">[specific quantifiable result, e.g., '25% in three months']</span> and improve their overall website conversion rate by <span class="font-bold">[another quantifiable result, e.g., '15%']</span>.</p>
        <p>"Our platform helps businesses like yours cut through the noise and achieve <span class="font-bold">more website conversions, generate more qualified leads, and increase local traffic through improved online visibility</span>. Crucially, we don't just promise results – we can **calculate and demonstrate the tangible increase in your overall profits** that comes from a high-performing web design combined with strategic local SEO. You mentioned <span class="font-bold">[reiterate their specific pain point]</span> – imagine if we could optimize your current web design to directly address that and show you exactly what's working, and the clear financial impact it will have."</p>
      </div>
      <div class="side-note">
        <p>(Your goal: Address concerns, reinforce value, and secure a clear call to action.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 4: Handling Objections & Guiding to Next Steps</div>
        <p><span class="font-bold">Sales Rep:</span> "Does that resonate with anything you're experiencing, or do you have any questions about how we achieve those kinds of results?"</p>
        <p class="italic-note">(Anticipate and prepare for common objections as per your research, e.g., "It's too expensive," "I don't see how this can help me," "This isn't a priority right now," "We're already working with someone.")</p>
        <p class="mt-4"><span class="font-bold">If they raise an objection (e.g., "It's too expensive"):</span></p>
        <p><span class="font-bold">Sales Rep:</span> "I totally understand the budget concern, <span class="font-bold">[Prospect's Name]</span>. Many of our clients have felt that way initially. What we've found is that the cost of <span class="italic">not</span> having an effective online presence, like <span class="font-bold">[reiterate their specific pain point, e.g., 'losing potential customers due to a poor website experience,' or 'their website not generating enough leads']</span>, often outweighs the investment in a solution that brings in measurable ROI. Would you be open to a quick 15-minute call where I could show you some of our tiered options and we can explore what might be a good fit for your current growth and budget?"</p>
        <p class="mt-4"><span class="font-bold">If they seem interested/no major objections:</span></p>
        <p><span class="font-bold">Sales Rep:</span> "Given what we've discussed about <span class="font-bold">[reiterate their main pain point/goal]</span> and how Pixel Works has helped businesses like yours achieve <span class="font-bold">[mention a key benefit/result related to conversions/design/leads/traffic]</span>, would you be open to a quick, no-pressure demo this week where we can show you exactly how we'd approach <span class="font-bold">[their specific web design/conversion challenge]</span> for your business and answer any questions you might have?"</p>
      </div>
      <div class="side-note">
        <p>(Your goal: Be clear and confident about the next action.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 5: Confirming the Next Step / Introducing the Quote</div>
        <p><span class="font-bold">Sales Rep:</span> "How does <span class="font-bold">[suggest a specific day and time, e.g., 'Wednesday at 10 AM or Thursday at 2 PM Central Time']</span> look for a brief chat to show you exactly how we'd implement this and get a precise quote tailored to your business?"</p>
        <p class="italic-note">(If the prospect agrees to a demo/quote presentation call, schedule it. If they are very eager and the conversation has been exceptionally strong, you might pivot to a brief quote introduction here.)</p>
        <p class="mt-4"><span class="font-bold">Sales Rep (If proceeding with quote on this call):</span> "Excellent, [Prospect's Name]. Based on our conversation about your need to [reiterate pain point, e.g., 'increase conversions' and 'generate more local leads'], we've outlined a solution that includes a modern web design with integrated local SEO. For a comprehensive package that covers <span class="font-bold">custom web design with up to 7 design revisions, 3 months of dedicated local SEO, 1 year of website hosting, and a prominent 'Click to Call' button for immediate customer engagement</span>, the investment would be [**State the price clearly, e.g., '$X,XXX' or 'starting at $X,XXX'**]. This is designed to deliver a clear [mention quantifiable benefit, e.g., 'increase in inquiries by Y%' or 'profit increase of Z% annually'] that we discussed."</p>
        <p class="italic-note">(Pause for their reaction. Be prepared to address initial price shock by re-emphasizing ROI.)</p>
        <p class="mt-4"><span class="font-bold">Sales Rep:</span> "Considering the impact this will have on [reiterate main benefit, e.g., 'your lead generation and overall profit'], does that sound like a viable investment to move forward and get this process started?"</p>
        <p class="italic-note">(Listen for approval. If they agree, proceed to the next steps.)</p>
      </div>
      <div class="side-note">
        <p>(Your goal: Secure the agreement and formalize the partnership.)</p>
      </div>
      <div class="script-section">
        <div class="sub-section-title">Phase 6: Gaining Approval & Sending Agreement</div>
        <p><span class="font-bold">Sales Rep (Upon verbal approval):</span> "Fantastic, [Prospect's Name]! That's great news. We're really excited to help you achieve [reiterate their goal, e.g., 'those increased conversions and leads'].</p>
        <p class="mt-4"><span class="font-bold">Sales Rep:</span> "The next step is quick and easy. I'll send over a digital agreement to your email at [confirm email address]. It will outline everything we've discussed: the web design, local SEO services, the investment, and the project timeline. You can review it, and it's set up for easy e-signature.</p>
        <p class="mt-4"><span class="font-bold">Sales Rep:</span> "I'll send that over immediately after this call. Can you confirm you'll be able to review and sign that today, so we can get started on your project right away?"</p>
        <p class="italic-note">(Confirm their commitment to signing. If they can't sign today, agree on a specific time frame.)</p>
        <p class="mt-4"><span class="font-bold">Sales Rep:</span> "Perfect. Once that's signed, our project manager, [Project Manager's Name], will reach out within [e.g., '24-48 hours'] to schedule your kick-off call and we'll begin bringing your new online presence to life. Thank you so much for your time today, [Prospect's Name]. I look forward to us working together!"</p>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 text-center">Key Principles Applied from Your Research:</h2>
      <ul class="list-disc list-inside text-gray-700 space-y-2">
        <li><span class="font-bold">Respect for Time:</span> "Do you have just two minutes..."</li>
        <li><span class="font-bold">Pre-Call Research & Personalization:</span> Opening lines reference specific details.</li>
        <li><span class="font-bold">Problem/Benefit Focus:</span> Immediately addresses challenges and offers solutions.</li>
        <li><span class="font-bold">Dialogue-First Approach:</span> Probing questions encourage the prospect to speak.</li>
        <li><span class="font-bold">Measurable ROI & Value Articulation:</span> Quantifiable results from case studies.</li>
        <li><span class="font-bold">Anticipating Objections:</span> Prepared responses for common concerns.</li>
        <li><span class="font-bold">Clear Call to Action:</span> Guides the prospect to a definitive next step.</li>
        <li><span class="font-bold">Focus on Small Business Pain Points:</span> Directly addresses common SMB struggles.</li>
        <li><span class="font-bold">Pixel Works Branding:</span> Integrated your agency's name and value proposition.</li>
      </ul>
      <p class="text-gray-700 mt-6 text-center">This script provides a strong framework, but remember, the "perfect" script is a <span class="font-bold">living document</span>. Encourage your sales team to practice, collect feedback (both qualitative from calls and quantitative from AI tools if available), and continuously refine it based on what genuinely resonates with your prospects.</p>
    `,
  },
]

const SalesScripts: React.FC = () => {
  const [scripts, setScripts] = useState<SalesScript[]>(initialScriptsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedScript, setSelectedScript] = useState<SalesScript | null>(null)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [currentScript, setCurrentScript] = useState<SalesScript>({
    id: "",
    title: "",
    category: "",
    purpose: "",
    content: "",
    isHtml: false,
  })
  const [isScriptViewFullScreen, setIsScriptViewFullScreen] = useState(false) // State for script view full screen
  const [isAddEditFullScreen, setIsAddEditFullScreen] = useState(false) // State for add/edit full screen

  const { style: scriptViewStyle, onMouseDown: onScriptViewMouseDown } = useDraggable()
  const { toast } = useToast()

  const filteredScripts = scripts.filter(
    (script) =>
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddScript = () => {
    setCurrentScript({
      id: (scripts.length + 1).toString(),
      title: "",
      category: "",
      purpose: "",
      content: "",
      isHtml: false,
    })
    setIsAddEditModalOpen(true)
    setIsAddEditFullScreen(false) // Reset full screen on open
  }

  const handleEditScript = (script: SalesScript) => {
    setCurrentScript({ ...script })
    setIsAddEditModalOpen(true)
    setIsAddEditFullScreen(false) // Reset full screen on open
  }

  const handleDeleteScript = (id: string) => {
    setScripts(scripts.filter((script) => script.id !== id))
    setSelectedScript(null)
    toast({
      title: "Script Deleted",
      description: "The sales script has been successfully deleted.",
      variant: "destructive",
    })
  }

  const handleSaveScript = () => {
    if (currentScript.id) {
      // Edit existing script
      setScripts(scripts.map((script) => (script.id === currentScript.id ? currentScript : script)))
      setSelectedScript(currentScript)
      toast({
        title: "Script Updated",
        description: "The sales script has been successfully updated.",
      })
    } else {
      // Add new script
      const newId = (Math.max(...scripts.map((s) => Number.parseInt(s.id)), 0) + 1).toString()
      const scriptToAdd = { ...currentScript, id: newId }
      setScripts([...scripts, scriptToAdd])
      setSelectedScript(scriptToAdd)
      toast({
        title: "Script Added",
        description: "A new sales script has been successfully added.",
      })
    }
    setIsAddEditModalOpen(false)
    setIsAddEditFullScreen(false)
  }

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to Clipboard",
      description: "The script content has been copied to your clipboard.",
    })
  }

  return (
    <div className="p-8 fade-in bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sales Scripts
        </h2>
        <Button
          onClick={handleAddScript}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <Plus size={18} />
          Add New Script
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search scripts by title, category, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScripts.length > 0 ? (
          filteredScripts.map((script) => (
            <Card
              key={script.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover-lift ${
                selectedScript?.id === script.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedScript(script)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">{script.title}</CardTitle>
                <div className="text-sm text-gray-500">{script.category}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{script.purpose}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditScript(script)
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 rounded-lg"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteScript(script.id)
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 text-lg">
            No sales scripts found. Try adjusting your search or add a new script!
          </div>
        )}
      </div>

      {selectedScript && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <Card
            className={`bg-white shadow-2xl border border-white/20 scale-in ${
              isScriptViewFullScreen
                ? "rounded-none w-full h-full max-w-full max-h-full"
                : "rounded-2xl w-full max-w-4xl max-h-[90vh]"
            }`}
            style={isScriptViewFullScreen ? {} : scriptViewStyle}
            onMouseDown={isScriptViewFullScreen ? undefined : onScriptViewMouseDown}
          >
            <CardHeader
              className={`flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-blue-600 to-purple-600 ${
                isScriptViewFullScreen ? "" : "rounded-t-2xl"
              }`}
            >
              <CardTitle className="text-2xl font-bold text-white">{selectedScript.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsScriptViewFullScreen(!isScriptViewFullScreen)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  {isScriptViewFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </Button>
                <Button
                  onClick={() => handleCopyScript(selectedScript.content)}
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <Copy size={16} />
                  Copy
                </Button>
                <Button
                  onClick={() => setSelectedScript(null)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent
              className={`p-6 overflow-y-auto ${
                isScriptViewFullScreen ? "h-[calc(100vh-80px)]" : "max-h-[calc(90vh-120px)]"
              }`}
            >
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-4 bg-gray-100 rounded-xl p-1">
                  <TabsTrigger
                    value="content"
                    className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Script Content
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="text-gray-800 bg-white p-4 rounded-xl border border-gray-200">
                  {selectedScript.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedScript.content) }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-sm">{selectedScript.content}</pre>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Script Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <Card
            className={`bg-white shadow-2xl border border-white/20 scale-in ${
              isAddEditFullScreen
                ? "rounded-none w-full h-full max-w-full max-h-full"
                : "rounded-2xl w-full max-w-2xl max-h-[90vh]"
            }`}
          >
            <CardHeader
              className={`flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-green-600 to-blue-600 ${
                isAddEditFullScreen ? "" : "rounded-t-2xl"
              }`}
            >
              <CardTitle className="text-2xl font-bold text-white">
                {currentScript.id ? "Edit Script" : "Add New Script"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddEditFullScreen(!isAddEditFullScreen)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  {isAddEditFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddEditModalOpen(false)
                    setIsAddEditFullScreen(false)
                  }}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent
              className={`p-6 space-y-6 overflow-y-auto ${
                isAddEditFullScreen ? "h-[calc(100vh-80px)]" : "max-h-[calc(90vh-120px)]"
              }`}
            >
              <div>
                <Label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-800">
                  Title
                </Label>
                <Input
                  id="title"
                  value={currentScript.title}
                  onChange={(e) => setCurrentScript({ ...currentScript, title: e.target.value })}
                  placeholder="e.g., Initial Client Outreach"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="category" className="block text-sm font-semibold mb-2 text-gray-800">
                  Category
                </Label>
                <Select
                  value={currentScript.category}
                  onValueChange={(value) => setCurrentScript({ ...currentScript, category: value })}
                >
                  <SelectTrigger className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Objection Handling">Objection Handling</SelectItem>
                    <SelectItem value="Closing">Closing</SelectItem>
                    <SelectItem value="Discovery">Discovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose" className="block text-sm font-semibold mb-2 text-gray-800">
                  Purpose
                </Label>
                <Textarea
                  id="purpose"
                  value={currentScript.purpose}
                  onChange={(e) => setCurrentScript({ ...currentScript, purpose: e.target.value })}
                  placeholder="e.g., To introduce our services and qualify the lead."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm h-24 resize-none transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="content" className="block text-sm font-semibold mb-2 text-gray-800">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={currentScript.content}
                  onChange={(e) => setCurrentScript({ ...currentScript, content: e.target.value })}
                  placeholder="Enter the full script content here..."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm h-48 resize-none transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isHtml"
                  checked={currentScript.isHtml}
                  onChange={(e) => setCurrentScript({ ...currentScript, isHtml: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isHtml" className="text-sm font-semibold text-gray-800">
                  Content is HTML
                </Label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  onClick={() => {
                    setIsAddEditModalOpen(false)
                    setIsAddEditFullScreen(false)
                  }}
                  className="px-6 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveScript}
                  className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Save Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SalesScripts
