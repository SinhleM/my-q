// 9 profile icon images from /public/profile-icons/
// Filenames have spaces so paths must be URL-encoded
const ICON_PATHS = [
    "/profile-icons/square-crop.webp",
    "/profile-icons/square-crop%20(1).webp",
    "/profile-icons/square-crop%20(2).webp",
    "/profile-icons/square-crop%20(3).webp",
    "/profile-icons/square-crop%20(4).webp",
    "/profile-icons/square-crop%20(5).webp",
    "/profile-icons/square-crop%20(6).webp",
    "/profile-icons/square-crop%20(7).webp",
    "/profile-icons/square-crop%20(8).webp",
];

export function getAvatarPath(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return ICON_PATHS[hash % ICON_PATHS.length];
}

export { ICON_PATHS };
