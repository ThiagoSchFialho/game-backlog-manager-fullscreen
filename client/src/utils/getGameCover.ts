const gameCovers = import.meta.glob('../assets/games/*/*.jpg', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

export function slugifyGameName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['’`]/g, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');
}

export function getGameCover(name: string, format: string): string {
    const slug = slugifyGameName(name);
    const path = `../assets/games/${slug}/${format}.jpg`;
    return gameCovers[path] ?? gameCovers['../assets/games/placeholder/square.jpg'];
}