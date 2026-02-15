const fs = require('fs/promises');
const path = require('path');

const settingsDir = path.resolve(__dirname, '../data');
const settingsPath = path.join(settingsDir, 'siteSettings.json');

const defaultSettings = {
    imgbb: {
        uploads: [],
    },
};

const ensureSettingsFile = async () => {
    try {
        await fs.access(settingsPath);
    } catch {
        await fs.mkdir(settingsDir, { recursive: true });
        await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    }
};

const readSettings = async () => {
    await ensureSettingsFile();
    try {
        const raw = await fs.readFile(settingsPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
            ...defaultSettings,
            ...parsed,
            imgbb: {
                ...defaultSettings.imgbb,
                uploads: Array.isArray(parsed?.imgbb?.uploads) ? parsed.imgbb.uploads : [],
            },
        };
    } catch {
        return defaultSettings;
    }
};

const writeSettings = async (settings) => {
    await fs.mkdir(settingsDir, { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
};

const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 6) return '*'.repeat(key.length);
    return `${key.slice(0, 3)}${'*'.repeat(Math.max(2, key.length - 6))}${key.slice(-3)}`;
};

const getImgBbSettings = async (_req, res) => {
    try {
        const settings = await readSettings();
        const apiKey = process.env.IMGBB_API_KEY || '';

        res.json({
            hasApiKey: !!apiKey,
            maskedApiKey: maskKey(apiKey),
            uploads: settings.imgbb.uploads || [],
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading imgBB settings', error: error.message });
    }
};

const getPublicImgBbImages = async (_req, res) => {
    try {
        const settings = await readSettings();
        const uploads = Array.isArray(settings?.imgbb?.uploads) ? settings.imgbb.uploads : [];

        res.json({
            images: uploads.map((image) => ({
                id: image.id,
                title: image.title,
                imageUrl: image.imageUrl,
                displayUrl: image.displayUrl,
                thumbUrl: image.thumbUrl,
                uploadedAt: image.uploadedAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading imgBB images', error: error.message });
    }
};

const updateImgBbSettings = async (req, res) => {
    try {
        return res.status(400).json({
            message: 'imgBB API key is managed through environment variable IMGBB_API_KEY and cannot be saved from dashboard.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving imgBB settings', error: error.message });
    }
};

const uploadToImgBb = async (req, res) => {
    try {
        const settings = await readSettings();
        const apiKey = process.env.IMGBB_API_KEY;

        if (!apiKey) {
            return res.status(400).json({ message: 'imgBB API key not configured' });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const base64Image = file.buffer.toString('base64');
        const body = new URLSearchParams();
        body.append('image', base64Image);
        body.append('name', file.originalname || `upload-${Date.now()}`);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body,
        });

        const payload = await imgbbResponse.json();
        if (!imgbbResponse.ok || !payload?.success) {
            return res.status(502).json({ message: 'imgBB upload failed', error: payload?.error?.message || 'Unknown error' });
        }

        const uploaded = {
            id: String(payload.data.id || Date.now()),
            title: file.originalname,
            imageUrl: payload.data.url,
            displayUrl: payload.data.display_url,
            thumbUrl: payload.data.thumb?.url || '',
            deleteUrl: payload.data.delete_url,
            uploadedAt: new Date().toISOString(),
            size: file.size,
        };

        settings.imgbb.uploads = [uploaded, ...(settings.imgbb.uploads || [])].slice(0, 300);
        await writeSettings(settings);

        res.status(201).json({ message: 'Image uploaded', image: uploaded, uploads: settings.imgbb.uploads });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

module.exports = {
    getImgBbSettings,
    getPublicImgBbImages,
    updateImgBbSettings,
    uploadToImgBb,
};
