import { useState } from 'preact/hooks';
import { Panel } from '../components/ui/Panel';
import { Logo } from '../components/Logo';
import { cn } from '../lib/utils';
import { IdentityAnimation, EndpointAnimation, CapabilitiesAnimation, ConfirmAnimation } from '../components/animations/StepAnimations';

const STEPS = [
  { id: 1, label: 'IDENTITY', icon: '01' },
  { id: 2, label: 'ENDPOINT', icon: '02' },
  { id: 3, label: 'CAPABILITIES', icon: '03' },
  { id: 4, label: 'CONFIRM', icon: '04' }
];

const CAPABILITIES_LIST = [
  { id: 'data-processing', label: 'Data Processing', desc: 'ETL pipelines, streaming, transformation' },
  { id: 'code-generation', label: 'Code Generation', desc: 'Smart contracts, scripts, automation' },
  { id: 'task-automation', label: 'Task Automation', desc: 'Workflow orchestration & scheduling' },
  { id: 'communication', label: 'Communication', desc: 'Cross-platform messaging & translation' },
  { id: 'analysis', label: 'Analysis', desc: 'On-chain analytics & pattern detection' },
  { id: 'creative', label: 'Creative', desc: 'Generative content & media creation' },
  { id: 'financial', label: 'Financial', desc: 'DeFi strategies & portfolio management' },
  { id: 'research', label: 'Research', desc: 'Knowledge synthesis & paper analysis' },
  { id: 'security', label: 'Security', desc: 'Threat monitoring & vulnerability scanning' },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Infra monitoring & auto-scaling' },
];

const ENDPOINT_TYPES = [
  { value: 'MCP', label: 'MCP', desc: 'Model Context Protocol' },
  { value: 'REST', label: 'REST', desc: 'RESTful API' },
  { value: 'GraphQL', label: 'GraphQL', desc: 'GraphQL endpoint' },
];

export function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpointUrl: '',
    endpointType: 'MCP',
    version: '1.0.0',
    capabilities: [] as string[],
    initialStake: '100',
  });

  const handleNext = () => {
    setStep(Math.min(4, step + 1));
  };

  const handlePrev = () => setStep(Math.max(1, step - 1));

  const toggleCapability = (cap: string) => {
    const removing = formData.capabilities.includes(cap);
    setFormData(prev => ({
      ...prev,
      capabilities: removing
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  const completionPercent = Math.round(
    ([formData.name, formData.description, formData.endpointUrl].filter(Boolean).length / 3) * 60 +
    (formData.capabilities.length > 0 ? 20 : 0) +
    (step >= 4 ? 20 : 0)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top header bar */}
      <Panel className="p-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <div className="flex items-center gap-4">
          <Logo className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-light tracking-tight text-fg">REGISTER AGENT</h1>
            <p className="text-fg-dim text-[10px] tracking-[0.2em] uppercase">Create an on-chain identity for your AI agent</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">COMPLETION</div>
            <div className="text-accent text-lg font-light">{completionPercent}%</div>
          </div>
          <div className="w-24 h-2 bg-stroke relative overflow-hidden rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-700 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </Panel>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Step nav + Form */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Step indicator - horizontal */}
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { if (s.id < step) setStep(s.id); }}
                className={cn(
                  "flex-1 flex items-center gap-3 p-4 border transition-all duration-300 relative overflow-hidden group",
                  step === s.id
                    ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                    : step > s.id
                    ? "border-stroke-2 bg-surface cursor-pointer hover:border-accent/30"
                    : "border-stroke bg-base/50 opacity-50"
                )}
              >
                {step === s.id && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
                )}
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center text-[10px] font-bold tracking-widest border-2 transition-all shrink-0",
                  step === s.id
                    ? "border-accent text-accent bg-accent/10 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    : step > s.id
                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                    : "border-stroke-2 text-fg-dim"
                )}>
                  {step > s.id ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                  ) : s.icon}
                </div>
                <div className="hidden md:block min-w-0">
                  <div className={cn("text-[9px] tracking-[0.2em] uppercase truncate", step >= s.id ? "text-fg-soft" : "text-fg-dim")}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-6",
                    step > s.id ? "bg-emerald-500/30" : "bg-stroke"
                  )} />
                )}
              </button>
            ))}
          </div>

          {/* Form content */}
          <Panel className="p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative z-10 min-h-[380px]">
              {/* Step 1: Identity */}
              {step === 1 && (
                <div className="flex flex-col gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-4 bg-accent" />
                      <h2 className="text-fg text-sm tracking-[0.2em] uppercase">Agent Identity</h2>
                    </div>
                    <p className="text-fg-muted text-xs mb-8 leading-relaxed max-w-lg">
                      Define how your agent will be identified on the Intuition network. This creates an Atom — a permanent on-chain record linked via IPFS.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="flex items-center justify-between mb-3">
                        <span className="text-fg-dim text-[10px] tracking-[0.2em] uppercase">Agent Name</span>
                        <span className="text-fg-dim text-[9px] font-mono">{formData.name.length}/32</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        maxLength={32}
                        onChange={e => setFormData({...formData, name: (e.target as HTMLInputElement).value})}
                        className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all font-mono"
                        placeholder="e.g. CodeReviewer"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center justify-between mb-3">
                        <span className="text-fg-dim text-[10px] tracking-[0.2em] uppercase">Description</span>
                        <span className="text-fg-dim text-[9px] font-mono">{formData.description.length}/256</span>
                      </label>
                      <textarea
                        value={formData.description}
                        maxLength={256}
                        onChange={e => setFormData({...formData, description: (e.target as HTMLTextAreaElement).value})}
                        className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all h-28 resize-none font-mono"
                        placeholder="Describe what your agent does..."
                      />
                    </div>
                  </div>

                  {/* Live preview */}
                  {formData.name && (
                    <div className="p-4 border border-stroke bg-surface/50 flex items-center gap-4">
                      <div className="w-10 h-10 bg-raised border border-accent/50 flex items-center justify-center text-accent font-light shadow-[0_0_10px_rgba(249,115,22,0.2)] shrink-0">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-fg font-medium truncate">{formData.name}</div>
                        <div className="text-fg-dim text-[10px] font-mono tracking-widest">0x{Array.from(formData.name).reduce((a, c) => a + c.charCodeAt(0), 0).toString(16).padStart(8, '0')}...</div>
                      </div>
                      <div className="ml-auto text-[8px] tracking-[0.2em] px-2 py-1 border border-stroke-2 text-fg-dim">PREVIEW</div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Endpoint */}
              {step === 2 && (
                <div className="flex flex-col gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-4 bg-accent" />
                      <h2 className="text-fg text-sm tracking-[0.2em] uppercase">Endpoint Configuration</h2>
                    </div>
                    <p className="text-fg-muted text-xs mb-8 leading-relaxed max-w-lg">
                      How will other agents and LLMs connect to your agent? We'll verify the endpoint is reachable during registration.
                    </p>
                  </div>

                  {/* Protocol selection */}
                  <div>
                    <label className="block text-fg-dim text-[10px] tracking-[0.2em] uppercase mb-3">Protocol</label>
                    <div className="grid grid-cols-3 gap-3">
                      {ENDPOINT_TYPES.map(type => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({...formData, endpointType: type.value})}
                          className={cn(
                            "p-4 border text-left transition-all",
                            formData.endpointType === type.value
                              ? "border-accent bg-accent/5 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                              : "border-stroke-2 bg-base hover:border-stroke-3"
                          )}
                        >
                          <div className={cn("text-sm font-mono mb-1", formData.endpointType === type.value ? "text-accent" : "text-fg")}>{type.label}</div>
                          <div className="text-fg-dim text-[9px] tracking-wider">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-fg-dim text-[10px] tracking-[0.2em] uppercase mb-3">Endpoint URL</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.endpointUrl}
                        onChange={e => setFormData({...formData, endpointUrl: (e.target as HTMLInputElement).value})}
                        className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all font-mono pr-20"
                        placeholder={`https://api.youragent.com/v1/${formData.endpointType.toLowerCase()}`}
                      />
                      {formData.endpointUrl && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] tracking-widest px-2 py-1 border border-emerald-500/50 text-emerald-500 bg-emerald-500/10">
                          VALID
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-32">
                    <label className="block text-fg-dim text-[10px] tracking-[0.2em] uppercase mb-3">Version</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={e => setFormData({...formData, version: (e.target as HTMLInputElement).value})}
                      className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all font-mono"
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Capabilities */}
              {step === 3 && (
                <div className="flex flex-col gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-4 bg-accent" />
                      <h2 className="text-fg text-sm tracking-[0.2em] uppercase">Agent Capabilities</h2>
                    </div>
                    <p className="text-fg-muted text-xs mb-4 leading-relaxed max-w-lg">
                      Select what your agent can do. This helps other agents discover and route tasks to yours. Choose at least one.
                    </p>
                    <div className="text-accent text-[10px] tracking-widest font-mono">
                      {formData.capabilities.length} SELECTED
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CAPABILITIES_LIST.map(cap => {
                      const selected = formData.capabilities.includes(cap.id);
                      return (
                        <button
                          key={cap.id}
                          onClick={() => toggleCapability(cap.id)}
                          className={cn(
                            "p-4 border text-left transition-all group relative overflow-hidden",
                            selected
                              ? "border-accent bg-accent/5 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                              : "border-stroke-2 bg-base hover:border-stroke-3"
                          )}
                        >
                          {selected && <div className="absolute top-0 left-0 w-[3px] h-full bg-accent" />}
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs font-medium", selected ? "text-accent" : "text-fg")}>{cap.label}</span>
                            <div className={cn(
                              "w-4 h-4 border flex items-center justify-center transition-all",
                              selected ? "border-accent bg-accent" : "border-stroke-3"
                            )}>
                              {selected && <svg className="w-3 h-3 text-base" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                          <p className="text-fg-dim text-[10px] leading-relaxed">{cap.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {step === 4 && (
                <div className="flex flex-col gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-4 bg-accent" />
                      <h2 className="text-fg text-sm tracking-[0.2em] uppercase">Review & Confirm</h2>
                    </div>
                    <p className="text-fg-muted text-xs mb-4 leading-relaxed max-w-lg">
                      Review your agent's registration details before submitting the on-chain transaction.
                    </p>
                  </div>

                  {/* Summary card */}
                  <div className="border border-accent/30 bg-surface relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent via-accent to-transparent" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl" />

                    <div className="p-6">
                      {/* Agent preview */}
                      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-stroke">
                        <div className="w-14 h-14 bg-raised border border-accent/50 flex items-center justify-center text-accent text-2xl font-light shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                          {(formData.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-fg text-lg font-medium">{formData.name || 'Unnamed Agent'}</div>
                          <div className="text-fg-dim text-[10px] font-mono tracking-widest">
                            {formData.endpointType} · v{formData.version}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent" /> DESCRIPTION
                          </div>
                          <div className="text-fg-soft text-sm leading-relaxed border-l-2 border-stroke-2 pl-4">{formData.description || 'No description provided.'}</div>
                        </div>
                        <div>
                          <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent" /> ENDPOINT
                          </div>
                          <div className="text-accent font-mono text-xs break-all">{formData.endpointUrl || 'Not set'}</div>
                        </div>
                        <div>
                          <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent" /> INITIAL STAKE
                          </div>
                          <div className="text-fg text-sm">{formData.initialStake} tTRUST</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent" /> CAPABILITIES ({formData.capabilities.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.capabilities.length > 0 ? formData.capabilities.map(cap => (
                              <span key={cap} className="text-[9px] tracking-[0.1em] px-3 py-1 border border-accent/30 text-accent bg-accent/5">
                                {cap}
                              </span>
                            )) : (
                              <span className="text-fg-dim text-xs italic">None selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost breakdown */}
                    <div className="border-t border-stroke p-6 bg-base/50">
                      <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-4">TRANSACTION DETAILS</div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-fg-muted">Atom Creation</span>
                          <span className="text-fg font-mono">0.001 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-fg-muted">IPFS Storage</span>
                          <span className="text-fg font-mono">0.0005 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-fg-muted">Initial Stake</span>
                          <span className="text-fg font-mono">{formData.initialStake} tTRUST</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-stroke mt-2">
                          <span className="text-fg-soft font-medium">Estimated Total</span>
                          <span className="text-accent font-mono font-medium">0.0015 ETH + {formData.initialStake} tTRUST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="relative z-10 flex justify-between mt-10 pt-6 border-t border-stroke">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className="text-[10px] tracking-[0.2em] uppercase px-6 py-3 border border-stroke-2 text-fg-muted hover:border-stroke-3 hover:text-fg-soft disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="text-[10px] tracking-[0.2em] uppercase px-8 py-3 border border-accent text-accent hover:bg-accent/10 shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all flex items-center gap-2"
                >
                  Continue
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => {}}
                  className="text-[10px] tracking-[0.2em] uppercase px-8 py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                  Confirm & Register
                </button>
              )}
            </div>
          </Panel>
        </div>

        {/* Right: Step Animation */}
        <div className="w-full lg:w-[380px] flex flex-col">
          <Panel className="flex-1 p-0 overflow-hidden flex flex-col border-stroke-2">
            <div className="bg-raised border-b border-stroke-2 px-4 py-2.5 flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", step === 4 ? "bg-emerald-500/60" : "bg-accent/60")} />
              <span className="ml-2 text-fg-dim text-[10px] tracking-widest uppercase flex-1">
                {step === 1 && 'IDENTITY CREATION'}
                {step === 2 && 'ENDPOINT VERIFICATION'}
                {step === 3 && 'CAPABILITY MAPPING'}
                {step === 4 && 'ON-CHAIN CONFIRMATION'}
              </span>
              <span className="text-fg-dim text-[9px] font-mono">STEP {step}/4</span>
            </div>
            <div className="flex-1 bg-base min-h-[400px]">
              {step === 1 && <IdentityAnimation />}
              {step === 2 && <EndpointAnimation />}
              {step === 3 && <CapabilitiesAnimation />}
              {step === 4 && <ConfirmAnimation />}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
