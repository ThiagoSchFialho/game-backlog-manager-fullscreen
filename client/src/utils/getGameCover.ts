const gameCovers = import.meta.glob('../assets/games/*/square.jpg', {
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

export function getGameCover(name: string): string {
    const slug = slugifyGameName(name);
    const path = `../assets/games/${slug}/square.jpg`;
    return gameCovers[path] ?? gameCovers['../assets/games/placeholder/square.jpg'];
}