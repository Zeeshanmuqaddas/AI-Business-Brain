import React, { useState } from 'react';
import { Brain, DollarSign, Target, Zap, LayoutList, Trophy, Megaphone, CheckCircle2, XCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the response type based on the strict JSON output rule
interface BusinessAnalysis {
  product: string;
  selling_price: string;
  cost_price: string;
  profit: string;
  competition: string;
  demand_score: string;
  marketing: {
    title: string;
    bullets: string[];
    ad_copy: string;
  };
  decision: string;
  reason: string;
}

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [error, setError] = useState('');

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !budget) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Intialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are AI Business Brain, an advanced multi-agent business intelligence system designed to evaluate business ideas and provide a final investment decision.

Your purpose is to transform a simple user input (keyword + budget) into a complete business analysis including product selection, financial estimation, marketing strategy, and final decision.

🧩 AGENT WORKFLOW (STRICT ORDER)
1. 🔍 Research Agent: Analyze market trends based on keyword and budget. Generate 3 potential product ideas. Select the most promising product.
2. 📊 Analysis Agent: For selected product estimate selling price, cost price, calculate profit margin, analyze competition level (Low / Medium / High), assign demand score (1–10).
3. 📢 Marketing Agent: Create complete marketing assets: Product title (optimized for selling), 3 bullet-point benefits (clear and persuasive), Short ad copy (engaging and conversion-focused).
4. 🧠 Decision Agent: Make final business decision: Output MUST be either: GO or NO-GO. Provide clear reasoning based on: Profitability, Demand, Competition.

📦 OUTPUT FORMAT: Return response strictly in the provided JSON schema. Be realistic with pricing and market assumptions. Prefer high-demand, low-competition opportunities when possible.`;

      const prompt = `Keyword: ${keyword}\nBudget: ${budget}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING },
              selling_price: { type: Type.STRING },
              cost_price: { type: Type.STRING },
              profit: { type: Type.STRING },
              competition: { type: Type.STRING },
              demand_score: { type: Type.STRING },
              marketing: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  bullets: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  ad_copy: { type: Type.STRING }
                },
                required: ["title", "bullets", "ad_copy"]
              },
              decision: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["product", "selling_price", "cost_price", "profit", "competition", "demand_score", "marketing", "decision", "reason"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text) as BusinessAnalysis;
        setAnalysis(result);
      } else {
        throw new Error('No response returned from the AI.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Input Form */}
        <section className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 border border-blue-200">
              <Brain className="w-3.5 h-3.5" />
              Intelligence Engine
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              AI Business <br/> Brain
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mt-2">
              Transform ideas into actionable business plans in seconds. Enter a niche and a budget to get a full market analysis.
            </p>
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400" />
                Target Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={runAnalysis} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Keyword / Niche</Label>
                  <Input 
                    id="keyword" 
                    placeholder="e.g. Kitchen gadgets, Eco-friendly toys..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="h-12 bg-slate-50 focus-visible:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget</Label>
                  <Input 
                    id="budget" 
                    placeholder="e.g. 500 USD, $2000..." 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-12 bg-slate-50 focus-visible:ring-blue-500"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Run Analysis
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Right Column: Results Dashboard */}
        <section className="w-full lg:w-2/3">
          {!analysis && !isLoading && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white/50 p-8 text-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <LayoutList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-500">Awaiting Input</p>
              <p className="text-sm max-w-sm">Enter a keyword and budget on the left to generate your comprehensive business analysis report.</p>
            </div>
          )}

          {isLoading && !analysis && (
            <div className="h-full min-h-[400px] rounded-2xl flex flex-col items-center justify-center gap-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-700">Synthesizing Business Plan</p>
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                  <span className="animate-pulse">🔄 Researching market trends...</span>
                  <span className="animate-pulse delay-150">📊 Crunching financials...</span>
                  <span className="animate-pulse delay-300">📢 Crafting marketing assets...</span>
                </div>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Header & Decision */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                <div className="space-y-1 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">Selected Product</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{analysis.product}</h2>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 z-10 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Decision</span>
                    <Badge className={`text-lg py-1.5 px-4 ${analysis.decision === 'GO' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}`}>
                      {analysis.decision === 'GO' ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <XCircle className="w-5 h-5 mr-1" />}
                      {analysis.decision}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rasoning block */}
              <div className={`p-4 rounded-xl border text-sm flex gap-3 ${analysis.decision === 'GO' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                <Trophy className={`w-5 h-5 shrink-0 ${analysis.decision === 'GO' ? 'text-emerald-500' : 'text-red-500'}`} />
                <p className="leading-relaxed"><strong className="font-semibold">Analysis:</strong> {analysis.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financials */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      Financial Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Cost Price</p>
                        <p className="text-lg font-mono font-medium">{analysis.cost_price}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Selling Price</p>
                        <p className="text-lg font-mono font-medium">{analysis.selling_price}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center border border-blue-100">
                      <p className="text-xs uppercase tracking-wider text-blue-700 font-bold">Est. Profit Margin</p>
                      <p className="text-xl font-mono font-bold text-blue-700">{analysis.profit}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Stats */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      Market Viability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center items-center p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Competition</p>
                      <Badge variant="outline" className={`
                        ${analysis.competition.toLowerCase().includes('low') && 'bg-green-100 border-green-200 text-green-800'}
                        ${analysis.competition.toLowerCase().includes('medium') && 'bg-yellow-100 border-yellow-200 text-yellow-800'}
                        ${analysis.competition.toLowerCase().includes('high') && 'bg-red-100 border-red-200 text-red-800'}
                      `}>
                        {analysis.competition}
                      </Badge>
                    </div>
                    <div className="flex flex-col justify-center items-center p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Demand Score</p>
                      <div className="text-2xl font-bold font-mono">{analysis.demand_score}<span className="text-slate-400 text-lg">/10</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Marketing Assets */}
              <Card className="shadow-sm border-blue-100">
                <CardHeader className="pb-4 bg-blue-50/50 border-b border-blue-100">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-purple-500" />
                    Marketing Assets
                  </CardTitle>
                  <CardDescription>Ready-to-use copy for ads and product listings.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Optimized Title</p>
                    <p className="text-lg font-medium text-slate-900 border-l-2 border-slate-300 pl-3 py-1">{analysis.marketing.title}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Key Benefits</p>
                    <ul className="space-y-2">
                      {analysis.marketing.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Suggest Ad Copy</p>
                    <div className="bg-slate-900 text-slate-50 p-4 rounded-xl text-sm leading-relaxed font-medium">
                      "{analysis.marketing.ad_copy}"
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </section>
      </main>
    </div>
  );
}
