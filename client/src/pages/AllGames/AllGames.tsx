import React, { useState, useMemo, useEffect } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';
import SyncSteamBtn from '../../components/syncSteamBtn/SyncSteamBtn';

const AllGames: React.FC = () => {
    const { fetchGames } = useDb();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage] = useState('allGames');
    const [gamesList, setGamesList] = useState<Game[]>([]);
        
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
            setSteamApiConnected(true);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);

    const [statusFilter, setStatusFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [sortBy, setSortBy] = useState('nome');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredGames = useMemo(() => {
        let result = [...gamesList];

        if (statusFilter !== 'all') {
            result = result.filter(game => game.status === statusFilter);
        }

        if (yearFilter !== 'all') {
            result = result.filter(game => {
                const gameYear = new Date(game.release_date).getFullYear();
                return gameYear === Number(yearFilter);
            });
        }

        result.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'nome':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'playtime':
                    comparison = a.playtime - b.playtime;
                    break;
                case 'developer':
                    comparison = a.developer.localeCompare(b.developer);
                    break;
                case 'release_date':
                    comparison = new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [statusFilter, yearFilter, sortBy, sortOrder, gamesList]);

    const clearFilters = () => {
        setStatusFilter('all');
        setYearFilter('all');
        setSortBy('nome');
        setSortOrder('asc');
    };

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="all-games-main-content">
                    <div className="page-header">
                        <h1 className="title">Todos os jogos</h1>
                        <SyncSteamBtn />
                    </div>

                    <div className="game-filter-container">
                        <div className="filters-container">
                            <div className="filter-header">
                                <h1>Filtros</h1>
                                <p onClick={clearFilters} style={{ cursor: 'pointer' }}>Limpar filtros</p>
                            </div>
                            <form
                                className="filter-form"
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <div className="filter-form-inputs">
                                    <div className="filter-input-container">
                                        <label>Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Todos</option>
                                            <option value="not-played">Não jogado</option>
                                            <option value="played">Jogado</option>
                                            <option value="playing">Jogando</option>
                                            <option value="completed">Zerado</option>
                                        </select>
                                    </div>

                                    <div className="filter-input-container">
                                        <label>Data de lançamento</label>
                                        <select
                                            value={yearFilter}
                                            onChange={(e) => setYearFilter(e.target.value)}
                                        >
                                            <option value="all">Todos</option>
                                            {Array.from(
                                                { length: new Date().getFullYear() - 1990 + 1 },
                                                (_, i) => new Date().getFullYear() - i
                                            ).map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-input-container">
                                        <label>Ordenar por:</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="nome">Nome</option>
                                            <option value="status">Status</option>
                                            <option value="playtime">Tempo de jogo</option>
                                            <option value="developer">Desenvolvedora</option>
                                            <option value="release_date">Data de lançamento</option>
                                        </select>
                                    </div>

                                    <div className="filter-input-container">
                                        <label>Direção</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        >
                                            <option value="asc">Crescente</option>
                                            <option value="desc">Decrescente</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="list-game-container">
                            {filteredGames.map(game => (
                                <GameCard
                                    key={game.id}
                                    id={game.id}
                                    steamId={game.steam_id}
                                    img={getGameCover(game.title)}
                                    name={game.title}
                                    status={game.status}
                                    playtime={game.playtime}
                                    onUpdate={getGames}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AllGames;