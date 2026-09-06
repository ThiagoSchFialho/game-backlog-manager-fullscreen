import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Library from '../pages/Library/Library';
import Completed from '../pages/Completed/Completed';
import Backlog from '../pages/Backlog/Backlog';
import Collections from '../pages/Collections/Collections';
import Collection from '../pages/Collection/Collection';
import GamePage from '../pages/GamePage/GamePage';


const AppRoutes = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/library' element={<Library />} />
                <Route path='/completed' element={<Completed />} />
                <Route path='/backlog' element={<Backlog />} />
                <Route path='/collections' element={<Collections />} />
                <Route path='/collection/:id' element={<Collection />} />
                <Route path='/game-page/:id' element={<GamePage />} />
            </Routes>
        </HashRouter>
    )
}

export default AppRoutes;