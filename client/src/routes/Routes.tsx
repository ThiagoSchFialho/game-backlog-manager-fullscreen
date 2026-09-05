import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import AllGames from '../pages/AllGames/AllGames';
import Favorites from '../pages/Favorites/Favorites';
import Completed from '../pages/Completed/Completed';
import Backlog from '../pages/Backlog/Backlog';
import Collections from '../pages/Collections/Collections';
import Collection from '../pages/Collection/Collection';
import Settings from '../pages/Settings/Settings';


const AppRoutes = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/allGames' element={<AllGames />} />
                <Route path='/favorites' element={<Favorites />} />
                <Route path='/completed' element={<Completed />} />
                <Route path='/backlog' element={<Backlog />} />
                <Route path='/collections' element={<Collections />} />
                <Route path='/collection/:id' element={<Collection />} />
                <Route path='/settings' element={<Settings />} />
            </Routes>
        </HashRouter>
    )
}

export default AppRoutes;