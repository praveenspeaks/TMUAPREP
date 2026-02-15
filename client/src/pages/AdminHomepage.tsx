import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import { LayoutTemplate, ArrowUp, ArrowDown, Save, Eye } from 'lucide-react';

interface HomepageSection {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
    position: number;
    content: Record<string, unknown>;
}

type ContentValue = string | number | boolean | null | ContentValue[] | { [key: string]: ContentValue };
type PathPart = string | number;

const toLabel = (value: string) =>
    value
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^./, (char) => char.toUpperCase());

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const getValueByPath = (source: ContentValue, path: PathPart[]) => {
    let current: any = source;
    for (const key of path) {
        if (current === null || current === undefined) return undefined;
        current = current[key as keyof typeof current];
    }
    return current;
};

const setValueByPath = (source: ContentValue, path: PathPart[], nextValue: ContentValue) => {
    if (path.length === 0) return nextValue;
    const clone = deepClone(source);
    let current: any = clone;

    for (let index = 0; index < path.length - 1; index += 1) {
        const key = path[index];
        if (current[key as keyof typeof current] === undefined || current[key as keyof typeof current] === null) {
            current[key as keyof typeof current] = typeof path[index + 1] === 'number' ? [] : {};
        }
        current = current[key as keyof typeof current];
    }

    const lastKey = path[path.length - 1];
    current[lastKey as keyof typeof current] = nextValue;
    return clone;
};

const defaultBySample = (sample: unknown): ContentValue => {
    if (typeof sample === 'number') return 0;
    if (typeof sample === 'boolean') return false;
    if (typeof sample === 'string') return '';
    if (Array.isArray(sample)) return [];
    if (sample && typeof sample === 'object') {
        const entries = Object.entries(sample as Record<string, unknown>).map(([key, value]) => [key, defaultBySample(value)]);
        return Object.fromEntries(entries) as ContentValue;
    }
    return '';
};

const AdminHomepage = () => {
    const { token } = useAuthStore();
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedSection = useMemo(
        () => sections.find((section) => section.id === selectedId) || null,
        [sections, selectedId]
    );

    const fetchConfig = async () => {
        try {
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/homepage-config`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load homepage config');

            const nextSections = [...(data.sections || [])].sort((a, b) => a.position - b.position);
            setSections(nextSections);

            const first = nextSections[0] || null;
            setSelectedId(first?.id || null);
        } catch (e: any) {
            setError(e.message || 'Failed to load homepage config');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const selectSection = (section: HomepageSection) => {
        setSelectedId(section.id);
        setError('');
        setSuccess('');
    };

    const moveSection = (id: string, direction: 'up' | 'down') => {
        setSections((prev) => {
            const sorted = [...prev].sort((a, b) => a.position - b.position);
            const index = sorted.findIndex((s) => s.id === id);
            if (index < 0) return prev;

            const movingSection = sorted[index];
            if (movingSection.key === 'hero' || movingSection.key === 'footer') return prev;

            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

            if (sorted[targetIndex].key === 'hero' || sorted[targetIndex].key === 'footer') return prev;

            [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];
            return sorted.map((section, i) => ({ ...section, position: i + 1 }));
        });
    };

    const updateSectionMeta = (id: string, patch: Partial<HomepageSection>) => {
        setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...patch } : section)));
    };

    const updateSelectedContent = (path: PathPart[], nextValue: ContentValue) => {
        if (!selectedSection) return;
        const currentContent = (selectedSection.content || {}) as ContentValue;
        const updatedContent = setValueByPath(currentContent, path, nextValue);
        updateSectionMeta(selectedSection.id, { content: updatedContent as Record<string, unknown> });
    };

    const addArrayItem = (path: PathPart[]) => {
        if (!selectedSection) return;
        const currentContent = (selectedSection.content || {}) as ContentValue;
        const arrayValue = getValueByPath(currentContent, path);
        if (!Array.isArray(arrayValue)) return;

        const template = arrayValue.length > 0 ? defaultBySample(arrayValue[0]) : '';
        updateSelectedContent(path, [...arrayValue, template]);
    };

    const removeArrayItem = (path: PathPart[], indexToRemove: number) => {
        if (!selectedSection) return;
        const currentContent = (selectedSection.content || {}) as ContentValue;
        const arrayValue = getValueByPath(currentContent, path);
        if (!Array.isArray(arrayValue)) return;

        const nextItems = arrayValue.filter((_, index) => index !== indexToRemove);
        updateSelectedContent(path, nextItems as ContentValue);
    };

    const renderContentField = (value: ContentValue, path: PathPart[], label: string) => {
        const fieldKey = path.join('.') || 'root';

        if (Array.isArray(value)) {
            return (
                <div key={fieldKey} className="rounded-xl border border-slate-200 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(path)}>Add Item</Button>
                    </div>

                    {value.length === 0 ? (
                        <p className="text-xs text-slate-500">No items yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {value.map((item, index) => (
                                <div key={`${fieldKey}-${index}`} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-700">Item {index + 1}</p>
                                        <button
                                            type="button"
                                            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                                            onClick={() => removeArrayItem(path, index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {renderContentField(item as ContentValue, [...path, index], `Item ${index + 1}`)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (value !== null && typeof value === 'object') {
            const entries = Object.entries(value as Record<string, ContentValue>);
            return (
                <div key={fieldKey} className="rounded-xl border border-slate-200 p-3 space-y-3">
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    {entries.map(([key, nestedValue]) => renderContentField(nestedValue, [...path, key], toLabel(key)))}
                </div>
            );
        }

        if (typeof value === 'boolean') {
            return (
                <label key={fieldKey} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(event) => updateSelectedContent(path, event.target.checked)}
                    />
                    {label}
                </label>
            );
        }

        if (typeof value === 'number') {
            return (
                <Input
                    key={fieldKey}
                    type="number"
                    label={label}
                    value={String(value)}
                    onChange={(event) => updateSelectedContent(path, Number(event.target.value || 0))}
                />
            );
        }

        const textValue = value === null ? '' : String(value);
        const useTextarea = textValue.length > 120 || textValue.includes('\n');

        if (useTextarea) {
            return (
                <div key={fieldKey}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                    <textarea
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[110px]"
                        value={textValue}
                        onChange={(event) => updateSelectedContent(path, event.target.value)}
                    />
                </div>
            );
        }

        return (
            <Input
                key={fieldKey}
                label={label}
                value={textValue}
                onChange={(event) => updateSelectedContent(path, event.target.value)}
            />
        );
    };

    const saveConfig = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const payload = {
                sections: [...sections]
                    .sort((a, b) => a.position - b.position)
                    .map((section, index) => ({ ...section, position: index + 1 })),
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/homepage-config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save homepage config');

            setSuccess('Homepage layout saved successfully. Refresh homepage to see updates.');
        } catch (e: any) {
            setError(e.message || 'Failed to save homepage config');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 shadow-lg">
                <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Homepage CMS</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1">Homepage Section Manager</h1>
                <p className="text-slate-300 mt-2">Configure sections, content, images, icons, and ordering. Save once to publish to homepage.</p>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{success}</div>}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5 text-indigo-600" />
                            Sections
                        </h2>
                        <span className="text-sm text-slate-500">{sections.length} total</span>
                    </div>

                    <div className="p-4 space-y-3">
                        {loading ? (
                            <p className="text-sm text-slate-500">Loading sections...</p>
                        ) : (
                            sections
                                .slice()
                                .sort((a, b) => a.position - b.position)
                                .map((section) => (
                                    (() => {
                                        const isLocked = section.key === 'hero' || section.key === 'footer';
                                        return (
                                    <div
                                        key={section.id}
                                        className={`rounded-xl border px-3 py-3 ${selectedId === section.id ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                className="text-left flex-1"
                                                onClick={() => selectSection(section)}
                                            >
                                                <p className="text-xs text-slate-500">Position {section.position}</p>
                                                <p className="font-medium text-slate-900">{section.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">key: {section.key}</p>
                                                {isLocked && <p className="text-[11px] text-amber-600 mt-1">Locked position</p>}
                                            </button>
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    className={`p-1 rounded ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                                                    onClick={() => moveSection(section.id, 'up')}
                                                    disabled={isLocked}
                                                >
                                                    <ArrowUp className="h-4 w-4 text-slate-500" />
                                                </button>
                                                <button
                                                    className={`p-1 rounded ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                                                    onClick={() => moveSection(section.id, 'down')}
                                                    disabled={isLocked}
                                                >
                                                    <ArrowDown className="h-4 w-4 text-slate-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                                                <input
                                                    type="checkbox"
                                                    checked={section.enabled}
                                                    onChange={(e) => updateSectionMeta(section.id, { enabled: e.target.checked })}
                                                />
                                                Enabled
                                            </label>
                                            <Input
                                                className="h-8 text-xs"
                                                value={String(section.position)}
                                                onChange={(e) => updateSectionMeta(section.id, { position: Number(e.target.value || section.position) })}
                                                disabled={isLocked}
                                            />
                                        </div>
                                    </div>
                                        );
                                    })()
                                ))
                        )}
                    </div>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <h2 className="text-lg font-semibold text-slate-900">Edit Selected Section</h2>
                        {!selectedSection ? (
                            <p className="text-sm text-slate-500 mt-2">Select a section from the left panel.</p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input
                                        label="Section Name"
                                        value={selectedSection.name}
                                        onChange={(e) => updateSectionMeta(selectedSection.id, { name: e.target.value })}
                                    />
                                    <Input
                                        label="Section Key"
                                        value={selectedSection.key}
                                        onChange={(e) => updateSectionMeta(selectedSection.id, { key: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Content Form</label>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Update texts, links, images, icons, and list items using this form. Click Save Changes below to publish.
                                    </p>
                                    <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                                        {Object.entries((selectedSection.content || {}) as Record<string, ContentValue>).map(([key, value]) =>
                                            renderContentField(value, [key], toLabel(key))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-slate-900">Publish Homepage Changes</h3>
                            <p className="text-sm text-slate-500">Save once, then homepage reflects order/content changes instantly from API.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                                <Eye className="h-4 w-4 mr-1" />
                                Preview Home
                            </Button>
                            <Button onClick={saveConfig} isLoading={saving}>
                                <Save className="h-4 w-4 mr-1" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminHomepage;
