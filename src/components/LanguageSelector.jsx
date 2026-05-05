import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', id: 'narration' },
  { code: 'hi-IN', label: 'Hindi', id: 'hindiNarration' },
  { code: 'bn-IN', label: 'Bengali', id: 'bengaliNarration' }
];

const LanguageSelector = ({ currentLang, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-gray-700 rounded-full px-3 py-1.5 backdrop-blur-sm">
      <Globe size={16} className="text-secondary" />
      <select 
        value={currentLang}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer appearance-none pr-4"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-background text-white">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
