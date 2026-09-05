export function orderBy(array: any[], attribute: string, direction: 'asc' | 'desc' = 'asc') {
    const dir = direction === 'asc' ? 1 : -1;

    if (attribute === 'title') {
        return [...array].sort((a, b) =>
            dir * a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
        );

    } else if (attribute === 'rtime_last_played') {
        return [...array].sort((a, b) => {
            const timeA = a.rtime_last_played ? new Date(a.rtime_last_played).getTime() : 0;
            const timeB = b.rtime_last_played ? new Date(b.rtime_last_played).getTime() : 0;
            return dir * (timeA - timeB);
        });

    } else if (typeof array[0]?.[attribute] === 'number') {
        return [...array].sort((a, b) => 
            dir * ((a[attribute] ?? 0) - (b[attribute] ?? 0))
        );

    } else {
        return [...array].sort((a, b) => 
            dir * String(a[attribute] ?? '').localeCompare(String(b[attribute] ?? ''))
        );
    }
}