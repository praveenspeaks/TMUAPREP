import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { ImageUp, Copy, Settings as SettingsIcon } from 'lucide-react';

interface UploadedImage {
    id: string;
    title: string;
    imageUrl: string;
    displayUrl?: string;
    thumbUrl?: string;
    deleteUrl?: string;
    uploadedAt: string;
    size?: number;
}

const AdminSettings = () => {
    const { token } = useAuthStore();
    const [hasApiKey, setHasApiKey] = useState(false);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSettings = async () => {
        try {
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/imgbb`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load settings');

            setHasApiKey(!!data.hasApiKey);
            setImages(Array.isArray(data.uploads) ? data.uploads : []);
        } catch (e: any) {
            setError(e.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError('');
            setSuccess('');

            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/imgbb/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to upload image');

            setImages(Array.isArray(data.uploads) ? data.uploads : []);
            setSuccess('Image uploaded to imgBB successfully. You can now use this URL in Homepage Builder content JSON.');
            event.target.value = '';
        } catch (e: any) {
            setError(e.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const copyText = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setSuccess('Copied to clipboard.');
        } catch {
            setError('Unable to copy to clipboard.');
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 shadow-lg">
                <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Platform Settings</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1">imgBB Image Configuration</h1>
                <p className="text-slate-300 mt-2">Upload website images to imgBB and reuse URLs in Homepage Builder.</p>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{success}</div>}

            <section>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <ImageUp className="h-5 w-5 text-violet-600" />
                            Upload Images to imgBB
                        </h2>
                        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${hasApiKey ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>
                            {uploading ? 'Uploading...' : 'Choose Image'}
                            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={!hasApiKey || uploading} />
                        </label>
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-500 mt-3">Loading...</p>
                    ) : (
                        <p className="text-sm text-slate-500 mt-3">imgBB key status: {hasApiKey ? 'Configured' : 'Not configured'}</p>
                    )}

                    {!hasApiKey && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">Set <strong>IMGBB_API_KEY</strong> in root <strong>.env</strong> and restart server to enable uploads.</p>}

                    <div className="mt-5 space-y-3 max-h-[420px] overflow-auto pr-1">
                        {images.length === 0 ? (
                            <p className="text-sm text-slate-500">No uploaded images yet.</p>
                        ) : (
                            images.map((image) => (
                                <div key={image.id} className="rounded-xl border border-slate-200 p-3">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={image.thumbUrl || image.imageUrl}
                                            alt={image.title}
                                            className="w-16 h-16 rounded object-cover border border-slate-200"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-900 truncate">{image.title}</p>
                                            <p className="text-xs text-slate-500">{new Date(image.uploadedAt).toLocaleString()}</p>
                                            <p className="text-xs text-slate-600 truncate mt-1">{image.imageUrl}</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => copyText(image.imageUrl)}>
                                            <Copy className="h-3.5 w-3.5 mr-1" />
                                            Copy URL
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-900">
                <div className="flex items-center gap-2 font-semibold mb-1">
                    <SettingsIcon className="h-4 w-4" />
                    How to use on website
                </div>
                <p>
                    Upload images here, copy URL, then go to Homepage Builder and paste URL into relevant section content JSON fields (e.g. `imageUrl`, `heroImageUrl`, item image fields). Saved config is used by homepage automatically.
                </p>
            </section>
        </div>
    );
};

export default AdminSettings;
