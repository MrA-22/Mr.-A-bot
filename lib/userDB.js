// Tetap import
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./database/user.json');

export const getAllUserData = () => {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8')) || {};
    } catch {
        return {};
    }
};

export const setAllUserData = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('❌ Error saving user data:', e);
    }
};

// Yang ini biarkan untuk akses per user
export const getUserData = (userId) => {
    const all = getAllUserData();
    return all[userId] || null;
};

export const setUserData = (userId, userData) => {
    const all = getAllUserData();
    all[userId] = userData;
    setAllUserData(all);
};
