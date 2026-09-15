import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Image as ImageIcon,
  Loader2,
  Play,
  Radar,
  Satellite,
  Server,
  UploadCloud,
  Waves
} from 'lucide-react';
import { analyzePrithviImage, fetchPrithviStatus, runPrithviDemo } from '../services/api';
import { PrithviAnalysisResult, PrithviStatus } from '../types';

type ImageKey = 'original_rgb' | 'water_mask' | 'overlay';

const imageTabs: Array<{ key: ImageKey; label: string }> = [
  { key: 'original_rgb', label: 'RGB Scene' },
  { key: 'water_mask', label: 'Water Mask' },
  { key: 'overlay', label: 'AI Overlay' }
];

const metricFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 3
});

export const PrithviPage: React.FC = () => {
  const [status, setStatus] = useState<PrithviStatus | null>(null);
  const [result, setResult] = useState<PrithviAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeImage, setActiveImage] = useState<ImageKey>('overlay');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [runningDemo, setRunningDemo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const selectedImage = result?.images?.[activeImage];
  const modeTone = useMemo(() => getModeTone(status?.mode), [status?.mode]);

  async function refreshStatus() {
    setLoadingStatus(true);
    try {
      setStatus(await fetchPrithviStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read Prithvi status.');
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleDemo() {
    setRunningDemo(true);
    setError('');
    try {
      const payload = await runPrithviDemo();
      setResult(payload);
      setActiveImage('overlay');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prithvi demo inference failed.');
    } finally {
      setRunningDemo(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedFile) {
      setError('Choose a Sentinel-2 GeoTIFF before running live inference.');
      return;
    }

    setAnalyzing(true);
    setError('');
    try {
      const payload = await analyzePrithviImage(selectedFile);
      setResult(payload);
      setActiveImage('overlay');
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prithvi upload analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
    void handleDemo();
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100">
      <section className="border-b border-cyan-500/10 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                  <Satellite className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 font-semibold">Prithvi EO Water Intelligence</p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Satellite water extent analysis</h1>
                </div>
              </div>
              <p className="max-w-3xl text-sm md:text-base text-slate-300 leading-7">
                Prithvi EO V2 identifies surface-water extent from Sentinel-2 scenes, then Jaal Drushti pairs that spatial signal with WQI telemetry, forecasts, and alerts.
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${modeTone.className}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              <span className="font-semibold uppercase">{status?.mode || 'checking'}</span>
              {loadingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.4fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Model Connection</h2>
                  <p className="text-sm text-slate-400">Current inference path and deployment readiness.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshStatus}
                  className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 flex items-center justify-center"
                  aria-label="Refresh Prithvi status"
                >
                  {loadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-3">
                <StatusRow
                  icon={Server}
                  label="Model API"
                  value={status?.external_api_reachable ? 'Connected' : status?.external_api_configured ? 'Configured, offline' : 'Not configured'}
                  ok={Boolean(status?.external_api_reachable)}
                />
                <StatusRow
                  icon={Database}
                  label="Local checkpoint"
                  value={status?.checkpoint_found ? 'Found on this machine' : 'Not visible to server'}
                  ok={Boolean(status?.checkpoint_found)}
                />
                <StatusRow
                  icon={UploadCloud}
                  label="Live GeoTIFF upload"
                  value={status?.supports_live_upload ? 'Enabled' : 'Needs model API'}
                  ok={Boolean(status?.supports_live_upload)}
                />
              </div>

              <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">Required Input</p>
                <p className="text-sm text-slate-300">{status?.required_input || 'Sentinel-2 GeoTIFF with multispectral bands'}</p>
              </div>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Run Analysis</h2>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={runningDemo}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:text-cyan-100 text-slate-950 font-semibold px-4 py-3 transition"
                >
                  {runningDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Demo Scene
                </button>

                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4">
                  <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="prithvi-file">
                    Sentinel-2 GeoTIFF
                  </label>
                  <input
                    id="prithvi-file"
                    type="file"
                    accept=".tif,.tiff,image/tiff"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] || null);
                      setError('');
                    }}
                    className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-200 hover:file:bg-slate-700"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-xs text-slate-400 break-all">
                      Selected: <span className="text-slate-200">{selectedFile.name}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || !selectedFile || !status?.supports_live_upload}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500 text-emerald-200 font-semibold px-4 py-3 transition"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  Analyze Uploaded Scene
                </button>

                {!status?.supports_live_upload && (
                  <p className="text-xs leading-5 text-slate-500">
                    Upload analysis turns on after `PRITHVI_API_BASE_URL` points to the running Pruthvi-model FastAPI service.
                  </p>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-slate-800 bg-slate-950/70 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Inference Output</h2>
                  <p className="text-sm text-slate-400">{result?.model || status?.model_name || 'Prithvi EO V2 water model'}</p>
                </div>
                {result && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRiskTone(result.risk_level)}`}>
                    <Waves className="w-4 h-4" />
                    {result.risk_level}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-800">
              <Metric label="Water Coverage" value={result ? `${metricFormatter.format(result.water_percentage)}%` : '--'} />
              <Metric label="Water Area" value={result ? `${metricFormatter.format(result.water_area_km2)} km2` : '--'} />
              <Metric label="Detection" value={result?.status || '--'} />
            </div>

            <div className="p-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                {imageTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveImage(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeImage === tab.key
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/40'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={`${activeImage} Prithvi inference output`}
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="text-center px-6">
                    <Satellite className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Run the demo scene or connect live inference to view Prithvi outputs.</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">AI Summary</p>
                  <p className="text-sm leading-6 text-slate-300">{result.ai_summary}</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                    <span>Job ID: <strong className="text-slate-200">{result.job_id}</strong></span>
                    <span>Area estimate: <strong className="text-slate-200">{result.area_is_estimated ? 'Estimated from scene' : 'Georeferenced'}</strong></span>
                    {result.source && <span className="md:col-span-2">Source: <strong className="text-slate-200">{result.source}</strong></span>}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const StatusRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok: boolean;
}> = ({ icon: Icon, label, value, ok }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
    <div className="flex items-center gap-3 min-w-0">
      <Icon className="w-4 h-4 text-cyan-300 flex-shrink-0" />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
    <div className={`inline-flex items-center gap-2 text-xs font-semibold ${ok ? 'text-emerald-300' : 'text-slate-400'}`}>
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      <span className="text-right">{value}</span>
    </div>
  </div>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-5 border-b md:border-b-0 md:border-r last:border-r-0 border-slate-800">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">{label}</p>
    <p className="text-2xl font-bold text-white break-words">{value}</p>
  </div>
);

function getModeTone(mode?: string) {
  if (mode === 'external') {
    return { className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' };
  }
  if (mode === 'local-ready') {
    return { className: 'border-sky-400/40 bg-sky-500/10 text-sky-300' };
  }
  return { className: 'border-amber-400/40 bg-amber-500/10 text-amber-300' };
}

function getRiskTone(risk: string) {
  if (risk === 'HIGH') return 'border-rose-400/40 bg-rose-500/10 text-rose-300';
  if (risk === 'MODERATE') return 'border-amber-400/40 bg-amber-500/10 text-amber-300';
  if (risk === 'LOW') return 'border-sky-400/40 bg-sky-500/10 text-sky-300';
  return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300';
}
